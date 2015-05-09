define([
    'application',
    'util'
],
    
    function(App, util) {
        function VCF(options) {
            // Initialization  
            var that = this;
            
            var envelopeOffset = options.envConstants.envelopeOffset;
            var attackMax = options.envConstants.attackMax;
            var decayReleaseMax = options.envConstants.decayReleaseMax;
            var minSustain = options.envConstants.minSustain;
            var filterMinimum = 10;
            
            var filter1 = App.context.createBiquadFilter();
            var filter2 = App.context.createBiquadFilter();
            filter1.type = 'lowpass';
            filter2.type = 'lowpass';
            filter1.Q.value = getResonanceFromValue(options.res);
            filter2.Q.value = getResonanceFromValue(options.res);
            
            var envMod = App.context.createGain();
            envMod.gain.value = getEnvModAmount(options.vcfEnv);
            
            var offset = createDCOffset();
            var filterEnvelope = App.context.createGain();
            
            var envelope = options.envelope;
            var filterCutoff = getCutoffFreqFromValue(options.frequency);
            
            var attackLength;
            var decayLength;
            var sustainLevel;
            var releaseLength;
            
            setupEnvelope();
            filter1.connect(filter2);
            offset.connect(filterEnvelope);
            filterEnvelope.connect(envMod);
            envMod.connect(filter1.detune);
            envMod.connect(filter2.detune);
            
            // Setter methods
            function setRes(value) {
                var now = App.context.currentTime;
                var resonance = getResonanceFromValue(value);
                filter1.Q.setValueAtTime(resonance / 2, now);
                filter2.Q.setValueAtTime(resonance / 2, now);
            }
            
            function setFilter(value) {
                value = value || filterCutoff;
                
                var now = App.context.currentTime;
                filter1.frequency.setValueAtTime(value, now);
                filter2.frequency.setValueAtTime(value, now);
            }
            
            // Helper methods
            function setupEnvelope() {
                attackLength = getAttackLength();
                decayLength = getDecayLength();
                releaseLength = getReleaseLength();
                sustainLevel = getSustainLevel();
            }
            
            function getSustainLevel() {
                return util.getFaderCurve(envelope.sustain) || minSustain;
            }
            
            function getAttackLength() {
                return util.getFaderCurve(envelope.attack) * attackMax + envelopeOffset;
            }
            
            function getDecayLength() {
                return util.getFaderCurve(envelope.decay) * decayReleaseMax + envelopeOffset;
            }
            
            function getReleaseLength() {
                return util.getFaderCurve(envelope.release) * decayReleaseMax + envelopeOffset;
            }
            
            function getEnvModAmount(value) {
                // Multiply fader value (0-1) by log2(2200) for total octaves 
                // in filter, then by 1200 for cents/octave
                return util.getFaderCurve(value) * 13323.94537;
            }
            
            function getResonanceFromValue(value) {
                return util.getFaderCurve(value) * 20 + 1;
            }
            
            function getCutoffFreqFromValue(value) {
                var nyquist = App.context.sampleRate / 2;
                var freq = util.getFaderCurve(value) * nyquist;
                return freq > filterMinimum ? freq : filterMinimum;
            }
            
            function setDecay() {
                var now = App.context.currentTime;
                decayLength = getDecayLength();
                filterEnvelope.gain.cancelScheduledValues(now);
                filterEnvelope.gain.linearRampToValueAtTime(sustainLevel, now + decayLength);
            }
            
            
            // Suggested by Chris Wilson on stackoverflow
            // http://stackoverflow.com/questions/30019666/web-audio-synthesis-how-to-handle-changing-the-filter-cutoff-during-the-attack
            function createDCOffset() {
                var buffer = App.context.createBuffer(1, 1, App.context.sampleRate);
                var data = buffer.getChannelData(0);
                var bufferSource = App.context.createBufferSource();
                data[0] = 1;
                bufferSource.buffer = buffer;
                bufferSource.loop = true;
                bufferSource.start(0);
                return bufferSource;
            }
            
            // Trigger the filter on keypress
            this.noteOn = function(initial) {
                var now = App.context.currentTime;
                
                if(!initial) {
                    initial = 0;
                    setupEnvelope();
                    setFilter();
                }
                
                filterEnvelope.gain.cancelScheduledValues(now);
                filterEnvelope.gain.setValueAtTime(initial, now);
                filterEnvelope.gain.linearRampToValueAtTime(1, now + attackLength);
                filterEnvelope.gain.linearRampToValueAtTime(sustainLevel, now + attackLength + decayLength);
            };
            
            // Release the filter on keyup
            this.noteOff = function(initial) {
                var now = App.context.currentTime;
                
                initial = initial || filterEnvelope.gain.value;
        
                filterEnvelope.gain.cancelScheduledValues(now);
                filterEnvelope.gain.setValueAtTime(initial, now);
                filterEnvelope.gain.linearRampToValueAtTime(minSustain, now + releaseLength);
            };
            
            Object.defineProperties(this, {
                'cutoff': {
                    'get': function() { return sustainLevel; },
                    'set': function(value) { 
                        filterCutoff = getCutoffFreqFromValue(value);
                        setFilter();
                    }
                },
                'envMod': {
                    'get': function() { return envMod.gain.value; },
                    'set': function(value) { 
                        envMod.gain.value = getEnvModAmount(value);
                    }
                },
                'attack': {
                    'set': function(e) { 
                        var now = App.context.currentTime;
                        var attacking = now < e.timing.attack + attackLength;
                        
                        envelope.attack = e.value;
                        setupEnvelope();
                        if(attacking) {
                            that.noteOn(filterEnvelope.gain.value);
                        }
                    }
                },
                'decay': {
                    'set': function(e) {
                        var now = App.context.currentTime;
                        var decaying = now < e.timing.attack + attackLength + decayLength;
                        
                        envelope.decay = e.value;
                        if(decaying) {
                            setDecay();
                        }
                    }
                },
                'sustain': {
                    'set': function(e) {
                        var now = App.context.currentTime;
                        var sustaining = now > e.timing.attack + attackLength + decayLength && 
                            e.timing.release === null;
                    
                        envelope.sustain = e.value;
                        sustainLevel = getSustainLevel();
                        if(sustaining) {
                            setFilter();
                        }
                    }
                },
                'release': {
                    'set': function(e) {
                        var now = App.context.currentTime;
                        var releasing = e.timing.release && 
                            now < e.timing.release + releaseLength;
                        
                        envelope.release = e.value;
                        setupEnvelope();
                        if(releasing) {
                            that.noteOff();
                        }
                    }
                },
                'res': {
                    'set': function(value) { setRes(value); }
                },
                 'input1': {
                    'get': function() { return filter1; }
                },
                'input2': {
                    'get': function() { return filter2; }
                },
                'output': {
                    'get': function() { return filter2; }
                }
            });
        }
        
        return VCF;
    }
);
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
            
            filter1.Q.value = getResonanceFromValue(options.res / 2);
            filter2.Q.value = getResonanceFromValue(options.res / 2);
            
            var envelope = options.envelope;
            var vcfEnv = options.vcfEnv;
            var filterCutoff = getCutoffFreqFromValue(options.frequency);
            
            var attackLength;
            var decayLength;
            var sustainLevel;
            var releaseLength;
            
            var envModAmount;
            var maxLevel;
            
            setupEnvelope();
            filter1.connect(filter2);
            
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
                envModAmount = getEnvModAmount();
            }
            
            function getSustainLevel() {
                return  (envModAmount * util.getFaderCurve(envelope.sustain)) || minSustain;
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
            
            function getResonanceFromValue(value) {
                return util.getFaderCurve(value) * 50 + 1;
            }
            
            function getCutoffFreqFromValue(value) {
                var nyquist = App.context.sampleRate / 2;
                var freq = util.getFaderCurve(value) * nyquist;
                return freq > filterMinimum ? freq : filterMinimum;
            }
            
            function getEnvModAmount() {
                return getCutoffFreqFromValue(util.getFaderCurve(vcfEnv)) - filterMinimum;
            }
            
            function resetAttack() {
                var now = App.context.currentTime;
                
                
                that.noteOn(filter1.detune.value);
            }
            
            function resetRelease() {
                var now = App.context.currentTime;
                
                
                that.noteOff(envModAmount);
            }
            
            function setDecay() {
                var now = App.context.currentTime;
                decayLength = getdecayLength();
                filter1.frequency.cancelScheduledValues(now);
                filter2.frequency.cancelScheduledValues(now);
                filter1.frequency.exponentialRampToValueAtTime(sustainLevel, now + decayLength);
                filter2.frequency.exponentialRampToValueAtTime(sustainLevel, now + decayLength);
            }
            
            // Trigger the filter on keypress
            this.noteOn = function(initial) {
                var now = App.context.currentTime;
                
                if(!initial) {
                    initial = 0;
                    setupEnvelope();
                    setFilter();
                }
                
                filter1.detune.cancelScheduledValues(now);
                filter1.detune.setValueAtTime(initial, now);
                filter1.detune.linearRampToValueAtTime(envModAmount, now + attackLength);
                filter1.detune.exponentialRampToValueAtTime(sustainLevel, now + attackLength + decayLength);
                
                filter2.detune.cancelScheduledValues(now);
                filter2.detune.setValueAtTime(initial, now);
                filter2.detune.linearRampToValueAtTime(envModAmount, now + attackLength);
                filter2.detune.linearRampToValueAtTime(sustainLevel, now + attackLength + decayLength);
            };
            
            // Release the filter on keyup
            this.noteOff = function(initial) {
                var now = App.context.currentTime;
                
                initial = initial || filter1.detune.value;
        
                filter1.detune.cancelScheduledValues(now);
                filter1.detune.setValueAtTime(initial, now);
                filter1.detune.exponentialRampToValueAtTime(minSustain, now + releaseLength);
    
                filter2.detune.cancelScheduledValues(now);
                filter2.detune.setValueAtTime(initial, now);
                filter2.detune.exponentialRampToValueAtTime(minSustain, now + releaseLength);
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
                    'get': function() { return envModAmount; },
                    'set': function(value) { 
                        vcfEnv = value;
                        envModAmount = getEnvModAmount();
                        sustainLevel = getSustainLevel();
                        
                        if(attackObj.attacking) {
                            resetAttack();
                        } else if(releaseObj.releasing) {
                            resetRelease();
                        } else {
                            setupEnvelope();
                            setFilter();
                        }
                    }
                },
                'attack': {
                    'set': function(value) { 
                        
                        
                        envelope.attack = value;
                        setupEnvelope();
                        
                    }
                },
                'decay': {
                    'set': function(value) {
                        envelope.decay = value;
                        if(!attackObj.attacking && !releaseObj.releasing) {
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
                    'set': function(value) {
                        envelope.release = value;
                        setupEnvelope();
                        if(releaseObj.releasing) {
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
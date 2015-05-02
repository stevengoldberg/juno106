define([
    'application',
    'util'
],
    
    function(App, util) {
        function VCF(options) {
            // Initialization     
            var envelopeOffset = options.envConstants.envelopeOffset;
            var attackMax = options.envConstants.attackMax;
            var decayReleaseMax = options.envConstants.decayReleaseMax;
            var minSustain = options.envConstants.minSustain;
            var filterMinimum = 10;
            
            filter1 = App.context.createBiquadFilter();
            filter2 = App.context.createBiquadFilter();
            filter1.type = 'lowpass';
            filter2.type = 'lowpass';
            
            filter1.Q.value = getResonanceFromValue(options.res / 2);
            filter2.Q.value = filter1.Q.value;
            
            var envelope = options.envelope;
            var vcfEnv = options.vcfEnv;
            var filterCutoff = getCutoffFreqFromValue(options.frequency);
            
            var attackTime;
            var decayTime;
            var sustainLevel;
            var releaseTime;
            var envModAmount;
            var maxLevel;
            
            setupEnvelope(options.frequency);
            filter1.connect(filter2);
            
            // Setter methods
            function setRes(value) {
                var now = App.context.currentTime;
                var resonance = getResonanceFromValue(value);
                filter1.Q.setValueAtTime(resonance / 2, now);
                filter2.Q.setValueAtTime(resonance / 2, now);
            }
            
            function setFilter() {
                var now = App.context.currentTime;
                filter1.frequency.cancelScheduledValues(now);
                filter2.frequency.cancelScheduledValues(now);
                filter1.frequency.setValueAtTime(sustainLevel, now);
                filter2.frequency.setValueAtTime(sustainLevel, now);
            }
            
            // Helper methods
            function setupEnvelope() {
                attackTime = getAttackTime();
                decayTime = getDecayTime();
                releaseTime = getReleaseTime();
                sustainLevel = getSustainLevel();
                
                envModAmount = getEnvModAmount();
                maxLevel = getMaxLevel();
            }
            
            function getMaxLevel() {
                var nyquist = App.context.sampleRate / 2;
                var value = filterCutoff + envModAmount;
                return value > nyquist ? nyquist : value;
            }
            
            function getSustainLevel() {
                return filterCutoff + (envModAmount * util.getFaderCurve(envelope.sustain));
            }
            
            function getAttackTime() {
                return util.getFaderCurve(envelope.attack) * attackMax + envelopeOffset;
            }
            
            function getDecayTime() {
                return util.getFaderCurve(envelope.decay) * decayReleaseMax + envelopeOffset;
            }
            
            function getReleaseTime() {
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
            
            // Trigger the filter on keypress
            this.noteOn = function() {
                var now = App.context.currentTime;
                setupEnvelope();

                filter1.frequency.cancelScheduledValues(now);
                filter1.frequency.setValueAtTime(filterCutoff, now);
                filter1.frequency.linearRampToValueAtTime(maxLevel, now + attackTime);
                filter1.frequency.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
    
                filter2.frequency.cancelScheduledValues(now);
                filter2.frequency.setValueAtTime(filterCutoff, now);
                filter2.frequency.linearRampToValueAtTime(maxLevel, now + attackTime);
                filter2.frequency.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
            };
            
            // Release the filter on keyup
            this.noteOff = function() {
                var now = App.context.currentTime;
        
                filter1.frequency.cancelScheduledValues(now);
                filter1.frequency.setValueAtTime(filter1.frequency.value, now);
                filter1.frequency.exponentialRampToValueAtTime(filterCutoff, now + releaseTime);
    
                filter2.frequency.cancelScheduledValues(now);
                filter2.frequency.setValueAtTime(filter2.frequency.value, now);
                filter2.frequency.exponentialRampToValueAtTime(filterCutoff, now + releaseTime);
            };
            
            Object.defineProperties(this, {
                'cutoff': {
                    'get': function() { return sustainLevel; },
                    'set': function(value) { 
                        filterCutoff = getCutoffFreqFromValue(value);
                        setupEnvelope();
                        setFilter();
                    }
                },
                'envMod': {
                    'get': function() { return envModAmount; },
                    'set': function(value) { 
                        vcfEnv = value;
                        envModAmount = getEnvModAmount();
                        sustainLevel = getSustainLevel();
                        setFilter();
                    }
                },
                'attack': {
                    'set': function(value) { 
                        envelope.attack = value;
                        attackTime = getAttackTime();
                        setFilter();
                    }
                },
                'decay': {
                    'set': function(value) {
                        envelope.decay = value;
                        decayTime = getDecayTime();
                        setFilter();
                    }
                },
                'sustain': {
                    'set': function(value) {
                        envelope.sustain = value;
                        sustainLevel = getSustainLevel();
                        setFilter();
                    }
                },
                'release': {
                    'set': function(value) {
                        envelope.release = value;
                        releaseTime = getReleaseTime();
                        setFilter();
                    }
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
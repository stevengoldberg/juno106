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
            
            var attackTime;
            var decayTime;
            var sustainLevel;
            var releaseTime;
            
            var envModAmount;
            var maxLevel;
            
            var releaseObj = {
                releasing: false,
                releaseMoment: null,
                releaseTimeout: null,
                releaseCutoff: null
            };
            
            var attackObj = {
                attacking: false,
                attackMoment: null,
                attackTimeout: null
            };
            
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
                value = value || sustainLevel;
                
                var now = App.context.currentTime;
                filter1.frequency.cancelScheduledValues(now);
                filter2.frequency.cancelScheduledValues(now);
                filter1.frequency.setValueAtTime(value, now);
                filter2.frequency.setValueAtTime(value, now);
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
            
            function resetAttack() {
                var now = App.context.currentTime;
                var elapsed = now - attackObj.attackMoment;
                
                attackTime -= elapsed;
            
                maxLevel = getMaxLevel();
                sustainLevel = getSustainLevel();
                
                window.clearTimeout(attackObj.attackTimeout);
                that.noteOn(filter1.frequency.value);
            }
            
            function resetRelease() {
                var now = App.context.currentTime;
                var elapsed = now - releaseObj.releaseMoment;
                
                releaseTime -= elapsed;
                
                window.clearTimeout(releaseObj.releaseTimeout);

                that.noteOff();
            }
            
            function setDecay() {
                var now = App.context.currentTime;
                decayTime = getDecayTime();
                filter1.frequency.cancelScheduledValues(now);
                filter2.frequency.cancelScheduledValues(now);
                filter1.frequency.exponentialRampToValueAtTime(sustainLevel, now + decayTime);
                filter2.frequency.exponentialRampToValueAtTime(sustainLevel, now + decayTime);
            }
            
            // Trigger the filter on keypress
            this.noteOn = function(initial) {
                var now = App.context.currentTime;
                
                if(!initial) {
                    initial = filterCutoff;
                    setupEnvelope();
                }

                attackObj.attacking = true;
                attackObj.attackMoment = now;
                
                attackObj.attackTimeout = window.setTimeout(function() {
                    attackObj.attacking = false;
                }, (attackTime * 1000));

                filter1.frequency.cancelScheduledValues(now);
                filter1.frequency.setValueAtTime(initial, now);
                filter1.frequency.linearRampToValueAtTime(maxLevel, now + attackTime);
                filter1.frequency.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
    
                filter2.frequency.cancelScheduledValues(now);
                filter2.frequency.setValueAtTime(initial, now);
                filter2.frequency.linearRampToValueAtTime(maxLevel, now + attackTime);
                filter2.frequency.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
            };
            
            // Release the filter on keyup
            this.noteOff = function() {
                var now = App.context.currentTime;
                
                releaseObj.releaseMoment = now;
                attackObj.attacking = false;
                releaseObj.releasing = true;
                
                releaseObj.releaseTimeout = window.setTimeout(function() {
                    releaseObj.releasing = false;
                }, (releaseTime * 1000));
        
                filter1.frequency.cancelScheduledValues(now);
                filter1.frequency.setValueAtTime(filter1.frequency.value, now);
                filter1.frequency.exponentialRampToValueAtTime(filterCutoff, now + releaseTime);
    
                filter2.frequency.cancelScheduledValues(now);
                filter2.frequency.setValueAtTime(filter1.frequency.value, now);
                filter2.frequency.exponentialRampToValueAtTime(filterCutoff, now + releaseTime);
            };
            
            Object.defineProperties(this, {
                'cutoff': {
                    'get': function() { return sustainLevel; },
                    'set': function(value) { 
                        filterCutoff = getCutoffFreqFromValue(value);
                        envModAmount = getEnvModAmount();
                        
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
                'envMod': {
                    'get': function() { return envModAmount; },
                    'set': function(value) { 
                        vcfEnv = value;
                        envModAmount = getEnvModAmount();
                        
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
                        if(attackObj.attacking) {
                            that.noteOn(filter1.frequency.value);
                        }
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
                    'set': function(value) {
                        envelope.sustain = value;
                        sustainLevel = getSustainLevel();
                        if(! attackObj.attacking && !releaseObj.releasing) {
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
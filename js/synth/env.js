define([
    'application',
    'util'
],
    
    function(App, util) {
        function ENV(options) {
                      
            var that = this;
        
            var envelopeOffset = options.envConstants.envelopeOffset;
            var attackMax = options.envConstants.attackMax;
            var decayReleaseMax = options.envConstants.decayReleaseMax;
            var ampMod = App.context.createGain();
            var maxLevel = options.maxLevel;
            var enabled = options.envelope.enabled;
            var envelope = options.envelope;
            var attackLength;
            var decayLength;
            var sustainLevel;
            var releaseLength;
            var timing = {
                attack: null,
                release: null
            };
            
            this.input = ampMod;
            this.output = ampMod;
        
            function init() {
                ampMod.gain.value = 0;
                
                if(enabled) {
                    setSustain(envelope.sustain);
                    setAttack(envelope.attack);
                    setDecay(envelope.decay);
                    setRelease(envelope.release);
                } else {
                    setSustain(1);
                    attackLength = envelopeOffset;
                    decayLength = envelopeOffset;
                    releaseLength = envelopeOffset;
                }
            }
        
            function setSustain(value) {
                var now = App.context.currentTime;
                var sustaining = now > timing.attack + attackLength + decayLength &&
                    timing.release === null;
                
                sustainLevel = maxLevel * value;
            
                if(enabled && sustaining) {
                    ampMod.gain.cancelScheduledValues(now);
                    ampMod.gain.setValueAtTime(sustainLevel, now);
                }
            }
        
            function setAttack(value) {
                var now = App.context.currentTime;
                var attacking = now < timing.attack + attackLength;
                
                attackLength = util.getFaderCurve(value) * attackMax + envelopeOffset;
            
                if(enabled && attacking) {
                    that.noteOn(ampMod.gain.value);
                }
            }
        
            function setDecay(value) {
                var now = App.context.currentTime;
                var decaying = now < timing.attack + attackLength + decayLength;
                
                decayLength = util.getFaderCurve(value) * decayReleaseMax + envelopeOffset;
            
                if(enabled && decaying) {
                    ampMod.gain.linearRampToValueAtTime(sustainLevel, now + decayLength);
                }
            }
        
            function setRelease(value) {
                var now = App.context.currentTime;
                var releasing = timing.release &&
                    now < timing.release + releaseLength;
                
                releaseLength = util.getFaderCurve(value) * decayReleaseMax + envelopeOffset;
            
                if(enabled && releasing) {
                    that.noteOff();
                }
            }
        
            // Trigger the envelope on a keypress
            this.noteOn = function(initial) {
                var now = App.context.currentTime;
                initial = initial || 0;
                
                ampMod.gain.cancelScheduledValues(now);
                ampMod.gain.setValueAtTime(initial, now);
            
                if(enabled) {
                    timing.attack = now;
                    ampMod.gain.linearRampToValueAtTime(maxLevel, now + attackLength);
                    ampMod.gain.linearRampToValueAtTime(sustainLevel, now + attackLength + decayLength);
                } else {
                    ampMod.gain.linearRampToValueAtTime(maxLevel, now + envelopeOffset);
                }
            };
        
            // Release the envelope on keyup
            this.noteOff = function() {
                var now = App.context.currentTime;
            
                ampMod.gain.cancelScheduledValues(now);
                ampMod.gain.setValueAtTime(ampMod.gain.value, now);
            
                if(enabled) {
                    timing.release = now;
                    ampMod.gain.linearRampToValueAtTime(0, now + releaseLength);
                } else {
                    ampMod.gain.linearRampToValueAtTime(0, now + envelopeOffset);
                }
                // Set the DCO's stop time
                this.trigger('noteOff', enabled ? releaseLength : envelopeOffset);
            };
        
            Object.defineProperties(this, {
                'attack': {
                    'set': function(value) {
                        var e = {
                            value: value,
                            timing: timing
                        };
                        setAttack(value);
                        this.trigger('attack', e);
                    }
                },
                'decay': {
                    'set': function(value) {
                        var e = {
                            value: value,
                            timing: timing
                        };
                        setDecay(value);
                        this.trigger('decay', e);
                    }
                },
                'sustain': {
                    'set': function(value) {
                        var e = {
                            value: value,
                            timing: timing
                        };
                        setSustain(value);
                        this.trigger('sustain', e);
                    }
                },
                'release': {
                    'set': function(value) {
                        var e = {
                            value: value,
                            timing: timing
                        };
                        setRelease(value);
                        this.trigger('release', e);
                    }
                },
                'enabled': {
                    'set': function(value) { enabled = value; }
                }
            });
            
            return init();
            
        }
        return ENV;
    }
);
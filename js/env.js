define([
    'application',
    'util'
],
    
    function(App, util) {
        return Backbone.Marionette.Object.extend({ 
            
            initialize: function(options) {            
                // Initialization
                var that = this;
            
                var envelopeOffset = options.envConstants.envelopeOffset;
                var attackMax = options.envConstants.attackMax;
                var decayReleaseMax = options.envConstants.decayReleaseMax;
                var minSustain = options.envConstants.minSustain;
            
                var ampMod = App.context.createGain();
                ampMod.gain.value = minSustain;
            
                var maxLevel = options.maxLevel;
                var enabled = options.envelope.enabled;
                var envelope = options.envelope;
            
                var attackLength;
                var decayLength;
                var sustainModifier;
                var sustainLevel;
                var releaseLength;
                
                var timing = {
                    attack: null,
                    decay: null,
                    release: null
                };
            
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
            
                // Setter methods
                function setSustain(value) {
                    var now = App.context.currentTime;
                    var sustaining = now > timing.attack + attackLength + decayLength && 
                        timing.release === null;
                    
                    sustainLevel = (maxLevel * value) || minSustain;
                
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
                        ampMod.gain.exponentialRampToValueAtTime(sustainLevel, now + decayLength);
                    }
                }
            
                function setRelease(value) {
                    var now = App.context.currentTime;
                    var releasing = now < timing.release + releaseLength;
                    
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
                        ampMod.gain.exponentialRampToValueAtTime(sustainLevel, now + attackLength + decayLength);
                    } else {
                        ampMod.gain.linearRampToValueAtTime(maxLevel, now + envelopeOffset);
                    }
                };
            
                // Release the envelope on keyup
                this.noteOff = function() {
                    var now = App.context.currentTime;
                    var that = this;
                
                    ampMod.gain.cancelScheduledValues(now);
                    ampMod.gain.setValueAtTime(ampMod.gain.value, now);
                
                    if(enabled) {
                        timing.release = now;
                        ampMod.gain.exponentialRampToValueAtTime(minSustain, now + releaseLength);
                    } else {
                        ampMod.gain.exponentialRampToValueAtTime(minSustain, now + envelopeOffset);
                    }
                };
            
                Object.defineProperties(this, {
                    'attack': {
                        'get': function() { return attackLength; },
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
                        'get': function() { return decayLength; },
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
                        'get': function() { return sustainModifier; },
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
                        'get': function() { return releaseLength; },
                        'set': function(value) {
                            var e = {
                                value: value,
                                timing: timing
                            };
                            setRelease(value);
                            this.trigger('release', e);
                        }
                    },
                    'ampMod': {
                        'get': function() { return ampMod; },
                        'set': function() { ampMod.gain.value = value; }
                    },
                    'enabled': {
                        'get': function() { return enabled; },
                        'set': function(value) { enabled = value; }
                    }
                });
            }
        });
    }
);
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
            
                var attackTime;
                var decayTime;
                var sustainModifier;
                var sustainLevel;
                var releaseTime;
                var releasing = false;
            
                if(enabled) {
                    sustainModifier = envelope.sustain;
                    sustainLevel = (maxLevel * sustainModifier) || minSustain;
                    attackTime = setAttack(envelope.attack);
                    decayTime = setDecay(envelope.decay);
                    releaseTime = setRelease(envelope.release);
                } else {
                    sustainLevel = (maxLevel * sustainModifier) || minSustain;
                    attackTime = envelopeOffset;
                    decayTime = envelopeOffset;
                    sustainModifier = 1;
                    releaseTime = envelopeOffset;
                }
            
                // Setter methods
                function setSustain(sustainModifier) {
                    var now = App.context.currentTime;
                    sustainLevel = (maxLevel * sustainModifier) || minSustain;
                
                    if(enabled) {
                        //ampMod.gain.cancelScheduledValues(now);
                        ampMod.gain.setValueAtTime(sustainLevel, now);
                    }
                    that.trigger('sustain', sustainLevel);
                }
            
                function setAttack(value) {
                    var now = App.context.currentTime;
                    attackTime = util.getFaderCurve(value) * attackMax + envelopeOffset;
                
                    if(enabled) {
                        //ampMod.gain.cancelScheduledValues(now);
                        ampMod.gain.linearRampToValueAtTime(maxLevel, now + attackTime);
                    }
                    return attackTime;
                }
            
                function setDecay(value) {
                    var now = App.context.currentTime;
                    decayTime = util.getFaderCurve(value) * decayReleaseMax + envelopeOffset;
                
                    if(enabled) {
                        //ampMod.gain.cancelScheduledValues(now);
                        ampMod.gain.linearRampToValueAtTime(sustainLevel, now + decayTime);
                    }
                    return decayTime;
                }
            
                function setRelease(value) {
                    var now = App.context.currentTime;
                    releaseTime = util.getFaderCurve(value) * decayReleaseMax + envelopeOffset;
                
                    if(enabled && releasing) {
                        //ampMod.gain.cancelScheduledValues(now);
                        ampMod.gain.exponentialRampToValueAtTime(minSustain, now + releaseTime);
                    }
                    return releaseTime;
                }
            
                // Trigger the envelope on a keypress
                this.noteOn = function() {
                    var now = App.context.currentTime;
                    ampMod.gain.cancelScheduledValues(now);
                    ampMod.gain.setValueAtTime(0, now);
                
                    if(enabled) {
                        ampMod.gain.linearRampToValueAtTime(maxLevel, now + attackTime);
                        ampMod.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
                    } else {
                        ampMod.gain.linearRampToValueAtTime(maxLevel, now + envelopeOffset);
                    }
                };
            
                // Release the envelope on keyup
                this.noteOff = function() {
                    var now = App.context.currentTime;
                    releasing = true;
                
                    ampMod.gain.cancelScheduledValues(now);
                    ampMod.gain.setValueAtTime(ampMod.gain.value, now);
                
                    if(enabled) {
                        ampMod.gain.exponentialRampToValueAtTime(minSustain, now + releaseTime);
                    } else {
                        ampMod.gain.exponentialRampToValueAtTime(minSustain, now + envelopeOffset);
                    }
                };
            
                Object.defineProperties(this, {
                    'attack': {
                        'get': function() { return attackTime; },
                        'set': function(value) { 
                            attackTime = setAttack(value);
                            this.trigger('attack', attackTime);
                        }
                    },
                    'decay': {
                        'get': function() { return decayTime; },
                        'set': function(value) {
                            decayTime = setDecay(value);
                            this.trigger('decay', decayTime);
                        }
                    },
                    'sustain': {
                        'get': function() { return sustainLevel; },
                        'set': function(value) {
                            setSustain(value);
                            this.trigger('sustain', sustainLevel);
                        }
                    },
                    'release': {
                        'get': function() { return releaseTime; },
                        'set': function(value) {
                            releaseTime = setRelease(value);
                            this.trigger('release', releaseTime);
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
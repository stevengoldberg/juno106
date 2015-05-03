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
                var releaseObj = {
                    releasing: false,
                    releaseTime: null,
                    releaseTimeout: null
                };
                var attackObj = {
                    attacking: false,
                    attackTime: null,
                    attackTimeout: null
                };
            
                if(enabled) {
                    setSustain(envelope.sustain);
                    setAttack(envelope.attack);
                    setDecay(envelope.decay);
                    setRelease(envelope.release);
                } else {
                    setSustain(1);
                    attackTime = envelopeOffset;
                    decayTime = envelopeOffset;
                    releaseTime = envelopeOffset;
                }
            
                // Setter methods
                function setSustain(value) {
                    var now = App.context.currentTime;
                    
                    sustainLevel = (maxLevel * value) || minSustain;
                
                    if(enabled && !attackObj.attacking && !releaseObj.releasing) {
                        ampMod.gain.cancelScheduledValues(now);
                        ampMod.gain.setValueAtTime(sustainLevel, now);
                    }
                }
            
                function setAttack(value) {
                    var now = App.context.currentTime;
                    attackTime = util.getFaderCurve(value) * attackMax + envelopeOffset;
                
                    if(enabled && attackObj.attacking) {
                        resetAttack();
                    }
                }
            
                function setDecay(value) {
                    var now = App.context.currentTime;
                    decayTime = util.getFaderCurve(value) * decayReleaseMax + envelopeOffset;
                
                    if(enabled && !attackObj.attacking && !releaseObj.releasing) {
                        ampMod.gain.exponentialRampToValueAtTime(sustainLevel, now + decayTime);
                    }
                }
            
                function setRelease(value) {
                    var now = App.context.currentTime;
                    releaseTime = util.getFaderCurve(value) * decayReleaseMax + envelopeOffset;
                
                    if(enabled && releaseObj.releasing) {
                        resetRelease();
                    }
                }
                
                function resetAttack() {
                    window.clearTimeout(attackObj.attackTimeout);
                    that.noteOn(ampMod.gain.value);
                }
                
                function resetRelease() {                
                    window.clearTimeout(releaseObj.releaseTimeout);
                    that.noteOff();
                }
            
                // Trigger the envelope on a keypress
                this.noteOn = function(initial) {
                    var now = App.context.currentTime;
                    initial = initial || 0;
                    
                    ampMod.gain.cancelScheduledValues(now);
                    ampMod.gain.setValueAtTime(initial, now);
                
                    if(enabled) {
                        attackObj.attacking = true;
                        attackObj.attackTime = now;
                        
                        attackObj.attackTimeout = window.setTimeout(function() {
                            attackObj.attacking = false;
                        }, (attackTime * 1000));
                        
                        ampMod.gain.linearRampToValueAtTime(maxLevel, now + attackTime);
                        ampMod.gain.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
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
                    
                    attackObj.attacking = false;
                
                    if(enabled) {
                        releaseObj.releasing = true;
                        releaseObj.releaseTime = now;
                        
                        releaseObj.releaseTimeout = window.setTimeout(function() {
                            releaseObj.releasing = false;
                            that.trigger('released');
                        }, (releaseTime * 1000));
                        
                        ampMod.gain.exponentialRampToValueAtTime(minSustain, now + releaseTime);
                    } else {
                        ampMod.gain.exponentialRampToValueAtTime(minSustain, now + envelopeOffset);
                    }
                };
            
                Object.defineProperties(this, {
                    'attack': {
                        'get': function() { return attackTime; },
                        'set': function(value) { 
                            setAttack(value);
                            this.trigger('attack', value);
                        }
                    },
                    'decay': {
                        'get': function() { return decayTime; },
                        'set': function(value) {
                            setDecay(value);
                            this.trigger('decay', value);
                        }
                    },
                    'sustain': {
                        'get': function() { return sustainModifier; },
                        'set': function(value) {
                            setSustain(value);
                            this.trigger('sustain', value);
                        }
                    },
                    'release': {
                        'get': function() { return releaseTime; },
                        'set': function(value) {
                            setRelease(value);
                            this.trigger('release', value);
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
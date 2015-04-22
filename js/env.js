define([
    'application'
],
    
    function(App) {
        return Backbone.Marionette.Object.extend({
            initialize: function(options) {
                this.context = App.context;
                
                this.gain = this.context.createGain();
                this.gain.gain.value = 0;
                this.input = this.gain;
                this.output = this.gain;
                this.amplitude = this.gain.gain;
                
                // Gate === 1 if envelope is enabled
                this.gate = options.envelope.gate;
                
                this.attackTime = this.gate ? options.envelope.a : 0;
                this.decayTime = this.gate ? options.envelope.d : 0;
                this.releaseTime = this.gate ? options.envelope.r : 0;
                this.sustainModifier = this.gate ? options.envelope.s : 1;
                this.maxLevel = options.maxLevel;
                this.sustainLevel = this.maxLevel * this.sustainModifier;
            },
            
            connect: function(node) {
                if (_.has(node, 'input')) {
                    this.output.connect(node.input);
                } else {
                    this.output.connect(node);
                }
            },
            
            attack: function() {
                var now = this.context.currentTime;
                
                window.clearTimeout(this.triggerDecay);
                this.triggerDecay = window.setTimeout(this.decay.bind(this), this.attackTime * 1000);
                
                this.amplitude.cancelScheduledValues(now);
                this.amplitude.setValueAtTime(0, now);
                this.amplitude.linearRampToValueAtTime(this.maxLevel, now + this.attackTime);
                
            },
            
            decay: function() {
                var now = this.context.currentTime;
                this.amplitude.exponentialRampToValueAtTime(this.sustainLevel, 
                    now + this.decayTime);
            },
            
            release: function() {
                var now = this.context.currentTime;
                window.clearTimeout(this.triggerDecay);
                this.amplitude.cancelScheduledValues(now);
                this.amplitude.setValueAtTime(this.amplitude.value, now);
                this.amplitude.linearRampToValueAtTime(0, now + this.releaseTime);
            },
            
            a: function(attackTime) {
                this.attackTime = attackTime;
            },
            
            r: function(releaseTime) {
                this.releaseTime = releaseTime;
            },
            
            s: function(sustainModifier) {
                var now = this.context.currentTime;
                
                if(!this.gate) return;
                
                this.sustainLevel = this.maxLevel * sustainModifier;
                this.amplitude.cancelScheduledValues(now);
                this.amplitude.setValueAtTime(this.sustainLevel, now);
            }
        });
    }
);
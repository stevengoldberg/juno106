define([
    'application'
],
    
    function(App) {
        function ENV(options) {
            this.gain = App.context.createGain();
            this.gain.gain.value = 0;
            this.input = this.gain;
            this.output = this.gain;
            this.amplitude = this.gain.gain;
            
            // Gate === 1 if envelope is enabled
            this.gate = options.envelope.gate;
            
            // webAudio can't exponentially ramp to 0
            this.minSustain = 0.000001;
            
            this.attackTime = this.gate ? options.envelope.a : 0.015;
            this.decayTime = this.gate ? options.envelope.d : 0;
            
            this.sustainModifier = this.gate ? (options.envelope.s || this.minSustain) : 1;
            this.maxLevel = options.maxLevel;
            this.sustainLevel = this.maxLevel * this.sustainModifier;
        }
        
        ENV.prototype.connect = function(node) {
            if (_.has(node, 'input')) {
                this.output.connect(node.input);
            } else {
                this.output.connect(node);
            }
        };
        
        ENV.prototype.on = function() {
            var now = App.context.currentTime;

            this.amplitude.cancelScheduledValues(now);
            this.amplitude.setValueAtTime(0, now);
            this.amplitude.linearRampToValueAtTime(this.maxLevel, now + this.attackTime);
            this.amplitude.linearRampToValueAtTime(this.sustainLevel, now + this.attackTime + this.decayTime);
            
        };
        
        ENV.prototype.off = function(release) {
            var now = App.context.currentTime;
            this.amplitude.cancelScheduledValues(now);
            this.amplitude.setValueAtTime(this.amplitude.value, now);
            this.amplitude.exponentialRampToValueAtTime(this.minSustain, now + release);
        };
        
        ENV.prototype.a = function(attackTime) {
            this.attackTime = attackTime;
        };
        
        ENV.prototype.d = function(decayTime) {
            this.decayTime = decayTime;
        };
        
        ENV.prototype.r = function(releaseTime) {
            this.releaseTime = releaseTime;
        };
        
        ENV.prototype.s = function(sustainModifier) {
            var now = App.context.currentTime;
            
            if(!this.gate) return;
            
            this.sustainLevel = (this.maxLevel * sustainModifier) || this.minSustain;
            this.amplitude.cancelScheduledValues(now);
            this.amplitude.setValueAtTime(this.sustainLevel, now);
        };
        
        return ENV;
    }
);
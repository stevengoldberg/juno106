define([
    'application',
    'util'
],
    
    function(App, util) {
        function ENV(options) {
            this.envelopeOffset = 0.0015;
            this.attackMax = 3;
            this.decayReleaseMax = 12;
            
            this.ampMod = App.context.createGain();
            this.ampMod.gain.value = 0;
            
            
            // Gate === 1 if envelope is enabled
            this.envOn = options.envelope.enabled;
            
            // webAudio can't exponentially ramp to 0
            this.minSustain = 0.000001;
            
            this.attackTime = this.envOn ? this.getAttack(options.envelope.a) :
                this.envelopeOffset;
            
            this.decayTime = this.envOn ? this.getDecay(options.envelope.d) : 
                this.envelopeOffset;
            
            this.releaseTime = this.envOn ? this.getDecay(options.envelope.r) : 
                this.envelopeOffset;
            
            this.sustainModifier = this.envOn ? (options.envelope.s || this.minSustain) : 1;
            
            this.maxLevel = options.maxLevel;
            this.sustainLevel = this.maxLevel * this.sustainModifier;
        }
        
        ENV.prototype.trigger = function() {
            var now = App.context.currentTime;

            this.ampMod.gain.cancelScheduledValues(now);
            this.ampMod.gain.setValueAtTime(0, now);
            this.ampMod.gain.linearRampToValueAtTime(this.maxLevel, now + this.attackTime);
            this.ampMod.gain.linearRampToValueAtTime(this.sustainLevel, now + this.attackTime + this.decayTime);
        };
        
        ENV.prototype.off = function(release) {
            var now = App.context.currentTime;
            this.ampMod.gain.cancelScheduledValues(now);
            this.ampMod.gain.setValueAtTime(this.ampMod.gain.value, now);
            this.ampMod.gain.exponentialRampToValueAtTime(this.minSustain, now + this.releaseTime);
        };
        
        ENV.prototype.a = function(value) {
            this.attackTime = this.getAttack(value);
        };
        
        ENV.prototype.d = function(value) {
            this.decayTime = this.getDecay(value);
        };
        
        ENV.prototype.r = function(value) {
            this.releaseTime = this.getDecay(value);
        };
        
        ENV.prototype.getAttack = function(value) {
            return util.getFaderCurve(value) * this.attackMax + this.envelopeOffset;
        };
        
        ENV.prototype.getDecay = function(value) {
            return util.getFaderCurve(value) * this.decayReleaseMax + this.envelopeOffset;
        };
        
        ENV.prototype.s = function(sustainModifier) {
            var now = App.context.currentTime;
            
            if(!this.envOn) return;
            
            this.sustainLevel = (this.maxLevel * sustainModifier) || this.minSustain;
            this.ampMod.gain.cancelScheduledValues(now);
            this.ampMod.gain.setValueAtTime(this.sustainLevel, now);
        };
        
        return ENV;
    }
);
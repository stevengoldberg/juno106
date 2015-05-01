define([
    'application',
    'util'
],
    
    function(App, util) {
        function ENV(options) {
            this.envelopeOffset = 0.0015;
            this.attackMax = 3;
            this.decayReleaseMax = 12;
            
            // webAudio can't exponentially ramp to 0
            this.minSustain = 0.000001;
            
            this.ampMod = App.context.createGain();
            this.ampMod.gain.value = this.minSustain;
            
            this.maxLevel = options.maxLevel;
            
            this.enabled = null;
        }
        
        ENV.prototype.trigger = function(envelope) {
            var now = App.context.currentTime;
            
            this.enabled = envelope.enabled;

            var attackTime = envelope.enabled ? this.getAttack(envelope.attack) :
                this.envelopeOffset;
            var decayTime = envelope.enabled ? this.getDecay(envelope.decay) : 
                this.envelopeOffset;
            this.sustainModifier = envelope.enabled ? (envelope.sustain || this.minSustain) : 1;
            this.sustainLevel = this.maxLevel * this.sustainModifier;
            
            this.ampMod.gain.cancelScheduledValues(now);
            this.ampMod.gain.setValueAtTime(0, now);
            this.ampMod.gain.linearRampToValueAtTime(this.maxLevel, now + attackTime);
            this.ampMod.gain.linearRampToValueAtTime(this.sustainLevel, now + attackTime + decayTime);
        };
        
        ENV.prototype.off = function(release) {
            var now = App.context.currentTime;
            
            this.releaseTime = this.enabled ? release : this.envelopeOffset;
            
            this.ampMod.gain.cancelScheduledValues(now);
            this.ampMod.gain.setValueAtTime(this.ampMod.gain.value, now);
            this.ampMod.gain.exponentialRampToValueAtTime(this.minSustain, now + this.releaseTime);
        };
        
        ENV.prototype.getAttack = function(value) {
            return util.getFaderCurve(value) * this.attackMax + this.envelopeOffset;
        };
        
        ENV.prototype.getDecay = function(value) {
            return util.getFaderCurve(value) * this.decayReleaseMax + this.envelopeOffset;
        };
        
        ENV.prototype.s = function(sustainModifier) {
            var now = App.context.currentTime;
            
            if(!this.enabled) return;
            
            this.sustainLevel = (this.maxLevel * sustainModifier) || this.minSustain;
            this.ampMod.gain.cancelScheduledValues(now);
            this.ampMod.gain.setValueAtTime(this.sustainLevel, now);
        };
        
        return ENV;
    }
);
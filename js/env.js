define([
    'application'
],
    
    function(App) {
        return function() {
            function ENV(options) {
                this.context = App.context;
                
                this.attackTime = options.envelope.a;
                this.decayTime = options.envelope.d;
                this.releaseTime = options.envelope.r; 
                this.maxLevel = options.maxLevel;
            }
            
            ENV.prototype.connect = function(param) {
                this.param = param;
            };
            
            ENV.prototype.attack = function() {
                var now = this.context.currentTime;
                this.param.cancelScheduledValues(now);
                this.param.setValueAtTime(0, now);
                this.param.linearRampToValueAtTime(this.maxLevel, now + this.attackTime);
            };
            
            ENV.prototype.release = function() {
                var now = this.context.currentTime;
                this.param.cancelScheduledValues(now);
                this.param.linearRampToValueAtTime(0, now + this.releaseTime);
            };
            
            ENV.prototype.a = function(attackTime) {
                this.attackTime = attackTime;
            };
            
            ENV.prototype.r = function(releaseTime) {
                this.releaseTime = releaseTime;
            };
            
            return ENV;
        }();
    }
);
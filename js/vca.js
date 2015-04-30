define([
    'application'
],
    
    function(App) {
        function VCA(options) {
            this.gain = App.context.createGain();
            this.gain.gain.value = 0;
            this.input = this.gain;
            this.output = this.gain;
            this.amplitude = this.gain.gain;
            this.amplitude.value = options.maxLevel;
        }
        
        VCA.prototype.level = function(level) {
            var now = App.context.currentTime;
            
            this.amplitude.cancelScheduledValues(now);
            this.amplitude.setValueAtTime(level, now);
        };
        
        return VCA;    
    }

);
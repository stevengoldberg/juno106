define([
    'application'
],
    
    function(App) {
        function VCA(options) {
            var amplifier = App.context.createGain();
            var that = this;
            
            amplifier.gain.value = 0;
            this.input = amplifier.gain;
            this.output = amplifier;
            amplifier.gain.value = options.maxLevel;
            
            var level = function(level) {
                var now = App.context.currentTime;
                amplifier.cancelScheduledValues(now);
                amplifier.setValueAtTime(level, now);
            };
            
            Object.defineProperties(this, {
                'level': {
                    'get': function() { return amplifier.gain.value; },
                    'set': function(value) { console.log('setting ' + value); level(value); }
                }
            });
        }
        
        /*VCA.prototype.level = function(level) {
            console.log(this.level);
            this.level = level;
            
            /*var now = App.context.currentTime;
            
            this.amplitude.cancelScheduledValues(now);
            this.amplitude.setValueAtTime(level, now);
        };*/
        
        return VCA;    
    }

);
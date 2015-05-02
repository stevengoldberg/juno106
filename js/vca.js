define([
    'application'
],
    
    function(App) {
        function VCA(options) {
            var amplifier = App.context.createGain();
            this.input = amplifier;
            this.output = amplifier;
            
            var level = function(level) {
                var now = App.context.currentTime;
                amplifier.gain.cancelScheduledValues(now);
                amplifier.gain.setValueAtTime(level, now);
            };
            
            amplifier.gain.value = options.maxLevel;
            
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
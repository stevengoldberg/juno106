define([
    'application'
],
    
    function(App) {
        function VCA(options) {
            // Initialization
            var amplifier = App.context.createGain();
            amplifier.gain.value = options.maxLevel;
            
            // Setter methods
            function setLevel(level) {
                var now = App.context.currentTime;
                amplifier.gain.cancelScheduledValues(now);
                amplifier.gain.setValueAtTime(level, now);
            }
            
            Object.defineProperties(this, {
                'level': {
                    'get': function() { return amplifier; },
                    'set': function(value) { setLevel(value); }
                }
            });
        }
        
        return VCA;    
    }

);
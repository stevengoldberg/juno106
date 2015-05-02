define([
    'application'
],
    
    function(App) {
        function VCA(options) {
            var amplifier = App.context.createGain();
            this.input = amplifier;
            this.output = amplifier;
            
            amplifier.gain.value = options.maxLevel;
            
            function setLevel(level) {
                var now = App.context.currentTime;
                amplifier.gain.cancelScheduledValues(now);
                amplifier.gain.setValueAtTime(level, now);
            }
            
            Object.defineProperties(this, {
                'level': {
                    'get': function() { return amplifier.gain.value; },
                    'set': function(value) { setLevel(value); }
                }
            });
        }
        
        return VCA;    
    }

);
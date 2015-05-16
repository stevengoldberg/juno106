define([
    'application',
    'util'
],
    
    function(App, util) {
        function VCA(options) {
            var amplifier = App.context.createGain();
            this.input = amplifier;
            this.output = amplifier;
            
            function init() {
                amplifier.gain.value = util.getFaderCurve(options.maxLevel);
            }
            
            function setLevel(level) {
                var now = App.context.currentTime;
                amplifier.gain.cancelScheduledValues(now);
                amplifier.gain.setValueAtTime(level, now);
            }
            
            Object.defineProperties(this, {
                'level': {
                    'set': function(value) { setLevel(0.75 * value); }
                }
            });
            
            return init();
        }
        return VCA;    
    }

);
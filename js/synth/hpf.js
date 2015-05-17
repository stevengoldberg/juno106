define([
    'application'
],
    
    function(App) {
        function HPF(options) {            
            var frequencyMap = {
                0: 0,
                1: 100,
                2: 180,
                3: 320
            };
            var filter = App.context.createBiquadFilter();
            
            this.input = filter;
            this.output = filter;
            
            function init() {
                filter.type = 'highpass';
                filter.frequency.value = frequencyMap[options.frequency];
                filter.Q.value = 1;
            }
            
            function setFreq(value) {
                var now = App.context.currentTime;
                var freq = frequencyMap[value];
            
                filter.frequency.cancelScheduledValues(now);
                filter.frequency.setValueAtTime(freq, now);
            }
            
            Object.defineProperties(this, {
                'cutoff': {
                    'set': function(value) { setFreq(value); }
                }
            });
            
            return init();
        }
        
        return HPF;
    }
);
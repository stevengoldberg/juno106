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
            var filter1 = App.context.createBiquadFilter();
            var filter2 = App.context.createBiquadFilter();
            
            this.input = filter1;
            this.output = filter2;
            
            function init() {
                filter1.type = 'highpass';
                filter2.type = 'highpass';
                filter1.frequency.value = frequencyMap[options.frequency];
                filter2.frequency.value = frequencyMap[options.frequency];
                filter1.Q.value = 1;
                filter2.Q.value = 1;

                filter1.connect(filter2);
            }
            
            function setFreq(value) {
                var now = App.context.currentTime;
                var freq = frequencyMap[value];
            
                filter1.frequency.cancelScheduledValues(now);
                filter2.frequency.cancelScheduledValues(now);
                filter1.frequency.setValueAtTime(freq, now);
                filter2.frequency.setValueAtTime(freq, now);
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
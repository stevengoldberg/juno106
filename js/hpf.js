define([
    'application'
],
    
    function(App) {
        function HPF(options) {            
            this.frequencyMap = {
                0: 0,
                1: 100,
                2: 180,
                3: 320
            };
            
            this.filter1 = App.context.createBiquadFilter();
            this.filter2 = App.context.createBiquadFilter();
            this.filter1.type = 'highpass';
            this.filter2.type = 'highpass';
            this.filter1.frequency.value = this.frequencyMap[options.frequency];
            this.filter2.frequency.value = this.frequencyMap[options.frequency];
            this.filter1.Q.value = 1;
            this.filter2.Q.value = 1;
            
            this.input = this.filter1;
            this.output = this.filter2;
            this.filter1.connect(this.filter2);
        }
        
        HPF.prototype.connect = function(node) {
            if (_.has(node, 'input')) {
                this.output.connect(node.input);
            } else {
                this.output.connect(node);
            }
        };
        
        HPF.prototype.freq = function(value) {
            var now = App.context.currentTime;
            var freq = this.frequencyMap[value];
            
            this.filter1.frequency.cancelScheduledValues(now);
            this.filter2.frequency.cancelScheduledValues(now);
            this.filter1.frequency.setValueAtTime(freq, now);
            this.filter2.frequency.setValueAtTime(freq, now);
        };
        
        return HPF;
    }
);
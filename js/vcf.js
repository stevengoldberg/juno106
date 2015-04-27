define([
    'application'
],
    
    function(App) {
        function VCF(options) {            
            this.filter1 = App.context.createBiquadFilter();
            this.filter2 = App.context.createBiquadFilter();
            this.filter1.type = 'lowpass';
            this.filter2.type = 'lowpass';
            this.filter1.frequency.value = options.frequency;
            this.filter2.frequency.value = options.frequency;
            this.filter1.Q.value = options.res / 2;
            this.filter2.Q.value = options.res / 2;
            
            this.input = this.filter1;
            this.output = this.filter2;
            this.filter1.connect(this.filter2);
        }
        
        VCF.prototype.connect = function(node) {
            if (_.has(node, 'input')) {
                this.output.connect(node.input);
            } else {
                this.output.connect(node);
            }
        };
        
        VCF.prototype.freq = function(frequency) {
            var now = App.context.currentTime;
            this.filter1.frequency.setValueAtTime(frequency, now);
            this.filter2.frequency.setValueAtTime(frequency, now);
        };
        
        VCF.prototype.res = function(resonance) {
            var now = App.context.currentTime;
            this.filter1.Q.setValueAtTime(resonance / 2, now);
            this.filter2.Q.setValueAtTime(resonance / 2, now);
        };
        
        return VCF;
    }
);
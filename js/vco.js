define([
    'application'
],
    
    function(App) {
        return function() {
            function VCO(options) {
                this.context = App.context;
                
                this.oscillator = this.context.createOscillator();
                this.oscillator.type = options.waveform;
                this.setFrequency(options.frequency);
                this.oscillator.start();
                
                this.input = this.oscillator;
                this.output = this.oscillator;
            }
            
            VCO.prototype.setFrequency = function(frequency) {
                this.oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
            };
            
            VCO.prototype.connect = function(node) {
                if(_.has(node, 'input')) {
                    this.output.connect(node.input);
                } else {
                    this.output.connect(node);
                }
            };
            
            VCO.prototype.stop = function() {
                this.oscillator.stop();
            };
            
            return VCO;
        }();
    }
);
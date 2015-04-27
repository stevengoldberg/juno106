define([
    'application'
],
    
    function(App) {
        function VCO(options) {
            this.oscillator = App.context.createOscillator();
            this.oscillator.type = options.waveform;
            this.setFrequency(options.frequency);
            this.oscillator.start();
            
            this.input = this.oscillator;
            this.output = this.oscillator;
        }
        
        VCO.prototype.setFrequency = function(frequency) {
            this.oscillator.frequency.setValueAtTime(frequency, App.context.currentTime);
        };
        
        VCO.prototype.connect = function(node) {
            if(_.has(node, 'input')) {
                this.output.connect(node.input);
            } else {
                this.output.connect(node);
            }
        };
        
        VCO.prototype.stop = function(release) {
            this.oscillator.stop(release);
        };
        
        return VCO;
    }
);
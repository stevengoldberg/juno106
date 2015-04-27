define([
    'application'
],
    
    function(App) {
        function VCO(options) {
            this.oscillators = [];
            
            _.each(options.waveform, function(waveform, i) {
                this.oscillators[i] = App.context.createOscillator();
                this.oscillators[i].type = waveform;
                this.oscillators[i].frequency.setValueAtTime(options.frequency,
                    App.context.currentTime);
                this.oscillators[i].start();
            }, this);
        }
        
        /*VCO.prototype.setFrequency = function(frequency) {
            this.oscillator.frequency.setValueAtTime(frequency, App.context.currentTime);
        };*/
        
        VCO.prototype.connect = function(node) {
            if(_.has(node, 'input')) {
                _.each(this.oscillators, function(oscillator) {
                    oscillator.connect(node.input);
                });
            } else {
                _.each(this.oscillators, function(oscillator) {
                    oscillator.connect(node);
                });
            }
        };
        
        VCO.prototype.stop = function() {
            _.each(this.oscillators, function(oscillator) {
                oscillator.stop();
            });
        };
        
        return VCO;
    }
);
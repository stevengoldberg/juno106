define([
    'application'
],
    
    function(App) {
        return Backbone.Marionette.Object.extend({
            initialize: function(options) {
                this.context = App.context;
                
                this.oscillator = this.context.createOscillator();
                this.oscillator.type = options.waveform;
                this.setFrequency(options.frequency);
                this.oscillator.start();
                
                this.input = this.oscillator;
                this.output = this.oscillator;
            },
            
            setFrequency: function(frequency) {
                this.oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
            },
            
            connect: function(node) {
                if(_.has(node, 'input')) {
                    this.output.connect(node.input);
                } else {
                    this.output.connect(node);
                }
            },
            
            stop: function() {
                this.oscillator.stop();
            }
            
        });
    }
);
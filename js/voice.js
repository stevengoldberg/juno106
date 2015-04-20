define([
    'application'
],
    
    function(App) {
        return function() {
            function Voice(options) {
                this.frequency = options.frequency;
                this.type = options.waveform;
                this.volume = options.volume;
                this.oscillators = [];
            }
            
            Voice.prototype.start = function() {
                var vco = App.context.createOscillator();
                var vca;
                
                vco.type = this.type;
                vco.frequency.value = this.frequency;
                
                vca = App.context.createGain();
                vca.gain.value = this.volume;
                
                vco.connect(vca);
                vca.connect(App.context.destination);
                
                vco.start(0);
                this.oscillators.push(vco);
            };
            
            Voice.prototype.stop = function() {
                _.each(this.oscillators, function(oscillator) {
                    oscillator.stop();
                });
            };
            
            return Voice;
        }();
    }
);
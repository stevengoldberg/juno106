define([
    'application'
],
    
    function(App) {
        return function() {
            function VCO(options) {
                this.context = App.context;
                
                //this.volume = options.volume;
                
                this.oscillator = this.context.createOscillator();
                this.oscillator.type = options.waveform;
                this.setFrequency(options.frequency);
                this.oscillator.start();
                
                this.input = this.oscillator;
                this.output = this.oscillator;
            }
            
            /*VCO.prototype.start = function() {
                var note = {
                    vco: App.context.createOscillator(),
                    vca: App.context.createGain()
                };
                
                note.vco.type = this.type;
                note.vco.frequency.value = this.frequency;
                 
                note.vca.gain.value = this.volume;
                
                note.vco.connect(note.vca);
                note.vca.connect(App.context.destination);
                
                note.vco.start(0);
                this.voices.push(note);
            };*/
            
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
            
            /*Voice.prototype.vcaLevel = function(volume) {
                _.each(this.voices, function(voice) {
                    voice.vca.gain.value = volume;
                });
            };*/
            
            VCO.prototype.stop = function() {
                this.oscillator.stop();
            };
            
            return VCO;
        }();
    }
);
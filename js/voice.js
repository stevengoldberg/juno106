define([
    'application'
],
    
    function(App) {
        return function() {
            function Voice(options) {
                this.frequency = options.frequency;
                this.type = options.waveform;
                this.volume = options.volume;
                this.voices = [];
            }
            
            Voice.prototype.start = function() {
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
            };
            
            Voice.prototype.setVolume = function(volume) {
                _.each(this.voices, function(voice) {
                    voice.vca.gain.value = volume;
                });
            };
            
            Voice.prototype.stop = function() {
                _.each(this.voices, function(voice) {
                    voice.vca.gain = 0;
                    voice.vco.stop();
                });
            };
            
            return Voice;
        }();
    }
);
define([
    'application'
],
    
    function(App) {
        
        return {
            getFaderCurve: function(value) {
                return Math.pow(value, 4);
            },
            
            nyquist: function() {
                return App.context.sampleRate / 2;
            },
            
            frequencyFromMidiNote: function(noteNumber) {
                return 440 * Math.pow(2, (noteNumber - 69) / 12);
            },
            
            noteFromMidiNumber: function(noteNumber) {
                var pitchMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                var octave = Math.floor(noteNumber / 12);
                var pitch = pitchMap[noteNumber % 12];
                
                return pitch.toString() + octave.toString();   
            }
        };
    
    }

);
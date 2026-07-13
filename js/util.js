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
            },
            
            keyMap: {
                'KeyZ': 'Z_',
                'KeyX': 'X_',
                'KeyC': 'C_',
                'KeyV': 'V_',
                'KeyB': 'B_',
                'KeyN': 'N_',
                'KeyM': 'M_',
                'Comma': ',_',
                'KeyT': 'T_',
                'KeyY': 'Y_',
                'KeyU': 'U_',
                'KeyI': 'I_',
                'KeyO': 'O_',
                'KeyP': 'P_',
                'BracketLeft': '[_',
                'KeyS': 'S_',
                'KeyD': 'D_',
                'KeyG': 'G_',
                'KeyH': 'H_',
                'KeyJ': 'J_',
                'Digit5': '5_',
                'Digit6': '6_',
                'Digit8': '8_',
                'Digit9': '9_',
                'Digit0': '0_',
                'KeyR': 'R_',
                'KeyQ': 'Q_',
                'KeyW': 'W_',
                'Digit2': '2_',
                'KeyE': 'E_',
                'Digit3': '3_',
                'Period': '._',
                'Slash': '/_',
                'KeyL': 'L_',
                'Semicolon': ';_',
                'Digit1': '1_'
            },
            
            parseParamName: function(param) {
                var parsedParam = param.split('-');
                parsedParam[0] = parsedParam[0].toUpperCase();
                return parsedParam[0] + ' ' + parsedParam[1];
            },
            
            determineMSB: function(midiMessage) {
                if(midiMessage[0][1] > midiMessage[1][1]) {
                    return {
                        MSB: midiMessage[0][1],
                        MSBValue: midiMessage[0][2],
                        LSB: midiMessage[1][1],
                        LSBValue: midiMessage[1][2]
                    };
                } else {
                    return {
                        LSB: midiMessage[0][1],
                        LSBValue: midiMessage[0][2],
                        MSB: midiMessage[1][1],
                        MSBValue: midiMessage[1][2]
                    };
                }
            }
        };
    
    }

);

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
                90: 'Z_',
                88: 'X_',
                67: 'C_',
                86: 'V_',
                66: 'B_',
                78: 'N_',
                77: 'M_',
                188: ',_',
                84: 'T_',
                89: 'Y_',
                85: 'U_',
                73: 'I_',
                79: 'O_',
                80: 'P_',
                219: '[_',
                83: 'S_',
                68: 'D_',
                71: 'G_',
                72: 'H_',
                74: 'J_',
                53: '5_',
                54: '6_',
                56: '8_',
                57: '9_',
                48: '0_',
                82: 'R_',
                81: 'Q_',
                87: 'W_',
                50: '2_',
                69: 'E_',
                51: '3_',
                190: '._',
                191: '/_',
                76: 'L_',
                186: ';_',
                49: '1_'
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
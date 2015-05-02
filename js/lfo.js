define([
    'application',
    'util'
],
    
    function(App, util) {
        function LFO(options) {
            // Initialization
            var lfo = App.context.createOscillator();
            lfo.type = 'triangle';
            lfo.frequency.value = 0;
            lfo.start(0);
            
            var pitchMod = App.context.createGain();
            pitchMod.gain.value = 0;
            
            var freqMod = App.context.createGain();
            freqMod.gain.value = 0;
            
            lfo.connect(pitchMod);
            lfo.connect(freqMod);
            
            // Setter methods
            function setPitchMod(value) {
                var now = App.context.currentTime;
                pitchMod.gain.cancelScheduledValues(now);
                pitchMod.gain.setValueAtTime(getAmplitude(value), now);
            }
            
            function setFreqMod(value) {
                var now = App.context.currentTime;
                freqMod.gain.cancelScheduledValues(now);
                freqMod.gain.setValueAtTime(getAmplitude(value) * 200, now);
            }
            
            function setRate(value) {
                var now = App.context.currentTime;
                lfo.frequency.cancelScheduledValues(now);
                lfo.frequency.setValueAtTime(getRate(value), now);
            }
            
            // Helper methods
            function getAmplitude(value) {
                return util.getFaderCurve(value) * 40;
            }
            
            function getRate(value) {
                 return util.getFaderCurve(value) * 25;
            }
            
            // Trigger the LFO on a keypress
            this.trigger = function(options) {
                var now = App.context.currentTime;
                var currentPitchMod = getAmplitude(options.lfoPitch);
                var currentFreqMod = getAmplitude(options.lfoFreq) * 200;
                var delayTime = util.getFaderCurve(options.lfoDelay) * 3;
            
                pitchMod.gain.cancelScheduledValues(now);
                pitchMod.gain.setValueAtTime(0, now);
                pitchMod.gain.linearRampToValueAtTime(currentPitchMod, now + delayTime);
            
                freqMod.gain.cancelScheduledValues(now);
                freqMod.gain.setValueAtTime(0, now);
                freqMod.gain.linearRampToValueAtTime(currentFreqMod, now + delayTime);
            };
                
            Object.defineProperties(this, {
                'pitchMod': {
                    'get': function() { return pitchMod; },
                    'set': function(value) { console.log('setting pitchMod ' + value); setPitchMod(value); }
                },
                'freqMod': {
                    'get': function() { return freqMod; },
                    'set': function(value) { console.log('setting freqMod ' + value); setFreqMod(value); }
                },
                'rate': {
                    'get': function() { return lfo.frequency; },
                    'set': function(value) { console.log('setting rate ' + value); setRate(value); }
                }
            });

        }
        
        return LFO;
    }
);
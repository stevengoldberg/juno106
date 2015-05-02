define([
    'application',
    'util'
],
    
    function(App, util) {
        function LFO(options) {
            // Initialization
            var lfo = App.context.createOscillator();
            lfo.type = 'triangle';
            lfo.frequency.value = options.lfoRate;
            lfo.start(0);
            
            var pitchMod = App.context.createGain();
            pitchMod.gain.value = 0;
            
            var freqMod = App.context.createGain();
            freqMod.gain.value = 0;
            
            var delayTime = setDelay(options.lfoDelay);
            var pitchModFactor = getPitchModFactor(options.lfoPitch);
            var freqModFactor = getFreqModFactor(options.lfoFreq);
            
            lfo.connect(pitchMod);
            lfo.connect(freqMod);
            
            // Setter methods
            function setPitchMod() {
                var now = App.context.currentTime;
                pitchMod.gain.cancelScheduledValues(now);
                pitchMod.gain.setValueAtTime(pitchModFactor, now);
            }
            
            function setFreqMod() {
                var now = App.context.currentTime;
                freqMod.gain.cancelScheduledValues(now);
                freqMod.gain.setValueAtTime(freqModFactor, now);
            }
            
            function setRate(value) {
                var now = App.context.currentTime;
                lfo.frequency.cancelScheduledValues(now);
                lfo.frequency.setValueAtTime(getRate(value), now);
            }
            
            function setDelay(value) {
                return util.getFaderCurve(value) * 3;
            }
            
            // Helper methods
            function getAmplitude(value) {
                return util.getFaderCurve(value) * 40;
            }
            
            function getRate(value) {
                 return util.getFaderCurve(value) * 25;
            }
            
            function getPitchModFactor(value) {
                return getAmplitude(value);
            }
            
            function getFreqModFactor(value) {
                return getAmplitude(value) * 200;
            }
            
            // Trigger the LFO on a keypress
            this.noteOn = function() {
                var now = App.context.currentTime;
            
                pitchMod.gain.cancelScheduledValues(now);
                pitchMod.gain.setValueAtTime(0, now);
                pitchMod.gain.linearRampToValueAtTime(pitchModFactor, now + delayTime);
            
                freqMod.gain.cancelScheduledValues(now);
                freqMod.gain.setValueAtTime(0, now);
                freqMod.gain.linearRampToValueAtTime(freqModFactor, now + delayTime);
            };
                
            Object.defineProperties(this, {
                'pitchMod': {
                    'get': function() { return pitchMod; },
                    'set': function(value) { 
                        pitchModFactor = getPitchModFactor(value);
                        setPitchMod();
                    }
                },
                'freqMod': {
                    'get': function() { return freqMod; },
                    'set': function(value) { 
                        freqModFactor = getFreqModFactor(value);
                        setFreqMod();
                    }
                },
                'rate': {
                    'get': function() { return lfo.frequency; },
                    'set': function(value) { setRate(value); }
                },
                'delay': {
                    'set': function(value) { delayTime = setDelay(value); }
                }
            });

        }
        
        return LFO;
    }
);
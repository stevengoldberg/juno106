define([
    'application',
    'util'
],
    
    function(App, util) {
        function LFO(options) {
            var lfo = App.context.createOscillator();
            var pitchMod = App.context.createGain();
            var freqMod = App.context.createGain();       
            var pwmMod = App.context.createGain();
            
            var delayTime = setDelay(options.lfoDelay);
            var pitchModFactor = getPitchModFactor(options.lfoPitch);
            var freqModFactor = getFreqModFactor(options.lfoFreq);
            var pwmModFactor = getPitchModFactor(options.lfoPwm);
            var pwmModEnabled = options.lfoPwmEnabled;
            
            function init() { 
                lfo.type = 'triangle';
                lfo.frequency.value = options.lfoRate;
                lfo.start(0);
                
                pitchMod.gain.value = 0;
                freqMod.gain.value = 0;
                pwmMod.gain.value = 0;
                
                lfo.connect(pitchMod);
                lfo.connect(freqMod);
                lfo.connect(pwmMod);
            }
            
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
            
            function setPwmMod() {
                var now = App.context.currentTime;
                if(pwmModEnabled) {
                    pwmMod.gain.cancelScheduledValues(now);
                    pwmMod.gain.setValueAtTime(pwmModFactor, now);
                }
            }
            
            function setRate(value) {
                var now = App.context.currentTime;
                lfo.frequency.cancelScheduledValues(now);
                lfo.frequency.setValueAtTime(getRate(value), now);
            }
            
            function setDelay(value) {
                return util.getFaderCurve(value) * 3;
            }
            
            function getRate(value) {
                 return util.getFaderCurve(value) * 25;
            }
            
            function getPitchModFactor(value) {
                // +/- 400 cents
                return value * 400;
            }
            
            function getFreqModFactor(value) {
                // +/- 3.5 octaves
                return value * 4200;
            }
            
            function disablePwmMod() {
                var now = App.context.currentTime;
                enabled = false;
                pwmMod.gain.cancelScheduledValues(now);
                pwmMod.gain.setValueAtTime(0, now);
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
                
                if(pwmModEnabled) {
                    pwmMod.gain.cancelScheduledValues(now);
                    pwmMod.gain.setValueAtTime(0, now);
                    pwmMod.gain.linearRampToValueAtTime(pwmModFactor, now + delayTime);
                }
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
                'pwmMod': {
                    'get': function() { return pwmMod; },
                    'set': function(value) {
                        pwmModFactor = util.getFaderCurve(value) * 0.8;
                        setPwmMod();
                    }
                },
                'pwmEnabled': {
                    'set': function(value) {
                        pwmModEnabled = value;
                        if(pwmModEnabled) {
                            setPwmMod();
                        } else {
                            disablePwmMod();
                        }
                    }
                },
                'rate': {
                    'set': function(value) { setRate(value); }
                },
                'delay': {
                    'set': function(value) { delayTime = setDelay(value); }
                }
            });
            
            return init();

        }
        
        return LFO;
    }
);
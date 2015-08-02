define([
    'application',
    'util'
],
    
    function(App, util) {
        function DCO(options) {
            
            this.input = [];
            this.output = [];
            this.oscillators = [];
            this.NUM_OSCILLATORS;
            
            var that = this;
            
            var lfoPwmEnabled = options.lfoPwmEnabled;
            var sawtooth = createOsc(options.frequency, 'sawtooth', options.waveform.sawtoothLevel);
            var pulseWidth;
            var pulseWidthNode;
            var pulse = createPulse(options.frequency, options.waveform.pulseWidth, options.waveform.pulseLevel);
            var sub = createOsc(options.frequency / 2, 'square', options.waveform.subLevel);
            var noise = createNoise(options.waveform.noiseLevel);
            
            
            function init() { 
                // Start the oscillators, set up mod inputs
                _.each(that.oscillators, function(oscillator) {
                    oscillator.start(0);
                    oscillator.onended = destroyOscillator;
                    if(oscillator.frequency) {
                        that.input.push(oscillator.detune);
                    }
                });

                that.NUM_OSCILLATORS = that.oscillators.length;
            }
            
            function setSubLevel(level) {
                var now = App.context.currentTime;
                sub.gain.cancelScheduledValues(now);
                sub.gain.setValueAtTime(level, now);
            }
        
            function setSawtoothLevel(level) {
                var now = App.context.currentTime;
                sawtooth.gain.cancelScheduledValues(now);
                sawtooth.gain.setValueAtTime(level, now);
            }
            
            function setPulseLevel(level) {
                var now = App.context.currentTime;
                pulse.gain.cancelScheduledValues(now);
                pulse.gain.setValueAtTime(level, now);
            }
            
            function setNoiseLevel(level) {
                var now = App.context.currentTime;
                noise.gain.cancelScheduledValues(now);
                noise.gain.setValueAtTime(level, now);
            }
            
            function setPulseWidth(width) {
                var now = App.context.currentTime;
                
                if(_.isUndefined(width)) {
                    width = pulseWidth;
                }
                pulseWidthNode.cancelScheduledValues(now);
                pulseWidthNode.setValueAtTime(width, now);
            }
            
            function createNoise(level) {
                var bufferSize = App.context.sampleRate;
                var noiseBuffer = App.context.createBuffer(1, bufferSize, App.context.sampleRate);
                var output = noiseBuffer.getChannelData(0);
                var gain;
                
                for (var i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;       
                }
                whiteNoise = App.context.createBufferSource();
                whiteNoise.buffer = noiseBuffer;
                whiteNoise.loop = true;
                
                gain = App.context.createGain();
                gain.gain.value = level;
                whiteNoise.connect(gain);
                
                that.oscillators.push(whiteNoise);
                that.output.push(gain);
                return gain;
            }
            
            function createPulse(frequency, pwm, level) {
                var osc = App.context.createPulseOscillator();
                var gain = App.context.createGain();
                
                pwm *= 0.8;
                
                osc.frequency.value = frequency;
                gain.gain.value = util.getFaderCurve(level);
                osc.connect(gain);
                
                if(lfoPwmEnabled) {
                    osc.width.value = 0;
                } else {
                    osc.width.value = pwm;
                }
                
                that.oscillators.push(osc);
                that.output.push(gain);
                pulseWidthNode = osc.width;
                pulseWidth = pwm;
                return gain;
            }
        
            function createOsc(frequency, type, level) {
                var osc = App.context.createOscillator();
                var gain = App.context.createGain();
                osc.type = type;
                osc.frequency.value = frequency;                
                gain.gain.value = level;
                osc.connect(gain);
                that.oscillators.push(osc);
                that.output.push(gain);
                return gain;
            }
        
            function destroyOscillator() {
                that.trigger('destroyed');
            }
        
            // Stop the oscillators immediately for note-stealing or after the 
            // release envelope completes
            this.noteOff = function(releaseLength) {
                var now = App.context.currentTime;
                
                releaseLength = releaseLength || 0;
                
                _.each(this.oscillators, function(oscillator) {
                    oscillator.stop(now + releaseLength);
                });
            };
        
            Object.defineProperties(this, {
                'sawtooth': {
                    'set': function(value) { setSawtoothLevel(0.5 * value); }
                },
                'pulse': {
                    'set': function(value) { setPulseLevel(0.5 * value); }
                },
                'sub': {
                    'set': function(value) { setSubLevel(value); }
                },
                'noise': {
                    'set': function(value) { setNoiseLevel(value); }
                },
                'pwm': {
                    'get': function() { return pulseWidthNode; },
                    'set': function(value) { 
                        pulseWidth = value * 0.8;
                        if(!lfoPwmEnabled) {
                            setPulseWidth();
                        }
                        that.trigger('pwm', value);
                    }
                },
                'lfoPwmEnabled': {
                    'set': function(value) {
                        if(value === 1) {
                            setPulseWidth(0);
                        } else {
                            setPulseWidth();
                        }
                        that.trigger('lfoPwmEnabled', value);
                    }
                }
            });
            
            return init();
           
        }
        
        return DCO;
    }
);
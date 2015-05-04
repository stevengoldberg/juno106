define([
    'application'
],
    
    function(App) {
        return Backbone.Marionette.Object.extend({
            initialize: function(options) {
                this.output = [];
                this.input = [];
                this.oscillators = [];
                var that = this;
                
                var lfoPwmEnabled = options.lfoPwmEnabled;
            
                // Sawtooth osc
                var sawtooth = createOsc.call(this, options.frequency, 'sawtooth', options.waveform.sawtooth);
            
                // Pulse osc
                var pulseWidth;
                var pulseWidthNode;
                var pulse = createPulse.call(this, options.frequency, options.waveform.pwm, options.waveform.pulse);
            
                // Sub osc is a square wave -1 8ve from the main osc
                var sub = createOsc.call(this, options.frequency / 2, 'square', options.subLevel);
            
                // Start the oscillators, set up mod inputs
                _.each(this.oscillators, function(oscillator) {
                    oscillator.start(0);
                    oscillator.onended = destroyOscillator;
                    this.input.push(oscillator.frequency);
                }, this);
            
                // Setter methods
                function setSub(level) {
                    var now = App.context.currentTime;
                    sub.gain.cancelScheduledValues(now);
                    sub.gain.setValueAtTime(level, now);
                }
            
                function setRange(level) {

                }
            
                function setSawtooth(level) {
                    var now = App.context.currentTime;
                    sawtooth.gain.cancelScheduledValues(now);
                    sawtooth.gain.setValueAtTime(level, now);
                }
                
                function setPulse(level) {
                    var now = App.context.currentTime;
                    pulse.gain.cancelScheduledValues(now);
                    pulse.gain.setValueAtTime(level, now);
                }
                
                function setPulseWidth(width) {
                    var now = App.context.currentTime;
                    
                    if(_.isUndefined(width)) {
                        width = pulseWidth;
                    }
                    pulseWidthNode.cancelScheduledValues(now);
                    pulseWidthNode.setValueAtTime(width, now);
                }
                
                function createPulse(frequency, pwm, level) {
                    var osc = App.context.createPulseOscillator();
                    var gain = App.context.createGain();
                    
                    pwm *= 0.8;
                    
                    osc.frequency.value = frequency;
                    gain.gain.value = level;
                    osc.connect(gain);
                    
                    if(lfoPwmEnabled) {
                        osc.width.value = 0;
                    } else {
                        osc.width.value = pwm;
                    }
                    
                    this.oscillators.push(osc);
                    this.output.push(gain);
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
                    this.oscillators.push(osc);
                    this.output.push(gain);
                    return gain;
                }
            
                function destroyOscillator() {
                    that.trigger('destroyed');
                }
            
                this.noteOff = function() {
                    var now = App.context.currentTime;
                    _.each(this.oscillators, function(oscillator) {
                        oscillator.stop(now);
                    });
                };
            
                Object.defineProperties(this, {
                    'sawtooth': {
                        'set': function(value) { setSawtooth(value); }
                    },
                    'pulse': {
                        'set': function(value) { setPulse(value); }
                    },
                    'sub': {
                        'set': function(value) { setSub(value); }
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
                            if(value) {
                                setPulseWidth(0);
                            } else {
                                setPulseWidth();
                            }
                            that.trigger('lfoPwmEnabled', value);
                        }
                    }
                });
               
            }
        });
    }
);
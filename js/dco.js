define([
    'application'
],
    
    function(App) {
        function DCO(options) {
            this.output = [];
            this.input = [];
            this.oscillators = [];
            
            // Sawtooth osc
            this.sawtooth = App.context.createOscillator();
            this.sawtooth.type = 'sawtooth';
            this.sawtooth.frequency.value = options.frequency;
            this.sawtoothLevel = App.context.createGain();
            this.sawtoothLevel.gain.value = options.waveform.sawtooth;
            this.sawtooth.connect(this.sawtoothLevel);
            this.oscillators.push(this.sawtooth);
            this.output.push(this.sawtoothLevel);
            
            // Pulse osc consists of sawtooth + delayed ramp
            this.pulse_sawtooth = App.context.createOscillator();
            this.pulse_sawtooth.type = 'sawtooth';
            this.pulse_sawtooth.frequency.value = options.frequency;
            
            this.pulse_ramp = App.context.createOscillator();
            this.pulse_ramp.type = 'sawtooth';
            this.pulse_ramp.frequency.value = options.frequency;
            this.sawtoothInverter = App.context.createGain();
            this.sawtoothInverter.gain.value = -1;
            
            this.pulse_ramp.connect(this.sawtoothInverter);
            this.rampDelay = App.context.createDelay(1 / options.frequency);
            this.setPWM(options.waveform.pwm);
            this.sawtoothInverter.connect(this.rampDelay);
            this.input.push(this.rampDelay.delayTime);
            
            this.pulseBus = App.context.createGain();
            this.pulse_sawtooth.connect(this.pulseBus);
            this.rampDelay.connect(this.pulseBus);
            
            this.pulseLevel = App.context.createGain();
            this.pulseLevel.gain.value = options.waveform.pulse;
            this.pulseBus.connect(this.pulseLevel);
            this.oscillators.push(this.pulse_ramp, this.pulse_sawtooth);
            this.output.push(this.pulseLevel);
            
            // Sub osc is a square wave -1 8ve from the main osc
            this.subOsc = App.context.createOscillator();
            this.subOsc.type = 'square';
            this.subOsc.frequency.value = options.frequency / 2;
            this.oscillators.push(this.subOsc);
            
            this.subLevel = App.context.createGain();
            this.subOsc.connect(this.subLevel);
            this.subLevel.gain.value = options.waveform.sub;
            this.output.push(this.subLevel);
            
            // Start the oscillators, setup mod inputs
            _.each(this.oscillators, function(oscillator) {
                oscillator.start(0);
                this.input.push(oscillator.frequency);
            }, this);
        }
        

        DCO.prototype.noteOff = function(releaseTime) {
            var now = App.context.currentTime;
            _.each(this.oscillators, function(oscillator) {
                oscillator.stop(now + releaseTime);
            });
        };
        
        DCO.prototype.sub = function(value) {
            var now = App.context.currentTime;
            this.subLevel.gain.cancelScheduledValues(now);
            this.subLevel.gain.setValueAtTime(value, now);
        };
        
        DCO.prototype.range = function() {
            //stub
        };
        
        return DCO;
    }
);
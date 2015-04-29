define([
    'application'
],
    
    function(App) {
        function LFO(options) {
            this.lfo = App.context.createOscillator();
            this.lfo.type = 'triangle';
            this.lfo.frequency.value = this.getRate(options.rate);
            this.lfo.start(0);
            
            this.pitchMod = App.context.createGain();
            this.pitchMod.gain.value = this.getAmplitude(options.pitchMod);
            
            this.freqMod = App.context.createGain();
            this.freqMod.gain.value = this.getAmplitude(options.freqMod) * 300;
            
            this.lfo.connect(this.pitchMod);
            this.lfo.connect(this.freqMod);
            
            this.delayTime = Math.pow(options.delay, 2) * 3;
        }
        
        LFO.prototype.pitch = function(value) {
            var now = App.context.currentTime;
            this.pitchMod.gain.cancelScheduledValues(now);
            this.pitchMod.gain.setValueAtTime(this.getAmplitude(value), now);
        };
        
        LFO.prototype.freq = function(value) {
            var now = App.context.currentTime;
            this.freqMod.gain.cancelScheduledValues(now);
            this.freqMod.gain.setValueAtTime(this.getAmplitude(value) * 300, now);
        };
        
        LFO.prototype.rate = function(value) {
            var now = App.context.currentTime;
            this.lfo.frequency.cancelScheduledValues(now);
            this.lfo.frequency.setValueAtTime(this.getRate(value), now);
        };
        
        LFO.prototype.delay = function(value) {
            this.delayTime = value * 3;
        };
        
        LFO.prototype.trigger = function() {
            var now = App.context.currentTime;
            var currentPitchMod = this.pitchMod.gain.value;
            var currentFreqMod = this.freqMod.gain.value;
            
            this.pitchMod.gain.cancelScheduledValues(now);
            this.pitchMod.gain.value = 0;
            this.pitchMod.gain.linearRampToValueAtTime(currentPitchMod, now + this.delayTime);
            
            this.freqMod.gain.cancelScheduledValues(now);
            this.freqMod.gain.value = 0;
            this.freqMod.gain.linearRampToValueAtTime(currentFreqMod, now + this.delayTime);
        };
        
        LFO.prototype.getRate = function(value) {
            return Math.pow(value, 3) * 25;
        };
        
        LFO.prototype.getAmplitude = function(value) {
            return Math.pow(value, 2) * 40;
        };
            
        return LFO;
    }
);
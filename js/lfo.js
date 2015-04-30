define([
    'application',
    'util'
],
    
    function(App, util) {
        function LFO(options) {
            this.lfo = App.context.createOscillator();
            this.lfo.type = 'triangle';
            
            this.lfo.start(0);
            
            this.pitchMod = App.context.createGain();
            
            this.freqMod = App.context.createGain();
            
            this.lfo.connect(this.pitchMod);
            this.lfo.connect(this.freqMod);

        }
        
        LFO.prototype.pitch = function(value) {
            var now = App.context.currentTime;
            this.pitchMod.gain.cancelScheduledValues(now);
            this.pitchMod.gain.setValueAtTime(this.getAmplitude(value), now);
        };
        
        LFO.prototype.freq = function(value) {
            var now = App.context.currentTime;
            this.freqMod.gain.cancelScheduledValues(now);
            this.freqMod.gain.setValueAtTime(this.getAmplitude(value) * 200, now);
        };
        
        LFO.prototype.rate = function(value) {
            var now = App.context.currentTime;
            this.lfo.frequency.cancelScheduledValues(now);
            this.lfo.frequency.setValueAtTime(this.getRate(value), now);
        };
        
        LFO.prototype.delay = function(value) {
            //this.delayTime = value * 3;
        };
        
        LFO.prototype.trigger = function(options) {
            var now = App.context.currentTime;
            var currentPitchMod = this.getAmplitude(options.lfoPitch);
            var currentFreqMod = this.getAmplitude(options.lfoFreq) * 200;
            var delayTime = util.getFaderCurve(options.lfoDelay) * 3;
            
            this.pitchMod.gain.cancelScheduledValues(now);
            this.pitchMod.gain.value = 0;
            this.pitchMod.gain.linearRampToValueAtTime(currentPitchMod, now + delayTime);
            
            this.freqMod.gain.cancelScheduledValues(now);
            this.freqMod.gain.value = 0;
            this.freqMod.gain.linearRampToValueAtTime(currentFreqMod, now + delayTime);
        };
        
        LFO.prototype.getRate = function(value) {
            return util.getFaderCurve(value) * 25;
        };
        
        LFO.prototype.getAmplitude = function(value) {
            return Math.pow(value, 2) * 40;
        };
            
        return LFO;
    }
);
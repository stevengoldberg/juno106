define([
    'application',
    'util'
],
    
    function(App, util) {
        function VCF(options) {            
            this.filter1 = App.context.createBiquadFilter();
            this.filter2 = App.context.createBiquadFilter();
            this.filter1.type = 'lowpass';
            this.filter2.type = 'lowpass';
            
            this.envelopeOffset = 0.0015;
            this.attackMax = 3;
            this.decayReleaseMax = 12;
            this.minSustain = 0.0001;
            
            this.filterCutoff = this.getFilterFreqFromCutoff(options.frequency);
            
            this.filter1.Q.value = this.getResonanceFromValue(options.res / 2);
            this.filter2.Q.value = this.filter1.Q.value;
            
            this.envelope = options.envelope;
            this.vcfEnv = options.vcfEnv;
            this.envModAmount = this.getEnvModAmount();
            this.sustainLevel = this.filterCutoff + (this.envModAmount * util.getFaderCurve(this.envelope.sustain));
            
            this.input = this.filter1;
            this.output = this.filter2;
            this.filter1.connect(this.filter2);
        }
        
        VCF.prototype.freq = function(value) {
            this.setupEnvValues(value);
            this.setFilter();
        };
        
        VCF.prototype.setFilter = function() {
            var now = App.context.currentTime;
            this.filter1.frequency.cancelScheduledValues(now);
            this.filter2.frequency.cancelScheduledValues(now);
            this.filter1.frequency.setValueAtTime(this.sustainLevel, now);
            this.filter2.frequency.setValueAtTime(this.sustainLevel, now);
        };
        
        VCF.prototype.setupEnvValues = function(value, cutoff) {
            this.filterCutoff = value === null ? cutoff : this.getFilterFreqFromCutoff(value);
            this.envModAmount = this.getEnvModAmount();
            this.maxLevel = this.getMaxLevel();
            this.sustainLevel = this.maxLevel * util.getFaderCurve(this.envelope.sustain);
        };
        
        VCF.prototype.res = function(value) {
            var now = App.context.currentTime;
            var resonance = this.getResonanceFromValue(value);
            this.filter1.Q.setValueAtTime(resonance / 2, now);
            this.filter2.Q.setValueAtTime(resonance / 2, now);
        };
        
        VCF.prototype.trigger = function(envelope) {
            var now = App.context.currentTime;
            var attackTime = util.getFaderCurve(envelope.attack) * this.attackMax + this.envelopeOffset;
            var decayTime = util.getFaderCurve(envelope.decay) * this.decayReleaseMax + this.envelopeOffset;
            
            this.setupEnvValues(null, this.filterCutoff);

            this.filter1.frequency.cancelScheduledValues(now);
            this.filter1.frequency.setValueAtTime(this.filterCutoff, now);
            this.filter1.frequency.linearRampToValueAtTime(this.maxLevel, now + attackTime);
            this.filter1.frequency.linearRampToValueAtTime(this.sustainLevel, now + attackTime + decayTime);
            
            this.filter2.frequency.cancelScheduledValues(now);
            this.filter2.frequency.setValueAtTime(this.filterCutoff, now);
            this.filter2.frequency.linearRampToValueAtTime(this.maxLevel, now + attackTime);
            this.filter2.frequency.linearRampToValueAtTime(this.sustainLevel, now + attackTime + decayTime);
        };
        
        VCF.prototype.getMaxLevel = function() {
            var nyquist = App.context.sampleRate / 2;
            var value = this.filterCutoff + this.envModAmount;
            return value > nyquist ? nyquist : value;
        };
        
        VCF.prototype.env = function(value) {
            this.vcfEnv = util.getFaderCurve(value);
            this.setupEnvValues(null, this.filterCutoff);
            this.setFilter();
        };
        
        VCF.prototype.getEnvModAmount = function() {
            return this.getFilterFreqFromCutoff(util.getFaderCurve(this.vcfEnv)) - 10;
        };
        
        VCF.prototype.off = function(releaseValue) {
            var now = App.context.currentTime;
            var releaseTime = util.getFaderCurve(releaseValue) * this.decayReleaseMax + this.envelopeOffset;
            this.envModAmount = this.getEnvModAmount();
                
            this.filter1.frequency.cancelScheduledValues(now);
            this.filter1.frequency.setValueAtTime(this.filter1.frequency.value, now);
            this.filter1.frequency.exponentialRampToValueAtTime(this.filterCutoff, now + releaseTime);
            
            this.filter2.frequency.cancelScheduledValues(now);
            this.filter2.frequency.setValueAtTime(this.filter2.frequency.value, now);
            this.filter2.frequency.exponentialRampToValueAtTime(this.filterCutoff, now + releaseTime);
        };
        
        VCF.prototype.getFilterFreqFromCutoff = function(cutoff) {
            var nyquist = App.context.sampleRate / 2;
            var freq = util.getFaderCurve(cutoff) * nyquist;
            return freq > 10 ? freq : 10;
        };
        
        VCF.prototype.getResonanceFromValue = function(value) {
            return util.getFaderCurve(value) * 50 + 1;
        };
        
        return VCF;
    }
);
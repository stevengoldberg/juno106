define([
    'application'
],
    
    function(App) {
        function VCF(options) {            
            this.filter1 = App.context.createBiquadFilter();
            this.filter2 = App.context.createBiquadFilter();
            this.filter1.type = 'lowpass';
            this.filter2.type = 'lowpass';
            this.filter1.frequency.value = options.frequency;
            this.filter2.frequency.value = options.frequency;
            this.filter1.Q.value = this.getResonanceFromValue(options.res / 2);
            this.filter2.Q.value = this.getResonanceFromValue(options.res / 2);
            
            this.envMod = options.vcfEnv;
            this.env = options.env;
            
            this.input = this.filter1;
            this.output = this.filter2;
            this.filter1.connect(this.filter2);
        }
        
        VCF.prototype.connect = function(node) {
            if (_.has(node, 'input')) {
                this.output.connect(node.input);
            } else {
                this.output.connect(node);
            }
        };
        
        VCF.prototype.freq = function(cutoff) {
            var now = App.context.currentTime;
            var freq = this.getFilterFreqFromCutoff(cutoff);
            
            this.filter1.frequency.cancelScheduledValues(now);
            this.filter2.frequency.cancelScheduledValues(now);
            this.filter1.frequency.setValueAtTime(freq, now);
            this.filter2.frequency.setValueAtTime(freq, now);
        };
        
        VCF.prototype.res = function(value) {
            var now = App.context.currentTime;
            var resonance = this.getResonanceFromValue(value);
            this.filter1.frequency.cancelScheduledValues(now);
            this.filter2.frequency.cancelScheduledValues(now);
            this.filter1.Q.setValueAtTime(resonance / 2, now);
            this.filter2.Q.setValueAtTime(resonance / 2, now);
        };
        
        VCF.prototype.getFilterFreqFromCutoff = function(cutoff) {
            var nyquist = App.context.sampleRate / 2;
            var freq = Math.pow(cutoff, 3) * nyquist;
            return freq > 10 ? freq : 10;
        };
        
        VCF.prototype.getResonanceFromValue = function(value) {
            return Math.pow(value, 2) * 50 + 1;
        };
        
        return VCF;
    }
);
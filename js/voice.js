define([
    'application',
    'vco',
    'vca',
    'env',
    'vcf'
],
    
    function(App, VCO, VCA, ENV, VCF) {
        function Voice(options) {
            this.vco = new VCO({
                frequency: options.frequency,
                waveform: options.waveform
            });
            
            this.vcf = new VCF({
                frequency: options.vcfFreq,
                res: options.res
            });
            
            this.vca = new VCA();
            
            this.env = new ENV({
                envelope: options.envelope,
                maxLevel: options.maxLevel
            });
            
            if(!_.isEmpty(options.waveform)) {
                this.vco.connect(this.vcf);
                this.vcf.connect(this.vca);
                this.vca.connect(this.env);
                this.env.connect(App.context.destination);
            }
        }
        
        Voice.prototype.noteOff = function(release) {
            this.env.release(release);
            this.vco.stop(release);
        };
        
        return Voice;
    }
);
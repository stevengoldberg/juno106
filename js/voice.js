define([
    'application',
    'dco',
    'vca',
    'env',
    'vcf',
    'lfo',
    'hpf'
],
    
    function(App, DCO, VCA, ENV, VCF, LFO, HPF) {
        return Backbone.Marionette.Object.extend({
            initialize: function(options) {
                this.maxLevel = options.maxLevel;
                
                this.lfo = new LFO({
                    rate: options.lfoRate,
                    pitchMod: options.lfoPitch,
                    delay: options.lfoDelay
                });
                
                this.dco = new DCO({
                    frequency: options.frequency,
                    waveform: options.waveform,
                    subLevel: options.subLevel
                });
                
                this.hpf = new HPF({
                    frequency: options.hpfFreq
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
                    this.lfo.connect(this.dco);
                    this.dco.connect(this.hpf);
                    this.hpf.connect(this.vcf);
                    this.vcf.connect(this.vca);
                    this.vca.connect(this.env);
                    this.env.connect(App.context.destination);
                }
            },
            
            noteOn: function() {
                this.vca.level(this.maxLevel);
                this.lfo.trigger();
                this.env.trigger();
            },
        
            noteOff: function(release) {
                var that = this;
                this.env.off(release);
                /*window.setTimeout(function() {
                    that.trigger('off');
                }, release * 1000);*/
            }
    });
});
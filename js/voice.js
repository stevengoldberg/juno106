define([
    'application',
    'vco',
    'vca',
    'env',
    'vcf'
],
    
    function(App, VCO, VCA, ENV, VCF) {
        return Backbone.Marionette.Object.extend({
            initialize: function(options) {
                this.maxLevel = options.maxLevel;
                
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
            },
            
            noteOn: function() {
                this.vca.level(this.maxLevel);
                this.env.on();
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
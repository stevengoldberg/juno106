define([
    'application',
    'vco',
    'vca',
    'env',
    'cho'
],
    
    function(App, VCO, VCA, ENV, CHO) {
        return Backbone.Marionette.Object.extend({
            initialize: function(options) {
                this.context = App.context;
                
                this.vco = new VCO({
                    frequency: options.frequency,
                    waveform: options.waveform
                });
                
                this.vca = new VCA();
                
                this.env = new ENV({
                    envelope: options.envelope,
                    maxLevel: options.maxLevel
                });
                
                this.cho = new CHO({
                    mode: options.chorus
                });
                
                if(!_.isEmpty(options.waveform)) {
                    this.vco.connect(this.vca);
                    this.vca.connect(this.env);
                    this.env.connect(this.cho);
                    this.cho.connect(this.context.destination);
                }
            }
            
            
        });
    }
);
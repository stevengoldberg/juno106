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
                    freqMod: options.lfoFreq,
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
                    res: options.res,
                    envelope: options.envelope
                });
            
                this.vca = new VCA();
            
                this.env = new ENV({
                    envelope: options.envelope,
                    freqMod: options.envFreqMod,
                    maxLevel: options.maxLevel
                });
            
                if(!_.isEmpty(options.waveform)) {
                    this.connect(this.lfo.pitchMod, this.dco.input);

                    this.connect(this.lfo.freqMod, this.vcf.filter1.detune);
                    this.connect(this.lfo.freqMod, this.vcf.filter2.detune);
                    
                    this.connect(this.dco.output, this.hpf.input);
                    this.connect(this.hpf.output, this.vcf.input);
                    this.connect(this.vcf.output, this.vca.input);
                    this.connect(this.vca.output, this.env.ampMod);
                    this.connect(this.env.ampMod, App.context.destination);
                }
            },
            
            noteOn: function() {
                this.vca.level(this.maxLevel);
                this.lfo.trigger();
                this.env.trigger();
            },
        
            noteOff: function(releaseValue) {
                var releaseTime = this.env.getDecay(releaseValue);
                this.env.off();
                this.dco.off(releaseTime);
                this.lfo.off(releaseTime);
            },
            
            connect: function(output, input) {
                if(_.isArray(output)) {
                    _.forEach(output, function(outputNode) {
                        outputNode.connect(input);
                    });
                } else if(_.isArray(input)) {
                    _.forEach(input, function(inputNode) {
                        output.connect(inputNode);
                    });
                } else {
                    output.connect(input);
                }
            }
    });
});
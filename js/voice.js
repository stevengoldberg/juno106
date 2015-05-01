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
                
                this.lfo = options.lfo;
                
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
                    envelope: options.envelope,
                    vcfEnv: options.vcfEnv
                });
            
                this.vca = new VCA({
                    maxLevel: options.maxLevel
                });
            
                this.env = new ENV({
                    //envelope: options.envelope,
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
            
            noteOn: function(options) {
                var triggerEnvelope = {
                    attack: options.envelope.a,
                    decay: options.envelope.d,
                    sustain: options.envelope.s,
                    enabled: options.envelope.enabled
                };
                
                this.lfo.trigger({
                    lfoRate: options.lfoRate,
                    lfoFreq: options.lfoFreq,
                    lfoDelay: options.lfoDelay,
                    lfoPitch: options.lfoPitch
                });
                
                this.env.trigger(triggerEnvelope);
                this.vcf.trigger(triggerEnvelope);
            },
        
            noteOff: function(releaseValue) {
                var releaseTime = this.env.getDecay(releaseValue);
                this.env.off(releaseTime);
                this.vcf.off(releaseTime);
                this.dco.off(releaseTime);
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
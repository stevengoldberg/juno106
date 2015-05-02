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
                
                this.cho = options.chorus;
                this.cho.chorusToggle = this.chorusToggle.bind(this);
                
                this.chorusToggle(options.chorusLevel);
                
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
                    envelope: options.envelope,
                    maxLevel: options.maxLevel
                });
            
                this.connect(this.lfo.pitchMod, this.dco.input);

                this.connect(this.lfo.freqMod, this.vcf.filter1.detune);
                this.connect(this.lfo.freqMod, this.vcf.filter2.detune);
                
                this.connect(this.dco.output, this.hpf.cutoff);
                this.connect(this.hpf.cutoff, this.vcf.input);
                this.connect(this.vcf.output, this.vca.level);
                this.connect(this.vca.level, this.env.ampMod);
                this.connect(this.env.ampMod, this.cho.input);
                this.connect(this.cho, App.context.destination);
            },
            
            noteOn: function(options) {
                var triggerEnvelope = {
                    attack: this.env.attack,
                    decay: this.env.decay,
                    sustain: this.env.sustain,
                    enabled: this.env.enabled
                };
                
                this.lfo.trigger({
                    lfoRate: options.lfoRate,
                    lfoFreq: options.lfoFreq,
                    lfoDelay: options.lfoDelay,
                    lfoPitch: options.lfoPitch
                });
                
                this.env.trigger();
                this.vcf.trigger(triggerEnvelope);
            },
        
            noteOff: function() {
                var releaseTime = this.env.release;
                this.env.off();
                this.vcf.off(releaseTime);
                this.dco.off(releaseTime);
            },
            
            chorusToggle: function(level) {
                switch(level) {
                    case 0:
                        this.cho.bypass = 1;
                        break;
                    case 1:
                        this.cho.bypass = 0;
                        this.cho.feedback = 0.15;
                        this.cho.delay = 0.05;
                        this.cho.rate = 0.1;
                        break;
                    case 2:
                        this.cho.bypass = 0;
                        this.cho.feedback = 0.5;
                        this.cho.delay = 0.25;
                        this.cho.rate = 0.6;
                        break;
                }
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
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
                
                var envConstants = {
                    envelopeOffset: 0.0015,
                    attackMax: 3,
                    decayReleaseMax: 12,
                    minSustain: 0.0001
                };
                
                var that = this;
                
                this.lfo = options.lfo;
                
                this.cho = options.chorus;
                this.cho.chorusToggle = chorusToggle;
                chorusToggle(options.chorusLevel);
                
                this.dco = new DCO({
                    frequency: options.frequency,
                    waveform: options.waveform,
                    subLevel: options.subLevel
                });
                this.hpf = new HPF({
                    frequency: options.hpfFreq
                });
                this.vca = new VCA({
                    maxLevel: options.maxLevel
                });
                this.env = new ENV({
                    envelope: options.envelope,
                    maxLevel: options.maxLevel,
                    envConstants: envConstants
                });
                this.vcf = new VCF({
                    frequency: options.vcfFreq,
                    res: options.res,
                    envelope: options.envelope,
                    vcfEnv: options.vcfEnv,
                    envConstants: envConstants
                });
                
                // Sync up the envelope between the amplifier and the filter
                function setupEnvelopeListeners() {
                    that.listenTo(that.env, 'attack', function(e) {
                        that.vcf.attack = e;
                    });
                
                    that.listenTo(that.env, 'decay', function(e) {
                        that.vcf.decay = e;
                    });
                
                    that.listenTo(that.env, 'sustain', function(e) {
                        that.vcf.sustain = e;
                    });
                
                    that.listenTo(that.env, 'release', function(e) {
                        that.vcf.release = e;
                    });
                }
                setupEnvelopeListeners();
                
                // Connect nodes
                function connect(output, input) {
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
                
                function chorusToggle(level) {
                    switch(level) {
                        case 0:
                            this.bypass = 1;
                            break;
                        case 1:
                            this.bypass = 0;
                            this.feedback = 0.15;
                            this.delay = 0.05;
                            this.rate = 0.1;
                            break;
                        case 2:
                            this.bypass = 0;
                            this.feedback = 0.5;
                            this.delay = 0.25;
                            this.rate = 0.6;
                            break;
                    }
                }
            
                connect(this.lfo.pitchMod, this.dco.input);
                connect(this.lfo.freqMod, this.vcf.input1.detune);
                connect(this.lfo.freqMod, this.vcf.input2.detune);
                connect(this.dco.output, this.hpf.cutoff);
                connect(this.hpf.output, this.vcf.input1);
                connect(this.vcf.output, this.vca.level);
                connect(this.vca.level, this.env.ampMod);
                connect(this.env.ampMod, this.cho.input);
                connect(this.cho, App.context.destination);
            },
            
            noteOn: function(options) {
                this.lfo.trigger({
                    lfoRate: options.lfoRate,
                    lfoFreq: options.lfoFreq,
                    lfoDelay: options.lfoDelay,
                    lfoPitch: options.lfoPitch
                });
                
                this.env.noteOn();
                this.vcf.noteOn();
            },
        
            noteOff: function() {
                var releaseTime = this.env.release;
                
                this.env.noteOff();
                this.vcf.noteOff();
                this.dco.noteOff(releaseTime);
            }
    });
});
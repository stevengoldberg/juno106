define([
    'application',
    'dco',
    'vcf',
    'env',
    'hpf',
    'vca'
],
    
    function(App, DCO, VCF, ENV, HPF, VCA) {
        return Backbone.Marionette.Object.extend({
            initialize: function(options) {
                
                var that = this;
                
                // Envelope constants
                var envConstants = {
                    envelopeOffset: 0.0015,
                    attackMax: 3,
                    decayReleaseMax: 12,
                    minSustain: 0.0001
                };
                
                // After all the oscillators are stopped, remove the voice from the pool
                // and disconnect it from the graph for garbage collection
                var triggerKillVoice = _.after(4, function() {
                    that.trigger('killVoice');
                    that.disconnect();
                });
                
                this.lfo = options.lfo;
                this.cho = options.cho;
                
                if(!_.has(this.cho, 'chorusToggle')) {
                    Object.defineProperties(this.cho, {
                        'chorusToggle': {
                            'set': function(value) { 
                                that.cho.chorusLevel = value;
                                chorusToggle.call(that.cho);
                            }
                        }
                    });
                }
                
                this.vcf = new VCF({
                    frequency: options.vcfFreq,
                    res: options.res,
                    envelope: options.envelope,
                    vcfEnv: options.vcfEnv,
                    envConstants: envConstants,
                    inverted: options.vcfInverted
                });
                
                this.env = new ENV({
                    envelope: options.envelope,
                    maxLevel: options.volume,
                    envConstants: envConstants
                });
                
                this.dco = new DCO({
                    frequency: options.frequency,
                    waveform: options.waveform,
                    lfoPwmEnabled: options.lfoPwmEnabled
                });
                
                this.hpf = new HPF({
                    frequency: options.hpf
                });
                
                this.vca = new VCA({
                    maxLevel: options.volume
                });
                
                // Propogate DCO events
                this.listenTo(this.dco, 'destroyed', triggerKillVoice);
                this.listenTo(this.dco, 'pwm', function(e) {
                    that.lfo.pwmMod = e;
                });
                this.listenTo(this.dco, 'lfoPwmEnabled', function(e) {
                    that.lfo.pwmEnabled = e;
                });

                // Sync up the envelope for the amplifier and the filter
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
                
                function chorusToggle() {
                    switch(this.chorusLevel) {
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
                
                // Connect nodes
                connect(this.lfo.pitchMod, this.dco.input);
                connect(this.lfo.pwmMod, this.dco.pwm);
                connect(this.lfo.freqMod, this.vcf.input1.detune);
                connect(this.lfo.freqMod, this.vcf.input2.detune);
                connect(this.dco.output, this.hpf.cutoff);
                connect(this.hpf.output, this.vcf.input1);
                connect(this.vcf.output, this.vca.level);
                connect(this.vca.level, this.env.ampMod);
                connect(this.env.ampMod, this.cho.input);
                
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
            },
            
            noteOn: function() {
                this.lfo.noteOn();
                this.env.noteOn();
                this.vcf.noteOn();
            },
        
            noteOff: function() {
                this.listenTo(this.env, 'noteOff', this.dco.noteOff.bind(this.dco));
                this.env.noteOff();
                this.vcf.noteOff();
            },
            
            stealNote: function() {
                this.dco.noteOff();
            },
            
            disconnect: function() {
                this.env.ampMod.disconnect(this.cho.input);
            }
    });
});
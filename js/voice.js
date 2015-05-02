define([
    'application',
    'dco'
],
    
    function(App, DCO) {
        return Backbone.Marionette.Object.extend({
            initialize: function(options) {
                
                var that = this;
                
                this.lfo = options.lfo;
                this.env = options.env;
                this.vcf = options.vcf;
                this.hpf = options.hpf;
                this.vca = options.vca;
                this.cho = options.cho;
                this.cho.chorusToggle = chorusToggle;
                chorusToggle(this.cho.chorusLevel);
                
                // Oscillators are instantiated as needed
                this.dco = new DCO({
                    frequency: options.frequency,
                    waveform: options.waveform,
                    subLevel: options.subLevel
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
                
                // Connect nodes
                connect(this.lfo.pitchMod, this.dco.input);
                connect(this.lfo.freqMod, this.vcf.input1.detune);
                connect(this.lfo.freqMod, this.vcf.input2.detune);
                connect(this.dco.output, this.hpf.cutoff);
                connect(this.hpf.output, this.vcf.input1);
                connect(this.vcf.output, this.vca.level);
                connect(this.vca.level, this.env.ampMod);
                connect(this.env.ampMod, this.cho.input);
                connect(this.cho, App.context.destination);
                
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
            },
            
            noteOn: function() {
                this.lfo.noteOn();
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
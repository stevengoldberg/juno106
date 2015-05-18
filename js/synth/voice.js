define([
    'application',
    'synth/dco',
    'synth/vcf',
    'synth/env',
    'synth/hpf',
    'synth/vca'
],

    function(App, DCO, VCF, ENV, HPF, VCA) {
        return Backbone.Marionette.Object.extend({
            initialize: function(data) {

                this.createComponents(data);

                // Mix Backbone.Events into the ENV to sync the amp and filter envelopes
                _.extend(this.env, Backbone.Events);

                // Mix Backbone.Events into the DCO to sync changes to the LFO
                // and manage oscillator lifetime
                _.extend(this.dco, Backbone.Events);

                this.createListeners();

                // Connect nodes
                this.connect(this.lfo.pitchMod, this.dco.input);
                this.connect(this.lfo.pwmMod, this.dco.pwm);
                this.connect(this.lfo.freqMod, this.vcf.detune);
                this.connect(this.dco.output, this.hpf.input);
                this.connect(this.hpf.output, this.vcf.input);
                this.connect(this.vcf.output, this.vca.input);
                this.connect(this.vca.output, this.env.input);
                this.connect(this.env.output, this.cho.input);

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
            },

            createComponents: function(data) {
                var options = data.synthOptions;
                // Envelope constants
                var envConstants = {
                    envelopeOffset: 0.0015,
                    attackMax: 3,
                    decayReleaseMax: 12
                };

                this.vcf = new VCF({
                    frequency: options.vcfFreq,
                    res: options.res,
                    envelope: options.envelope,
                    vcfEnv: options.vcfEnv,
                    envConstants: envConstants,
                    inverted: options.vcfInverted,
                    keyFreq: options.frequency,
                    keyFollow: options.keyFollow
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

                this.lfo = data.lfo;
                this.lfo.rate = options.lfoRate;
                this.lfo.delay = options.lfoDelay;
                this.lfo.pwmEnabled = options.lfoPwmEnabled;
                this.lfo.freqMod = options.lfoFreqMod;
                this.lfo.pitchMod = options.lfoPitchMod;
                this.lfo.pwmMod = options.waveform.pulseWidth;

                this.cho = data.cho;

                function chorusToggle() {
                    switch(this.chorusLevel) {
                        case 0:
                            this.bypass = 1;
                            break;
                        case 1:
                            this.bypass = 0;
                            this.feedback = 0.1;
                            this.delay = 0.3;
                            this.rate = 0.05;
                            break;
                        case 2:
                            this.bypass = 0;
                            this.feedback = 0.35;
                            this.delay = 0.6;
                            this.rate = 0.15;
                            break;
                    }
                }

                // Additional detune for chorus effect
                function setDetune(value) {
                    var detune = App.context.createOscillator();
                    var gain = App.context.createGain();
                    detune.start(0);
                    detune.frequency.value = (0.05 * value);
                    gain.gain.value = (5 * value);
                    detune.connect(gain);
                    this.connect(gain, this.dco.input);
                }

                // Make the tuna.js chorus effect responsive to the UI
                if(!_.has(this.cho, 'chorusToggle')) {
                    Object.defineProperties(this.cho, {
                        'chorusToggle': {
                            'set': function(value) {
                                setDetune.call(this, value);
                                this.cho.chorusLevel = value;
                                chorusToggle.call(this.cho);
                            }.bind(this)
                        }
                    });
                }

                this.cho.chorusToggle = options.chorusLevel;
            },

            createListeners: function() {
                // After all the oscillators are stopped, remove the voice from the pool
                // and disconnect it from the graph for garbage collection
                var triggerKillVoice = _.after(4, function() {
                    this.trigger('killVoice');
                    this.disconnect();
                }.bind(this));

                this.listenTo(this.env, 'attack', function(newAttack) {
                    this.vcf.attack = newAttack;
                });

                this.listenTo(this.env, 'decay', function(newDecay) {
                    this.vcf.decay = newDecay;
                });

                this.listenTo(this.env, 'sustain', function(newSustain) {
                    this.vcf.sustain = newSustain;
                });

                this.listenTo(this.env, 'release', function(newRelease) {
                    this.vcf.release = newRelease;
                });

                this.listenTo(this.dco, 'destroyed', triggerKillVoice);

                this.listenTo(this.dco, 'pwm', function(pwmValue) {
                    this.lfo.pwmMod = pwmValue;
                });

                this.listenTo(this.dco, 'lfoPwmEnabled', function(enabled) {
                    this.lfo.pwmEnabled = enabled;
                });
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
                this.env.output.disconnect(this.cho.input);
            }
    });
});
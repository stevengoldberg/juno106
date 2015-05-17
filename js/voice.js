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
            initialize: function(data) {
                
                var that = this;
                var options = data.synthOptions;
                
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
                
                // Mix Backbone.Events into the ENV to sync the amp and filter envelopes
                _.extend(this.env, Backbone.Events);

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

                // Mix Backbone.Events into the DCO to sync changes to the LFO
                // and manage oscillator lifetime
                _.extend(this.dco, Backbone.Events);
                
                this.listenTo(this.dco, 'destroyed', triggerKillVoice);
                this.listenTo(this.dco, 'pwm', function(pwmValue) {
                    this.lfo.pwmMod = pwmValue;
                });
                this.listenTo(this.dco, 'lfoPwmEnabled', function(enabled) {
                    this.lfo.pwmEnabled = enabled;
                });
                                
                // Connect nodes
                connect(this.lfo.pitchMod, this.dco.input);
                connect(this.lfo.pwmMod, this.dco.pwm);
                connect(this.lfo.freqMod, this.vcf.detune);
                connect(this.dco.output, this.hpf.input);
                connect(this.hpf.output, this.vcf.input);
                connect(this.vcf.output, this.vca.input);
                connect(this.vca.output, this.env.input);
                connect(this.env.output, this.cho.input);
                
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
                    detune.start();
                    detune.frequency.value = (0.05 * value);
                    gain.gain.value = (3 * value);
                    detune.connect(gain);
                    connect(gain, this.dco.input);
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
                this.env.output.disconnect(this.cho.input);
            }
    });
});
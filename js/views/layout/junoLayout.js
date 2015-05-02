define([
    'backbone',
    'application',
    'views/layout/moduleLayout',
    'views/item/keyboardItemView',
    'voice',
    'lfo',
    'vcf',
    'env',
    'hpf',
    'vca',
    'tuna',
    'models/junoModel',
    'hbs!tmpl/layout/junoLayout-tmpl'
    ],
    
    function(Backbone, App, ModuleLayout, KeyboardItemView, Voice, LFO, VCF, ENV,
        HPF, VCA, Tuna, JunoModel, Template) {
        
        return Backbone.Marionette.LayoutView.extend({
            
            className: 'juno',
            
            template: Template,
            
            regions: {
                synthRegion: '.js-synth-region',
                keyboardRegion: '.js-keyboard-region'
            },
            
            initialize: function() {
                this.maxPolyphony = 6;
                this.activeVoices = {};
                                
                // Envelope constants
                var envConstants = {
                    envelopeOffset: 0.0015,
                    attackMax: 3,
                    decayReleaseMax: 12,
                    minSustain: 0.0001
                };
                
                // Initialize long-lived components
                this.synth = new JunoModel();
                
                var tuna = new Tuna(App.context);
                
                this.cho = new tuna.Chorus();
                this.cho.chorusLevel = this.synth.get('cho-chorusToggle');
                
                this.lfo = new LFO({
                    lfoRate: this.synth.get('lfo-rate'),
                    lfoPitch: this.synth.get('lfo-pitch'),
                    lfoDelay: this.synth.get('lfo-delay'),
                    lfoFreq: this.synth.get('lfo-freq')
                });
                
                this.vcf = new VCF({
                    frequency: this.synth.get('vcf-cutoff'),
                    res: this.synth.get('vcf-res'),
                    envelope: this.synth.getCurrentEnvelope(),
                    vcfEnv: this.synth.get('vcf-envMod'),
                    envConstants: envConstants
                });
                
                this.env = new ENV({
                    envelope: this.synth.getCurrentEnvelope(),
                    maxLevel: this.synth.get('vca-level'),
                    envConstants: envConstants
                });
                
                this.hpf = new HPF({
                    frequency: this.synth.get('hpf-freq')
                });
                
                this.vca = new VCA({
                    maxLevel: this.synth.get('vca-level'),
                });
            },
            
            onShow: function() {
                this.moduleLayout = new ModuleLayout({
                    synth: this.synth
                });
                this.synthRegion.show(this.moduleLayout);
                
                this.keyboardView = new KeyboardItemView();
                this.keyboardRegion.show(this.keyboardView);
                
                this.listenTo(this.keyboardView, 'noteOn', this.noteOnHandler);
                this.listenTo(this.keyboardView, 'noteOff', this.noteOffHandler);
                this.listenTo(this.synth, 'change', this.synthUpdateHandler);
            },
            
            noteOnHandler: function(note, frequency) {
                var voice = new Voice({
                    frequency: this.synth.getCurrentRange(frequency),
                    waveform: this.synth.getCurrentWaveforms(),
                    subLevel: this.synth.get('dco-sub'),
                    cho: this.cho,
                    vcf: this.vcf,
                    hpf: this.hpf,
                    env: this.env,
                    vca: this.vca,
                    lfo: this.lfo
                });
                    
                voice.noteOn();
                
                this.activeVoices[note] = voice;
            },
            
            noteOffHandler: function(note) {
                this.activeVoices[note].noteOff();
                delete this.activeVoices[note];
            },
            
            synthUpdateHandler: _.throttle(function(update) {                    
                var param = Object.keys(update.changed)[0];
                var value = update.changed[param];
                var component = param.slice(0, 3);
                var method = param.slice(4);
                
                _.each(this.activeVoices, function(voice) {
                    if(voice[component] && _.isFunction(voice[component][method])) {
                        voice[component][method](value);
                    } else {
                        voice[component][method] = value;
                    }
                });
            }, 15)
            
        });
    });
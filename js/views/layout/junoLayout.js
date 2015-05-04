define([
    'backbone',
    'application',
    'views/layout/moduleLayout',
    'views/item/keyboardItemView',
    'voice',
    'lfo',
    'tuna',
    'models/junoModel',
    'hbs!tmpl/layout/junoLayout-tmpl'
    ],
    
    function(Backbone, App, ModuleLayout, KeyboardItemView, Voice, LFO, Tuna, JunoModel, Template) {
        
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
                
                // Initialize long-lived components
                this.synth = new JunoModel();
                
                var tuna = new Tuna(App.context);
                
                this.cho = new tuna.Chorus();
                this.cho.chorusLevel = this.synth.get('cho-chorusToggle');
                
                this.lfo = new LFO({
                    lfoRate: this.synth.get('lfo-rate'),
                    lfoPitch: this.synth.get('lfo-pitch'),
                    lfoDelay: this.synth.get('lfo-delay'),
                    lfoFreq: this.synth.get('lfo-freq'),
                    lfoPwmEnabled: this.synth.get('dco-lfoPwmEnabled')
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
                var that = this;
            
                var voice = new Voice({
                    frequency: this.synth.getCurrentRange(frequency),
                    waveform: this.synth.getCurrentWaveforms(),
                    envelope: this.synth.getCurrentEnvelope(),
                    subLevel: this.synth.get('dco-sub'),
                    lfoPwmEnabled: this.synth.get('dco-lfoPwmEnabled'),
                    vcfFreq: this.synth.get('vcf-cutoff'),
                    res: this.synth.get('vcf-res'),
                    vcfEnv: this.synth.get('vcf-envMod'),
                    maxLevel: this.synth.get('vca-level'),
                    hpf: this.synth.get('hpf-cutoff'),
                    cho: this.cho,
                    lfo: this.lfo
                });
                
                if(this.activeVoices[note]) {
                    this.activeVoices[note].dco.noteOff();
                    delete this.activeVoices[note];
                }
                
                voice.noteOn();
    
                this.activeVoices[note] = voice;
            },
            
            noteOffHandler: function(note) {
                try {
                    this.activeVoices[note].noteOff();
                } catch(e) {
                    console.log(this.activeVoices);
                    _.each(this.activeVoices, function(voice) {
                        voice.noteOff();
                    });
                    throw new Error('Error killing note: ' + note);
                }
            },
            
            synthUpdateHandler: _.throttle(function(update) {                    
                var param = Object.keys(update.changed)[0];
                var value = update.changed[param];
                var component = param.slice(0, 3);
                var attr = param.slice(4);
                
                _.each(this.activeVoices, function(voice) {
                    voice[component][attr] = value;
                });
            }, 15)
            
        });
    });
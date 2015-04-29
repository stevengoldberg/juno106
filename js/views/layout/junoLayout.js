define([
    'backbone',
    'application',
    'views/layout/moduleLayout',
    'views/item/keyboardItemView',
    'voice',
    'models/junoModel',
    'hbs!tmpl/layout/junoLayout-tmpl'
    ],
    
    function(Backbone, App, ModuleLayout, KeyboardItemView, Voice, JunoModel, Template) {
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
                this.synth = new JunoModel();
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
                var voice;
                
                var options = {
                    frequency: this.synth.getCurrentRange(frequency),
                    waveform: this.synth.getCurrentWaveforms(),
                    vcfFreq: this.synth.getCurrentFilterFreq(),
                    res: this.synth.get('vcf-res'),
                    envelope: this.synth.getCurrentEnvelope(),
                    maxLevel: this.synth.get('vca-level'),
                    chorus: this.synth.get('cho-chorusToggle'),
                    subLevel: this.synth.get('dco-sub'),
                    hpfFreq: this.synth.get('hpf-freq'),
                    lfoRate: this.synth.get('lfo-rate'),
                    lfoPitch: this.synth.get('lfo-pitch'),
                    lfoDelay: this.synth.get('lfo-delay'),
                    lfoFreq: this.synth.get('lfo-freq'),
                    vcfEnv: this.synth.get('vcf-env')
                };
                
                if(_.keys(this.activeVoices).length < this.maxPolyphony) {
                    if(this.activeVoices[note]) {
                        this.activeVoices[note].vco.stop();
                        console.log('deleting ' + note);
                        delete this.activeVoices[note];
                    } 
                    voice = new Voice(options);
                    voice.noteOn();
                    
                    this.activeVoices[note] = voice;
                }
            },
            
            noteOffHandler: function(note) {
                var release;
                var envOn = this.synth.get('vca-gate');
                var that = this;
                if(this.activeVoices[note]) {
                    release = envOn ? this.synth.getCurrentEnvelope().r : 0.015;
                    this.activeVoices[note].noteOff(release);
                    delete this.activeVoices[note];
                }
            },
            
            synthUpdateHandler: _.throttle(function(update) {                    
                var param = Object.keys(update.changed)[0];
                var value = update.changed[param];
                var component = param.slice(0, 3);
                var method = param.slice(4);
                
                _.each(this.activeVoices, function(voice) {
                    if(voice[component] && _.isFunction(voice[component][method])) {
                        voice[component][method](value);
                    }
                });
            }, 30)
            
        });
    });
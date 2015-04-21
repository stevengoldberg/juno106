define([
    'backbone',
    'application',
    'views/layout/moduleLayout',
    'views/item/keyboardItemView',
    'vco',
    'vca',
    'env',
    'models/junoModel',
    'hbs!tmpl/layout/junoLayout-tmpl'
    ],
    
    function(Backbone, App, ModuleLayout, KeyboardItemView, VCO, VCA, ENV, JunoModel, Template) {
        return Backbone.Marionette.LayoutView.extend({
            
            className: 'juno',
            
            template: Template,
            
            regions: {
                synthRegion: '.js-synth-region',
                keyboardRegion: '.js-keyboard-region'
            },
            
            initialize: function() {
                this.context = App.context;
                
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
                var vco;
                var vca;
                var envelope;
                var envSettings = this.synth.getCurrentEnvelope();
                
                var options = {};
                
                if(_.keys(this.activeVoices).length <= this.maxPolyphony) {
                    vco = new VCO({
                        frequency: this.synth.getCurrentRange(frequency),
                        waveform: this.synth.getCurrentWaveforms()
                    });
                    
                    vca = new VCA();
                    
                    env = new ENV({
                        envelope: envSettings,
                        maxLevel: this.synth.get('vca-level')
                    });
                    
                    vco.connect(vca);
                    env.connect(vca.amplitude);
                    vca.connect(this.context.destination);
                    env.attack();
                    
                    this.activeVoices[note] = {
                        vco: vco,
                        vca: vca,
                        env: env
                    };
                    
                    
                    /*options.frequency = this.synth.getCurrentRange(frequency);
                    options.waveform = this.synth.getCurrentWaveforms();
                    options.envelope = this.synth.getCurrentEnvelope();
                    options.volume = this.synth.get('vcaLevel');
                    
                    //Oscillators are turned off
                    if(options.waveform.length === 0) return;
                    
                    voice = Voice(options);
                    voice.start();
                    
                    this.activeVoices[note] = voice;*/
                }
            },
            
            noteOffHandler: function(note) {
                if(_.isEmpty(this.activeVoices)) {
                    return;
                }
                this.activeVoices[note].env.release();
                delete this.activeVoices[note];
            },
            
            synthUpdateHandler: function(update) {
                var value = _.first(_.values(update.changed));
                var param = _.first(_.keys(update.changed));
                var component = param.slice(0, 3);
                var method = param.slice(4);
                
                _.each(this.activeVoices, function(voice) {
                    if(_.isFunction(voice[component][method])) {
                        voice[component][method](value);
                    }
                });
            }
            
        });
    });
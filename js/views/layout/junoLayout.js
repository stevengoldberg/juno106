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
                var voice;
                
                var options = {
                    frequency: this.synth.getCurrentRange(frequency),
                    waveform: this.synth.getCurrentWaveforms(),
                    envelope: this.synth.getCurrentEnvelope(),
                    maxLevel: this.synth.get('vca-level'),
                    chorus: this.synth.get('cho-chorusToggle')
                };
                
                if(_.keys(this.activeVoices).length <= this.maxPolyphony) {
                    voice = new Voice(options);
                    
                    // Set voice initial volume 
                    voice.vca.level(options.maxLevel);
                    // Trigger voice amp envelope
                    voice.env.attack();
                    
                    this.activeVoices[note] = voice;
                }
            },
            
            noteOffHandler: function(note) {
                if(_.isEmpty(this.activeVoices)) {
                    return;
                }
                this.activeVoices[note].env.release();
                delete this.activeVoices[note];
            },
            
            synthUpdateHandler: _.throttle(function(update) {
                // Not sure why this is needed
                if(_.isEmpty(update.changed)) return;
                    
                var value = _.first(_.values(update.changed));
                var param = _.first(_.keys(update.changed));
                var component = param.slice(0, 3);
                var method = param.slice(4);
                
                _.each(this.activeVoices, function(voice) {
                    if(voice[component] && _.isFunction(voice[component][method])) {
                        voice[component][method](value);
                    }
                });
            }, 25)
            
        });
    });
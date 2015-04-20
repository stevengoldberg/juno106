define([
    'backbone',
    'views/layout/moduleLayout',
    'views/item/keyboardItemView',
    'voice',
    'hbs!tmpl/layout/junoLayout-tmpl'
    ],
    
    function(Backbone, ModuleLayout, KeyboardItemView, Voice, Template) {
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
            },
            
            onShow: function() {
                this.moduleLayout = new ModuleLayout();
                this.synthRegion.show(this.moduleLayout);
                
                this.keyboardView = new KeyboardItemView();
                this.keyboardRegion.show(this.keyboardView);
                
                this.listenTo(this.keyboardView, 'noteOn', this.noteOnHandler);
                this.listenTo(this.keyboardView, 'noteOff', this.noteOffHandler);
            },
            
            noteOnHandler: function(note, frequency) {
                var voice;
                var options = {};
                
                if(_.keys(this.activeVoices).length <= this.maxPolyphony) {
                    options.frequency = frequency;
                    options.waveform = this.getCurrentWaveform();
                    
                    voice = new Voice(options);
                    voice.start();
                    this.activeVoices[note] = voice;
                }
            },
            
            noteOffHandler: function(note, frequency) {
                this.activeVoices[note].stop();
                delete this.activeVoices[note];
            },
            
            getCurrentWaveform: function() {
                return 'sawtooth';
            }
            
        });
    });
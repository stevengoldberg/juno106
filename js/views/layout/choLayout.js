define([
    'backbone',
    'hbs!tmpl/layout/choLayout-tmpl',
    'views/item/moduleBaseItemView',
    'views/item/midiItemView'
    ],
    
    function(Backbone, Template, ModuleBaseItemView, MidiItemView) {
        return Marionette.LayoutView.extend({
            
            className: 'control cho',
            
            template: Template,
            
            ui: {
                button: '.button'
            },
            
            regions: {
                midiRegion: '.js-midi-region'
            },
            
            initialize: function(options) {
                var base = new ModuleBaseItemView();
                
                this.midiListener = options.midiListener;
                this.styleParent = base.styleParent;
                this.bindButtons = base.bindButtons;
                this.updateUIState = base.updateUIState;
                this.triggerUpdate = base.triggerUpdate;
                this.updateButtonState = base.updateButtonState;
                
                this.midiView = new MidiItemView({
                    midiListener: this.midiListener
                });
            },
            
            onShow: function() {
                this.styleParent('four');
                this.bindButtons();
                
                this.midiRegion.show(this.midiView);
            }
            
        });
    });
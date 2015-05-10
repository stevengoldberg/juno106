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
            
            initialize: function() {
                var base = new ModuleBaseItemView();
                this.styleParent = base.styleParent;
                this.bindButtons = base.bindButtons;
                this.updateUIState = base.updateUIState;
                this.triggerUpdate = base.triggerUpdate;
                
                this.midiView = new MidiItemView();
            },
            
            onShow: function() {
                this.styleParent('four');
                this.bindButtons();
                
                this.midiRegion.show(this.midiView);
            }
            
        });
    });
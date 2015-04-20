define([
    'backbone',
    'views/layout/moduleLayout',
    'views/item/keyboardItemView',
    'hbs!tmpl/layout/junoLayout-tmpl'
    ],
    
    function(Backbone, ModuleLayout, KeyboardItemView, Template) {
        return Backbone.Marionette.LayoutView.extend({
            
            className: 'juno',
            
            template: Template,
            
            regions: {
                synthRegion: '.js-synth-region',
                keyboardRegion: '.js-keyboard-region'
            },
            
            intiialize: function() {
                this.context = null;
                
                try {
                    window.AudioContext = window.AudioContext || window.webkitAudioContext;
                    this.context = new AudioContext();
                }
                catch(e) {
                    alert('Web Audio API is not supported in this browser');
                }
                
            },
            
            onShow: function() {
                this.moduleLayout = new ModuleLayout();
                this.synthRegion.show(this.moduleLayout);
                
                this.keyboardView = new KeyboardItemView();
                this.keyboardRegion.show(this.keyboardView);
            }
            
        });
    });
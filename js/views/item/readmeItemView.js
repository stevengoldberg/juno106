define([
    'backbone',
    'hbs!tmpl/item/readmeItemView-tmpl'
    ],
    
    function(Backbone, Template) {
        return Marionette.ItemView.extend({
            
            className: 'readme',
            
            template: Template,
            
            ui: {
                init: '.js-init'
            },
            
            events: {
                'click @ui.init': 'triggerInit'
            },
            
            triggerInit: function() {
                this.trigger('init');
            }
        });
    });
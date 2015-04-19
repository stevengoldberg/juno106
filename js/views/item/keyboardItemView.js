define([
    'backbone',
    'hbs!tmpl/item/keyboardItemView-tmpl'
    ],
    
    function(Backbone, Template) {
        return Backbone.Marionette.ItemView.extend({
            
            className: 'keyboard',
            
            template: Template

        });
    });
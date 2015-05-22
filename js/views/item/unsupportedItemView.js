define([
    'backbone',
    'hbs!tmpl/item/unsupportedItemView-tmpl'
    ],
    
    function(Backbone, Template) {
        return Marionette.ItemView.extend({
            
            tagName: 'h4',
            
            template: Template
        });
    });
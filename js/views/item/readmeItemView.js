define([
    'backbone',
    'hbs!tmpl/item/readmeItemView-tmpl'
    ],
    
    function(Backbone, Template) {
        return Marionette.ItemView.extend({
            
            className: 'readme',
            
            template: Template    
        });
    });
define([
    'backbone'
    ],
    
    function(Backbone) {
        return Backbone.Marionette.ItemView.extend({
            
            styleParent: function(className) {
                this.$el.parent().addClass('module').addClass(className);
            }
            
        });
    });
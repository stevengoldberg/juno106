define([
    'backbone',
    ],
    
    function(Backbone) {
        return Backbone.Model.extend({
            defaults: function() {
                return {
                    MSBController: null,
                    LSBController: null,
                    param: null
                };
            }
            
        });
    });
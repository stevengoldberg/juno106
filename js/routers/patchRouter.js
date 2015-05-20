define(['backbone', 'backbone.marionette'],

    function(Backbone) {

        return Backbone.Marionette.AppRouter.extend({

            routes: {
                'patch': 'restorePatch'
            },

            restorePatch: function(param) {
                var attributes = param.split('?');
                
                Backbone.Wreqr.radio.channel('patch').vent.trigger('load', attributes);
            }
        });
    });

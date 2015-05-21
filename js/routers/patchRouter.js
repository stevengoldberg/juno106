define(['backbone', 'backbone.marionette'],

    function(Backbone) {

        return Backbone.Marionette.AppRouter.extend({

            routes: {
                'patch/:patchName': 'restorePatch'
            },

            restorePatch: function(patchName, param) {
                var attributes = param.split('?');
                
                Backbone.Wreqr.radio.channel('patch').vent.trigger('load', attributes);
                Backbone.Wreqr.radio.channel('patch').vent.trigger('setName', decodeURIComponent(patchName));
            }
        });
    });

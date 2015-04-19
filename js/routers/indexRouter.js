define(['backbone', 'backbone.marionette'],

    function(Backbone) {

        return Backbone.Marionette.AppRouter.extend({

            routes: {
                '': 'routeToApplication'
            },

            routeToApplication: function() {
                Backbone.history.navigate('/juno', {trigger: true});
            }
        });
    });

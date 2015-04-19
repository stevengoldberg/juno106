require([
    'backbone',
    'backbone.marionette',
    'application',
    'routers', // Do not remove. This is required as a dependency. Routers must be loaded prior to App.start();
],

    function (Backbone, Marionette, App, Routers) {

        App.start();
        App.router = Routers;
});

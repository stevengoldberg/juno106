require([
    'backbone',
    'backbone.marionette',
    'application',
    'routers', // Do not remove. This is required as a dependency. Routers must be loaded prior to App.start();
    'views/layout/junoLayout'
],

    function (Backbone, Marionette, App, Routers, JunoLayout) {

        var junoLayout = new JunoLayout();
        App.start();
        App.router = Routers;
        App.content.show(junoLayout);
});

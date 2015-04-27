require([
    'backbone',
    'backbone.marionette',
    'application',
    'routers', // Do not remove. This is required as a dependency. Routers must be loaded prior to App.start();
    'views/layout/junoLayout',
],

    function (Backbone, Marionette, App, Routers, JunoLayout) {
        
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            App.context = new AudioContext();
        }
        catch(e) {
            alert('Web Audio API is not supported in this browser');
        }
        
        var junoLayout = new JunoLayout();
        App.router = Routers;
        App.start();
        App.content.show(junoLayout);
});
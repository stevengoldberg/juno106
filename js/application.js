define([
    'backbone',
    'hbs!tmpl/shell-tmpl',
    ],

    function(Backbone, ShellTmpl) {

        var application = {

            initialize: function() {
                var shellTemplate = ShellTmpl;

                var JN = new Backbone.Marionette.Application();

                JN.addRegions({
                    header: '#top-bar',
                    content: '#reg-content',
                    footer: '#reg-footer',
                    modal: '#reg-modal'
                });

                JN.views = {};

                JN.addInitializer(function () {
                    document.body.innerHTML = shellTemplate();
                    Backbone.history.start();
                });

                return JN;
            }
        };

        return application.initialize();
    }
);

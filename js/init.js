require.config({

    deps: ['main'],

    wrapShim: true,


    // Uncomment to enable dev utils debugging output.
    //map: {
    //    '*': {
    //        'eca/controllers/searchController': 'dev/searchController'
    //    },

    //    'dev/searchController': {
    //        'eca/controllers/searchController': 'eca/controllers/searchController'
    //    }
    //},

    paths: {

        tmpl: '../templates',

        jquery: './vendor/jquery',
        'backbone.marionette': './vendor/backbone.marionette',
        'backbone.wreqr': './vendor/backbone.wreqr',
        'backbone.babysitter': './vendor/backbone.babysitter',
        backbone: './vendor/backbone',
        'backbone.poller': './vendor/backbone.poller',
        'backbone.paginator': './vendor/backbone.paginator',
        hbs: './vendor/require-handlebars-plugin/hbs',
        'jquery-ui': './vendor/jquery-ui',
        requireLib: './vendor/require',
        underscore: './vendor/underscore',
        'underscore.string': './vendor/underscore.string',
        'backbone.modal': './vendor/backbone.modal-bundled-min'
    },

    shim: {
        
        'backbone.paginator': {
            deps: ['backbone']
        },

        'backbone.poller': {
            deps: ['backbone']
        },

        'jquery-ui': {
            deps: ['jquery']
        },

        'jquery-powertip': {
           deps: ['jquery']
        },

        'jquery-timepicker': {
            deps: ['jquery-ui']
        },

        'underscore.string': {
            deps: ['underscore']
        },

        'backbone.modal': {
            deps: ['backbone', 'backbone.marionette']
        }

    }
});

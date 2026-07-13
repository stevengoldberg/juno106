require.config({

    deps: ['main'],

    wrapShim: true,

    paths: {
        tmpl: '../templates',
        tuna: './vendor/tuna',
        // jQuery 3.7.1, Backbone 1.6.1, and Underscore 1.13.8 are in vendor/,
        // but Backbone.Marionette 2.4.1 (vendor/backbone.marionette.js) was
        // written against Backbone ~1.3.x, jQuery ~2.x, and Underscore ~1.9.x.
        // Upgrading Marionette to work with these newer versions is a significant
        // migration. For now, pin to CDN versions that are known to be compatible.
        jquery: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min',
        backbone: 'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.3.3/backbone-min',
        underscore: 'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min',
        'backbone.marionette': './vendor/backbone.marionette',
        'backbone.wreqr': './vendor/backbone.wreqr',
        hbs: './vendor/hbs',
        requireLib: './vendor/require',
        'backbone.modal': './vendor/backbone.modal',
        'handlebars-v4.7.8': './vendor/handlebars-v4.7.8'
    },

    shim: {
        'backbone.modal': {
            deps: ['backbone', 'backbone.marionette'],
            exports: 'backbone.modal'
        },

        'tuna': {
            deps: [],
            'exports': 'Tuna'
        }
    }
});

requirejs.onError = function(err) {
    document.body.style.background = 'white';
    document.body.style.color = 'black';
    document.body.style.fontFamily = 'monospace';
    document.body.style.padding = '20px';
    document.body.innerHTML =
        '<h2>RequireJS Error: ' + err.requireType + '</h2>' +
        '<p>Failed modules: ' + (err.requireModules || []).join(', ') + '</p>' +
        '<pre>' + err.stack + '</pre>';
};

window.onerror = function(msg, src, line, col, err) {
    document.body.style.background = 'white';
    document.body.style.color = 'black';
    document.body.style.fontFamily = 'monospace';
    document.body.style.padding = '20px';
    document.body.innerHTML =
        '<h2>JavaScript Error</h2>' +
        '<p>' + msg + '</p>' +
        '<p>at ' + src + ':' + line + ':' + col + '</p>' +
        '<pre>' + (err && err.stack ? err.stack : '') + '</pre>';
    return false;
};

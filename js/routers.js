define([
    'backbone',
    'backbone.marionette',
    'routers/indexRouter',
    'routers/patchRouter'
    ],

    function () {
        var allRouters = {
            index: new (require('routers/indexRouter'))(),
            patch: new (require('routers/patchRouter'))()
        };

        return allRouters;
    }
);

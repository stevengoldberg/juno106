define([
    'backbone',
    'backbone.marionette',
    'routers/indexRouter'
    ],

    function () {
        var allRouters = {
            index: new (require('routers/indexRouter'))(),
        };

        return allRouters;
    }
);

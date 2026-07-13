define(['hbs/handlebars'], function(Handlebars) {
    return function precompile(str, langMap, options) {
        return Handlebars.precompile(str, options || {});
    };
});

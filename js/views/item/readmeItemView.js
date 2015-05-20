define([
    'backbone',
    'hbs!tmpl/item/readmeItemView-tmpl'
    ],
    
    function(Backbone, Template) {
        return Marionette.ItemView.extend({
            
            className: 'readme',
            
            template: Template,
            
            ui: {
                init: '.js-init',
                share: '.js-share-patch'
            },
            
            events: {
                'click @ui.init': 'triggerReset',
                'click @ui.share': 'triggerSharePatch'
            },
            
            triggerReset: function() {
                this.trigger('reset');
            },
            
            triggerSharePatch: function() {
                this.trigger('share');
            }
        });
    });
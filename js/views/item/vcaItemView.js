define([
    'backbone',
    'hbs!tmpl/item/vcaItemView-tmpl',
    'views/item/moduleBaseItemView'
    ],
    
    function(Backbone, Template, ModuleBaseItemView) {
        return ModuleBaseItemView.extend({
            
            className: 'vca',
            
            template: Template,
            
            onShow: function() {
                this.styleParent('two');
                this.bindFaders();
            }
            
        });
    });
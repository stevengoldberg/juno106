define([
    'backbone',
    'hbs!tmpl/item/envItemView-tmpl',
    'views/item/moduleBaseItemView'
    ],
    
    function(Backbone, Template, ModuleBaseItemView) {
        return ModuleBaseItemView.extend({
            
            className: 'env',
            
            template: Template,
            
            onShow: function() {
                this.styleParent('four');
                this.bindFaders();
            }
            
        });
    });
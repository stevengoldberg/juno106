define([
    'backbone',
    'hbs!tmpl/item/choItemView-tmpl',
    'views/item/moduleBaseItemView'
    ],
    
    function(Backbone, Template, ModuleBaseItemView) {
        return ModuleBaseItemView.extend({
            
            className: 'control cho',
            
            template: Template,
            
            onShow: function() {
                this.styleParent('four');
                this.bindButtons();
            }
            
        });
    });
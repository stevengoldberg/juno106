define([
    'backbone',
    'hbs!tmpl/item/choItemView-tmpl',
    'views/item/moduleBaseItemView'
    ],
    
    function(Backbone, Template, ModuleBaseItemView) {
        return ModuleBaseItemView.extend({
            
            className: 'cho',
            
            template: Template,
            
            onShow: function() {
                this.styleParent('three');
                this.bindButtons();
            }
            
        });
    });
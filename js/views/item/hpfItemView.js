define([
    'backbone',
    'hbs!tmpl/item/hpfItemView-tmpl',
    'views/item/moduleBaseItemView'
    ],
    
    function(Backbone, Template, ModuleBaseItemView) {
        return ModuleBaseItemView.extend({
            
            template: Template,
            
            onShow: function() {
                this.styleParent('one');
            }
            
        });
    });
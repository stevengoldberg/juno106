define([
    'backbone',
    'hbs!tmpl/item/hpfItemView-tmpl',
    'views/item/moduleBaseItemView'
    ],
    
    function(Backbone, Template, ModuleBaseItemView) {
        return ModuleBaseItemView.extend({
            
            className: 'hpf',
            
            template: Template,
            
            onShow: function() {
                this.styleParent('one');
            }
            
        });
    });
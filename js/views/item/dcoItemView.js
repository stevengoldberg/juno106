define([
    'backbone',
    'hbs!tmpl/item/dcoItemView-tmpl',
    'views/item/moduleBaseItemView'
    ],
    
    function(Backbone, Template, ModuleBaseItemView) {
        return ModuleBaseItemView.extend({
            
            template: Template,
            
            onShow: function() {
                this.styleParent('eight');
                this.bindSwitches();
            }
            
        });
    });
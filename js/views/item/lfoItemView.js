define([
    'backbone',
    'hbs!tmpl/item/lfoItemView-tmpl',
    'views/item/moduleBaseItemView'
    ],
    
    function(Backbone, Template, ModuleBaseItemView) {
        return ModuleBaseItemView.extend({
            
            className: 'lfo control',
            
            template: Template,
            
            onShow: function() {
                this.styleParent('two');
                this.bindFaders();
            }
            
        });
    });
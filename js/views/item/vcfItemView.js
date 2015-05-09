define([
    'backbone',
    'hbs!tmpl/item/vcfItemView-tmpl',
    'views/item/moduleBaseItemView'
    ],
    
    function(Backbone, Template, ModuleBaseItemView) {
        return ModuleBaseItemView.extend({
            
            className: 'vcf',
            
            template: Template,
            
            onShow: function() {
                this.styleParent('six');
                this.bindFaders();
                this.bindSwitches();
            }
            
        });
    });
define([
    'backbone',
    'hbs!tmpl/item/vcfItemView-tmpl',
    'views/item/moduleBaseItemView'
    ],
    
    function(Backbone, Template, ModuleBaseItemView) {
        return ModuleBaseItemView.extend({
            
            className: 'vcf control',
            
            template: Template,
            
            onShow: function() {
                this.styleParent('five');
                this.bindFaders();
                this.bindSwitches();
                this.setupSwitchPositions();
            }
            
        });
    });
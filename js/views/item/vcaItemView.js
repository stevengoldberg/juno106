define([
    'backbone',
    'hbs!tmpl/item/vcaItemView-tmpl',
    'views/item/moduleBaseItemView'
    ],
    
    function(Backbone, Template, ModuleBaseItemView) {
        return ModuleBaseItemView.extend({
            
            className: 'vca control',
            
            template: Template,
            
            onShow: function() {
                this.styleParent('three');
                this.bindFaders();
                this.bindSwitches();
                this.setupSwitchPositions();
            }
            
        });
    });
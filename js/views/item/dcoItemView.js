define([
    'backbone',
    'hbs!tmpl/item/dcoItemView-tmpl',
    'views/item/moduleBaseItemView'
    ],

    function(Backbone, Template, ModuleBaseItemView) {
        return ModuleBaseItemView.extend({

            className: 'dco control',

            template: Template,

            onShow: function() {
                this.styleParent('seven');
                this.bindSwitches();
                this.bindButtons();
                this.bindFaders();
                this.setupSwitchPositions();

                // Allow clicking RANGE labels (4', 8', 16') to jump directly to that position
                this.bindRangeLabels('.knob-container--range p.range', 'dco-range');
            }

        });
    });

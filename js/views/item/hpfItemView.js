define([
    'backbone',
    'hbs!tmpl/item/hpfItemView-tmpl',
    'views/item/moduleBaseItemView'
    ],
    
    function(Backbone, Template, ModuleBaseItemView) {
        return ModuleBaseItemView.extend({
            
            className: 'hpf',
            
            template: Template,
            
            initialize: function() {
                this.currentSetting = 0;
                this.positionMap = {
                    0: '83%',
                    1: '57%',
                    2: '30%',
                    3: '4%'
                };
            },
            
            onShow: function() {
                this.styleParent('one');
                this.bindFaders();
            },
            
            calculateFaderMovement: function(el, yPos) {
                var position;
                var slotTop = el.parent().offset().top;
                var slotHeight = el.parent().height();
                var slotBottom = slotTop + slotHeight;
                var value;
                var percentage = (yPos - slotTop) / slotHeight * 100;
                
                if(yPos > slotBottom || percentage > 75) {
                    value = 0;
                } else if (yPos < slotTop || percentage < 25) {
                    value = 3;
                } else if (percentage >= 25 && percentage < 50){
                    value = 2;
                } else {
                    value = 1;
                }
                
                if(this.currentSetting !== value) {
                    this.triggerUpdate(el.data().param, value);
                    this.updateUIState(el.data().param, value);
                    this.currentSetting = value;
                }
            },
            
            updateUIState: function(param, value) {
                var el = this.$('[data-param="' + param + '"]');
                
                el.css({
                    top: this.positionMap[value]
                });
            }
            
        });
    });
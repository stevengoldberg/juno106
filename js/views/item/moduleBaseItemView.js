define([
    'backbone'
    ],
    
    function(Backbone) {
        return Backbone.Marionette.ItemView.extend({
            
            
            ui: {
                faderKnob: '.fader__knob'
            },
            
            styleParent: function(className) {
                this.$el.parent().addClass('module').addClass(className);
            },
            
            bindFaders: function() {
                var that = this;
                var target;
                
                this.ui.faderKnob.mousedown(function(e) {
                    target = $(e.currentTarget);
                    $(window).on('mousemove', function(e) {
                        target.addClass('dragging');
                        that.calculateFaderMovement(target, e.clientY);
                    });
                });
                $(window).mouseup(function(e) {
                    if(target) {
                        target.removeClass('dragging');
                    }
                    $(window).off('mousemove');
                });
            },
            
            calculateFaderMovement: function(knob, yPos) {
                var position;
                var slotTop = knob.parent().offset().top;
                var slotHeight = knob.parent().height();
                var slotBottom = slotTop + slotHeight;
                
                if(yPos < slotTop) {
                    position = '0%';
                } else if (yPos > slotBottom) {
                    position = '100%';
                } else {
                    position = (yPos - slotTop) / slotHeight * 100  + '%';
                }

                knob.css({
					top: position
                });
                
                this.triggerUpdate(knob, position);
            },
            
            triggerUpdate: function(knob, position) {
                var update = {
                    param: knob.data().param,
                    value: position,
                    type: 'fader'
                };
                
                this.trigger('update', update);
            }
            
        });
    });
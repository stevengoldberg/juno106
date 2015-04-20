define([
    'backbone'
    ],
    
    function(Backbone) {
        return Backbone.Marionette.ItemView.extend({
                  
            switchValues: {
                range: [0, 1, 2],
                pwmLfo: [0, 1],
                vcfInvert: [0, 1],
                vcaEnv: [0, 1]
            },
            
            ui: {
                faderKnob: '.fader__el',
                switchEl: '.switch'
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
            
            calculateFaderMovement: function(el, yPos) {
                var position;
                var slotTop = el.parent().offset().top;
                var slotHeight = el.parent().height();
                var slotBottom = slotTop + slotHeight;
                var value;
                
                if(yPos < slotTop) {
                    position = '0%';
                } else if (yPos > slotBottom) {
                    position = '100%';
                } else {
                    position = (yPos - slotTop) / slotHeight * 100  + '%';
                }

                el.css({
					top: position
                });
                
                value = (100 - parseInt(position.slice(0, -1))) / 100;
                
                this.triggerUpdate(el.data().param, value, 'fader');
            },
            
            bindSwitches: function() {
                var that = this;
                var el;
                var param;
                var oldValue;
                var newValue;
                var currentIndex;
                var newIndex;
                
                this.ui.switchEl.click(function(e) {
                    el = $(this);
                    param = el.data().param;
                    oldValue = el.data().value;
                    _.each(that.switchValues[param], function(element, index) {
                        if(element === oldValue) {
                            currentIndex = index;
                        }
                    });
                    newIndex = (currentIndex + 1) % (that.switchValues[param].length);
                    newValue = that.switchValues[param][newIndex];
                    that.triggerUpdate(param, newValue, 'switch');
                    that.updateSwitchUI(el, param, newValue);
                });
            },
            
            updateSwitchUI: function(el, param, newValue) {
                var knob = el.children();
                el.data('value', newValue);
                
                if(newValue === 0) {
                    knob.removeClass('switch__knob--middle switch__knob--up');
                    knob.addClass('switch__knob--down');
                } else if (newValue === 2 || (param !== 'range' && newValue === 1)) {
                    knob.removeClass('switch__knob--middle switch__knob--down');
                    knob.addClass('switch__knob--up');
                } else if (newValue === 1) {
                    knob.removeClass('switch__knob--up switch__knob--down');
                    knob.addClass('switch__knob--middle');
                }
            },
            
            triggerUpdate: function(param, value, type) {
                var update = {
                    param: param,
                    value: value,
                    type: type
                };
                
                this.trigger('update', update);
            }
            
        });
    });
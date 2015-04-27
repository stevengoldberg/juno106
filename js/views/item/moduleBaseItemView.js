define([
    'backbone'
    ],
    
    function(Backbone) {
        return Backbone.Marionette.ItemView.extend({
                  
            switchValues: {
                'dco-range': [0, 1, 2],
                'pwm-lfo': [0, 1],
                'vcf-invert': [0, 1],
                'env-gate': [0, 1]
            },
            
            ui: {
                faderKnob: '.fader__knob',
                switchEl: '.switch',
                button: '.button'
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
                
                this.triggerUpdate(el.data().param, value);
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
                    that.triggerUpdate(param, newValue);
                    that.updateSwitchUI(el, param, newValue);
                });
            },
            
            updateSwitchUI: function(el, param, newValue) {
                var knob = el.children();
                el.data('value', newValue);
                
                if(newValue === 0) {
                    knob.removeClass('switch__knob--middle switch__knob--up');
                    knob.addClass('switch__knob--down');
                } else if (newValue === 2 || (param !== 'dco-range' && newValue === 1)) {
                    knob.removeClass('switch__knob--middle switch__knob--down');
                    knob.addClass('switch__knob--up');
                } else if (newValue === 1) {
                    knob.removeClass('switch__knob--up switch__knob--down');
                    knob.addClass('switch__knob--middle');
                }
            },
            
            bindButtons: function() {
                var that = this;
                var button;
                var data;
                var newValue;
                
                this.ui.button.click(function(e) {
                    button = $(this);
                    data = button.data();
                    
                    if(button.hasClass('js-chorus')) {
                        button.addClass('pressed');
                        button.siblings('.led').addClass('lit');
                        button.parent().siblings().children().removeClass('pressed lit');
                    } else {
                        button.toggleClass('pressed');
                        button.siblings('.led').toggleClass('lit');
                        newValue = (data.value + 1) % 2;
                        button.data('value', newValue);
                    }
                    that.triggerUpdate(data.param, data.value);
                });
            },
            
            triggerUpdate: function(param, value) {
                var update = {
                    param: param,
                    value: value
                };
                
                this.trigger('update', update);
            },
            
            updateUIState: function(param, value) {
                var el = this.$('[data-param="' + param + '"]');
                if(el.hasClass('fader__knob')) {
                    this.updateFaderPosition(el, value);
                }
            },
            
            updateFaderPosition: function(el, value) {
                var slotHeight = el.parent().height();
                var pos = (1 - value) * slotHeight;
                
                el.css({
                    top: pos
                });
            }
            
        });
    });
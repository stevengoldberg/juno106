define([
    'backbone',
    'application',
    'util'
    ],
    
    function(Backbone, App, util) {
        return Backbone.Marionette.ItemView.extend({
            
            ui: {
                faderKnob: '.fader__knob',
                switchKnob: '.switch__knob',
                button: '.button'
            },
            
            events: {
                'contextmenu @ui.switchKnob': 'showContextMenu',
                'contextmenu @ui.faderKnob': 'showContextMenu',
                'contextmenu @ui.button': 'showContextMenu'
            },
            
            styleParent: function(className) {
                this.$el.parent().addClass('module').addClass(className);
            },
            
            initialize: function() {
                var that = this;
                this.dragging = null;
                
                $(window).on('mousemove', function(e) {
                    if(!_.isNull(that.dragging)) {
                        that.dragging.addClass('dragging');
                        
                        if(that.dragging.hasClass('fader__knob')) {
                            that.calculateFaderMovement(that.dragging, e.pageY);
                        } else if(that.dragging.hasClass('switch__knob')) {
                            that.calculateSwitchMovement(that.dragging, e.pageY);
                        }
                    }
                });
                
                $(window).on('mouseup', function(e) {
                    if(that.dragging) {
                        that.dragging.removeClass('dragging');
                    }
                    that.dragging = null;
                });
            },
            
            bindFaders: function() {
                var that = this;
                
                this.ui.faderKnob.mousedown(function(e) {
                    that.dragging = $(e.currentTarget);
                    that.clickOffset = e.pageY - that.dragging.offset().top;
                });
            },
            
            calculateFaderMovement: function(el, yPos) {
                var position;
                var value;
                var slotTop = el.parent().offset().top;
                var faderCompensation = this.clickOffset / this.slotHeight * 100;
                
                if((yPos - faderCompensation) < slotTop) {
                    position = -5;
                } else if(yPos > (slotTop + this.slotHeight + faderCompensation)) {
                    position = 95;
                } else {
                    position = ((yPos - slotTop) / this.slotHeight * 100) - faderCompensation;
                }

                el.css({
					top: position + '%'
                });
                
                value = (100 - (position + 5)) / 100;
                
                this.triggerUpdate(el.data().param, value);
            },
            
            updateSwitchUI: function(el, param, newValue) {
                var switchObject = this.getSwitchObject(el);
                var offset = switchObject.getOffset(newValue);
                
                el.data('value', newValue);
                
                el.css({
                    bottom: offset
                });
            },
            
            bindSwitches: function() {
                var that = this;
                
                this.ui.switchKnob.mousedown(function(e) {
                    that.dragging = $(e.currentTarget);
                });   
            },
            
            calculateSwitchMovement: function(el, yPos) {
                var switchObject = this.getSwitchObject(el);
                var mouseOffset = switchObject.switchBottom() - yPos;
                var positions = [];
                var newPosition = 0;
                
                for(var i = 0; i < el.data('length'); i++) {
                    positions.push(switchObject.getOffset(i));
                }
                
                for(var j = 0; j < el.data('length'); j++) {
                    if(mouseOffset > positions[j]) {
                        newPosition = j;
                    }
                }
                
                el.css({
                    bottom: positions[newPosition]
                });
                
                if(el.data('value') !== newPosition) {
                    el.data('value', newPosition);
                    this.triggerUpdate(el.data().param, newPosition);
                }
            },
            
            getSwitchObject: function(el) {
                return {
                    switchThickness: el.height(),
                    switchHeight: el.parent().height(),
                    switchBottom: function() { return el.parent().offset().top + this.switchHeight; },
                    switchPositions: el.data('length'),
                    multiplier: function() { return this.switchHeight / this.switchPositions; },
                    getOffset: function(newValue) {
                        return newValue === 0 ? 0 : this.multiplier() * newValue + 
                            (1 / this.switchPositions * newValue * this.switchThickness); 
                            
                    }
                };
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
                        button.siblings('.led').addClass('led--lit');
                        button.parent().siblings().children().removeClass('pressed led--lit');
                    } else {
                        button.toggleClass('pressed');
                        button.siblings('.led').toggleClass('led--lit');
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
                var el = $('[data-param="' + param + '"]');
                
                if(el.hasClass('fader__knob')) {
                    this.setupFaderPosition(el, value);
                } else if(el.hasClass('switch__knob')) {
                    this.setupSwitchPosition(el, value);
                } else if(el.hasClass('button')) {
                    this.setupButtonState(el, value);
                }
            },
            
            setupFaderPosition: function(el, value) {
                this.slotHeight = el.parent().height();
                this.slotTop = el.parent().offset().top;
                this.faderThickness = el.height();
                
                var topPercentOffset = 1 - value;
                var topPxOffset = (topPercentOffset * this.slotHeight) -
                    (0.5 * this.faderThickness);
                
                el.css({
                    top: topPxOffset
                });
            },
            
            setupSwitchPosition: function(el, value) {
                var param = el.data().param;
                this.updateSwitchUI(el, param, value);
            },
            
            setupButtonState: function(el, value) {
                var chorusOn;
                var data;
                
                if(el.length === 3) {
                    chorusOn = el.filter(function(i) { return $(this).data().value === value; });
                    this.$('.led').removeClass('led--lit');
                    this.$('.button').removeClass('pressed');
                    chorusOn.addClass('pressed');
                    chorusOn.siblings('.led').addClass('led--lit');
                    value = chorusOn.data().value;
                } else {
                    el.toggleClass('pressed', !!value);
                    el.siblings('.led').toggleClass('led--lit', !!value);
                    el.data('value', value);
                }
                this.triggerUpdate(el.data().param, value);
            },
            
            showContextMenu: function(e) {
                var param = $(e.currentTarget).data().param;
                var parsedParam = util.parseParamName(param);
                
                var options = { 
                    offsetX: 50,
                    param: parsedParam
                };
                
                var CC = Backbone.Wreqr.radio.channel('midi').reqres.request('midiAssignment', param);
                
                if(_.isUndefined(CC)) {
                    options.assignment = 'Un-assigned';
                    options.menuOptions = [
                        {
                            name: 'Assign...',
                            event: 'assign:' + param
                        }
                    ];
                } else {
                    options.assignment = 'CC# ' + CC;
                    options.menuOptions = [
                        {
                            name: 'Re-assign...',
                            event: 'assign:' + param
                        }
                    ];
                }
                App.contextMenu.setup(options);
                App.contextMenu.rightClickHandler(e);
                e.preventDefault();
            }
            
        });
    });
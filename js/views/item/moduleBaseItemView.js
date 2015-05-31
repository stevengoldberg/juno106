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
                var multiplier;
                
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
                var positionIndex = 0;
                
                el.data('value', newValue);
                
                for(var i = 0; i < this.positions[param].length; i++) {
                    if(offset > this.positions[param][i]) {
                        positionIndex = i;
                    }
                }
                
                if(positionIndex !== -1) {
                    el.css({
                         bottom: this.positions[param][positionIndex] + (switchObject.switchThickness * 
                             (1 / switchObject.switchPositions))
                    });
                }        
            },
            
            setupSwitchPositions: function() {
                var that = this;
                var positionArray;
                this.positions = {};
                this.ui.switchKnob.each(function(i, knob) {
                    positionArray = [];
                    multiplier = $(this).parent().height() / $(this).data().length;
                    for(var j = 0; j < $(this).data().length; j++) {
                        positionArray.push((j * multiplier));
                    }
                    that.positions[$(this).data('param')] = positionArray;
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
                var newPosition = 0;
            
                for(var j = 0; j < el.data('length'); j++) {
                    if(mouseOffset > this.positions[el.data('param')][j]) {
                        newPosition = j;
                    }
                }
                el.css({
                    bottom: this.positions[el.data('param')][newPosition] + 
                        0.5 * switchObject.switchThickness
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
                this.ui.button.click(function(e) {
                    this.triggerButton($(e.currentTarget));
                }.bind(this));
            },
            
            setupButtonState: function(el, value) {
                var data;

                el.toggleClass('pressed', !!value);
                el.siblings('.led').toggleClass('led--lit', !!value);
                el.data('value', value);
                if(el.hasClass('js-chorus') &&  value === 1) {
                    el.parent().siblings().children().removeClass('pressed led--lit');
                } else if(!el.hasClass('js-chorus')) {
                    this.triggerUpdate(el.data().param, value);
                }
                
            },
            
            triggerButton: function(button, value) {
                var data = button.data();
                var newValue;
    
                if(button.hasClass('js-chorus')) {
                    if(button.hasClass('pressed')) return;
                    button.parent().siblings().children().removeClass('pressed led--lit').data('value', 0);
                }
                button.toggleClass('pressed');
                button.siblings('.led').toggleClass('led--lit');
                newValue = (data.value + 1) % 2;
                button.data('value', newValue);
                this.triggerUpdate(data.param, data.value);
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
            
            showContextMenu: function(e) {
                var midiChannel = Backbone.Wreqr.radio.channel('midi');
                if(!midiChannel.reqres.request('input')) return;
                
                var param = $(e.currentTarget).data().param;
                var parsedParam = util.parseParamName(param);
                
                var options = { 
                    offsetX: 50,
                    param: parsedParam
                };
                
                var CC = midiChannel.reqres.request('midiAssignment', param);
                
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
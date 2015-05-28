define([
    'backbone',
    'models/midiModel',
    'hbs!tmpl/item/midiItemView-tmpl'
    ],
    
    function(Backbone, MidiModel, Template) {
        return Marionette.ItemView.extend({
            
            className: 'midi',
            
            template: Template,
            
            ui: {
                select: '.js-active-midi',
                midiButton: '.button--midi',
                midiLabel: '.js-midi-label',
                midiSpinner: '.js-midi-spinner',
                check: '.js-midi-check',
                error: '.js-midi-error'
            },
            
            events: {
                'change @ui.select': 'selectMidi'
            },
            
            initialize: function(options) {
                this.midi = false;
                this.inputs = [];
                this.activeDevice = null;
                this.mappings = new Backbone.Collection();
                this.menuChannel = Backbone.Wreqr.radio.channel('menu');
                
                this.menuChannel.vent.on('click', function(event) {
                    if(event.indexOf('assign') !== -1) {
                        this.handleMidiLearn(event.split(':')[1]);
                    }
                }.bind(this));
                
                
                Backbone.Wreqr.radio.channel('midi').reqres.setHandler('midiAssignment', function(param){
                    return this.getMidiAssignment(param);
                }.bind(this));
            },
            
            onRender: function() {
                this.ui.midiSpinner.hide();
            },
            
            onShow: function() {
                this.requestMidi();
            },
            
            requestMidi: function() {
                var that = this;
                var inputs; 
                
                this.inputs = [];
                
                this.ui.midiLabel.hide();
                this.ui.midiSpinner.show();
                
                try {
                    navigator.requestMIDIAccess().then(function(access) {
                        if(access.inputs && access.inputs.size > 0) {
                            that.midi = true;
                            inputs = access.inputs.values();
                            for (input = inputs.next(); input && !input.done; input = inputs.next()) {
                                that.inputs.push(input.value);
                            }
                            that.render();
                            that.selectMidi();
                        } else {
                            that.render();
                        }
                    });
                } catch (e) {
                    console.log('No MIDI access');
                    this.render();
                }
            },
            
            selectMidi: function() {
                this.activeDevice = _.findWhere(this.inputs, {name: this.ui.select.val() });
                this.activeDevice.onmidimessage = this.handleMidi.bind(this);
            },
            
            handleMidi: function(e) {
                var secondByte = e.data[1];
                var type = this.getMessageType(e);
                var midi = {
                    type: type,
                    value: e.data[1]
                };
                
                //console.log(type);
                //console.log(e.data);
                
                Backbone.Wreqr.radio.vent.trigger('midi', 'message', midi);
            },
            
            getMidiAssignment: function(param) {
                var midiObject = this.mappings.findWhere({param: param});
                if(midiObject) {
                    return midiObject.get('MSBController') + (midiObject.get('LSBController') ?
                        ', ' + midiObject.get('LSBController') : '');
                }
            },
            
            handleMidiLearn: function(param) {
                var messages = [];
                var firstByte;
                this.activeDevice.onmidimessage = function(e) {
                    
                    if(this.getMessageType(e) !== 'CC') {
                        return;
                    }
                    
                    firstByte = +(e.data[0].toString(2).slice(0, 4));
                    // Listen to the first two messages to allow for 14-bit MIDI
                    if(messages.length < 2) {
                        messages.push(e.data);
                    } else {
                        this.activeDevice.onmidimessage = this.handleMidi.bind(this);
                        this.assignMidiCC(messages, param);
                    }
                }.bind(this);
            },
            
            assignMidiCC: function(messages, param) {
                var MSBController = messages[0][1];
                var LSBController = messages[1][1];
                
                if(MSBController === LSBController) {
                    LSBController = null;
                }
                
                // If the synth parameter or the CC were previously assigned,
                // clear the old mapping
                this.removeOldMapping(MSBController, LSBController, param);
                
                this.mappings.add(new MidiModel({
                    MSBController: MSBController,
                    LSBController: LSBController,
                    param: param
                }));
            },
            
            removeOldMapping: function(MSBController, LSBController, param) {
                var previousCCMapping = this.mappings.findWhere({
                    MSBController: MSBController,
                    LSBController: LSBController
                });
                var previousParamMapping = this.mappings.findWhere({
                    param: param
                });
                if(previousCCMapping) {
                    this.mappings.remove(previousCCMapping);
                }
                if(previousParamMapping) {
                    this.mappings.remove(previousParamMapping);
                }
            },
            
            getMessageType: function(e) {
                var firstByte = +(e.data[0].toString(2).slice(0, 4));
                var secondByte = e.data[1];
                var thirdByte = e.data[2];
                
                if(firstByte === 1000 || (firstByte === 1001 && thirdByte === 0)) {
                    return 'noteOff';
                } else if(firstByte === 1001) {
                     return 'noteOn';
                } else if(firstByte === 1011 && secondByte < 120) {
                    return 'CC';
                } else if(firstByte === 1110) {
                    return 'pitchBend';
                }
            },
            
            serializeData: function() {
                return {
                    midi: this.midi,
                    inputs: this.inputs
                };
            }
            
        });
    });
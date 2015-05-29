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
                this.midiChannel = Backbone.Wreqr.radio.channel('midi');
                this.messageBuffer = [];
                
                this.menuChannel.vent.on('click', function(event) {
                    if(event.indexOf('assign') !== -1) {
                        this.handleMidiLearn(event.split(':')[1]);
                    }
                }.bind(this));
                
                this.midiChannel.reqres.setHandler('midiAssignment', function(param){
                    return this.getMidiAssignment(param);
                }.bind(this));
            },
            
            onShow: function() {
                this.requestMidi();
            },
            
            requestMidi: function() {
                var that = this;
                var inputs; 
                
                this.inputs = [];
                
                this.ui.midiLabel.hide();
                
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
                var storedMappings;
                this.activeDevice = _.findWhere(this.inputs, {name: this.ui.select.val() });
                this.activeDevice.onmidimessage = this.handleMidi.bind(this);
                if(window.localStorage.getItem(this.activeDevice.name)) {
                    storedMappings = JSON.parse(window.localStorage.getItem(this.activeDevice.name));
                }
                
                _.each(storedMappings, function(storedMapping) {
                    this.mappings.add(new MidiModel({
                        MSBController: storedMapping.MSBController,
                        LSBController: storedMapping.LSBController,
                        param: storedMapping.param
                    }));
                }, this);
            },
            
            handleMidi: function(e) {
                var secondByte = e.data[1];
                var type = this.getMessageType(e);
                
                if(type === 'CC') {
                    if(this.messageBuffer.length < 2) {
                        this.messageBuffer.push(e.data);
                    } else {
                        this.handleCCUpdate(this.messageBuffer);
                        this.messageBuffer = [];
                    }
                } else if(type === 'noteOn' || type === 'noteOff') {
                    this.midiChannel.vent.trigger('message', {type: type, value: secondByte});
                }
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
            
            assignMidiCC: function(midiMessage, param) {
                var controllers = this.determineMSB(midiMessage);
                
                if(controllers.MSB === controllers.LSB) {
                    controllers.LSB = null;
                }
                
                // If the synth parameter or the CC were previously assigned,
                // clear the old mapping
                this.removeOldMapping(controllers.MSB, param);
                
                this.mappings.add(new MidiModel({
                    MSBController: controllers.MSB,
                    LSBController: controllers.LSB,
                    param: param
                }));
                
                window.localStorage.setItem(this.activeDevice.name, JSON.stringify(this.mappings));
            },
            
            determineMSB: function(midiMessage) {
                if(midiMessage[0][1] > midiMessage[1][1]) {
                    return {
                        MSB: midiMessage[0][1],
                        MSBValue: midiMessage[0][2],
                        LSB: midiMessage[1][1],
                        LSBValue: midiMessage[1][2]
                    };
                } else {
                    return {
                        LSB: midiMessage[0][1],
                        LSBValue: midiMessage[0][2],
                        MSB: midiMessage[1][1],
                        MSBValue: midiMessage[1][2]
                    };
                }
            },
            
            removeOldMapping: function(midiMessage, param) {
                var previousCCMapping = this.getModelForMessage(midiMessage);
                var previousParamMapping = this.getModelForParam(param);
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
            
            handleCCUpdate: function(messages) {
                var mapping = this.getModelForMessage(this.determineMSB(messages).MSB);
                var value;
                
                if(mapping) {
                    value = mapping.getValue(this.determineMSB(messages));
                    this.midiChannel.vent.trigger('message', {type: 'CC', param: mapping.get('param'), value: value});
                }
            },
            
            getModelForMessage: function(MSBController) {
                return this.mappings.findWhere({
                    MSBController: MSBController
                });
            },
            
            getModelForParam: function(param) {
                return this.mappings.findWhere({
                    param: param
                });
            },
            
            serializeData: function() {
                return {
                    midi: this.midi,
                    inputs: this.inputs
                };
            }
            
        });
    });
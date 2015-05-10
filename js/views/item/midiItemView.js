define([
    'backbone',
    'hbs!tmpl/item/midiItemView-tmpl'
    ],
    
    function(Backbone, Template) {
        return Marionette.ItemView.extend({
            
            className: 'midi',
            
            template: Template,
            
            ui: {
                select: '.js-active-midi'
            },
            
            events: {
                'change @ui.select': 'selectMidi'
            },
            
            initialize: function(options) {
                this.midiListener = options.midiListener;
                this.midi = false;
                this.inputs = [];
                this.activeDevice = null;
                
                this.requestMidi();
            },
            
            onShow: function() {

            },
            
            requestMidi: function() {
                var that = this;
                var inputs; 
                navigator.requestMIDIAccess().then(function(access) {
                    if(access.inputs && access.inputs.size > 0) {
                        that.midi = true;
                        inputs = access.inputs.values();
                        for (input = inputs.next(); input && !input.done; input = inputs.next()) {
                            that.inputs.push(input.value);
                        }
                        that.render();
                        that.selectMidi();
                    }
                });
            },
            
            selectMidi: function() {
                this.activeDevice = _.findWhere(this.inputs, {name: this.ui.select.val() });
                this.activeDevice.onmidimessage = this.handleMidi.bind(this);
            },
            
            handleMidi: function(e) {
                this.midiListener.trigger('midiMessage', e.data);
            },
            
            serializeData: function() {
                return {
                    midi: this.midi,
                    inputs: this.inputs
                };
            }
            
        });
    });
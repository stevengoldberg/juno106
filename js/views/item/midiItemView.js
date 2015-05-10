define([
    'backbone',
    'hbs!tmpl/item/midiItemView-tmpl'
    ],
    
    function(Backbone, Template) {
        return Marionette.ItemView.extend({
            
            className: 'midi',
            
            template: Template,
            
            initialize: function() {
                this.midi = false;
                this.inputs = [];
                this.requestMidi();
            },
            
            onShow: function() {

            },
            
            requestMidi: function() {
                var that = this;
                var inputs; 
                navigator.requestMIDIAccess().then(function(access) {
                    console.log(access);
                    if(access.inputs && access.inputs.size > 0) {
                        that.midi = true;
                        inputs = access.inputs.values();
                        for (input = inputs.next(); input && !input.done; input = inputs.next()) {
                            that.inputs.push(input.value);
                        }
                        console.log(that.inputs);
                        that.render();
                    }
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
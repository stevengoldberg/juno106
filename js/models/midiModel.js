define([
    'backbone',
    ],
    
    function(Backbone) {
        return Backbone.Model.extend({
            defaults: function() {
                return {
                    device: null,
                    MSBController: null,
                    LSBController: null,
                    param: null
                };
            },
            
            getValue: function(messages) {
                if(this.get('LSBController') === null) {
                    return this.get7BitValue(messages);
                } else {
                    return this.get14BitValue(messages);
                }
            },
            
            get7BitValue: function(message) {
                var value = message.MSBValue / 127;
                return value;
            },
            
            get14BitValue: function(messages) {
                var value = (messages.LSBValue / 127) + (messages.MSBValue / Math.pow(127, 2));
                return value;
            },
            
        });
    });
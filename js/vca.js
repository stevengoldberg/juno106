define([
    'application'
],
    
    function(App) {
        return Backbone.Marionette.Object.extend({
            initialize: function() {
                this.context = App.context;
                
                this.gain = this.context.createGain();
                this.gain.gain.value = 0;
                this.input = this.gain;
                this.output = this.gain;
                this.amplitude = this.gain.gain;
            },
            
            connect: function(node) {
                if (_.has(node, 'input')) {
                    this.output.connect(node.input);
                } else {
                    this.output.connect(node);
                }
            },
            
            level: function(level) {
                var now = this.context.currentTime;
                
                this.amplitude.cancelScheduledValues(now);
                this.amplitude.setValueAtTime(level, now);
            },
        });
    }
);
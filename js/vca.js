define([
    'application'
],
    
    function(App) {
        function VCA() {
            this.gain = App.context.createGain();
            this.gain.gain.value = 0;
            this.input = this.gain;
            this.output = this.gain;
            this.amplitude = this.gain.gain;
        }
        
        VCA.prototype.connect = function(node) {
            if (_.has(node, 'input')) {
                this.output.connect(node.input);
            } else {
                this.output.connect(node);
            }
        };
        
        VCA.prototype.level = function(level) {
            var now = App.context.currentTime;
            
            this.amplitude.cancelScheduledValues(now);
            this.amplitude.setValueAtTime(level, now);
        };
        
        return VCA;    
    }

);
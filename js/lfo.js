define([
    'application'
],
    
    function(App) {
        function LFO(options) {
            this.lfo = App.context.createOscillator();
            this.lfo.type = 'triangle';
            this.lfo.frequency.value = this.getFrequency(options.rate);
            this.lfo.start(0);
            
            this.pitchMod = App.context.createGain();
            this.pitchMod.gain.value = this.getAmplitude(options.pitchMod);
            this.lfo.connect(this.pitchMod);
            this.output = this.pitchMod;
        }
        
        LFO.prototype.connect = function(node) {
            if (_.has(node, 'input')) {
                if(_.isArray(node.input)) {
                    _.each(node.input, function(inputNode) {
                        this.output.connect(inputNode);
                    }, this);
                } else {
                    this.output.connect(node.input);
                }
            } else {
                this.output.connect(node);
            }
        };
        
        LFO.prototype.pitch = function(value) {
            var now = App.context.currentTime;
            this.pitchMod.gain.cancelScheduledValues(now);
            this.pitchMod.gain.value = this.getAmplitude(value);
        };
        
        LFO.prototype.rate = function(value) {
            var now = App.context.currentTime;
            this.lfo.frequency.cancelScheduledValues(now);
            this.lfo.frequency.value = this.getFrequency(value);
        };
        
        LFO.prototype.getFrequency = function(value) {
            return Math.pow(value, 3) * 25;
        };
        
        LFO.prototype.getAmplitude = function(value) {
            return Math.pow(value, 2) * 30;
        };
        
        return LFO;
    }
);
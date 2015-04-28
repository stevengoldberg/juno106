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
            this.pitchMod.gain.value = 0;
            this.pitchModLevel = options.pitchMod;
            
            this.lfo.connect(this.pitchMod);
            this.output = this.pitchMod;
            this.delayTime = Math.pow(options.delay, 2) * 3;
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
        
        LFO.prototype.delay = function(value) {
            this.delayTime = value * 3;
        };
        
        LFO.prototype.trigger = function() {
            var now = App.context.currentTime;
            this.pitchMod.gain.cancelScheduledValues(now);
            this.pitchMod.gain.value = 0;
            this.pitchMod.gain.setTargetAtTime(this.getAmplitude(this.pitchModLevel), now + this.delayTime, 1.5);
        };
        
        LFO.prototype.getFrequency = function(value) {
            return Math.pow(value, 3) * 25;
        };
        
        LFO.prototype.getAmplitude = function(value) {
            return Math.pow(value, 2) * 40;
        };
        
        
        
        return LFO;
    }
);
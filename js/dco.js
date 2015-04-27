define([
    'application'
],
    
    function(App) {
        function DCO(options) {
            this.output = [];
            this.input = [];
            
            _.each(options.waveform, function(waveform, i) {
                this.output[i] = App.context.createOscillator();
                this.output[i].type = waveform;
                this.output[i].frequency.value = options.frequency;
                this.output[i].start();
            }, this);
            
            this.subOsc = App.context.createOscillator();
            this.subOsc.type = 'square';
            this.subOsc.frequency.value = options.frequency / 2;
            this.subOsc.start();
            
            this.subLevel = App.context.createGain();
            this.subOsc.connect(this.subLevel);
            this.subLevel.gain.value = options.subLevel;
            this.output.push(this.subLevel);
            
            _.each(this.output, function(outputNode, i) {
                if(outputNode instanceof OscillatorNode) {
                    this.input.push(outputNode.frequency);
                }
            }, this);
            this.input.push(this.subOsc.frequency);
        }
        
        /*VCO.prototype.setFrequency = function(frequency) {
            this.oscillator.frequency.setValueAtTime(frequency, App.context.currentTime);
        };*/
        
        DCO.prototype.connect = function(node) {
            if(_.has(node, 'input')) {
                _.each(this.output, function(outputNode) {
                    outputNode.connect(node.input);
                });
            } else {
                _.each(this.output, function(outputNode) {
                    outputNode.connect(node);
                });
            }
        };
        
        DCO.prototype.stop = function() {
            _.each(this.oscillators, function(oscillator) {
                oscillator.stop();
            });
        };
        
        DCO.prototype.sub = function(value) {
            var now = App.context.currentTime;
            this.subLevel.gain.cancelScheduledValues(now);
            this.subLevel.gain.setValueAtTime(value, now);
        };
        
        return DCO;
    }
);
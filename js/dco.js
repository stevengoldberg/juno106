define([
    'application'
],
    
    function(App) {
        function DCO(options) {
            this.outputs = [];
            
            _.each(options.waveform, function(waveform, i) {
                this.outputs[i] = App.context.createOscillator();
                this.outputs[i].type = waveform;
                this.outputs[i].frequency.value = options.frequency;
                this.outputs[i].start();
            }, this);
            
            this.subOsc = App.context.createOscillator();
            this.subOsc.type = 'square';
            this.subOsc.frequency.value = options.frequency / 2;
            this.subOsc.start();
            //this.oscillators.push(this.sub);
            
            this.subLevel = App.context.createGain();
            this.subOsc.connect(this.subLevel);
            this.subLevel.gain.value = options.subLevel;
            this.outputs.push(this.subLevel);
        }
        
        /*VCO.prototype.setFrequency = function(frequency) {
            this.oscillator.frequency.setValueAtTime(frequency, App.context.currentTime);
        };*/
        
        DCO.prototype.connect = function(node) {
            if(_.has(node, 'input')) {
                _.each(this.outputs, function(output) {
                    output.connect(node.input);
                });
            } else {
                _.each(this.outputs, function(output) {
                    output.connect(node);
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
define([
    'backbone'
    ],
    
    function(Backbone) {
        return Backbone.Model.extend({
            
            defaults: function() {
                return {
                    vcaLevel: 0.1,
                    vcaEnv: 0,
                    a: 0,
                    d: 0,
                    s: 1,
                    r: 0,
                    gate: true,
                    vcfFreq: 1,
                    sawtooth: true,
                    square: false,
                    noise: 0,
                    range: 1
                };
            },
            
            getCurrentWaveforms: function() {
                var dco = {
                    sawtooth: this.get('sawtooth'),
                    square: this.get('square'),
                    noise: this.get('noise')
                };
                
                var waveforms = _.pick(dco, function(value) {
                    return value != 0;
                });
                
                return _.keys(waveforms);
            },
            
            getCurrentRange: function(frequency) {
                var range = this.get('range');
                
                if(range === 0) {
                    return frequency / 2;
                } else if(range === 2) {
                    return frequency * 2;
                }
                return frequency;
            }
            
        });
    });
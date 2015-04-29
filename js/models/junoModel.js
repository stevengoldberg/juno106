define([
    'backbone'
    ],
    
    function(Backbone) {
        return Backbone.Model.extend({
            
            defaults: function() {
                return {
                    'vca-level': 0.3,
                    'env-a': 0,
                    'env-d': 0,
                    'env-s': 1,
                    'env-r': 0,
                    'vca-gate': 1,
                    'dco-sawtooth': true,
                    'dco-square': false,
                    'dco-noise': 0,
                    'dco-range': 1,
                    'dco-sub': 0,
                    'cho-chorusToggle': 0,
                    'vcf-freq': 1,
                    'vcf-res': 0,
                    'vcf-env': 0,
                    'lfo-pitch': 0,
                    'lfo-rate': 0,
                    'lfo-delay': 0,
                    'lfo-freq': 0,
                    'hpf-freq': 0
                };
            },
            
            getCurrentWaveforms: function() {
                var dco = {
                    sawtooth: this.get('dco-sawtooth'),
                    square: this.get('dco-square'),
                    noise: this.get('dco-noise')
                };
                
                var waveforms = _.pick(dco, function(value) {
                    return value != 0;
                });
                
                return _.keys(waveforms);
            },
            
            getCurrentRange: function(frequency) {
                var range = this.get('dco-range');
                
                if(range === 0) {
                    return frequency / 2;
                } else if(range === 2) {
                    return frequency * 2;
                }
                return frequency;
            },
            
            getCurrentEnvelope: function() {
                return {
                    enabled: this.get('vca-gate'),
                    a: this.get('env-a'),
                    d: this.get('env-d'),
                    s: this.get('env-s'),
                    r: this.get('env-r')
                };
            }
            
        });
    });
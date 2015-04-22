define([
    'backbone'
    ],
    
    function(Backbone) {
        return Backbone.Model.extend({
            
            defaults: function() {
                return {
                    'vca-level': 0.1,
                    'vca-env': 0,
                    'env-a': 0,
                    'env-d': 0,
                    'env-s': 1,
                    'env-r': 0,
                    'env-gate': 0,
                    'vcf-freq': 1,
                    'dco-sawtooth': true,
                    'dco-square': false,
                    'dco-noise': 0,
                    'dco-range': 1
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
                var envelopeOffset = 0.0015;
                var attackMax = 3;
                var decayReleaseMax = 12;
                
                var env = {
                    gate: this.get('env-gate'),
                    a: attackMax * this.getAttackCurve(this.get('env-a')) + envelopeOffset,
                    d: decayReleaseMax * this.getReleaseCurve(this.get('env-d')) + envelopeOffset,
                    s: this.get('env-s'),
                    r: decayReleaseMax * this.getReleaseCurve(this.get('env-r')) + envelopeOffset
                };
                
                return env;
            },
            
            getReleaseCurve: function(releaseMultiplier) {
                return Math.pow(releaseMultiplier, 3);
            },
            
            getAttackCurve: function(attackMultiplier) {
                return Math.pow(attackMultiplier, 2);
            }
            
        });
    });
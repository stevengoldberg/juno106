define([
    'backbone'
    ],
    
    function(Backbone) {
        return Backbone.Model.extend({
            
            defaults: function() {
                return {
                    'vca-level': 0.3,
                    'env-attack': 0,
                    'env-decay': 0,
                    'env-sustain': 1,
                    'env-release': 0,
                    'vca-gate': 1,
                    'dco-sawtooth': true,
                    'dco-square': false,
                    'dco-noise': 0,
                    'dco-range': 1,
                    'dco-sub': 0,
                    'cho-chorusToggle': 0,
                    'vcf-cutoff': 1,
                    'vcf-res': 0,
                    'vcf-envMod': 0,
                    'lfo-pitchMod': 0,
                    'lfo-rate': 0,
                    'lfo-delay': 0,
                    'lfo-freqMod': 0,
                    'hpf-cutoff': 0
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
                    attack: this.get('env-attack'),
                    decay: this.get('env-decay'),
                    sustain: this.get('env-sustain'),
                    release: this.get('env-release')
                };
            },
            
            // Faders register 0.0775 at their lowest position, so convert that to 0
            get: function(attr) {
                var value = Backbone.Model.prototype.get.call(this, attr);
                return value > 0.0775 ? value : 0;
            }
            
        });
    });
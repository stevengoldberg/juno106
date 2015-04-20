define([
    'backbone'
    ],
    
    function(Backbone) {
        return Backbone.Model.extend({
            
            defaults: function() {
                return {
                    vca: 0.1,
                    env: {
                        a: 0,
                        d: 0,
                        s: 1,
                        r: 0
                    },
                    vcf: {
                        freq: 1
                    },
                    dco: {
                        sawtooth: true,
                        square: false
                    },
                    range: 1
                };
            },
            
            getCurrentWaveforms: function() {
                var dco = _.pick(this.get('dco'), function(value, key, object) {
                    return object[key] === true;
                });
                
                return _.keys(dco);
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
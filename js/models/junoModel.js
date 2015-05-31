define([
    'backbone'
    ],
    
    function(Backbone) {
        return Backbone.Model.extend({
            
            defaults: function() {
                return {
                    'vca-level': 0.5,
                    'env-attack': 0,
                    'env-decay': 0,
                    'env-sustain': 1,
                    'env-release': 0,
                    'vca-envEnabled': 1,
                    'dco-sawtooth': 1,
                    'dco-pulse': 0,
                    'dco-noise': 0,
                    'dco-pwm': 0,
                    'dco-range': 1,
                    'dco-sub': 0,
                    'dco-lfoPwmEnabled': 0,
                    'cho-chorusOff': 1,
                    'cho-chorusI': 0,
                    'cho-chorusII': 0,
                    'vcf-cutoff': 1,
                    'vcf-res': 0,
                    'vcf-envMod': 0,
                    'vcf-invert': 1,
                    'vcf-keyFollow': 0,
                    'lfo-pitchMod': 0,
                    'lfo-rate': 0,
                    'lfo-delay': 0,
                    'lfo-freqMod': 0,
                    'hpf-cutoff': 0
                };
            },
            
            getOptions: function(frequency) {
                return {
                    frequency: this.getCurrentRange(frequency),
                    waveform: this.getCurrentWaveform(),
                    envelope: this.getCurrentEnvelope(),
                    vcfInverted: this.isFilterInverted(),
                    chorusLevel: this.getChorusLevel(),
                    lfoPwmEnabled: this.get('dco-lfoPwmEnabled'),
                    lfoRate: this.get('lfo-rate'),
                    lfoDelay: this.get('lfo-delay'),
                    lfoPitchMod: this.get('lfo-pitchMod'),
                    lfoFreqMod: this.get('lfo-freqMod'),
                    vcfFreq: this.get('vcf-cutoff'),
                    keyFollow: this.get('vcf-keyFollow'),
                    res: this.get('vcf-res'),
                    vcfEnv: this.get('vcf-envMod'),
                    volume: this.get('vca-level'),
                    hpf: Math.floor(this.get('hpf-cutoff')),
                };
            },
            
            getCurrentWaveform: function() {
                return {
                    sawtoothLevel: this.get('dco-sawtooth'),
                    pulseLevel: this.get('dco-pulse'),
                    noiseLevel: this.get('dco-noise'),
                    subLevel: this.get('dco-sub'),
                    pulseWidth: this.getPulseWidth()
                };
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
                    enabled: this.get('vca-envEnabled'),
                    attack: this.get('env-attack'),
                    decay: this.get('env-decay'),
                    sustain: this.get('env-sustain'),
                    release: this.get('env-release')
                };
            },
            
            getPulseWidth: function() {
                return this.get('dco-pwm') * 0.8;
            },
            
            isFilterInverted: function() {
                return !this.get('vcf-invert');
            },
            
            getChorusLevel: function() {
                if(this.get('cho-chorusOff')) {
                    return 0;
                } else if(this.get('cho-chorusI')) {
                    return 1;
                } else if(this.get('cho-chorusII')) {
                    return 2;
                }
            },
            
            setChorus: function(attribute, value) {
                var chorusValues = ['cho-chorusOff', 'cho-chorusI', 'cho-chorusII'];
                var newValue = chorusValues.indexOf(attribute);
                for(var i = 0; i < chorusValues.length; i++) {
                    if(i === newValue) {
                        Backbone.Model.prototype.set.call(this, chorusValues[i], 1);
                    } else {
                        Backbone.Model.prototype.set.call(this, chorusValues[i], 0, {silent: true});
                    }
                }
            },
            
            set: function(attributes, options) {
                if(typeof attributes === 'string' && attributes.indexOf('cho') !== -1) {
                    this.setChorus(attributes, options);
                } else {
                    Backbone.Model.prototype.set.call(this, attributes, options);
                }
            }
            
        });
    });
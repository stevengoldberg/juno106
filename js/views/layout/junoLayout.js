define([
    'backbone',
    'application',
    'util',
    'views/layout/moduleLayout',
    'views/item/keyboardItemView',
    'views/modal/shareItemView',
    'synth/voice',
    'synth/lfo',
    'tuna',
    'models/junoModel',
    'hbs!tmpl/layout/junoLayout-tmpl'
    ],

    function(Backbone, App, util, ModuleLayout, KeyboardItemView,
        ShareItemView, Voice, LFO, Tuna, JunoModel, Template) {

        var MAX_POLYPHONY = 6;

        return Backbone.Marionette.LayoutView.extend({

            className: 'juno-container',

            template: Template,

            regions: {
                synthRegion: '.js-synth-region',
                keyboardRegion: '.js-keyboard-region',
                readmeRegion: '.js-readme-region'
            },

            initialize: function() {
                this.activeVoices = [];
                this.synth = new JunoModel();
                this.portamentoTime = 0;
                this.lastFrequency = null;
                this.unisonEnabled = false;
                this.pitchBendSemitones = 0;

                // Reset restores the blank init patch (not the rich page-load
                // default), giving experts a clean slate.
                this.cachedSynth = JSON.stringify(this.synth.initPatch());

                var tuna = new Tuna(App.context);
                this.cho = new tuna.Chorus();
                this.cho.chorusLevel = this.synth.get('cho-chorusToggle');
                // Overdrive bypassed: it was waveshaping every voice on the
                // master bus at all times, adding audible distortion to
                // transients (short plucks especially). Bypassed so the output
                // stays clean; the node is left in the chain (passing signal
                // through) so it can be re-enabled later if a drive control is
                // ever exposed in the UI.
                this.drive = new tuna.Overdrive({
                    outputGain: 0,
                    drive: 0.1,
                    curveAmount: 0.2,
                    algorithmIndex: 3,
                    bypass: 1
                });

                this.masterGain = App.context.createGain();
                this.masterGain.gain.value = 0.5;
                this.masterGain.connect(App.context.destination);

                this.lfo = new LFO({
                    lfoRate: this.synth.get('lfo-rate'),
                    lfoPitch: this.synth.get('lfo-pitch'),
                    lfoDelay: this.synth.get('lfo-delay'),
                    lfoFreq: this.synth.get('lfo-freq'),
                    lfoPwmEnabled: this.synth.get('dco-lfoPwmEnabled'),
                    lfoPwm: this.synth.get('dco-pwm')
                });

                this.midiListener = Backbone.Wreqr.radio.channel('midi').vent;
                this.patchListener = Backbone.Wreqr.radio.channel('patch').vent;

                this.listenTo(this.patchListener, 'load', this.loadPatch);
                this.listenTo(this.midiListener, 'message', this.handleMidi);
                this.listenTo(this.synth, 'change', this.synthUpdateHandler);
            },

            onShow: function() {
                this.moduleLayout = new ModuleLayout({
                    synth: this.synth
                });
                this.synthRegion.show(this.moduleLayout);

                this.keyboardView = new KeyboardItemView();
                this.keyboardRegion.show(this.keyboardView);

                this.listenTo(this.keyboardView, 'noteOn', this.noteOnHandler);
                this.listenTo(this.keyboardView, 'noteOff', this.noteOffHandler);

                document.addEventListener('visibilitychange', function() {
                    if(document.hidden) {
                        this.allNotesOff();
                    }
                }.bind(this), false);
            },

            spawnVoice: function(frequency, fromFrequency) {
                var voice = new Voice({
                    synthOptions: this.synth.getOptions(frequency),
                    lfo: this.lfo,
                    cho: this.cho
                });

                if(fromFrequency && this.portamentoTime > 0) {
                    voice.dco.portamento(fromFrequency, frequency, this.portamentoTime);
                }

                if(this.pitchBendSemitones !== 0) {
                    voice.dco.pitchBend = this.pitchBendSemitones;
                }

                voice.cho.connect(this.drive.input);
                this.drive.connect(this.masterGain);
                voice.noteOn();
                return voice;
            },

            noteOnHandler: function(note, frequency) {
                var that = this;

                var existingVoices = _.filter(this.activeVoices, function(v) { return v.note === note; });
                _.each(existingVoices, function(v) {
                    v.stealNote();
                    that.stopListening(v);
                    that.activeVoices = _.without(that.activeVoices, v);
                });

                var fromFrequency = (this.portamentoTime > 0) ? this.lastFrequency : null;

                if(this.unisonEnabled) {
                    _.each(this.activeVoices, function(v) {
                        v.stealNote();
                        that.stopListening(v);
                    });
                    this.activeVoices = [];

                    for(var i = 0; i < MAX_POLYPHONY; i++) {
                        var uv = this.spawnVoice(frequency, fromFrequency);
                        uv.note = note;
                        this.listenToOnce(uv, 'killVoice', function(deadVoice) {
                            return function() {
                                that.activeVoices = _.without(that.activeVoices, deadVoice);
                            };
                        }(uv));
                        this.activeVoices.push(uv);
                    }
                } else {
                    if(this.activeVoices.length === MAX_POLYPHONY) {
                        this.stopListening(this.activeVoices[0]);
                        this.activeVoices[0].stealNote();
                        this.activeVoices.shift();
                    }

                    var voice = this.spawnVoice(frequency, fromFrequency);
                    voice.note = note;
                    this.listenToOnce(voice, 'killVoice', function() {
                        that.activeVoices = _.without(that.activeVoices, voice);
                    });
                    this.activeVoices.push(voice);
                }

                this.lastFrequency = frequency;
            },

            noteOffHandler: function(note) {
                var voicesToStop = _.filter(this.activeVoices, function(v) { return v.note === note; });
                _.each(voicesToStop, function(voice) {
                    voice.noteOff();
                });
            },

            allNotesOff: function() {
                this.activeVoices.forEach(function(voice) {
                    voice.stealNote();
                }, this);
            },

            handleMidi: function(message) {
                var note;
                var frequency;
                var length;
                var that = this;

                if(message.type === 'noteOn') {
                    frequency = util.frequencyFromMidiNote(message.value);
                    note = util.noteFromMidiNumber(message.value);
                    this.noteOnHandler(note, frequency);
                } else if(message.type === 'noteOff') {
                    note = util.noteFromMidiNumber(message.value);
                    this.noteOffHandler(note);
                } else if(message.type === 'pitchBend') {
                    this.pitchBendSemitones = message.value;
                    _.each(this.activeVoices, function(voice) {
                        voice.dco.pitchBend = message.value;
                    });
                } else if(message.type === 'CC') {
                    length = $('[data-param="' + message.param + '"]').data().length;
                    if(length !== undefined) {
                        if(message.value === 1) {
                            message.value = length - 1;
                        } else {
                            message.value = Math.floor(message.value * length);
                        }
                    }
                    this.synth.set(message.param, message.value);
                    this.moduleLayout.updateComponentUIState(message.param);
                }
            },

            synthUpdateHandler: function(update) {
                // Apply EVERY changed parameter, not just the first. A single
                // fader move changes one param, but RESET and patch loads set
                // the whole patch at once; only reading changed[0] meant those
                // updated a single parameter and silently dropped the rest —
                // most visibly leaving portamentoTime (and unison) stuck at
                // their previous values, so a glide survived Reset and ignored
                // the PORTA fader.
                _.each(update.changed, function(value, param) {
                    if(param === 'prt-time') {
                        this.portamentoTime = value * 3;
                        return;
                    }
                    if(param === 'uni-enabled') {
                        this.unisonEnabled = !!value;
                        return;
                    }

                    var component = param.slice(0, 3);
                    var attr = param.slice(4);

                    _.each(this.activeVoices, function(voice) {
                        voice[component][attr] = value;
                    });
                }, this);
            },

            handleReset: function() {
                this.synth.set(JSON.parse(this.cachedSynth));
                Backbone.Wreqr.radio.channel('patch').vent.trigger('reset');
                this.moduleLayout.updateUIState();
            },

            loadPatch: function(attributes) {
                var update = {};
                var attr;

                _.each(attributes, function(attributePair) {
                    attr = attributePair.split('=');
                    update[attr[0]] = parseFloat(attr[1]);
                });

                this.synth.set(update);
                if(this.moduleLayout) {
                    this.moduleLayout.updateUIState();
                }
            },

            sharePatch: function() {
                var url;
                var paramString = '';
                var attributes = _.pairs(this.synth.attributes);
                var patchName = Backbone.Wreqr.radio.channel('global').reqres.request('patchName');

                _.each(attributes, function(attributePair) {
                    paramString += '?' + attributePair[0] + '=' + parseFloat(attributePair[1].toFixed(6));
                });

                url = window.location.origin + window.location.pathname + '#patch/' +
                    encodeURIComponent(patchName) + paramString;

                App.modal.show(new ShareItemView({
                    name: patchName,
                    url: url
                }));
            }

        });
    });

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
                
                // Initialize long-lived components
                var tuna = new Tuna(App.context);
                this.synth = new JunoModel();
                // Cache the initialized synth for later resetting
                this.cachedSynth = JSON.stringify(this.synth.attributes);
                this.cho = new tuna.Chorus();
                this.cho.chorusLevel = this.synth.get('cho-chorusToggle');
                this.drive = new tuna.Overdrive({
                    outputGain: 0,
                    drive: 0.1,
                    curveAmount: 0.2,
                    algorithmIndex: 3,
                    bypass: 0 
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
            },
            
            noteOnHandler: function(note, frequency) {
                var that = this;
                var currentNote;
                
                for(var i = 0; i < this.activeVoices.length; i++) {
                    if(this.activeVoices[i].note === note) {
                        currentNote = this.activeVoices[i];
                    }
                }
            
                var voice = new Voice({
                    synthOptions: this.synth.getOptions(frequency),
                    lfo: this.lfo,
                    cho: this.cho
                });
                
                if(currentNote) {
                    currentNote.stealNote();
                    this.stopListening(currentNote);
                    this.activeVoices = _.without(this.activeVoices, currentNote);
                }
                
                if(this.activeVoices.length === MAX_POLYPHONY) {
                    this.stopListening(this.activeVoices[0]);
                    this.activeVoices[0].stealNote();
                    this.activeVoices.shift();
                }
                
                voice.cho.connect(this.drive.input);
                this.drive.connect(this.masterGain);
                
                voice.noteOn();
                voice.note = note;
                this.activeVoices.push(voice);
            },
            
            noteOffHandler: function(note) {
                var currentNote;
                
                for(var i = 0; i < this.activeVoices.length; i++) {
                    if(this.activeVoices[i].note === note) {
                        currentNote = this.activeVoices[i];
                    }
                }
                            
                if(currentNote) {
                    this.listenToOnce(currentNote, 'killVoice', function() {
                        this.activeVoices = _.without(this.activeVoices, currentNote);
                    });
                    currentNote.noteOff();
                }

            },
            
            handleMidi: function(message) {
                var note;
                var frequency;
                var length;
                
                if(message.type === 'noteOn') {
                    frequency = util.frequencyFromMidiNote(message.value);
                    note = util.noteFromMidiNumber(message.value);
                    this.noteOnHandler(note, frequency);
                } else if(message.type === 'noteOff') {
                    note = util.noteFromMidiNumber(message.value);
                    this.noteOffHandler(note);
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
                var param = Object.keys(update.changed)[0];
                var value = update.changed[param];
                var component = param.slice(0, 3);
                var attr = param.slice(4);
                
                _.each(this.activeVoices, function(voice) {
                    voice[component][attr] = value;
                });
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
define([
    'backbone',
    'util',
    'hbs!tmpl/item/keyboardItemView-tmpl'
    ],
    
    function(Backbone, util, Template) {
        return Backbone.Marionette.ItemView.extend({
            
            tagName: 'ul',
            
            className: 'keyboard-container',
            
            template: Template,
            
            ui: {
                keys: '.white-key, .black-key',
                whiteKeys: '.white-key',
                blackKeys: '.black-key',
                labels: 'span',
                octaveDown: '.js-octave-down',
                octaveUp: '.js-octave-up'
            },

            events: {
                'mousedown @ui.keys': 'mouseDownHandler',
                'click @ui.octaveDown': 'shiftOctaveDown',
                'click @ui.octaveUp': 'shiftOctaveUp'
            },

            MIN_OCTAVE_SHIFT: -3,
            MAX_OCTAVE_SHIFT: 3,

            initialize: function() {
                this.keysDown = [];
                this.mouseNote = null;
                this.octaveShift = 0;
            },

            onShow: function() {
                this.positionKeys();
                this.updateOctaveButtons();

                this._boundKeyDown = this.keyDownHandler.bind(this);
                this._boundKeyUp = this.keyUpHandler.bind(this);
                $(window).on('keydown.keyboard', this._boundKeyDown);
                $(window).on('keyup.keyboard', this._boundKeyUp);
            },

            onDestroy: function() {
                $(window).off('keydown.keyboard');
                $(window).off('keyup.keyboard');
            },
            
            keyUpHandler: function(e) {
                var keyCode = e.originalEvent.code;
                var noteEl;
                var noteName;
                
                if(!_.has(util.keyMap, keyCode)) {
                    return;
                }
                
                noteEl = this.$('[id*=' + '"' + util.keyMap[keyCode] + '"]').parent();
                noteName = noteEl.attr('id');
                this.stopNote(noteName, noteEl);
            },
            
            keyDownHandler: function(e) {
                if($('.js-edit-patch-name').is(':focus')) return;
                
                var keyCode = e.originalEvent.code;
                var noteEl = this.$('[id*=' + '"' + util.keyMap[keyCode] + '"]').parent();
                var noteName = noteEl.attr('id');
                
                if(_.contains(this.keysDown, noteName)) {
                    return;
                } else if(!_.has(util.keyMap, keyCode)) {
                    return;
                } else {
                    this.playNote(noteName, noteEl);
                }
            },
            
            playNote: function(noteName, noteEl) {
                var frequency;

                this.keysDown.push(noteName);
                
                if(noteEl.hasClass('white-key')) {
                    noteEl.addClass('white-key--playing');
                } else {
                    noteEl.addClass('black-key--playing');
                }
                frequency = this.getFrequency(noteName);
                this.trigger('noteOn', noteName, frequency);
            },
            
            stopNote: function(noteName, noteEl) {
                var frequency;

                this.keysDown = _.without(this.keysDown, noteName);
                frequency = this.getFrequency(noteName);
                noteEl.removeClass('white-key--playing black-key--playing');
                this.trigger('noteOff', noteName, frequency);
            },
            
            mouseDownHandler: function(e) {
                var noteEl = $(e.currentTarget);
                var noteName = noteEl.attr('id');
                
                if(_.contains(this.keysDown, noteName)) {
                    return;
                } else {
                    this.mouseNote = noteName;
                    this.playNote(noteName, noteEl);
                    
                    $(window).on('mouseup.keyboard', function() {
                        this.stopNote(noteName, noteEl);
                        $(window).off('mouseup.keyboard');
                    }.bind(this));
                }
            },
            
            getFrequency: function(noteName) {
                var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
                var keyNumber;
                var octave;

                if (noteName.length === 3) {
                    octave = noteName.charAt(2);
                } else {
                    octave = noteName.charAt(1);
                }

                keyNumber = notes.indexOf(noteName.slice(0, -1));

                if (keyNumber < 3) {
                    keyNumber = keyNumber + 12 + ((octave - 1) * 12) + 1;
                } else {
                    keyNumber = keyNumber + ((octave - 1) * 12) + 1;
                }

                return 440 * Math.pow(2, (keyNumber - 49) / 12) * Math.pow(2, this.octaveShift);
            },

            // Octave shift only affects notes played from here on — held notes
            // keep the pitch they started at, matching how a hardware synth's
            // octave switch behaves.
            shiftOctaveDown: function() {
                if(this.octaveShift <= this.MIN_OCTAVE_SHIFT) return;
                this.octaveShift--;
                this.updateOctaveButtons();
            },

            shiftOctaveUp: function() {
                if(this.octaveShift >= this.MAX_OCTAVE_SHIFT) return;
                this.octaveShift++;
                this.updateOctaveButtons();
            },

            updateOctaveButtons: function() {
                this.ui.octaveDown.toggleClass('octave-shift--disabled', this.octaveShift <= this.MIN_OCTAVE_SHIFT);
                this.ui.octaveUp.toggleClass('octave-shift--disabled', this.octaveShift >= this.MAX_OCTAVE_SHIFT);
            },

            positionKeys: function() {
                var whiteWidth = this.ui.whiteKeys.first().width();
                var blackWidth = this.ui.blackKeys.first().width();
                var thisKey;
                var whiteKeyCounter = 0;
                
                this.ui.whiteKeys.each(function(i) {
                thisKey = $(this);
                    thisKey.css({
                        left: i * thisKey.width()
                    });
                });
                
                this.ui.keys.each(function() {
                    thisKey = $(this);
                    if(thisKey.hasClass('white-key')) {
                        whiteKeyCounter++;
                    } else if(thisKey.hasClass('black-key')) {
                        thisKey.css({
                            left: (whiteKeyCounter * whiteWidth) - (0.5 * blackWidth)
                        });
                    }
                });

                // Positioned from the same measured whiteWidth as the keys
                // themselves (rather than a fixed CSS offset) so it sits
                // flush against the last white key regardless of exactly how
                // much room the keyboard-container leaves past its keys.
                this.ui.octaveUp.css({
                    left: this.ui.whiteKeys.length * whiteWidth
                });
            }

        });
    });

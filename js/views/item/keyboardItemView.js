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
                keys: 'li',
                whiteKeys: '.white-key',
                blackKeys: '.black-key',
                labels: 'span'
            },
            
            events: {
                'mousedown @ui.keys': 'mouseDownHandler'
            },
            
            initialize: function() {
                this.keysDown = [];
                this.mouseNote = null;
            },

            onShow: function() {
                this.positionKeys();
                
                $(window).on('keydown', this.keyDownHandler.bind(this));
                $(window).on('keyup', this.keyUpHandler.bind(this));
                
            },
            
            keyUpHandler: function(e) {
                var keyCode = e.which;
                var noteEl;
                var frequency;
                var noteName;
                
                if(!_.has(util.keyMap, keyCode)) {
                    return;
                }
                
                noteEl = this.$('[id*=' + '"' + util.keyMap[keyCode] + '"]').parent();
                noteName = noteEl.attr('id');
                this.stopNote(noteName, noteEl);
            },
            
            keyDownHandler: function(e) {
                var keyCode = e.which;
                var noteEl = this.$('[id*=' + '"' + util.keyMap[keyCode] + '"]').parent();
                var noteName = noteEl.attr('id');
                var frequency;
                
                if(_.contains(this.keysDown, noteName)) {
                    return;
                } else if(!_.has(util.keyMap, keyCode)) {
                    return;
                } else {
                    this.playNote(noteName, noteEl);
                }
            },
            
            playNote: function(noteName, noteEl) {
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
                    
                    $(window).on('mouseup.keyboard', function(e) {
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

                return 440 * Math.pow(2, (keyNumber - 49) / 12);
            },
            
            
            positionKeys: function() {
                var whiteWidth = this.ui.whiteKeys.first().width();
                var blackWidth = this.ui.blackKeys.first().width();
                var thisKey;
                var whiteKeyCounter = 0;
                
                this.ui.whiteKeys.each(function(i, key) {
                thisKey = $(this);
                    thisKey.css({
                        left: i * thisKey.width()
                    });
                });
                
                this.ui.keys.each(function(i, key) {
                    thisKey = $(this);
                    if(thisKey.hasClass('white-key')) {
                        whiteKeyCounter++;
                    } else if(thisKey.hasClass('black-key')) {
                        thisKey.css({
                            left: (whiteKeyCounter * whiteWidth) - (0.5 * blackWidth)
                        });
                    }
                });
            }

        });
    });
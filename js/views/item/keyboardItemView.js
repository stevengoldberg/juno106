define([
    'backbone',
    'qwerty-hancock',
    'hbs!tmpl/item/keyboardItemView-tmpl'
    ],
    
    function(Backbone, QwertyHancock, Template) {
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
            
            initialize: function() {
                this.keyArray = ['A', 'W', 'S', 'E', 'D', 'F', 'T', 'G', 'Y', 'H',
                    'U', 'J', 'K', 'O', 'L', 'P', ';', '\'', '\]', '\\'];
            },

            onShow: function() {
                this.positionKeys();
            
                /*var keyboard = new QwertyHancock({
                    id: 'js-keyboard',
                    width: 1024,
                    height: 120,
                    octaves: 2,
                    startNote: 'C3',
                    whiteNotesColour: 'white',
                    blackNotesColour: 'black',
                    hoverColour: '#f3e939'
                });
                
                keyboard.keyDown = this.keyDownHandler.bind(this);
                
                keyboard.keyUp = this.keyUpHandler.bind(this);*/
            },
            
            keyUpHandler: function(note, frequency) {
                this.trigger('noteOff', note, frequency);
            },
            
            keyDownHandler: function(note, frequency) {
                this.trigger('noteOn', note, frequency);
            },
            
            labelKeyboard: function() {
                var that = this;
                var keys = this.$('li');
                var label;
                var color;
                
                keys.each(function(i, key) {
                    color = $(this).data().noteType;
                    if(color === 'white') {
                        $(this).css({
                            position: 'relative'
                        });
                    } else {
                        $(this).css({
                            'z-index': 2
                        });
                    }
                    label = $('<span class="key-label--' + color + '">' + that.keyArray[i] + '</span>');
                    $(this).append(label);
                });
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
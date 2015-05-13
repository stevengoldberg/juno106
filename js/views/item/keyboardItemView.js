define([
    'backbone',
    'qwerty-hancock',
    'hbs!tmpl/item/keyboardItemView-tmpl'
    ],
    
    function(Backbone, QwertyHancock, Template) {
        return Backbone.Marionette.ItemView.extend({
            
            className: 'keyboard-container',
            
            template: Template,
            
            initialize: function() {
                this.keyArray = ['A', 'W', 'S', 'E', 'D', 'F', 'T', 'G', 'Y', 'H',
                    'U', 'J', 'K', 'O', 'L', 'P', ';', '\'', '\]', '\\'];
            },

            onShow: function() {
            
                var keyboard = new QwertyHancock({
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
                
                keyboard.keyUp = this.keyUpHandler.bind(this);
                
                //this.labelKeyboard();
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
            }

        });
    });
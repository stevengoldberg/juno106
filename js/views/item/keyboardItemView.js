define([
    'backbone',
    'qwerty-hancock',
    'hbs!tmpl/item/keyboardItemView-tmpl'
    ],
    
    function(Backbone, QwertyHancock, Template) {
        return Backbone.Marionette.ItemView.extend({
            
            className: 'keyboard-container',
            
            template: Template,

            onShow: function() {
            
                var keyboard = new QwertyHancock({
                    id: 'js-keyboard',
                    width: 1024,
                    height: 150,
                    octaves: 2,
                    startNote: 'C3',
                    whiteNotesColour: 'white',
                    blackNotesColour: 'black',
                    hoverColour: '#f3e939'
                });
                
                keyboard.keyDown = this.keyDownHandler.bind(this);
                
                keyboard.keyUp = this.keyUpHandler.bind(this);
            },
            
            keyUpHandler: function(note, frequency) {
                this.trigger('noteOff', note, frequency);
            },
            
            keyDownHandler: function(note, frequency) {
                this.trigger('noteOn', note, frequency);
            }

        });
    });
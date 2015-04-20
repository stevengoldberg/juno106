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
                this.keyMap = {
                    65: 'c',
                    87: 'c#',
                    83: 'd',
                    69: 'd#',
                    68: 'e',
                    70: 'f',
                    84: 'f#',
                    71: 'g',
                    89: 'g#',
                    72: 'a',
                    85: 'a#',
                    74: 'b',
                    75: 'C' 
                };
                
                this.maxPolyphony = 6;
                
                this.notesTriggered = [];
            },
            
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
                console.log('off: ' + note + ' ' + frequency);
                this.notesTriggered = _.without(this.notesTriggered, note);
                console.log(this.notesTriggered);
            },
            
            keyDownHandler: function(note, frequency) {
                console.log('on: ' + note + ' ' + frequency);
                if(this.notesTriggered.length <= this.maxPolyphony) {
                    this.notesTriggered.push(note);
                    console.log(this.notesTriggered);
                }
            }

        });
    });
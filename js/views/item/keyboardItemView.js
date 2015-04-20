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
                //$(window).on('keydown.keyboard', this.keydownHandler.bind(this));
                //$(window).on('keyup.keyboard', this.keyupHandler.bind(this));
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
            },
            
            keydownHandler: function(e) {
                console.log('note on');
                console.log(this.keyMap[e.which]);
            },
            
            keyupHandler: function(e) {
                console.log('note off');
                console.log(this.keyMap[e.which]);
            },
            
            onClose: function() {
                //$(window).off('keydown.keyboard');
                //$(window).off('keyup.keyboard');
            }

        });
    });
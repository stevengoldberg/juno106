define([
    'application',
    'tuna'
],
    
    function(App, Tuna) {
        return Backbone.Marionette.Object.extend({
            initialize: function(options) {
                this.context = App.context;
                this.tuna = new Tuna(this.context);
                this.chorus = new this.tuna.Chorus({
                    bypass: 1
                });
                this.input = this.chorus.input;
                this.output = this.chorus;
                this.chorusToggle(options.mode);
            },
            
            connect: function(node) {
                if (_.has(node, 'input')) {
                    this.output.connect(node.input);
                } else {
                    this.output.connect(node);
                }
            },
            
            chorusToggle: function(value) {
                if(value === 0) {
                    this.chorus.bypass = 1;
                } else if(value === 1) {
                    this.chorus.bypass = 0;
                    this.chorus.delay = 0.045;
                    this.chorus.feedback = 0.1;
                    this.chorus.rate = 0.35;
                } else if(value === 2) {
                    this.chorus.bypass = 0;
                    this.chorus.delay = 0.1;
                    this.chorus.feedback = 0.5;
                    this.chorus.rate = 0.5;
                }
                
            }
            
        });
    }
);
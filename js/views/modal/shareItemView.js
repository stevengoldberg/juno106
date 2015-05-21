define([
    'backbone',
    'application',
    'backbone.modal',
    'zeroclipboard',
    'hbs!tmpl/modal/shareItemView-tmpl'
    ],
    
    function(Backbone, App, BackboneModal, ZeroClipboard, Template) {
        return BackboneModal.extend({
            
            initialize: function(data) {
                this.url = data.url;
                this.name = data.name;
                this.clipboard = null;
            },
            
            template: Template,
            
            events: {
                'click .js-close': 'closeModal'
            },
            
            serializeData: function() {
                return {
                    url: this.url,
                    name: this.name
                };
            },
            
            onShow: function() {
                if(!this.clipboard) {
                    this.clipboard = new ZeroClipboard(this.$('.js-share'));
                    this.clipboard.on('copy', function(e) {
                        this.$('.js-share').removeClass('fa-share-square').addClass('fa-check-square');
                    }.bind(this));
                }
            },
            
            closeModal: function() {
                ZeroClipboard.destroy();
                this.destroy();
            }
            
        });
    });
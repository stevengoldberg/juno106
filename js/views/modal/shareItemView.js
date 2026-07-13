define([
    'backbone',
    'application',
    'backbone.modal',
    'hbs!tmpl/modal/shareItemView-tmpl'
    ],

    function(Backbone, App, BackboneModal, Template) {
        return BackboneModal.extend({

            initialize: function(data) {
                this.url = data.url;
                this.name = data.name;
            },

            template: Template,

            cancelEl:  '.js-close',

            serializeData: function() {
                return {
                    url: this.url,
                    name: this.name
                };
            },

            onShow: function() {
                this.$('.js-share').on('click', function() {
                    navigator.clipboard.writeText(this.url).then(function() {
                        this.$('.js-share').removeClass('fa-share-square').addClass('fa-check-square');
                    }.bind(this));
                }.bind(this));
            },

            cancel: function() {}

        });
    });

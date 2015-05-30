define([
    'backbone',
    'application',
    'backbone.modal',
    'hbs!tmpl/modal/midiAssignItemView-tmpl'
    ],
    
    function(Backbone, App, BackboneModal, Template) {
        return BackboneModal.extend({
            
            initialize: function(data) {
                this.param = data.param;
            },
            
            template: Template,
            
            cancelEl: '.js-cancel',
            
            serializeData: function() {
                return {
                    param: this.param
                };
            },
            
            success: function() {
                this.$('.js-assign').removeClass('fa-sliders').addClass('fa-check-square');
                _.delay(this.destroy.bind(this), 1000);
            }
            
        });
    });
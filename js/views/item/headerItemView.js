define([
    'backbone',
    'hbs!tmpl/item/headerItemView-tmpl'
    ],
    
    function(Backbone, Template) {
        return Marionette.ItemView.extend({
            
            className: 'header',
            
            template: Template,
            
            ui: {
                init: '.js-init',
                share: '.js-share-patch',
                name: '.js-patch-name',
                editIcon: '.js-edit-icon',
                nameInput: '.js-edit-patch-name'
            },
            
            events: {
                'click @ui.init': 'triggerReset',
                'click @ui.share': 'triggerSharePatch',
                'click @ui.name': 'handleEditName',
                'click @ui.editIcon': 'handleEditName',
                'blur @ui.nameInput': 'handleEditComplete'
            },
            
            initialize: function() {
                this.patchName = 'PATCH NAME';
            },
            
            serializeData: function() {
                return {
                    patchName: this.patchName
                };
            },
            
            triggerReset: function() {
                this.trigger('reset');
            },
            
            triggerSharePatch: function() {
                this.trigger('share');
            },
            
            handleEditName: function() {
                this.ui.name.hide();
                this.ui.nameInput.show();
                this.ui.nameInput.val(this.patchName);
                this.ui.nameInput.focus();
                this.ui.nameInput.select();
            },
            
            handleEditComplete: function() {
                this.patchName = this.ui.nameInput.val();
                this.ui.nameInput.hide();
                this.render();
            }
        });
    });
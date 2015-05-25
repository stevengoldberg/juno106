define([
    'backbone',
    'application',
    'hbs!tmpl/item/clickMenuItemView-tmpl'],

    function(Backbone, App, Template) {

        return Backbone.Marionette.ItemView.extend({

            template: Template,

            ui: {
                clickMenu: '.js-click-menu',
                item: 'li'
            },

            events: {
                'click @ui.item': 'triggerClickEvent'
            },

            setup: function(options) {
                this.menuOptions = options.menuOptions;

                _.each(this.menuOptions, function(menu) {
                    if(_.isArray(menu.event)) {
                        menu.isSubmenu = true;
                    }
                });

                this.header = options.header;
                this.offsetX = options.offsetX || 0;
                this.offsetY = options.offsetY || 0;
                this.render();
                $(window).on('click.context', this.noSelection.bind(this));
            },

            triggerClickEvent: function(e) {
                var eventData = $(e.currentTarget).data().click;
                if(!eventData) {
                    e.stopPropagation();
                    return;
                }
                this.trigger('clicked', eventData);
                this.hide();
                $(window).off('click.context');
            },

            serializeData: function() {
                return {
                    options: this.menuOptions,
                    header: this.header
                };
            },

            rightClickHandler: function(e) {
                var target = $(e.target);
                var boundaryOffset;

                this.ui.clickMenu.addClass('click-menu--shown')
                    .css({
                        visibility: 'hidden'
                    });

                boundaryOffset = this.boundaryAdjustment(e);

                this.ui.clickMenu.css({
                    left: e.clientX + this.offsetX + boundaryOffset.x,
                    top: e.clientY + this.offsetY + boundaryOffset.y,
                    visibility: 'visible'
                });
            },

            boundaryAdjustment: function(e) {
                var xOffset = $(window).width() - e.clientX -
                    this.ui.clickMenu.width() - 40;
                var yOffset = $(window).height() - e.clientY -
                    this.ui.clickMenu.height() - 40;

                return {
                    x: xOffset < 0 ? xOffset : 0,
                    y: yOffset < 0 ? yOffset : 0
                };
            },

            noSelection: function() {
                this.trigger('clicked', null);
                this.hide();
                $(window).off('click.context');
            },

            hide: function() {
                this.ui.clickMenu.removeClass('click-menu--shown');
                this.trigger('closed');
            }
    });
});

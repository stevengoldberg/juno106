define([
    'backbone',
    'views/item/lfoItemView',
    'views/item/dcoItemView',
    'views/item/vcfItemView',
    'views/item/hpfItemView',
    'views/item/vcaItemView',
    'views/item/envItemView',
    'views/item/choItemView',
    'hbs!tmpl/layout/moduleLayout-tmpl'
    ],
    
    function(Backbone, LFOItemView, DCOItemView, VCFItemView, HPFItemView, VCAItemView,
        ENVItemView, CHOItemView, Template) {
        return Backbone.Marionette.LayoutView.extend({
            
            className: 'module-container',
            
            template: Template,
            
            regions: {
                lfoRegion: '.js-lfo-region',
                dcoRegion: '.js-dco-region',
                vcfRegion: '.js-vcf-region',
                hpfRegion: '.js-hpf-region',
                vcaRegion: '.js-vca-region',
                envRegion: '.js-env-region',
                choRegion: '.js-cho-region'
            },
            
            initialize: function(data) {
                this.synth = data.synth;
                this.modules = this.setupModules();
            },
            
            setupModules: function() {
                return {
                    LFO: new LFOItemView(),
                    DCO: new DCOItemView(),
                    VCF: new VCFItemView(),
                    HPF: new HPFItemView(),
                    VCA: new VCAItemView(),
                    ENV: new ENVItemView(),
                    CHO: new CHOItemView()
                };
            },
            
            getRegionName: function(moduleName) {
                return moduleName.toLowerCase() + 'Region';
            },
            
            onShow: function() {
                var regionName;
                _.each(this.modules, function(view, name) {
                    regionName = this.getRegionName(name);
                    this[regionName].show(view);
                    this.listenTo(view, 'update', this.handleModuleUpdate);
                }, this);
            },
            
            handleModuleUpdate: function(update) {
                console.log(update);
                this.synth.set(update.param, update.value);
            },
        });
    });
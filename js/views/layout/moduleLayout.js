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
                this.currentParam = null;
                this.currentValue = null;
            },
            
            setupModules: function() {
                return {
                    lfo: new LFOItemView(),
                    dco: new DCOItemView(),
                    vcf: new VCFItemView(),
                    hpf: new HPFItemView(),
                    vca: new VCAItemView(),
                    env: new ENVItemView(),
                    cho: new CHOItemView()
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
                
                this.updateUIState();
            },
            
            updateUIState: function() {
                var component;
                _.each(this.synth.attributes, function(value, key) {
                    component = key.slice(0, 3);
                    this.modules[component].updateUIState(key, this.synth.get(key));
                }, this);
            },
            
            handleModuleUpdate: function(update) {
                if(update.param === this.currentParam && update.value === this.currentValue) return;
                //console.log(update);
                
                this.synth.set(update.param, update.value);
                this.currentParam = update.param;
                this.currentValue = update.value;
            },
        });
    });
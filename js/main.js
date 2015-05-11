require([
    'backbone',
    'backbone.marionette',
    'application',
    'routers', // Do not remove. This is required as a dependency. Routers must be loaded prior to App.start();
    'views/layout/junoLayout'
],

    function (Backbone, Marionette, App, Routers, JunoLayout) {
        
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            App.context = new AudioContext();
        }
        catch(e) {
            alert('Web Audio API is not supported in this browser');
        }
        
        
        // Pulse oscillator from Andy Harman
        // https://github.com/pendragon-andyh/WebAudio-PulseOscillator
        var pulseCurve = new Float32Array(256);
        for(var i = 0; i < 128; i++) {
            pulseCurve[i] = -1;
            pulseCurve[i + 128] = 1;
        }
        App.context.pulseCurve = pulseCurve;
        
        var constantOneCurve = new Float32Array(2);
        constantOneCurve[0] = 1;
        constantOneCurve[1] = 1;
        App.context.constantOneCurve = constantOneCurve;
        
        App.context.createPulseOscillator = function() {
    		var node = this.createOscillator();
    		node.type = "sawtooth";
            
    		var pulseShaper = App.context.createWaveShaper();
    		pulseShaper.curve = this.pulseCurve;
    		node.connect(pulseShaper);
    		var widthGain = App.context.createGain();
    		widthGain.gain.value = 0; 
    		node.width = widthGain.gain; 
    		widthGain.connect(pulseShaper);
            
    		var constantOneShaper = this.createWaveShaper();
    		constantOneShaper.curve = this.constantOneCurve;
    		node.connect(constantOneShaper);
    		constantOneShaper.connect(widthGain);

    		node.connect = function() {
    			pulseShaper.connect.apply(pulseShaper, arguments);
    			return node;
    		};
    		
    		node.disconnect = function() {
    			pulseShaper.disconnect.apply(pulseShaper, arguments);
    			return node;
    		};
            
    		return node;
    	};
        
        var junoLayout = new JunoLayout();
                
        App.router = Routers;
        App.start();
        App.content.show(junoLayout);
});
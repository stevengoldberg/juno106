define([
    'application'
],
    
    function(App) {
        
        return {
            getFaderCurve: function(value) {
                return Math.pow(value, 2);
            },
            
            nyquist: function() {
                return App.context.sampleRate / 2;
            }
        };
    
    }

);
define([

],
    
    function() {
        
        return {
            getFaderCurve: function(value) {
                return Math.pow(value, 3);
            }
        };
    
    }

);
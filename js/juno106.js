$(document).on('ready', function() {
	var juno = (function() {
        var synth = {
            env: {
                a: 0,
                d: 0,
                s: 0,
                r: 0
            },
            lfo: {
                rate: 0,
                delay: 0
            },
            dco: {
                range: 8,
                lfoMod: 0,
                pwm: 0
            }
        };
        
        return {
            setupButtons: function() {
                var target;
                $('.button').on('click', function(e) {
                    target = $(e.currentTarget);
                    if(target.hasClass('js-chorus')) {
                        target.addClass('pressed');
                        target.siblings('.led').addClass('lit');
                        target.parent().siblings().children().removeClass('pressed lit');
                    } else {
                        target.toggleClass('pressed');
                    	target.siblings('.led').toggleClass('lit');
                    }
                });
            },
            setupFaders: function() {
                var target;
                var that = this;
                $('.fader__knob').mousedown(function(e) {
                    target = $(e.currentTarget);
                    $(window).on('mousemove', function(e) {
                        that.calculateFaderMovement(target, e.clientY);
                    });
                });
                $(window).mouseup(function(e) {
                    $(window).off('mousemove');
                });
            },
            calculateFaderMovement: function(knob, yPos) {
                var position;
                var slotTop = knob.parent().offset().top;
                var slotHeight = knob.parent().height();
                var slotBottom = slotTop + slotHeight;
                
                if(yPos < slotTop) {
                    position = 0;
                } else if (yPos > slotBottom) {
                    position = 175;
                } else {
                    position = (yPos - slotTop) / slotHeight * 100  + '%';
                }

                knob.css({
					top: position
                });
            }
        }
    })();
    
    juno.setupButtons();
    juno.setupFaders();
});
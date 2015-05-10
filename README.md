# Juno-106.js v 1.0

Juno-106.js is an emulation of the classic [Roland Juno-106 analog synthesizer](http://en.wikipedia.org/wiki/Roland_Juno-106).

[You can play the Juno-106.js here](http://resistorsings.com/juno-106).

# System Requirements

Minimum window size of 1024x768. Please use an updated version of **Google Chrome**. For MIDI connectivity, you must either use **Chrome 43** or newer (currently in beta), or enable the MIDI feature flag in **Chrome 38** or newer by pointing your browser to `chrome://flags`, searching for "Enable Web MIDI API," clicking "enable," and then restarting the browser.

# How to play

Notes can be played on the Juno by clicking the keys on the keyboard with the mouse. However, this synth can play up to 6 notes at a time if played via the computer keyboard or a MIDI keyboard. The letter "A" on your computer keyboard corresponds to the lowest note on the synthesizer keyboard, a C3.

**Synthesis Quickstart Manual**

This is an overview of the controls on the Juno-106.js, and many other analog and virtual analog synthesizers. For more detailed instructions, consult the [Juno 106 owner's manual](http://www.synthfool.com/docs/Roland/Juno_Series/Roland_Juno_106/Roland_Juno106_Owners_Manual.pdf).

* LFO - Low Frequency Oscillator  
 Triangle-wave oscillator used to modulate other synth parameters.
 
 Rate: Controls the speed of the LFO.  
 Delay: Controls the speed at which the LFO fades in on triggering a note.  

* DCO - Digitally Controlled Oscillator  
 Oscillators that produce pitches, controlled by the keyboard.
 
 Range: Selects the keyboard octave.  
 LFO: Selects the extent to which the LFO modulates the oscillator pitch -- i.e., adjusts the depth of vibrato.  
 PWM: In manual mode, sets the width of the pulse wave, between 5% and 95%. In LFO mode,  
 selects the extent to which the LFO modulates pulse width.  
 PULSE/SAW: Toggles active waveforms.  
 SUB: Sets volume of square-wave sub-oscillator, one octave below main oscillator.  
 NOISE: Sets volume of noise generator.  

* VCF - Voltage Controlled Filter  
 24 dB/octave resonant lowpass filter

 FREQ: Sets filter cutoff. Higher values let more high frequencies pass through, for a brighter sound.  
 RES: Controls resonance, which is a gain increase at the point of the filter cutoff.  
 NORM/INV: Whether or not to invert the filter.  
 ENV: The extent to which the envelope is applied to the filter cutoff.  
 LFO: The extent to which the LFO is applied to the filter cutoff.  
 KBD: The extent to which the filter cutoff tracks the keyboard pitch.  

* HPF - High Pass Filter  
 24 dB/octave non-resonant highpass filter

 FREQ: Set the level higher to filter out more low-frequency content.

* VCA - Voltage Controlled Amplifier  
 Controls the overall volume level.

 ENV/GATE: In ENV mode, the volume will be shaped by the envelope. In GATE mode, notes will instantly turn on and off when keys are pressed and released. Note that in GATE mode, the ENV can still be applied to the filter cutoff.  
 LEVEL: Overall volume.

* ENV - Envelope  
 Envelope shared by both the amplifier and filter.
 
 A: Attack - how quickly the volume/filter rises to its maximum level when a note is triggered.  
 D: Decay - after reaching its maximum level, how quickly the volume/filter falls back down to the sustain level.  
 S: Sustain - the level at which the volume/filter maintains itself while a note is held.  
 R: Release - how long the volume/filter takes to fade out once a note is released.  

* CHORUS  
 A chorus effect.
 
 OFF: No effect.  
 I: Moderate chorus effect.  
 II: Stronger chorus effect.

**Technology**

Juno-106.js was written in Javascript using the [WebAudio API](http://webaudio.github.io/web-audio-api/) and [Backbone.Marionette](marionettejs.com). It also uses some effects from [tuna.js](https://github.com/Dinahmoe/tuna/blob/master/tuna.js), and [QWERTYHancock](https://github.com/stuartmemo/qwerty-hancock) for its keyboard.

**TO-DO**

* Tweak chorus
* Alternate PWM Implementation
* Filter self-resonance
* Deeper MIDI implementation

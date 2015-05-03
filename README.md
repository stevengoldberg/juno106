# juno106

An emulation of the classic [Roland Juno-106 analog synthesizer](http://en.wikipedia.org/wiki/Roland_Juno-106).

Current live WIP version:
http://stevegoldberg.neocities.org/#juno

Requires a minimum 1024x768 window and an updated browser (tested in Chrome only).

Active features:

* Play notes with the QWERTY keyboard -- QWERTY A = C3
* LFO rate
* LFO delay
* DCO range
* DCO modulation by LFO
* DCO sawtooth on/off
* DCO sub level
* VCF cutoff
* VCF res
* VCF modulation by ENV
* VCF modulation by LFO
* HPF level
* VCA level
* VCA ENV/GATE switch
* ADSR envelope
* Chorus effect

**TODO:**

1.0:

* Square/pulse wave
* Noise generator
* PWM manual/LFO
* Filter key tracking
* Filter invert
* Optimize for iPad
* Clean up
* WebMIDI
 
Post-1.0:

* Save/load presets
* Replace QwertyHancock?
* Arpeggiator/sequencer

For detailed instructions, consult the [Juno 106 owner's manual](http://www.synthfool.com/docs/Roland/Juno_Series/Roland_Juno_106/Roland_Juno106_Owners_Manual.pdf).

**QUICKSTART MANUAL**

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

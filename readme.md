1 : use accellerometer and GPS to approximate speed
2 : a drone
3 : Speed Morph Drone — sensor-driven master morph
4 : Speed → Choir Drone
5 : Drone Choir — 4 Voices
6 : Drone Choir — Compass
7 : Drone Choir — Nudge Compass
8 : "Shimmer in the Sand" — Micro‑Gliss Harmonic Web Synth
9 : "Shimmer in the Sand" — Micro‑Gliss Harmonic Web Synth
10 : Organic Deep String Drone


motion1 : learns your forward direction from GPS, then uses only the accelerometer to show instantaneous acceleration (big meter) and continuous accel/decel streaks (small bars).

riders1 : Group Glide — Single Note with Scale Crossfade

synth-rider : Drone synth driven by your acceleration. Connect, start, and ride.

m8-drone-control : 8-channel MIDI chord morph that crossfades between two scales.

Basic note logic (m8-drone-control):
- Each channel holds one note; at start it builds an 8-note chord by picking scale degrees from Scale A or Scale B based on the Blend slider.
- Root + octave set the pitch center; Spread biases notes toward higher octaves (0, +12, +24) for wider voicings.
- After Hold Time, the chord morphs in steps: a few channels change per step based on Density.
- Each change replaces the channel’s note with a new random degree from the blended scales; Note Length 0 sustains until the next change.





## motion1

always periodically getting 

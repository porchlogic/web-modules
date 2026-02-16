# ARCHITECTURE

## Modules

### motion

#### overview

#### inputs

#### outputs

### m8-drone-control

#### overview
Modular Web MIDI single-page app with section-specific JS modules and shared MIDI engine.

#### inputs
DOM elements in m8-drone-control/index.html, user interaction, Web MIDI API.

#### outputs
MIDI messages to the selected output device and UI state updates.

### drone4

#### overview
Single-page MIDI meanderer with two structured crossfading voices and an internal lush Web Audio drone layer that mirrors played notes.

#### inputs
DOM controls in `drone4.html`, Start/Stop interaction, slider values, and Web MIDI output selection.

#### outputs
MIDI note/CC messages to the selected hardware/software device plus local synthesized drone audio routed to the browser audio output.

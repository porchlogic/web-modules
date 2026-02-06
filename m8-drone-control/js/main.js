import { getRefs } from "./dom.js";
import { createEngine } from "./engine.js";
import { createState } from "./state.js";
import { createUi } from "./ui.js";
import { initMidiOutputSection } from "./sections/midi-output.js";
import { initOutputSection } from "./sections/output.js";
import { initScaleSection } from "./sections/scale.js";
import { initTracksSection } from "./sections/tracks.js";

const refs = getRefs();
const state = createState();
const ui = createUi(refs);

const tracksSection = initTracksSection({ state, refs });
const outputSection = initOutputSection({ state, refs });

const engine = createEngine(state, {
    renderTracks: tracksSection.renderTracks,
    updateNotePlanText: outputSection.updateNotePlanText,
});

initScaleSection({ state, refs, engine });
initMidiOutputSection({ state, refs, ui, engine });
outputSection.bind({ state, refs, ui, engine });

(function boot() {
    engine.computePlannedNotes();

    const supported = !!navigator.requestMIDIAccess;
    refs.supportNote.textContent = supported ? "Web MIDI supported" : "Web MIDI NOT supported";
    ui.setEnabledUI(false, false);
    outputSection.updateToggleLabel();

    for (let i = 0; i < 8; i += 1) {
        state.chState[i].baseNote = -1;
        state.chState[i].targetNote = -1;
    }
    tracksSection.renderTracks();

    if (!supported) {
        ui.setStatus(
            `<span class="bad">Web MIDI not supported.</span> Use Chrome/Edge, and run from https:// or localhost.`
        );
    } else {
        ui.setStatus(`<span class="bad">Not connected.</span> Click <strong>Connect MIDI</strong>.`);
    }
})();

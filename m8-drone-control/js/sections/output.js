import { midiToName, SCALES, SLIDE_MS } from "../state.js";

export function initOutputSection({ state, refs }) {
    function updateToggleLabel() {
        refs.toggleLabel.textContent = state.enabled ? "Output ON" : "Output OFF";
    }

    function updateNotePlanText() {
        const parts = state.plannedNotes.map((n, i) => `CH${i + 1}:${n >= 0 ? n : "—"}`);
        const scale = SCALES[state.scaleIndex] || SCALES[0];
        refs.notePlan.innerHTML =
            `<strong>Planned notes:</strong> ${parts.join("  •  ")} ` +
            `<span class="note-plan-meta">(${midiToName(state.rootMidi)} / ${scale.name})</span>`;
    }

    function bind({ engine, ui }) {
        refs.outputToggle.addEventListener("change", () => {
            const wantOn = refs.outputToggle.checked;

            if (wantOn) {
                if (!state.currentOutput) {
                    refs.outputToggle.checked = false;
                    state.enabled = false;
                    updateToggleLabel();
                    ui.setStatus(`<span class="bad">Select an output first.</span>`);
                    return;
                }

                state.enabled = true;
                updateToggleLabel();
                engine.startOutput();
                ui.setStatus(
                    `<span class="ok">Output ON.</span> Notes held on channels 1–8; pitch slides over ${Math.round(
                        SLIDE_MS / 1000
                    )}s on changes.`
                );
            } else {
                state.enabled = false;
                updateToggleLabel();
                engine.stopOutput();
                ui.setStatus(`<span class="ok">Output OFF.</span> Notes released.`);
            }
        });

        refs.btnResend.addEventListener("click", () => {
            if (!state.currentOutput) {
                ui.setStatus(`<span class="bad">No output selected.</span>`);
                return;
            }
            if (state.enabled) {
                engine.stopOutput();
                engine.startOutput();
                ui.setStatus(`<span class="ok">Resent notes.</span>`);
            } else {
                ui.setStatus(`<span class="ok">Ready.</span> Turn Output ON to send notes.`);
            }
        });
    }

    return {
        bind,
        updateNotePlanText,
        updateToggleLabel,
    };
}

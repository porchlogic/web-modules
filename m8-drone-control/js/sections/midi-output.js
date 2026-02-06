import { PB_RANGE_SEMIS } from "../state.js";

export function initMidiOutputSection({ state, refs, ui, engine }) {
    function refreshOutputList() {
        const prev = state.currentOutputId;

        refs.outSelect.innerHTML = "";
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "(select an output device)";
        refs.outSelect.appendChild(placeholder);

        if (!state.midiAccess) return;

        const outputs = Array.from(state.midiAccess.outputs.values());
        outputs.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        for (const out of outputs) {
            const opt = document.createElement("option");
            opt.value = out.id;
            opt.textContent = `${out.name || "Unnamed"}${out.manufacturer ? " — " + out.manufacturer : ""}`;
            refs.outSelect.appendChild(opt);
        }

        if (prev && outputs.some((out) => out.id === prev)) {
            refs.outSelect.value = prev;
            selectOutput(prev, { silent: true });
        } else {
            refs.outSelect.value = "";
            selectOutput("", { silent: true });
        }
    }

    function selectOutput(id, { silent = false } = {}) {
        let output = null;
        if (state.midiAccess && id) {
            output = state.midiAccess.outputs.get(id) || null;
        }

        engine.setOutput(output, id);
        ui.setEnabledUI(!!state.midiAccess, !!state.currentOutput);

        if (!silent) {
            if (state.currentOutput) {
                ui.setStatus(
                    `<span class="ok">Connected.</span> Output: <strong>${
                        state.currentOutput.name || "Unnamed"
                    }</strong> <span class="note-plan-meta">| PB range: ±${PB_RANGE_SEMIS} semis</span>`
                );
            } else if (state.midiAccess) {
                ui.setStatus(`<span class="bad">Connected, but no output selected.</span>`);
            }
        }
    }

    async function connectMIDI() {
        if (!navigator.requestMIDIAccess) {
            refs.supportNote.textContent = "Web MIDI not supported in this browser.";
            ui.setStatus(`<span class="bad">Web MIDI not supported.</span> Try Chrome or Edge.`);
            return;
        }

        try {
            state.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
            state.midiAccess.onstatechange = () => refreshOutputList();

            refreshOutputList();
            ui.setEnabledUI(true, !!state.currentOutput);

            ui.setStatus(`<span class="ok">Connected.</span> Select your M8 from the Output list.`);
        } catch (err) {
            ui.setStatus(`<span class="bad">Permission denied or unavailable.</span> ${String(err)}`);
        }
    }

    refs.btnConnect.addEventListener("click", async () => {
        await connectMIDI();
    });

    refs.outSelect.addEventListener("change", () => {
        selectOutput(refs.outSelect.value);
    });

    refs.btnPanic.addEventListener("click", () => {
        engine.panic();
        ui.setStatus(`<span class="ok">Panic sent.</span> All Notes Off / All Sound Off.`);
    });

    return {
        refreshOutputList,
        selectOutput,
    };
}

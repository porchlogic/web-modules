import { midiToName, SCALES } from "../state.js";

export function initScaleSection({ state, refs, engine }) {
    function populateRootSelect() {
        refs.rootSelect.innerHTML = "";
        for (let n = 24; n <= 96; n += 1) {
            const opt = document.createElement("option");
            opt.value = String(n);
            opt.textContent = `${midiToName(n)} (${n})`;
            refs.rootSelect.appendChild(opt);
        }
        refs.rootSelect.value = String(state.rootMidi);
    }

    function populateScaleSelect() {
        refs.scaleSelect.innerHTML = "";
        SCALES.forEach((scale, idx) => {
            const opt = document.createElement("option");
            opt.value = String(idx);
            opt.textContent = scale.name;
            refs.scaleSelect.appendChild(opt);
        });
        refs.scaleSelect.value = String(state.scaleIndex);
    }

    refs.rootSelect.addEventListener("change", () => {
        state.rootMidi = Number(refs.rootSelect.value || 60);
        engine.applyTargets();
    });

    refs.scaleSelect.addEventListener("change", () => {
        state.scaleIndex = Number(refs.scaleSelect.value || 0);
        engine.applyTargets();
    });

    populateRootSelect();
    populateScaleSelect();
}

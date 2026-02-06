import { buildScaleNotes, PB_RANGE_SEMIS, SCALES, SLIDE_MS } from "./state.js";

export function createEngine(state, { renderTracks, updateNotePlanText }) {
    function sendCC(ch1, cc, val) {
        if (!state.currentOutput) return;
        const ch0 = Math.max(0, Math.min(15, ch1 - 1));
        state.currentOutput.send([0xB0 + ch0, cc & 0x7F, val & 0x7F]);
    }

    function sendNoteOn(ch1, note, vel = 96) {
        if (!state.currentOutput) return;
        const ch0 = Math.max(0, Math.min(15, ch1 - 1));
        state.currentOutput.send([0x90 + ch0, note & 0x7F, vel & 0x7F]);
    }

    function sendNoteOff(ch1, note) {
        if (!state.currentOutput) return;
        const ch0 = Math.max(0, Math.min(15, ch1 - 1));
        state.currentOutput.send([0x80 + ch0, note & 0x7F, 0x00]);
    }

    function sendPitchBend14(ch1, value14) {
        if (!state.currentOutput) return;
        const v = Math.max(0, Math.min(16383, value14 | 0));
        const lsb = v & 0x7F;
        const msb = (v >> 7) & 0x7F;
        const ch0 = Math.max(0, Math.min(15, ch1 - 1));
        state.currentOutput.send([0xE0 + ch0, lsb, msb]);
    }

    function sendPitchBendSemis(ch1, semis) {
        const clamped = Math.max(-PB_RANGE_SEMIS, Math.min(PB_RANGE_SEMIS, semis));
        const v = Math.round(8192 + (clamped / PB_RANGE_SEMIS) * 8192);
        sendPitchBend14(ch1, v);
    }

    function sendPitchBendCenter(ch1) {
        sendPitchBend14(ch1, 8192);
    }

    function setPitchBendRangeRPN(ch1, semis) {
        sendCC(ch1, 101, 0);
        sendCC(ch1, 100, 0);
        sendCC(ch1, 6, Math.max(0, Math.min(127, semis | 0)));
        sendCC(ch1, 38, 0);
        sendCC(ch1, 101, 127);
        sendCC(ch1, 100, 127);
    }

    function sendAllNotesOff() {
        if (!state.currentOutput) return;
        for (let ch1 = 1; ch1 <= 16; ch1 += 1) {
            sendCC(ch1, 123, 0);
            sendCC(ch1, 120, 0);
            sendPitchBendCenter(ch1);
        }
    }

    function cancelSlide(i) {
        const st = state.chState[i];
        if (st.slideRaf) {
            cancelAnimationFrame(st.slideRaf);
            st.slideRaf = 0;
        }
    }

    function slideChannelToTarget(i, newTargetNote) {
        const st = state.chState[i];
        const ch1 = i + 1;

        if (!state.enabled || !state.currentOutput) return;
        if (st.baseNote < 0) return;

        const from = st.bendSemis;
        const to = newTargetNote - st.baseNote;

        st.targetNote = newTargetNote;
        renderTracks();

        cancelSlide(i);
        st.slideFrom = from;
        st.slideTo = to;
        st.slideStartT = performance.now();

        const tick = (t) => {
            if (!state.enabled || !state.currentOutput) {
                st.slideRaf = 0;
                return;
            }
            const u = Math.min(1, (t - st.slideStartT) / SLIDE_MS);
            const bend = st.slideFrom + (st.slideTo - st.slideFrom) * u;

            st.bendSemis = bend;
            sendPitchBendSemis(ch1, bend);

            if (u < 1) {
                st.slideRaf = requestAnimationFrame(tick);
            } else {
                st.slideRaf = 0;
            }
        };

        st.slideRaf = requestAnimationFrame(tick);
    }

    function computePlannedNotes() {
        const scale = SCALES[state.scaleIndex] || SCALES[0];
        const notes = buildScaleNotes(state.rootMidi, scale.offsets, 8);
        state.plannedNotes = notes.map((n) => Math.max(0, Math.min(127, n)));
        updateNotePlanText();
    }

    function applyTargets() {
        computePlannedNotes();

        for (let i = 0; i < 8; i += 1) {
            state.chState[i].targetNote = state.plannedNotes[i];
        }
        renderTracks();

        if (!state.enabled || !state.currentOutput) return;

        for (let i = 0; i < 8; i += 1) {
            slideChannelToTarget(i, state.plannedNotes[i]);
        }
    }

    function startOutput() {
        if (!state.currentOutput) return;

        computePlannedNotes();

        for (let ch1 = 1; ch1 <= 8; ch1 += 1) {
            setPitchBendRangeRPN(ch1, PB_RANGE_SEMIS);
            sendPitchBendCenter(ch1);
        }

        for (let i = 0; i < 8; i += 1) {
            cancelSlide(i);
            const ch1 = i + 1;
            const n = state.plannedNotes[i];

            state.chState[i].baseNote = n;
            state.chState[i].targetNote = n;
            state.chState[i].bendSemis = 0;

            sendPitchBendCenter(ch1);
            sendNoteOn(ch1, n, 96);
        }

        renderTracks();
    }

    function stopOutput() {
        for (let i = 0; i < 8; i += 1) {
            cancelSlide(i);
            const ch1 = i + 1;
            const st = state.chState[i];

            if (st.baseNote >= 0) {
                sendNoteOff(ch1, st.baseNote);
            }
            sendPitchBendCenter(ch1);

            st.baseNote = -1;
            st.targetNote = -1;
            st.bendSemis = 0;
        }

        sendAllNotesOff();
        renderTracks();
    }

    function panic() {
        for (let i = 0; i < 8; i += 1) {
            cancelSlide(i);
            state.chState[i].baseNote = -1;
            state.chState[i].targetNote = -1;
            state.chState[i].bendSemis = 0;
        }
        sendAllNotesOff();
        renderTracks();
    }

    function setOutput(output, outputId) {
        if (state.enabled && state.currentOutput) {
            stopOutput();
        }

        state.currentOutputId = outputId || "";
        state.currentOutput = output || null;

        if (state.enabled && state.currentOutput) {
            startOutput();
        }
    }

    return {
        applyTargets,
        computePlannedNotes,
        startOutput,
        stopOutput,
        panic,
        setOutput,
        sendAllNotesOff,
    };
}

export function initTracksSection({ state, refs }) {
    function renderTracks() {
        for (let i = 0; i < 8; i += 1) {
            const ch = i + 1;
            const card = refs.tracks.querySelector(`.track[data-ch="${ch}"]`);
            const noteEl = card.querySelector("[data-role=\"note\"]");

            const active = state.chState[i].baseNote >= 0;
            const shown = state.chState[i].targetNote;

            if (active) {
                card.classList.add("active");
                noteEl.classList.remove("empty");
                noteEl.textContent = shown >= 0 ? String(shown) : "—";
            } else {
                card.classList.remove("active");
                noteEl.classList.add("empty");
                noteEl.textContent = "—";
            }
        }
    }

    function initTracksUI() {
        refs.tracks.innerHTML = "";
        for (let ch = 1; ch <= 8; ch += 1) {
            const card = document.createElement("div");
            card.className = "track";
            card.dataset.ch = String(ch);

            const top = document.createElement("div");
            top.className = "ch";
            top.innerHTML = `<span>CH ${ch}</span><span class="dot" aria-hidden="true"></span>`;

            const note = document.createElement("div");
            note.className = "note empty";
            note.textContent = "—";
            note.dataset.role = "note";

            card.appendChild(top);
            card.appendChild(note);
            refs.tracks.appendChild(card);
        }
        renderTracks();
    }

    initTracksUI();

    return {
        renderTracks,
    };
}

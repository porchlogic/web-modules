export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const SCALES = [
    { name: "Major (Ionian)", offsets: [0, 2, 4, 5, 7, 9, 11] },
    { name: "Natural Minor (Aeolian)", offsets: [0, 2, 3, 5, 7, 8, 10] },
    { name: "Dorian", offsets: [0, 2, 3, 5, 7, 9, 10] },
    { name: "Phrygian", offsets: [0, 1, 3, 5, 7, 8, 10] },
    { name: "Lydian", offsets: [0, 2, 4, 6, 7, 9, 11] },
    { name: "Mixolydian", offsets: [0, 2, 4, 5, 7, 9, 10] },
    { name: "Locrian", offsets: [0, 1, 3, 5, 6, 8, 10] },
    { name: "Pentatonic Major", offsets: [0, 2, 4, 7, 9] },
    { name: "Pentatonic Minor", offsets: [0, 3, 5, 7, 10] },
];

export const SLIDE_MS = 3000;
export const PB_RANGE_SEMIS = 48;

export function midiToName(n) {
    const name = NOTE_NAMES[n % 12];
    const oct = Math.floor(n / 12) - 1;
    return `${name}${oct}`;
}

export function buildScaleNotes(rootMidi, offsets, count) {
    const m = offsets.length;
    const notes = [];
    for (let i = 0; i < count; i += 1) {
        const degree = i % m;
        const oct = Math.floor(i / m);
        notes.push(rootMidi + offsets[degree] + 12 * oct);
    }
    return notes;
}

export function createState() {
    return {
        midiAccess: null,
        currentOutput: null,
        currentOutputId: "",
        enabled: false,
        rootMidi: 60,
        scaleIndex: 0,
        plannedNotes: Array(8).fill(-1),
        chState: Array.from({ length: 8 }, () => ({
            baseNote: -1,
            targetNote: -1,
            bendSemis: 0,
            slideRaf: 0,
            slideFrom: 0,
            slideTo: 0,
            slideStartT: 0,
        })),
    };
}

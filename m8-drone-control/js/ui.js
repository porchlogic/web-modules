export function createUi(refs) {
    function setStatus(html) {
        refs.midiStatus.innerHTML = `<strong>Status:</strong> ${html}`;
    }

    function setEnabledUI(canUse, hasOutput) {
        refs.outSelect.disabled = !canUse;
        refs.rootSelect.disabled = !canUse;
        refs.scaleSelect.disabled = !canUse;
        refs.outputToggle.disabled = !canUse || !hasOutput;
        refs.btnPanic.disabled = !canUse || !hasOutput;
        refs.btnResend.disabled = !canUse || !hasOutput;
    }

    return {
        setStatus,
        setEnabledUI,
    };
}

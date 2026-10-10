/* Task 9: independent preview controls only. DO NOT mutate clock-card DOM yet.
   Future integration can listen to "worldclock:preview-time-change" on window.
   event.detail = { offsetMinutes, previewTimestamp, isLive }.
*/
(() => {
  const root = document.querySelector("#time-slider");
  if (!root) return;
  const slider = root.querySelector("#time-preview-offset");
  const output = root.querySelector("#time-preview-label");
  const timestamp = root.querySelector("#time-preview-date");
  const reset = root.querySelector("#time-preview-reset");
  const back = root.querySelector("#time-preview-back");
  const forward = root.querySelector("#time-preview-forward");
  const STEP = 30;
  const minutes = () => Number(slider.value);
  function render() {
    const offset = minutes();
    const sign = offset < 0 ? "−" : "+";
    const abs = Math.abs(offset);
    const hours = Math.floor(abs / 60);
    const rem = abs % 60;
    output.textContent = offset === 0 ? "Live / current time" : `${sign}${hours}h ${String(rem).padStart(2,"0")}m`;
    const preview = new Date(Date.now() + offset * 60_000);
    timestamp.textContent = new Intl.DateTimeFormat("en-GB", {dateStyle:"full",timeStyle:"short"}).format(preview);
    window.dispatchEvent(new CustomEvent("worldclock:preview-time-change", {
      detail: { offsetMinutes: offset, previewTimestamp: preview.getTime(), isLive: offset === 0 }
    }));
  }
  slider.addEventListener("input", render);
  reset.addEventListener("click", () => {slider.value = "0"; render(); slider.focus();});
  back.addEventListener("click", () => {slider.value = String(Math.max(Number(slider.min), minutes() - STEP)); render();});
  forward.addEventListener("click", () => {slider.value = String(Math.min(Number(slider.max), minutes() + STEP)); render();});
  render();
  // Keep the relative preview timestamp current when the slider is in live mode.
  setInterval(() => {if (minutes() === 0) render();}, 60_000);
})();
/* Connect Task 8 to the existing Task 9 preview without changing other tasks. */
(function () {
  let offsetMinutes = 0;
  function refresh() {
    if (!window.WorldClockAnalog) return;
    window.WorldClockAnalog.updateAll(new Date(Date.now() + offsetMinutes * 60000));
  }
  window.addEventListener("worldclock:preview-time-change", function (event) {
    const value = Number(event.detail && event.detail.offsetMinutes);
    if (Number.isFinite(value)) offsetMinutes = value;
    refresh();
  });
  const grid = document.getElementById("clock-grid");
  if (grid) {
    const observer = new MutationObserver(function (records) {
      if (records.some(record => record.type === "childList" && record.target === grid)) refresh();
    });
    observer.observe(grid, {childList:true});
  }
  refresh();
  setInterval(refresh, 1000);
})();

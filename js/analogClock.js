/* Task 8 — analog clock and local day/night display. Uses IANA timezones. */
(function () {
  const formatters = new Map();
  function parts(zone, instant) {
    if (!formatters.has(zone)) {
      formatters.set(zone, new Intl.DateTimeFormat("en-GB", {
        timeZone: zone, hour: "2-digit", minute: "2-digit", second: "2-digit",
        hourCycle: "h23"
      }));
    }
    const values = Object.fromEntries(formatters.get(zone).formatToParts(instant)
      .filter(part => ["hour", "minute", "second"].includes(part.type))
      .map(part => [part.type, Number(part.value)]));
    return values;
  }
  function create(card) {
    const face = document.createElement("div");
    face.className = "analog-clock";
    face.setAttribute("role", "img");
    face.setAttribute("aria-label", "Analog clock");
    face.innerHTML = '<span class="analog-marker analog-marker-12">12</span><span class="analog-marker analog-marker-3">3</span><span class="analog-marker analog-marker-6">6</span><span class="analog-marker analog-marker-9">9</span><span class="analog-hand analog-hour"></span><span class="analog-hand analog-minute"></span><span class="analog-hand analog-second"></span><span class="analog-center"></span>';
    const time = card.querySelector(".clock-time");
    if (time) time.before(face);
    else card.append(face);
    return face;
  }
  function update(card, instant) {
    if (!(instant instanceof Date) || Number.isNaN(instant.getTime())) return;
    const zone = card.dataset.zone;
    if (!zone) return;
    let values;
    try { values = parts(zone, instant); }
    catch (error) { console.warn("Analog clock: invalid timezone", zone, error); return; }
    const face = card.querySelector(".analog-clock") || create(card);
    const {hour, minute, second} = values;
    face.querySelector(".analog-hour").style.transform = `rotate(${(hour % 12 + minute / 60 + second / 3600) * 30}deg)`;
    face.querySelector(".analog-minute").style.transform = `rotate(${(minute + second / 60) * 6}deg)`;
    face.querySelector(".analog-second").style.transform = `rotate(${second * 6}deg)`;
    face.setAttribute("aria-label", `Analog time in ${zone}: ${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}:${String(second).padStart(2,"0")}`);
    const isDay = hour >= 6 && hour < 18;
    card.classList.toggle("analog-day", isDay);
    card.classList.toggle("analog-night", !isDay);
    const indicator = card.querySelector(".clock-daypart");
    if (indicator) {
      indicator.textContent = isDay ? "Daytime" : "Nighttime";
      indicator.classList.toggle("night", !isDay);
    }
  }
  window.WorldClockAnalog = {update, updateAll(instant) {
    document.querySelectorAll(".clock-card").forEach(card => update(card, instant));
  }};
})();

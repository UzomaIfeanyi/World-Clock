/* Task 10 — Meeting Planner UI. Does not change saved clocks or book meetings. */
import { createCityStore } from "./cityStore.js";
import { findMeetingSlots, localDateKey, nextBusinessDate } from "./meetingEngine.js";

const root = document.querySelector("#meeting-planner");
if (root) {
  const STORAGE_KEY = "worldclock:meeting-planner:v1";
  const MAX_SELECTION = 5;
  const elements = {
    date: root.querySelector("#planner-date"),
    dateHint: root.querySelector("#planner-date-hint"),
    duration: root.querySelector("#planner-duration"),
    start: root.querySelector("#planner-work-start"),
    end: root.querySelector("#planner-work-end"),
    options: root.querySelector("#planner-city-options"),
    count: root.querySelector("#planner-city-count"),
    status: root.querySelector("#planner-status"),
    results: root.querySelector("#planner-results")
  };
  let savedCities = createCityStore().getCities();
  let selected = [];
  const defaults = { duration: "60", start: "09:00", end: "17:00" };
  let settings = { ...defaults };
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    if (saved && typeof saved === "object" && !Array.isArray(saved)) {
      const ids = new Set(savedCities.map(city => city.id));
      if (Array.isArray(saved.selected)) {
        selected = [...new Set(saved.selected.filter(id => typeof id === "string" && ids.has(id)))].slice(0, MAX_SELECTION);
      }
      if (["30", "60", "90", "120"].includes(saved.duration)) settings.duration = saved.duration;
      if (/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(saved.start ?? "")) settings.start = saved.start;
      if (/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(saved.end ?? "")) settings.end = saved.end;
    }
  } catch (_) { /* Bad or blocked browser storage uses safe defaults. */ }
  if (selected.length < 2) selected = savedCities.slice(0, 3).map(city => city.id);
  elements.duration.value = settings.duration;
  elements.start.value = settings.start;
  elements.end.value = settings.end;
  function activeCities() {
    const byId = new Map(savedCities.map(city => [city.id, city]));
    return selected.map(id => byId.get(id)).filter(Boolean);
  }
  function refreshReferenceDate() {
    const first = activeCities()[0];
    if (first && !elements.date.value) elements.date.value = nextBusinessDate(localDateKey(first.zone));
    elements.dateHint.textContent = first
      ? "Date in " + first.city + " (" + first.zone + ")."
      : "Select at least two saved cities.";
  }
  function storeSettings() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        selected, duration: elements.duration.value,
        start: elements.start.value, end: elements.end.value
      }));
    } catch (_) { /* Preferences still work for the current visit. */ }
  }
  function minuteValue(value) {
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return NaN;
    const pieces = value.split(":").map(Number);
    return pieces[0] * 60 + pieces[1];
  }
  const formatTime = (zone, instant) => new Intl.DateTimeFormat(
    document.querySelector("#clock-format-12")?.getAttribute("aria-pressed") === "true" ? "en-US" : "en-GB", {
      timeZone: zone, hour: "2-digit", minute: "2-digit",
      hourCycle: document.querySelector("#clock-format-12")?.getAttribute("aria-pressed") === "true" ? "h12" : "h23"
    }).format(instant);
  const formatDate = (zone, instant) => new Intl.DateTimeFormat(
    document.documentElement.dataset.dateFormat === "mdy" ? "en-US" : "en-GB", {
      timeZone: zone, month: "short", day: "numeric", weekday: "short"
    }).format(instant);
  function renderCityOptions() {
    const fragment = document.createDocumentFragment();
    if (!savedCities.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No saved cities. Add cities to your dashboard first.";
      fragment.append(empty);
    }
    for (const city of savedCities) {
      const label = document.createElement("label");
      label.className = "planner-city-choice";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = city.id;
      checkbox.checked = selected.includes(city.id);
      checkbox.disabled = !checkbox.checked && selected.length >= MAX_SELECTION;
      const name = document.createElement("span");
      name.textContent = city.city + " · " + city.country;
      const zone = document.createElement("small");
      zone.textContent = city.zone;
      label.append(checkbox, name, zone);
      fragment.append(label);
    }
    elements.options.replaceChildren(fragment);
    elements.count.textContent = selected.length + " of " + MAX_SELECTION + " selected";
  }
  function renderResults() {
    const cities = activeCities();
    elements.results.replaceChildren();
    refreshReferenceDate();
    if (cities.length < 2) {
      elements.status.textContent = "Choose at least two saved cities.";
      return;
    }
    const start = minuteValue(elements.start.value);
    const end = minuteValue(elements.end.value);
    const duration = Number(elements.duration.value);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end || duration > end - start) {
      elements.status.textContent = "Choose a valid workday long enough for the meeting.";
      return;
    }
    if (!elements.date.value) {
      elements.status.textContent = "Choose a meeting date.";
      return;
    }
    let slots;
    try {
      slots = findMeetingSlots({
        date: elements.date.value, cities, startMinutes: start, endMinutes: end,
        durationMinutes: duration
      });
    } catch (_) {
      elements.status.textContent = "Please choose a valid date, city selection and workday.";
      return;
    }
    if (!slots.length) {
      elements.status.textContent = "No shared working-hour slots for this date. Try another date, fewer cities, shorter meetings or wider work hours.";
      return;
    }
    elements.status.textContent = slots.length + (slots.length === 1 ? " suitable start time" : " suitable start times") + " shown.";
    const fragment = document.createDocumentFragment();
    for (const slot of slots) {
      const card = document.createElement("article");
      card.className = "planner-slot";
      const heading = document.createElement("h4");
      heading.textContent = "Starts " + formatTime(cities[0].zone, new Date(slot.startsAt)) + " in " + cities[0].city;
      const details = document.createElement("div");
      details.className = "planner-slot-times";
      for (const city of cities) {
        const row = document.createElement("div");
        row.className = "planner-local-time";
        const name = document.createElement("strong");
        name.textContent = city.city;
        const value = document.createElement("span");
        const instant = new Date(slot.startsAt);
        const endInstant = new Date(slot.endsAt);
        value.textContent = formatTime(city.zone, instant) + "–" + formatTime(city.zone, endInstant) +
          " · " + formatDate(city.zone, instant);
        row.append(name, value);
        details.append(row);
      }
      card.append(heading, details);
      fragment.append(card);
    }
    elements.results.replaceChildren(fragment);
  }
  function refreshAll() {
    refreshReferenceDate();
    renderCityOptions();
    renderResults();
  }
  elements.options.addEventListener("change", event => {
    const checkbox = event.target.closest('input[type="checkbox"]');
    if (!checkbox) return;
    if (checkbox.checked && selected.length < MAX_SELECTION && !selected.includes(checkbox.value)) {
      selected.push(checkbox.value);
    } else if (!checkbox.checked) {
      selected = selected.filter(id => id !== checkbox.value);
    }
    // The first selected city establishes the local calendar date.
    elements.date.value = "";
    storeSettings();
    refreshAll();
  });
  for (const input of [elements.date, elements.duration, elements.start, elements.end]) {
    input.addEventListener("change", () => { storeSettings(); renderResults(); });
    if (input.type === "time") input.addEventListener("input", renderResults);
  }
  window.addEventListener("worldclock:cities-change", event => {
    savedCities = Array.isArray(event.detail?.cities) ? event.detail.cities : createCityStore().getCities();
    const valid = new Set(savedCities.map(city => city.id));
    selected = selected.filter(id => valid.has(id));
    if (selected.length < 2) {
      for (const city of savedCities) {
        if (selected.length >= Math.min(3, savedCities.length)) break;
        if (!selected.includes(city.id)) selected.push(city.id);
      }
    }
    elements.date.value = "";
    storeSettings();
    refreshAll();
  });
  window.addEventListener("worldclock:preferences-change", renderResults);
  document.querySelectorAll("#clock-format-12,#clock-format-24").forEach(button =>
    button.addEventListener("click", () => setTimeout(renderResults, 0)));
  refreshAll();
}

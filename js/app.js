import { getTimeForZone, getDateForZone } from "./timezoneEngine.js";
import { createDigitalClockController } from "./digitalClock.js";
import { CITY_BY_ID, MAX_CITIES, findCities } from "./cityCatalog.js";
import { createCityStore } from "./cityStore.js";

const cityStore = createCityStore();
const grid = document.querySelector("#clock-grid");
const search = document.querySelector("#city-search");
const summary = document.querySelector("#city-summary");
const sidebar = document.querySelector("#sidebar");
const backdrop = document.querySelector("#sidebar-backdrop");
const menuButton = document.querySelector("#menu-button");
const navLinks = [...document.querySelectorAll(".nav-link")];
const clock24Button = document.querySelector("#clock-format-24");
const clock12Button = document.querySelector("#clock-format-12");
const addButton = document.querySelector("#add-clock");
const dialog = document.querySelector("#add-city-dialog");
const pickerSearch = document.querySelector("#add-city-search");
const pickerOptions = document.querySelector("#city-options");
const pickerCount = document.querySelector("#city-limit");
const pickerFeedback = document.querySelector("#city-feedback");
const pickerClose = document.querySelector("#add-city-close");
let digitalClock;

function timeFor(zone) { return getTimeForZone(zone, digitalClock.getInstant(), digitalClock.getHour12()); }
function dateFor(zone) { return getDateForZone(zone, digitalClock.getInstant()); }
function visibleCities() {
  const query = search.value.trim().toLocaleLowerCase("en");
  return cityStore.getCities().filter(city =>
    [city.city, city.country, city.zone].some(value => value.toLocaleLowerCase("en").includes(query)));
}
function renderClocks() {
  const instant = digitalClock.getInstant();
  renderWorldClockCards(grid, visibleCities(), timeFor, dateFor, instant);
  window.WorldClockAnalog.updateAll(instant);
  summary.textContent = `${cityStore.getCount()} / ${MAX_CITIES} cities saved`;
}
function updateTimes(instant, hour12) {
  grid.querySelectorAll(".clock-card").forEach(card => {
    const zone = card.dataset.zone;
    const time = card.querySelector(".clock-time");
    const date = card.querySelector(".clock-date");
    const part = card.querySelector(".clock-daypart");
    time.textContent = getTimeForZone(zone, instant, hour12);
    time.dateTime = instant.toISOString();
    date.textContent = getDateForZone(zone, instant);
    const daypart = clockDaypart(zone, instant);
    part.textContent = daypart;
    part.classList.toggle("night", daypart === "Nighttime");
  });
  window.WorldClockAnalog.updateAll(instant);
  document.querySelector("#local-date").textContent =
    new Intl.DateTimeFormat("en-GB", { dateStyle: "full" }).format(instant);
}
function syncFormatButtons() {
  clock12Button.setAttribute("aria-pressed", String(digitalClock.getHour12()));
  clock24Button.setAttribute("aria-pressed", String(!digitalClock.getHour12()));
}
digitalClock = createDigitalClockController({ render: updateTimes });
clock12Button.addEventListener("click", () => { digitalClock.setHour12(true); syncFormatButtons(); });
clock24Button.addEventListener("click", () => { digitalClock.setHour12(false); syncFormatButtons(); });
syncFormatButtons();

function closeSidebar(restoreFocus = false) {
  sidebar.classList.remove("open");
  backdrop.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  if (restoreFocus) menuButton.focus();
}
function toggleSidebar() {
  const opening = !sidebar.classList.contains("open");
  sidebar.classList.toggle("open", opening);
  backdrop.classList.toggle("open", opening);
  menuButton.setAttribute("aria-expanded", String(opening));
}
function setActiveLink(link) {
  navLinks.forEach(item => item.classList.toggle("active", item === link));
  closeSidebar();
}

search.addEventListener("input", renderClocks);
menuButton.addEventListener("click", toggleSidebar);
backdrop.addEventListener("click", () => closeSidebar());
navLinks.forEach(link => link.addEventListener("click", () => setActiveLink(link)));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && sidebar.classList.contains("open")) closeSidebar(true);
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 720 && sidebar.classList.contains("open")) closeSidebar();
});

function notifyCityChange() {
  // Other modules can react to saved-city additions without sharing mutable state.
  window.dispatchEvent(new CustomEvent("worldclock:cities-change", {
    detail: { cities: cityStore.getCities() }
  }));
}

function renderCityPicker() {
  const count = cityStore.getCount();
  pickerCount.textContent = `${count} of ${MAX_CITIES} clocks selected`;
  const matches = findCities(pickerSearch.value);
  const candidates = matches.slice(0, 60);
  const fragment = document.createDocumentFragment();
  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "muted city-picker-empty";
    empty.textContent = "No matching location. Try a different city, country or IANA timezone.";
    fragment.append(empty);
  }
  for (const city of candidates) {
    const option = document.createElement("div");
    option.className = "city-option";
    const flag = document.createElement("span");
    flag.className = "city-option-flag";
    flag.textContent = city.flag;
    flag.setAttribute("aria-hidden", "true");
    const copy = document.createElement("div");
    copy.className = "city-option-copy";
    const name = document.createElement("strong");
    name.textContent = city.city;
    const info = document.createElement("span");
    info.textContent = `${city.country} · ${city.zone}`;
    copy.append(name, info);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "city-option-add";
    button.dataset.addCityId = city.id;
    const isAdded = cityStore.has(city.id);
    button.disabled = isAdded || count >= MAX_CITIES;
    button.textContent = isAdded ? "Added" : count >= MAX_CITIES ? "Limit reached" : "Add";
    button.setAttribute("aria-label", `${isAdded ? "Already added" : "Add"} ${city.city}, ${city.country}`);
    option.append(flag, copy, button);
    fragment.append(option);
  }
  if (matches.length > candidates.length) {
    const note = document.createElement("p");
    note.className = "muted city-picker-empty";
    note.textContent = "Showing the first 60 matches. Type more letters to narrow your search.";
    fragment.append(note);
  }
  pickerOptions.replaceChildren(fragment);
  if (count >= MAX_CITIES) {
    pickerFeedback.textContent = "Your dashboard has reached its 100-city limit. Remove a clock to make room.";
  }
}

addButton.addEventListener("click", () => {
  pickerSearch.value = "";
  pickerFeedback.textContent = "";
  renderCityPicker();
  dialog.showModal();
  pickerSearch.focus();
});
pickerClose.addEventListener("click", () => dialog.close());
pickerSearch.addEventListener("input", () => {
  pickerFeedback.textContent = "";
  renderCityPicker();
});
pickerOptions.addEventListener("click", event => {
  const button = event.target.closest("button[data-add-city-id]");
  if (!button || button.disabled) return;
  const city = CITY_BY_ID.get(button.dataset.addCityId);
  const outcome = cityStore.add(button.dataset.addCityId);
  if (outcome === "added") {
    // A dashboard filter should not conceal the city a person just added.
    search.value = "";
    renderClocks();
    notifyCityChange();
    pickerFeedback.textContent = `${city.city} added to your dashboard.`;
  } else {
    pickerFeedback.textContent = outcome === "limit" ? "100-city limit reached." : "This city is already in your dashboard.";
  }
  renderCityPicker();
  pickerSearch.focus();
});
grid.addEventListener("click", event => {
  const button = event.target.closest("button[data-remove-city]");
  if (!button) return;
  const removed = cityStore.remove(button.dataset.removeCity);
  if (!removed) return;
  renderClocks();
  notifyCityChange();
});
dialog.addEventListener("click", event => {
  if (event.target !== dialog) return;
  // Native dialog backdrops dispatch clicks with the dialog as their target.
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});

window.addEventListener("worldclock:preview-time-change", event => {
  const value = Number(event.detail?.offsetMinutes);
  if (Number.isFinite(value)) digitalClock.setPreviewOffset(value);
});

renderClocks();
digitalClock.start();

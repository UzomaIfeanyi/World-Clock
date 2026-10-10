import { getZonedDateTime } from "./timezoneEngine.js";

const clocks = [
  { city:"Lagos", zone:"Africa/Lagos", label:"WAT" },
  { city:"London", zone:"Europe/London", label:"UK" },
  { city:"New York", zone:"America/New_York", label:"ET" },
  { city:"Tokyo", zone:"Asia/Tokyo", label:"JST" },
  { city:"Dubai", zone:"Asia/Dubai", label:"GST" },
  { city:"Sydney", zone:"Australia/Sydney", label:"AET" }
];
const grid = document.querySelector("#clock-grid");
const search = document.querySelector("#city-search");
const sidebar = document.querySelector("#sidebar");
const menuButton = document.querySelector("#menu-button");
const navLinks = [...document.querySelectorAll(".nav-link")];
let offsetMinutes = 0;
let hour12 = false;

function instantForPreview() {
  return new Date(Date.now() + offsetMinutes * 60_000);
}
function renderClocks() {
  const query = search.value.trim().toLowerCase();
  const visible = clocks.filter(clock => clock.city.toLowerCase().includes(query));
  const instant = instantForPreview();
  if (!visible.length) {
    grid.innerHTML = '<p class="empty-state">No city in the starter list matches your search.</p>';
  } else {
    // City names and zones are fixed trusted values; dynamic values use textContent.
    grid.replaceChildren();
    for (const clock of visible) {
      const article = document.createElement("article");
      article.className = "clock-card";
      article.dataset.zone = clock.zone;
      const city = document.createElement("div");
      city.className = "clock-city";
      const heading = document.createElement("h3");
      heading.textContent = clock.city;
      const label = document.createElement("span");
      label.className = "clock-zone";
      label.textContent = clock.label;
      city.append(heading, label);
      const time = document.createElement("div");
      time.className = "clock-time";
      const date = document.createElement("div");
      date.className = "clock-date";
      article.append(city, time, date);
      grid.append(article);
    }
    updateClockCards(instant);
  }
  updateLocalDate(instant);
}
function updateClockCards(instant) {
  grid.querySelectorAll(".clock-card").forEach(card => {
    try {
      const formatted = getZonedDateTime(card.dataset.zone, instant, hour12);
      card.querySelector(".clock-time").textContent = formatted.time;
      card.querySelector(".clock-date").textContent = formatted.date;
    } catch (error) {
      card.querySelector(".clock-time").textContent = "Time unavailable";
      card.querySelector(".clock-date").textContent = "Check timezone";
      console.error("Timezone formatting failed:", card.dataset.zone, error);
    }
  });
}
function updateLocalDate(instant) {
  const target = document.querySelector("#local-date");
  if (target) target.textContent = new Intl.DateTimeFormat("en-GB", { dateStyle:"full" }).format(instant);
}
function updateTimes() {
  const instant = instantForPreview();
  updateClockCards(instant);
  updateLocalDate(instant);
}
function setActiveLink(link) {
  navLinks.forEach(item => item.classList.toggle("active", item === link));
  if (window.innerWidth <= 720) {
    sidebar.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }
}
search.addEventListener("input", renderClocks);
menuButton.addEventListener("click", () => {
  const open = sidebar.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
navLinks.forEach(link => link.addEventListener("click", () => setActiveLink(link)));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.focus();
  }
});
document.querySelector("#add-clock").addEventListener("click", () => {
  alert("Add City is reserved for the teammate building city and time-zone selection.");
});
window.addEventListener("worldclock:preview-time-change", event => {
  const next = Number(event.detail?.offsetMinutes);
  if (!Number.isFinite(next)) return;
  offsetMinutes = next;
  updateTimes();
});
renderClocks();
setInterval(updateTimes, 1000);

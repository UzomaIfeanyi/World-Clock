/* City cards keep the established Task 3 layout, with discreet national flags. */
function clockHour(zone, instant = new Date()) {
  return Number(new Intl.DateTimeFormat("en-GB", {
    timeZone: zone, hour: "2-digit", hourCycle: "h23"
  }).format(instant));
}
function clockDaypart(zone, instant = new Date()) {
  const hour = clockHour(zone, instant);
  return hour >= 6 && hour < 18 ? "Daytime" : "Nighttime";
}
function renderWorldClockCards(grid, cities, formatTime, formatDate, instant = new Date()) {
  if (!grid) return;
  if (!cities.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No cities match your search. Add a city or clear your search.";
    grid.replaceChildren(empty);
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const clock of cities) {
    const card = document.createElement("article");
    card.className = "clock-card";
    card.dataset.zone = clock.zone;
    card.dataset.cityId = clock.id;

    const header = document.createElement("div");
    header.className = "clock-card-header";
    const location = document.createElement("div");
    location.className = "clock-location";
    const heading = document.createElement("h3");
    heading.textContent = clock.city;
    const country = document.createElement("p");
    country.className = "clock-country";
    country.textContent = clock.country;
    location.append(heading, country);

    const controls = document.createElement("div");
    controls.className = "clock-card-meta";
    const flag = document.createElement("span");
    flag.className = "clock-flag";
    flag.textContent = clock.flag;
    flag.setAttribute("role", "img");
    flag.setAttribute("aria-label", clock.code ? `Flag of ${clock.country}` : "Time zone location");
    const zone = document.createElement("span");
    zone.className = "clock-zone";
    zone.textContent = clock.label;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "clock-remove";
    remove.dataset.removeCity = clock.id;
    remove.textContent = "×";
    remove.title = `Remove ${clock.city}`;
    remove.setAttribute("aria-label", `Remove ${clock.city}`);
    controls.append(flag, zone, remove);
    header.append(location, controls);

    const time = document.createElement("time");
    time.className = "clock-time";
    time.textContent = formatTime(clock.zone);
    time.dateTime = instant.toISOString();

    const footer = document.createElement("div");
    footer.className = "clock-card-footer";
    const date = document.createElement("span");
    date.className = "clock-date";
    date.textContent = formatDate(clock.zone);
    const part = document.createElement("span");
    part.className = "clock-daypart";
    const daypart = clockDaypart(clock.zone, instant);
    part.textContent = daypart;
    part.classList.toggle("night", daypart === "Nighttime");
    footer.append(date, part);
    card.append(header, time, footer);
    fragment.append(card);
  }
  grid.replaceChildren(fragment);
}

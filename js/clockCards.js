/* Task 3 — World Clock Cards. Integrates with the existing clock engine. */
const WORLD_CLOCK_CITIES=[
  {city:"Lagos",country:"Nigeria",zone:"Africa/Lagos",label:"WAT"},
  {city:"London",country:"United Kingdom",zone:"Europe/London",label:"UK"},
  {city:"New York",country:"United States",zone:"America/New_York",label:"ET"},
  {city:"Tokyo",country:"Japan",zone:"Asia/Tokyo",label:"JST"},
  {city:"Dubai",country:"United Arab Emirates",zone:"Asia/Dubai",label:"GST"},
  {city:"Sydney",country:"Australia",zone:"Australia/Sydney",label:"AET"}
];
function clockHour(zone,instant=new Date()){
  return Number(new Intl.DateTimeFormat("en-GB",{timeZone:zone,hour:"2-digit",hourCycle:"h23"}).format(instant));
}
function clockDaypart(zone,instant=new Date()){
  const hour=clockHour(zone,instant);
  return hour>=6&&hour<18?"Daytime":"Nighttime";
}
function renderWorldClockCards(grid,cities,formatTime,formatDate,instant=new Date()){
  if(!grid)return;
  if(!cities.length){
    grid.innerHTML='<p class="empty-state">No cities match your search.</p>';
    return;
  }
  const fragment=document.createDocumentFragment();
  for(const clock of cities){
    const card=document.createElement("article");
    card.className="clock-card";
    card.dataset.zone=clock.zone;
    const header=document.createElement("div");header.className="clock-card-header";
    const location=document.createElement("div");location.className="clock-location";
    const heading=document.createElement("h3");heading.textContent=clock.city;
    const country=document.createElement("p");country.className="clock-country";country.textContent=clock.country;
    location.append(heading,country);
    const zone=document.createElement("span");zone.className="clock-zone";zone.textContent=clock.label;
    header.append(location,zone);
    const time=document.createElement("time");time.className="clock-time";time.textContent=formatTime(clock.zone);
    const footer=document.createElement("div");footer.className="clock-card-footer";
    const date=document.createElement("span");date.className="clock-date";date.textContent=formatDate(clock.zone);
    const part=document.createElement("span");part.className="clock-daypart";
    const daypart=clockDaypart(clock.zone,instant);
    part.textContent=daypart;part.classList.toggle("night",daypart==="Nighttime");
    footer.append(date,part);card.append(header,time,footer);fragment.append(card);
  }
  grid.replaceChildren(fragment);
}

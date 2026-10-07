import {
  getTimeForZone,
  getDateForZone
} from "./timezoneEngine.js";

const clocks=[{city:"Lagos",zone:"Africa/Lagos",label:"WAT"},{city:"London",zone:"Europe/London",label:"UK"},{city:"New York",zone:"America/New_York",label:"ET"},{city:"Tokyo",zone:"Asia/Tokyo",label:"JST"},{city:"Dubai",zone:"Asia/Dubai",label:"GST"},{city:"Sydney",zone:"Australia/Sydney",label:"AET"}];

const grid=document.querySelector("#clock-grid");
const search=document.querySelector("#city-search");
const sidebar=document.querySelector("#sidebar");
const menuButton=document.querySelector("#menu-button");
const navLinks=[...document.querySelectorAll(".nav-link")];

function timeFor(zone) {
  return getTimeForZone(zone);
}
function dateFor(zone){return getDateForZone(zone)}

function renderClocks(filter=""){
  const query=filter.trim().toLowerCase();
  const visible=clocks.filter(clock=>clock.city.toLowerCase().includes(query));
  if(!visible.length){grid.innerHTML='<p class="empty-state">No city in the starter list matches your search.</p>';return}
  grid.innerHTML=visible.map(clock=>`<article class="clock-card" data-zone="${clock.zone}"><div class="clock-city"><h3>${clock.city}</h3><span class="clock-zone">${clock.label}</span></div><div class="clock-time">${timeFor(clock.zone)}</div><div class="clock-date">${dateFor(clock.zone)}</div></article>`).join("");
}

function updateTimes(){
  document.querySelectorAll(".clock-card").forEach(card=>{const zone=card.dataset.zone;card.querySelector(".clock-time").textContent=timeFor(zone);card.querySelector(".clock-date").textContent=dateFor(zone)});
  document.querySelector("#local-date").textContent=new Intl.DateTimeFormat("en-GB",{dateStyle:"full"}).format(new Date());
}

function setActiveLink(link){
  navLinks.forEach(item=>item.classList.toggle("active",item===link));
  if(window.innerWidth<=720){sidebar.classList.remove("open");menuButton.setAttribute("aria-expanded","false")}
}

search.addEventListener("input",event=>renderClocks(event.target.value));
menuButton.addEventListener("click",()=>{const open=sidebar.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open))});
navLinks.forEach(link=>link.addEventListener("click",()=>setActiveLink(link)));
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&sidebar.classList.contains("open")){sidebar.classList.remove("open");menuButton.setAttribute("aria-expanded","false");menuButton.focus()}});
document.querySelector("#add-clock").addEventListener("click",()=>{alert("Add City is reserved for the teammate building city and time-zone selection.")});

renderClocks();
updateTimes();
setInterval(updateTimes,1000);
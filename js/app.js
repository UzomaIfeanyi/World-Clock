import {getTimeForZone,getDateForZone} from "./timezoneEngine.js";
import {createDigitalClockController} from "./digitalClock.js";
const clocks=WORLD_CLOCK_CITIES;

const grid=document.querySelector("#clock-grid");
const search=document.querySelector("#city-search");
const sidebar=document.querySelector("#sidebar");
const menuButton=document.querySelector("#menu-button");
const navLinks=[...document.querySelectorAll(".nav-link")];
const clock24Button=document.querySelector("#clock-format-24");
const clock12Button=document.querySelector("#clock-format-12");
let digitalClock;
function timeFor(zone){return getTimeForZone(zone,digitalClock.getInstant(),digitalClock.getHour12())}
function dateFor(zone){return getDateForZone(zone,digitalClock.getInstant())}
function renderClocks(filter=""){
  const query=filter.trim().toLocaleLowerCase();
  const visible=clocks.filter(clock=>clock.city.toLocaleLowerCase().includes(query)||clock.country.toLocaleLowerCase().includes(query));
  renderWorldClockCards(grid,visible,timeFor,dateFor,digitalClock.getInstant());
  window.WorldClockAnalog.updateAll(digitalClock.getInstant());
}
function updateTimes(instant,hour12){
  document.querySelectorAll(".clock-card").forEach(card=>{
    const zone=card.dataset.zone;
    const time=card.querySelector(".clock-time");
    const date=card.querySelector(".clock-date");
    const part=card.querySelector(".clock-daypart");
    time.textContent=getTimeForZone(zone,instant,hour12);
    date.textContent=getDateForZone(zone,instant);
    const daypart=clockDaypart(zone,instant);
    if(part){part.textContent=daypart;part.classList.toggle("night",daypart==="Nighttime")}
    time.dateTime=instant.toISOString();
  });
  window.WorldClockAnalog.updateAll(instant);
  document.querySelector("#local-date").textContent=new Intl.DateTimeFormat("en-GB",{dateStyle:"full"}).format(instant);
}
function syncFormatButtons(){
  clock12Button.setAttribute("aria-pressed",String(digitalClock.getHour12()));
  clock24Button.setAttribute("aria-pressed",String(!digitalClock.getHour12()));
}
digitalClock=createDigitalClockController({render:updateTimes});
clock12Button.addEventListener("click",()=>{digitalClock.setHour12(true);syncFormatButtons()});
clock24Button.addEventListener("click",()=>{digitalClock.setHour12(false);syncFormatButtons()});
syncFormatButtons();

function setActiveLink(link){
  navLinks.forEach(item=>item.classList.toggle("active",item===link));
  if(window.innerWidth<=720){sidebar.classList.remove("open");menuButton.setAttribute("aria-expanded","false")}
}

search.addEventListener("input",event=>renderClocks(event.target.value));
menuButton.addEventListener("click",()=>{const open=sidebar.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open))});
navLinks.forEach(link=>link.addEventListener("click",()=>setActiveLink(link)));
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&sidebar.classList.contains("open")){sidebar.classList.remove("open");menuButton.setAttribute("aria-expanded","false");menuButton.focus()}});
document.querySelector("#add-clock").addEventListener("click",()=>{alert("Add City is reserved for the teammate building city and time-zone selection.")});

window.addEventListener("worldclock:preview-time-change",event=>{const value=Number(event.detail?.offsetMinutes);if(Number.isFinite(value)){digitalClock.setPreviewOffset(value)}});

renderClocks();
digitalClock.start();
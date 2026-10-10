const clocks=WORLD_CLOCK_CITIES;

const grid=document.querySelector("#clock-grid");
const search=document.querySelector("#city-search");
const sidebar=document.querySelector("#sidebar");
const menuButton=document.querySelector("#menu-button");
const navLinks=[...document.querySelectorAll(".nav-link")];

function timeFor(zone){return new Intl.DateTimeFormat("en-GB",{timeZone:zone,hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date())}
function dateFor(zone){return new Intl.DateTimeFormat("en-GB",{timeZone:zone,weekday:"short",day:"numeric",month:"short"}).format(new Date())}

function renderClocks(filter=""){
  const query=filter.trim().toLocaleLowerCase();
  const visible=clocks.filter(clock=>clock.city.toLocaleLowerCase().includes(query)||clock.country.toLocaleLowerCase().includes(query));
  renderWorldClockCards(grid,visible,timeFor,dateFor);
}

function updateTimes(){
  document.querySelectorAll(".clock-card").forEach(card=>{const zone=card.dataset.zone;card.querySelector(".clock-time").textContent=timeFor(zone);card.querySelector(".clock-date").textContent=dateFor(zone);const part=card.querySelector(".clock-daypart");if(part){const label=clockDaypart(zone);part.textContent=label;part.classList.toggle("night",label==="Nighttime")}});
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
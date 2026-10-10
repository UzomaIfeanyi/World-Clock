/* Task 7 — Digital Clock Logic: time format preference and live clock controller.
   Uses the shared timezone engine; no independent timezone offsets are calculated. */
export function createDigitalClockController({render,storage=window.localStorage}){
  const KEY="worldclock:hour-format";
  let hour12=false;
  try{hour12=storage.getItem(KEY)==="12"}catch(_error){/* private browsing can block storage */}
  let previewOffsetMinutes=0;
  let timer=null;
  const getInstant=()=>new Date(Date.now()+previewOffsetMinutes*60_000);
  const getHour12=()=>hour12;
  function refresh(){render(getInstant(),hour12)}
  function setHour12(value){
    hour12=Boolean(value);
    try{storage.setItem(KEY,hour12?"12":"24")}catch(_error){/* preference remains in memory */}
    refresh();
  }
  function setPreviewOffset(value){
    const offset=Number(value);
    if(!Number.isFinite(offset))return;
    previewOffsetMinutes=offset;
    refresh();
  }
  function start(){
    if(timer!==null)return;
    refresh();
    // Align the first update with the next second, then continue at 1-second intervals.
    const tick=()=>{refresh();timer=window.setTimeout(tick,Math.max(50,1000-Date.now()%1000))};
    timer=window.setTimeout(tick,Math.max(50,1000-Date.now()%1000));
  }
  function stop(){if(timer!==null){window.clearTimeout(timer);timer=null}}
  return{getInstant,getHour12,refresh,setHour12,setPreviewOffset,start,stop};
}

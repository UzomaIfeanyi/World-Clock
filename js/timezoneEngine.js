// Shared timezone formatting engine. Dates are absolute instants, not local wall-clock strings.
function requireValidDate(date) {
  const instant = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(instant.getTime())) throw new RangeError("Invalid date or timestamp");
  return instant;
}
const formatterCache = new Map();
function formatter(zone, options, locale = "en-GB") {
  // Reuse validated Intl instances instead of constructing hundreds per second
  // when a dashboard has many clocks. The IANA rules still handle DST.
  const key = locale + ":" + zone + ":" + JSON.stringify(options);
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.DateTimeFormat(locale, { timeZone: zone, ...options }));
  }
  return formatterCache.get(key);
}
export function getTimeForZone(zone, date = new Date(), hour12 = false) {
  return formatter(zone, {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: hour12 ? "h12" : "h23"
  }).format(requireValidDate(date));
}
export function getDateForZone(zone, date = new Date(), dateFormat = "dmy") {
  return formatter(zone, {
    weekday: "short", day: "numeric", month: "short", year: "numeric"
  }, dateFormat === "mdy" ? "en-US" : "en-GB").format(requireValidDate(date));
}
export function getZonedDateTime(zone, date = new Date(), hour12 = false) {
  const instant = requireValidDate(date);
  return {
    time: getTimeForZone(zone, instant, hour12),
    date: getDateForZone(zone, instant),
    timestamp: instant.getTime(),
    zone
  };
}

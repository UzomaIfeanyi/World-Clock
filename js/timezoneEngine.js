// Shared timezone formatting engine. Dates are absolute instants, not local wall-clock strings.
function requireValidDate(date) {
  const instant = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(instant.getTime())) throw new RangeError("Invalid date or timestamp");
  return instant;
}
function formatter(zone, options) {
  // Intl.DateTimeFormat validates IANA timezone names and handles DST transitions.
  return new Intl.DateTimeFormat("en-GB", { timeZone: zone, ...options });
}
export function getTimeForZone(zone, date = new Date(), hour12 = false) {
  return formatter(zone, {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: hour12 ? "h12" : "h23"
  }).format(requireValidDate(date));
}
export function getDateForZone(zone, date = new Date()) {
  return formatter(zone, {
    weekday: "short", day: "numeric", month: "short", year: "numeric"
  }).format(requireValidDate(date));
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

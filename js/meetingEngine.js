/* Task 10 — meeting overlap search using real IANA time zones and local workdays. */
const zonedFormatters = new Map();
const weekendDays = new Set(["Sat", "Sun"]);
function localParts(zone, instant) {
  let formatter = zonedFormatters.get(zone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: zone, weekday: "short", year: "numeric", month: "2-digit",
      day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    });
    zonedFormatters.set(zone, formatter);
  }
  const parts = Object.fromEntries(formatter.formatToParts(instant)
    .filter(part => part.type !== "literal").map(part => [part.type, part.value]));
  return {
    dateKey: parts.year + "-" + parts.month + "-" + parts.day,
    weekday: parts.weekday,
    minuteOfDay: Number(parts.hour) * 60 + Number(parts.minute)
  };
}
export function localDateKey(zone, instant = new Date()) {
  return localParts(zone, instant).dateKey;
}
export function isBusinessDay(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  const date = new Date(dateKey + "T12:00:00Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateKey) return false;
  return date.getUTCDay() !== 0 && date.getUTCDay() !== 6;
}
export function nextBusinessDate(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) throw new RangeError("Invalid date");
  const date = new Date(dateKey + "T12:00:00Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateKey) throw new RangeError("Invalid date");
  while (!isBusinessDay(date.toISOString().slice(0, 10))) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}
export function findMeetingSlots({
  date, cities, startMinutes = 9 * 60, endMinutes = 17 * 60,
  durationMinutes = 60, maxResults = 8
}) {
  if (!Array.isArray(cities) || cities.length < 2 || cities.length > 5) {
    throw new RangeError("Choose 2 to 5 cities");
  }
  if (new Set(cities.map(city => city.id)).size !== cities.length ||
      cities.some(city => !city || typeof city.zone !== "string" || typeof city.id !== "string")) {
    throw new RangeError("Cities must be unique and have valid time zones");
  }
  if (!Number.isInteger(startMinutes) || !Number.isInteger(endMinutes) ||
      startMinutes < 0 || endMinutes > 1440 || startMinutes >= endMinutes ||
      !Number.isInteger(durationMinutes) || durationMinutes < 15 ||
      durationMinutes > endMinutes - startMinutes ||
      !Number.isInteger(maxResults) || maxResults < 1 || maxResults > 100) {
    throw new RangeError("Invalid working hours, duration or result limit");
  }
  if (!isBusinessDay(date)) return [];
  // Date is interpreted in the FIRST selected city's time zone, not the browser's.
  // Search a 72-hour UTC band so UTC-12 through UTC+14 reference days are covered.
  // 15-minute increments preserve 30-minute local starts in quarter-hour zones.
  const referenceZone = cities[0].zone;
  const startUtc = Date.parse(date + "T00:00:00Z") - 24 * 60 * 60 * 1000;
  const endUtc = startUtc + 72 * 60 * 60 * 1000;
  const matches = [];
  for (let stamp = startUtc; stamp < endUtc; stamp += 15 * 60 * 1000) {
    const instant = new Date(stamp);
    const reference = localParts(referenceZone, instant);
    if (reference.dateKey !== date || reference.minuteOfDay % 30 !== 0) continue;
    const endInstant = new Date(stamp + durationMinutes * 60 * 1000);
    // Check the last minute so a meeting ending exactly at 17:00 is allowed.
    const lastMinute = new Date(endInstant.getTime() - 60 * 1000);
    const localTimes = [];
    let acceptable = true;
    for (const city of cities) {
      const start = localParts(city.zone, instant);
      const end = localParts(city.zone, lastMinute);
      if (weekendDays.has(start.weekday) || start.dateKey !== end.dateKey ||
          start.minuteOfDay < startMinutes || start.minuteOfDay >= endMinutes ||
          end.minuteOfDay >= endMinutes || end.minuteOfDay < startMinutes) {
        acceptable = false;
        break;
      }
      localTimes.push({ id: city.id, city: city.city, zone: city.zone, dateKey: start.dateKey });
    }
    if (acceptable) {
      matches.push({ startsAt: instant.toISOString(), endsAt: endInstant.toISOString(), localTimes });
      if (matches.length >= maxResults) break;
    }
  }
  return matches;
}

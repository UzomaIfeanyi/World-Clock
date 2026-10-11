import test from "node:test";
import assert from "node:assert/strict";
import { buildBusinessHoursTimeline } from "../js/meetingEngine.js";

const lagos = { id: "lagos", city: "Lagos", zone: "Africa/Lagos" };
const london = { id: "london", city: "London", zone: "Europe/London" };
const newYork = { id: "new-york", city: "New York", zone: "America/New_York" };

test("Lagos, London and New York share three hours on 15 October 2026", () => {
  const intervals = buildBusinessHoursTimeline({
    date: "2026-10-15", cities: [lagos, london, newYork]
  });
  assert.equal(intervals.length, 96);
  const shared = intervals.filter(interval => interval.allAvailable);
  assert.equal(shared.length, 12); // Three hours, 15 minutes per interval
  assert.equal(shared[0].startsAt, "2026-10-15T13:00:00.000Z");
  assert.equal(shared.at(-1).endsAt, "2026-10-15T16:00:00.000Z");
});

test("The shared working window shifts with New York daylight saving", () => {
  const intervals = buildBusinessHoursTimeline({
    date: "2026-11-12", cities: [lagos, newYork]
  });
  const shared = intervals.filter(interval => interval.allAvailable);
  assert.equal(shared.length, 8); // Two hours in November
  assert.equal(shared[0].startsAt, "2026-11-12T14:00:00.000Z");
  assert.equal(shared.at(-1).endsAt, "2026-11-12T16:00:00.000Z");
});

test("Weekends and no-overlap days do not generate shared bands", () => {
  const weekend = buildBusinessHoursTimeline({
    date: "2026-10-17", cities: [lagos, london, newYork]
  });
  assert.equal(weekend.filter(interval => interval.allAvailable).length, 0);
  const sydney = { id: "sydney", city: "Sydney", zone: "Australia/Sydney" };
  const distant = buildBusinessHoursTimeline({
    date: "2026-10-15", cities: [lagos, sydney]
  });
  assert.equal(distant.filter(interval => interval.allAvailable).length, 0);
});

test("Quarter-hour timezone offsets are represented accurately", () => {
  const kathmandu = { id: "ktm", city: "Kathmandu", zone: "Asia/Kathmandu" };
  const intervals = buildBusinessHoursTimeline({
    date: "2026-10-15", cities: [lagos, kathmandu]
  });
  const shared = intervals.filter(interval => interval.allAvailable);
  assert.equal(shared.length, 13);
  assert.equal(shared[0].startsAt, "2026-10-15T08:00:00.000Z");
  assert.equal(shared.at(-1).endsAt, "2026-10-15T11:15:00.000Z");
});

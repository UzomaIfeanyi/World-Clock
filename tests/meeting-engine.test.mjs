import test from "node:test";
import assert from "node:assert/strict";
import { findMeetingSlots, isBusinessDay, nextBusinessDate, localDateKey } from "../js/meetingEngine.js";

const Lagos = {id:"lagos",city:"Lagos",zone:"Africa/Lagos"};
const London = {id:"london",city:"London",zone:"Europe/London"};
const NewYork = {id:"new-york",city:"New York",zone:"America/New_York"};
const Tokyo = {id:"tokyo",city:"Tokyo",zone:"Asia/Tokyo"};

test("weekdays, weekends and invalid dates are checked independently of the browser time zone", () => {
  assert.equal(isBusinessDay("2026-10-12"), true);
  assert.equal(isBusinessDay("2026-10-11"), false);
  assert.equal(isBusinessDay("2026-02-30"), false);
  assert.equal(nextBusinessDate("2026-10-11"), "2026-10-12");
  assert.equal(localDateKey("Africa/Lagos",new Date("2026-10-11T23:30:00Z")), "2026-10-12");
  assert.throws(() => nextBusinessDate("invalid"), RangeError);
});

test("finds weekday overlap for three cities with DST-aware New York and London times", () => {
  const winter = findMeetingSlots({date:"2026-01-15",cities:[Lagos,London,NewYork]});
  const summer = findMeetingSlots({date:"2026-07-15",cities:[Lagos,London,NewYork]});
  assert.ok(winter.length > 0);
  assert.ok(summer.length > 0);
  assert.equal(winter[0].startsAt, "2026-01-15T14:00:00.000Z"); // Lagos 15, London 14, NY 09
  assert.equal(summer[0].startsAt, "2026-07-15T13:00:00.000Z"); // Lagos 14, London 14, NY 09
  assert.deepEqual(winter[0].localTimes.map(c=>c.city),["Lagos","London","New York"]);
  assert.equal(winter[0].endsAt, "2026-01-15T15:00:00.000Z");
});

test("no overlap exists across distant business-hour windows or weekend date", () => {
  assert.deepEqual(findMeetingSlots({date:"2026-10-11",cities:[Lagos,London]}),[]);
  assert.deepEqual(findMeetingSlots({date:"2026-10-12",cities:[NewYork,Tokyo]}),[]);
  assert.ok(findMeetingSlots({date:"2026-10-12",cities:[Lagos,London],startMinutes:8*60,endMinutes:18*60,durationMinutes:120}).length > 0);
});

test("quarter-hour time zone offsets preserve on-the-hour or half-hour local meeting starts", () => {
  const Kathmandu={id:"kathmandu",city:"Kathmandu",zone:"Asia/Kathmandu"};
  const Kolkata={id:"kolkata",city:"Kolkata",zone:"Asia/Kolkata"};
  const slots=findMeetingSlots({date:"2026-10-12",cities:[Kathmandu,Kolkata]});
  assert.ok(slots.length>0);
  assert.equal(slots[0].startsAt, "2026-10-12T03:45:00.000Z");
});

test("input constraints exclude invalid windows, duplicates, missing zones and oversized groups", () => {
  assert.throws(()=>findMeetingSlots({date:"2026-10-12",cities:[Lagos]}),RangeError);
  assert.throws(()=>findMeetingSlots({date:"2026-10-12",cities:[Lagos,Lagos]}),RangeError);
  assert.throws(()=>findMeetingSlots({date:"2026-10-12",cities:[Lagos,London],startMinutes:1000,endMinutes:900}),RangeError);
  assert.throws(()=>findMeetingSlots({date:"2026-10-12",cities:[Lagos,London],durationMinutes:600}),RangeError);
  assert.throws(()=>findMeetingSlots({date:"2026-10-12",cities:[Lagos,{id:"bad",city:"Bad",zone:"Not/AZone"}]}),RangeError);
});

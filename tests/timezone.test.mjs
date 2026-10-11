import test from "node:test";
import assert from "node:assert/strict";
import { getTimeForZone, getDateForZone, getZonedDateTime } from "../js/timezoneEngine.js";
import { createDigitalClockController } from "../js/digitalClock.js";

test("IANA zones use actual summer and winter offsets", () => {
  assert.equal(getTimeForZone("Europe/London", "2026-01-15T12:00:00Z"), "12:00:00");
  assert.equal(getTimeForZone("Europe/London", "2026-07-15T12:00:00Z"), "13:00:00");
  assert.equal(getTimeForZone("America/New_York", "2026-01-15T12:00:00Z"), "07:00:00");
  assert.equal(getTimeForZone("America/New_York", "2026-07-15T12:00:00Z"), "08:00:00");
  assert.equal(getTimeForZone("Africa/Lagos", "2026-07-15T12:00:00Z"), "13:00:00");
  assert.equal(getTimeForZone("Asia/Tokyo", "2026-07-15T12:00:00Z"), "21:00:00");
});

test("dates change correctly when a city crosses midnight", () => {
  assert.match(getDateForZone("Asia/Tokyo", "2026-10-11T23:30:00Z"), /12 Oct 2026/);
  assert.match(getDateForZone("America/New_York", "2026-10-11T01:30:00Z"), /10 Oct 2026/);
});

test("format preference, UTC instant and errors are handled by shared engine", () => {
  const date = new Date("2026-07-15T12:34:56Z");
  assert.match(getTimeForZone("Europe/London", date, true).toLowerCase(), /pm/);
  const zoned = getZonedDateTime("Africa/Lagos", date);
  assert.equal(zoned.zone, "Africa/Lagos");
  assert.equal(zoned.timestamp, date.getTime());
  assert.equal(zoned.time, "13:34:56");
  assert.throws(() => getTimeForZone("Invalid/Timezone", date), RangeError);
  assert.throws(() => getDateForZone("Africa/Lagos", "not-a-date"), RangeError);
});

test("digital clock can run with unavailable storage and still preview time", () => {
  const renders = [];
  const blockedStorage = {
    getItem() { throw new Error("Storage blocked"); },
    setItem() { throw new Error("Storage blocked"); }
  };
  const clock = createDigitalClockController({
    render: (instant, hour12) => renders.push({ instant, hour12 }),
    storage: blockedStorage
  });
  assert.equal(clock.getHour12(), false);
  clock.setHour12(true);
  assert.equal(clock.getHour12(), true);
  const before = Date.now();
  clock.setPreviewOffset(90);
  const preview = clock.getInstant().getTime();
  assert.ok(preview >= before + 90 * 60_000);
  assert.ok(preview < Date.now() + 90 * 60_000 + 2_000);
  assert.ok(renders.length >= 2);
  clock.setPreviewOffset(Number.NaN);
  assert.ok(clock.getInstant().getTime() >= before + 90 * 60_000);
});

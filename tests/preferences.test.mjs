import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PREFERENCES, createPreferencesStore } from "../js/preferences.js";
import { getDateForZone } from "../js/timezoneEngine.js";

test("settings defaults, validation and browser persistence", () => {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
  const store = createPreferencesStore(storage);
  assert.deepEqual(store.get(), DEFAULT_PREFERENCES);
  assert.equal(store.set("theme", "light"), true);
  assert.equal(store.set("dateFormat", "mdy"), true);
  assert.equal(store.set("clockDisplay", "analog"), true);
  assert.equal(store.set("theme", "invalid"), false);
  assert.equal(store.set("__proto__", "anything"), false);
  assert.deepEqual(createPreferencesStore(storage).get(), {
    theme: "light", dateFormat: "mdy", clockDisplay: "analog"
  });
  store.reset();
  assert.deepEqual(createPreferencesStore(storage).get(), DEFAULT_PREFERENCES);
});

test("broken settings data or inaccessible storage never prevents rendering", () => {
  const malformed = { getItem: () => "{not json", setItem() {} };
  assert.deepEqual(createPreferencesStore(malformed).get(), DEFAULT_PREFERENCES);
  const blocked = { getItem() { throw Error("blocked"); }, setItem() { throw Error("blocked"); } };
  const settings = createPreferencesStore(blocked);
  assert.equal(settings.set("theme", "light"), true);
  assert.equal(settings.get().theme, "light");
  const invalid = { getItem: () => JSON.stringify({theme:"danger", dateFormat:"mdy",clockDisplay:"other"}) };
  assert.deepEqual(createPreferencesStore(invalid).get(), { theme:"dark", dateFormat:"mdy", clockDisplay:"both" });
});

test("date display changes locale without changing a city's actual calendar date", () => {
  const instant = new Date("2026-10-11T12:15:00Z");
  assert.match(getDateForZone("Europe/London", instant, "dmy"), /11 Oct 2026/);
  assert.match(getDateForZone("Europe/London", instant, "mdy"), /Oct 11, 2026/);
  assert.match(getDateForZone("Asia/Tokyo", instant, "mdy"), /Oct 11, 2026/);
});

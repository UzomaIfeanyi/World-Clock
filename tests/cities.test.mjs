import test from "node:test";
import assert from "node:assert/strict";
import { CITY_CATALOG, CITY_BY_ID, DEFAULT_CITY_IDS, MAX_CITIES, findCities, flagForCountry } from "../js/cityCatalog.js";
import { createCityStore, STORAGE_KEY } from "../js/cityStore.js";

function storage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: key => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
    read: key => data.get(key)
  };
}
test("expanded catalogue contains real IANA timezones and correctly assigned flags", () => {
  assert.ok(CITY_CATALOG.length > 200);
  for (const city of CITY_CATALOG) {
    assert.doesNotThrow(() => new Intl.DateTimeFormat("en", { timeZone: city.zone }),
      `Invalid timezone for ${city.city}: ${city.zone}`);
  }
  const paris = findCities("Paris").find(city => city.city === "Paris");
  const toronto = findCities("toronto").find(city => city.city === "Toronto");
  assert.equal(paris?.zone, "Europe/Paris");
  assert.equal(paris?.flag, "🇫🇷");
  assert.equal(toronto?.zone, "America/Toronto");
  assert.equal(toronto?.flag, "🇨🇦");
  assert.equal(flagForCountry("NG"), "🇳🇬");
  assert.equal(flagForCountry(""), "🌐");
  assert.equal(findCities("nigeria").some(city => city.city === "Lagos"), true);
  assert.equal(findCities("America/Toronto").some(city => city.city === "Toronto"), true);
});
test("six starter cities can be extended, removed and persisted across reloads", () => {
  const memory = storage();
  const cities = createCityStore(memory);
  assert.equal(cities.getCount(), 6);
  const paris = findCities("Paris").find(city => city.city === "Paris");
  const toronto = findCities("Toronto").find(city => city.city === "Toronto");
  assert.equal(cities.add(paris.id), "added");
  assert.equal(cities.add(toronto.id), "added");
  assert.equal(cities.add(paris.id), "duplicate");
  assert.equal(cities.getCount(), 8);
  assert.equal(createCityStore(memory).getCount(), 8);
  assert.equal(cities.remove(paris.id), true);
  assert.equal(cities.remove(paris.id), false);
  assert.equal(createCityStore(memory).getCount(), 7);
  assert.equal(cities.add("not-a-real-city"), "unknown");
});
test("city limit is 100, including six starter cards", () => {
  const cities = createCityStore(storage());
  const candidateIDs = CITY_CATALOG.map(city => city.id).filter(id => !cities.has(id));
  for (const id of candidateIDs.slice(0, MAX_CITIES - 6)) {
    assert.equal(cities.add(id), "added");
  }
  assert.equal(cities.getCount(), MAX_CITIES);
  assert.equal(cities.add(candidateIDs[MAX_CITIES - 6]), "limit");
  assert.equal(cities.remove(DEFAULT_CITY_IDS[0]), true);
  assert.equal(cities.add(candidateIDs[MAX_CITIES - 6]), "added");
});
test("invalid persisted values and unavailable storage cannot crash the dashboard", () => {
  const memory = storage({[STORAGE_KEY]: JSON.stringify([DEFAULT_CITY_IDS[0], DEFAULT_CITY_IDS[0], "bad-id"])});
  const restored = createCityStore(memory);
  assert.equal(restored.getCount(), 1);
  assert.equal(createCityStore(storage({[STORAGE_KEY]: "not-json"})).getCount(), 6);
  assert.equal(createCityStore(storage({[STORAGE_KEY]: JSON.stringify([])})).getCount(), 0);
  const blocked = {
    getItem() { throw new Error("Blocked"); },
    setItem() { throw new Error("Blocked"); }
  };
  const offline = createCityStore(blocked);
  assert.equal(offline.getCount(), 6);
  assert.equal(offline.add(findCities("Paris")[0].id), "added");
});

test("Task 4: normalized city discovery handles punctuation, accents and country codes", () => {
  assert.equal(findCities("new-york")[0].city, "New York");
  assert.equal(findCities("são paulo").some(city => city.city === "Sao Paulo"), true);
  assert.equal(findCities("Cote d Ivoire").some(city => city.city === "Abidjan"), true);
  assert.equal(findCities(" ng ").some(city => city.city === "Lagos"), true);
  assert.equal(findCities("Europe / Vienna").some(city => city.city === "Vienna"), true);
  assert.equal(findCities("Toronto")[0].city, "Toronto");
  assert.equal(findCities("no-such-city_1789").length, 0);
});

test("Task 5: moving a saved city changes display order and persists safely", () => {
  const memory = storage();
  const store = createCityStore(memory);
  const before = store.getCities().map(city => city.id);
  assert.equal(store.move(before[0], -1), false);
  assert.equal(store.move(before[before.length - 1], 1), false);
  assert.equal(store.move("missing", 1), false);
  assert.equal(store.move(before[0], 20), false);
  assert.equal(store.move(before[1], -1), true);
  assert.deepEqual(store.getCities().map(city => city.id).slice(0, 2),
    [before[1], before[0]]);
  assert.deepEqual(createCityStore(memory).getCities().map(city => city.id).slice(0, 2),
    [before[1], before[0]]);
  assert.equal(store.remove(before[0]), true);
  assert.equal(store.move(before[0], 1), false);
});

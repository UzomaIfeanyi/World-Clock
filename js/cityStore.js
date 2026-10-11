import { CITY_BY_ID, DEFAULT_CITY_IDS, MAX_CITIES } from "./cityCatalog.js";

const STORAGE_KEY = "worldclock:selected-cities:v1";

export function createCityStore(storage) {
  let store = null;
  try { store = storage === undefined ? window.localStorage : storage; }
  catch (_) { /* Private browsing or strict security settings may block access. */ }

  let selected = [...DEFAULT_CITY_IDS];
  try {
    const raw = store?.getItem(STORAGE_KEY);
    if (raw !== null && raw !== undefined) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Ignore malformed, duplicate and obsolete entries without breaking startup.
        selected = [...new Set(parsed.filter(id => typeof id === "string" && CITY_BY_ID.has(id)))].slice(0, MAX_CITIES);
      }
    }
  } catch (_) { /* Keep the six starter cities if persisted data is unreadable. */ }

  const getCities = () => selected.map(id => CITY_BY_ID.get(id));
  const has = id => selected.includes(id);
  function save() {
    try { store?.setItem(STORAGE_KEY, JSON.stringify(selected)); }
    catch (_) { /* Changes still work in memory until this page is closed. */ }
  }
  function add(id) {
    if (!CITY_BY_ID.has(id)) return "unknown";
    if (has(id)) return "duplicate";
    if (selected.length >= MAX_CITIES) return "limit";
    selected.push(id);
    save();
    return "added";
  }
  function remove(id) {
    if (!has(id)) return false;
    selected = selected.filter(value => value !== id);
    save();
    return true;
  }
  return { getCities, has, add, remove, getCount: () => selected.length };
}

export { STORAGE_KEY };

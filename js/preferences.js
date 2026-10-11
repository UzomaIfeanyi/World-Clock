/* Task 2 — browser-local appearance and clock display preferences. */
export const DEFAULT_PREFERENCES = Object.freeze({
  theme: "dark",
  dateFormat: "dmy",
  clockDisplay: "both"
});
const STORAGE_KEY = "worldclock:preferences:v1";
const ALLOWED = Object.freeze({
  theme: ["dark", "light"],
  dateFormat: ["dmy", "mdy"],
  clockDisplay: ["both", "digital", "analog"]
});
export function createPreferencesStore(storage) {
  let store = null;
  let preferences = { ...DEFAULT_PREFERENCES };
  try {
    store = storage === undefined ? (typeof window === "undefined" ? null : window.localStorage) : storage;
    const saved = JSON.parse(store?.getItem(STORAGE_KEY) ?? "null");
    if (saved && typeof saved === "object" && !Array.isArray(saved)) {
      for (const key of Object.keys(DEFAULT_PREFERENCES)) {
        if (ALLOWED[key].includes(saved[key])) preferences[key] = saved[key];
      }
    }
  } catch (_) { /* Storage unavailable or data malformed — retain safe defaults. */ }
  function persist() {
    try { store?.setItem(STORAGE_KEY, JSON.stringify(preferences)); }
    catch (_) { /* Controls continue to work in memory. */ }
  }
  return {
    get() { return { ...preferences }; },
    set(key, value) {
      if (!Object.hasOwn(ALLOWED, key) || !ALLOWED[key].includes(value)) return false;
      preferences = { ...preferences, [key]: value };
      persist();
      return true;
    },
    reset() {
      preferences = { ...DEFAULT_PREFERENCES };
      persist();
    }
  };
}

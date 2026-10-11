# World Clock

A responsive world-clock dashboard developed by TechCrush Group 10.

## Getting started

Run a local static server from the project root (ES modules require HTTP):

```sh
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Cities and navigation

- Tap **+ Add city**, search by name, country or time zone, and choose **Add**. Paris, Toronto and more than 200 other named cities are included, along with additional IANA timezone locations.
- Each city has a timezone-aware digital and analog clock. A **small national flag image** appears next to its timezone label when its country is known (via flagcdn.com). A country-code badge remains visible if images fail or the browser is offline. Daytime has a sun icon and nighttime has a moon icon, based on the local hour (06:00–17:59 is daytime); it is not an astronomical sunrise/sunset calculation.
- Save up to **100 cities**, including the six starter cities. Duplicate selections are blocked. Remove a clock using its small × button.
- Selected cities persist in the current browser using `localStorage`; when browser storage is blocked, changes last only for the current tab. Selections are not synced between devices.
- The top search field filters **saved clocks** while suggesting **new cities from the complete catalogue**. Search for Vienna, Dublin, or Paris and choose **Add** directly. The separate Add City picker is still available.
- On mobile, tap the three-line menu button to open the sidebar. Tap **outside the sidebar**, select a destination or press Escape to close it.

## Tests

```sh
npm install
npx playwright install chromium
npm test
```

GitHub Actions runs unit and Chromium browser tests for new pull requests. Feature areas under active development (meeting planner and account syncing) are identified separately.

### Task 4 — City Search & Add City (Hassan)
The city picker and global search share the same normalized catalogue search. City, country, ISO country code, and IANA timezone queries work despite accent, spacing or punctuation variations; duplicate entries and the 100-city limit remain enforced.

### Task 5 — Manage Cities (Jemimah)
The **Saved Cities** section now lists every saved clock with up, down and remove buttons. The same order appears in the dashboard, persists across browser reloads and survives additions/removals. Controls remain usable on mobile and by keyboard. Saved cities are browser-local, not account-synced.

### Task 2 — Settings (Aminu / UI styling)
Settings provides browser-local appearance, date formatting and clock-display options, alongside the existing Task 7 12/24-hour digital time control. Changes apply to dashboard clocks immediately, and date preferences also update the local date, slider preview, and converter results. Choose **Restore default preferences** to reset only display settings; saved cities are not removed. Preferences are stored in localStorage when available and otherwise remain active until the page closes.

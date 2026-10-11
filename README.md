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

GitHub Actions runs unit and Chromium browser tests for new pull requests. Account syncing is not included; saved cities and preferences are browser-local.

## Project status and hand-off

All ten feature tasks have working implementations in the application. Task 11 automated integration tests passed on the feature-complete main branch, but a person should still run the real-browser smoke check before calling the release signed off. Task 12 documentation and a presentation run-through are prepared; the final demo still needs to be delivered by the team.

- [Integration and testing record](docs/INTEGRATION-TESTING.md)
- [Manual browser sign-off checklist](docs/MANUAL-QA-CHECKLIST.md)
- [Final presentation notes and demo order](docs/FINAL-PRESENTATION.md)

### Scope we kept simple

- The **Time Converter** intentionally uses six predefined cities. It is functional; we are not expanding it to the entire catalogue for this hand-off.
- The Meeting Planner suggests overlapping local **working hours**, not verified free slots in individual calendars; it neither schedules nor sends invitations.
- Day/night means local hours from **06:00 to 17:59**, not calculated sunrise and sunset.
- Saved cities and preferences live in **this browser's storage**. There is no login or cloud sync.
- Flag images need a network connection; a country-code fallback is available if they fail.

These are known limitations, not features claimed to be present.

### Task 4 — City Search & Add City (Hassan)
The city picker and global search share the same normalized catalogue search. City, country, ISO country code, and IANA timezone queries work despite accent, spacing or punctuation variations; duplicate entries and the 100-city limit remain enforced.

### Task 5 — Manage Cities (Jemimah)
The **Saved Cities** section now lists every saved clock with up, down and remove buttons. The same order appears in the dashboard, persists across browser reloads and survives additions/removals. Controls remain usable on mobile and by keyboard. Saved cities are browser-local, not account-synced.

### Task 2 — Settings (Aminu / UI styling)
Settings provides browser-local appearance, date formatting and clock-display options, alongside the existing Task 7 12/24-hour digital time control. Changes apply to dashboard clocks immediately, and date preferences also update the local date, slider preview, and converter results. Choose **Restore default preferences** to reset only display settings; saved cities are not removed. Preferences are stored in localStorage when available and otherwise remain active until the page closes.

### Task 10 — Business Hours & Meeting Planner
Open **Meeting Planner** to choose 2–5 saved cities, a meeting date in the first selected city's local calendar, duration (30–120 minutes), and a shared workday window (default 09:00–17:00). The planner offers matching times on weekdays in **all** selected cities. Every result displays each city's corresponding local date and time. Time-zone and daylight-saving differences are calculated through built-in IANA rules; no fixed hour offsets are assumed. If there is no shared working-hour slot, the planner explains how to adjust the date, cities, working hours or duration. Selected locations, duration and working-hour settings persist in browser storage where allowed. The planner does not book meetings or read anyone's calendar, and it never deletes saved cities.

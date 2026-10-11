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
- Each city has a timezone-aware digital and analog clock. A **small national flag** appears next to its timezone label when the city's country is known. Unmapped time zone names use a globe instead of guessing a flag.
- Save up to **100 cities**, including the six starter cities. Duplicate selections are blocked. Remove a clock using its small × button.
- Selected cities persist in the current browser using `localStorage`; when browser storage is blocked, changes last only for the current tab. Selections are not synced between devices.
- The top search field filters **saved clocks**; the Add City search finds **new locations**.
- On mobile, tap the three-line menu button to open the sidebar. Tap **outside the sidebar**, select a destination or press Escape to close it.

## Tests

```sh
npm install
npx playwright install chromium
npm test
```

GitHub Actions runs unit and Chromium browser tests for new pull requests. Feature areas under active development (meeting planner and account syncing) are identified separately.

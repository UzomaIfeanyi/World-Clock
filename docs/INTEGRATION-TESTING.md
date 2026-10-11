# Task 11 — Integration & Testing

## Scope

Task 11 integrates and verifies features **present on main**: navigation and responsive layout (Task 1), purple styling (Task 2), world-clock cards (Task 3), corrected timezone engine (Task 6), digital clock and 12/24-hour choice (Task 7), analog hands/day-night indicator (Task 8), time slider (Task 9), and the time-converter UI merged as PR #7.

The analog clock used to have two refresh paths: the application controller and a second standalone timer in `analogIntegration.js`. The duplicate bridge is no longer loaded from `index.html`. The application controller now remains responsible for card and analog updates, including search re-rendering and slider previews. The unused bridge file is retained for history; do not re-add its script without reviewing duplication.

The digital clock controller now tolerates browsers that reject access to localStorage or its property getter. If blocked, preferences stay in memory for that tab.

## Automated testing

Requires Node.js 20+ and Python 3 (for a local static HTTP server used by browser tests).

```sh
npm install
npx playwright install chromium
npm test
```

- `npm run test:unit`: timezones, daylight-saving offsets, cross-midnight dates, invalid inputs, in-memory format preference and preview handling.
- `npm run test:e2e`: Chromium interaction tests for load/rendering, six analog clocks, city search, preference persistence, preview slider, converter and London DST transitions, mobile navigation.
- Every pull request targeting `main` triggers GitHub Actions; the workflow also runs on pushes to `main`.
- For a quick local preview, run `python3 -m http.server 4173` from the repository root and open `http://127.0.0.1:4173`. ES modules may not work reliably from `file://`.

## Acceptance matrix

| Area | Automated check | Manual follow-up |
| --- | --- | --- |
| Clock cards, dates, timezones and day/night | Unit + Chromium | Inspect alignment on phone and laptop |
| 12/24-hour preference | Chromium | Reload in a real browser |
| Analog movement and preview sync | Chromium structural checks | Observe hand movement visually |
| Search and empty state | Chromium | Try keyboard input |
| Time slider controls and reset | Chromium | Drag range input on a touchscreen |
| Conversion and daylight-saving time | Unit + Chromium | Compare with another trusted time-zone source |
| Navigation and responsive layout | Chromium narrow viewport | Inspect at 320px, 768px and desktop |
| Console/runtime startup | Chromium test, JS syntax check | Inspect browser console |
| Accessibility | ARIA and keyboard checks in Chromium | Full screen-reader and contrast audit still needed |

## Unintegrated feature dependencies

These features are **not** implemented on main at the time Task 11 was prepared. Their sections should remain clearly labelled as placeholders until their owners submit code:

- Task 4 — City search/add-city selection (the existing search only filters predefined cards)
- Task 5 — Save, remove and reorder cities
- Task 10 — Business hours and meeting planner

Task 11 cannot certify functionality that has not yet been submitted. Re-run the suite and add corresponding tests when those features are merged. Task 12 (documentation/final presentation) remains a separate workstream.

## Release gate

1. GitHub Actions integration workflow is green on the Task 11 PR.
2. No new console errors during the desktop/mobile manual smoke check.
3. Verify that the outstanding feature owners' pull requests are merged before calling the entire World Clock feature-complete.
4. Re-run regression tests after every feature merge.

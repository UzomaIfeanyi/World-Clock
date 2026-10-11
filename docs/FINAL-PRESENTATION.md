# Task 12 — Final Presentation Notes

**World Clock — TechCrush Group 10**  
Standalone Capstone • Planned presentation: **15–16 October 2026**

Use these notes for a straightforward team presentation, not a claim that the app has features it does not have. The slides should be short, with the actual app doing most of the demonstration.

## Suggested eight slides

### Slide 1 — World Clock
Our standalone capstone brings the time in different cities together in one place.

### Slide 2 — Problem
Time differences make it easy to call somebody at the wrong hour or confuse meeting times. Searching one city at a time also makes comparisons slower.

### Slide 3 — Aim
Build a responsive browser-based dashboard for comparing international time, managing cities, previewing other times and finding overlapping business hours.

### Slide 4 — How it works
HTML and CSS provide the interface. JavaScript handles the city catalogue, saved cities and clock updates. The browser's Intl/IANA time-zone data accounts for differences and daylight-saving changes. Local storage retains browser preferences.

### Slide 5 — Main features
Live digital/analogue clock cards; search and add city; saved-city ordering; time slider; six-city Time Converter; Settings; Meeting Planner.

### Slide 6 — Live demonstration
Open Dashboard → show Lagos/London/Tokyo → Add Paris → Saved Cities → time slider → Time Converter → Meeting Planner → Settings. Keep the demo focused and do not switch to features that are not built.

### Slide 7 — Testing and limitations
Automated Node and Chromium checks passed on 11 October. The manual browser checklist still needs sign-off. Known limitations: browser-local storage, fixed six-city converter, no actual calendar availability check or meeting invites, and simplified day/night labelling.

### Slide 8 — Conclusion
The project shows how time-zone-aware browser features can help people understand international time. Future work could include broader converter search, account sync and real calendar integration, but these are **future ideas**, not current capabilities.

## Live demo walkthrough (about 4–5 minutes)

1. **Clocks (45 seconds).** Show different local times and moving seconds. Explain that the location's time zone determines the display.
2. **Cities (45 seconds).** Search for Paris, add it, then show how Saved Cities can reorder or remove a place.
3. **Slider and Converter (60 seconds).** Preview +30 minutes, return to now, then use the existing **six-city** converter.
4. **Meeting Planner (60 seconds).** Select Lagos, London and New York and show overlapping hours. Explain that results are suggested working-hour overlaps, not calendar bookings.
5. **Settings and finish (45 seconds).** Show 12/24-hour display or light/dark mode, then state the project limitations.

Before presenting: return the time slider to Now, restore a usable display setting, and check the laptop/browser zoom.

## Fair answers to likely questions

**Why not just use a search engine?** We wanted to compare and manage several cities in one dashboard, not make a separate query for each city.

**How are time differences calculated?** We use browser-supported IANA time-zone identifiers with JavaScript `Intl.DateTimeFormat`. The time-zone rules handle daylight saving; we do not hardcode a fixed difference between cities.

**Does the Meeting Planner check users' calendars?** No. It suggests times when the selected cities fall within the same working-hour window.

**Where are saved cities stored?** In that browser's local storage. There are no accounts or cross-device syncing.

**Why only six cities in the Time Converter?** That screen was built with six commonly used locations. The main clock catalogue is broader. Extending converter search is possible but outside the current scope.

**What did testing cover?** Unit and browser tests for key interactions and time-zone cases. We still need to complete the practical browser sign-off before treating every device scenario as verified.

**What would you improve?** Better cross-device persistence, a wider converter selection, real calendar connections, accessibility checks and more detailed testing.

## Presentation-day hand-off

- Project lead: explain the aim and introduce the demonstration.
- Team presenters: describe the specific components they can explain and demonstrate.
- Anyone answering technical questions: say what the code actually does; do not guess about a feature or promise something not implemented.
- Keep a local copy of the project open in Live Server; avoid relying on Internet access for the demo, except that flag images may use an external service.
- Final screenshots and manual test results should be captured by the team on its own laptop before the presentation.

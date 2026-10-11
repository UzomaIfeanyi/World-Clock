# Manual Browser Check — World Clock

**Task 11 final smoke test.** Complete on the latest `main` branch after **Fetch origin → Pull origin** in GitHub Desktop. Open the project in VS Code with Live Server.

Checked by: __________________________   Date: __________________

Mark each item **Pass**, **Issue**, or **Not tested**. If there is an issue, briefly describe it; do not mark an item passed just because a test script exists.

| Check | Status | Notes |
| --- | --- | --- |
| Page loads and the six starter city cards appear | Not tested | |
| Clock seconds increase; analogue hands move and display the right time | Not tested | |
| Time in Lagos, London and Tokyo matches a trusted clock | Not tested | |
| Sun/moon and day/night text match the app's 06:00–17:59 rule | Not tested | |
| Search finds an unsaved city; Add places it on the dashboard | Not tested | |
| Duplicate city cannot be added; remove and reorder behave correctly | Not tested | |
| City choices stay saved after refresh | Not tested | |
| Time slider moves all city clocks and Back to now restores current time | Not tested | |
| Time Converter changes its six-city result for date/time selections | Not tested | |
| Meeting Planner produces reasonable overlap and no-overlap outcomes | Not tested | |
| Settings change theme, clock view, date and hour format; reload retains them | Not tested | |
| Desktop layout: no clipped cards, overlapping headings or unreadable buttons | Not tested | |
| Mobile layout at roughly 375px: menu opens/closes, controls can be tapped | Not tested | |
| Browser console: no unexpected red errors when using main features | Not tested | |
| Keyboard Tab, Enter and Escape operate the menu and city dialog | Not tested | |
| Light mode is readable; country-code flag fallback is visible offline | Not tested | |

## Quick procedure

1. Open the dashboard on your laptop and watch the clocks for 10 seconds.
2. Search for **Paris**, add it, refresh the page, move it in Saved Cities, then remove it.
3. Move the time slider +30 minutes, check several clocks, and choose **Back to now**.
4. Open Time Converter and compare Lagos to London for January and July.
5. In Meeting Planner choose Lagos, London and New York; try a weekday and a Sunday. A weekday can give slots; Sunday should give none under the Monday–Friday rule.
6. In Settings select light mode, 12-hour and analogue-only; refresh and restore defaults.
7. Narrow the browser window or open the app on a phone and repeat the menu and Add City checks.
8. Open developer tools with **F12 → Console** and note unexpected errors. Some external flag images may fail when offline; their country-code fallback should remain visible.

## Outcome

Manual verification: **Pending**

Issues found: ____________________________________________________________

Decision: [ ] Accept for presentation  [ ] Fix before presentation

Signed: __________________________

Do not call this section complete until the person testing it records the result.

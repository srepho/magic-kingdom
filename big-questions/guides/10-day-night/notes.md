# Guide 10 — fact-check log

The grown-up notes the parent reads are in `index.html` (the `grownups` part). This file
records where each claim was checked.

Checked 14 November 2026.

| Claim on the page | Label | Checked against | How |
| --- | --- | --- | --- |
| The Earth turns once in about 24 hours; a solar day is about 24 h, a sidereal day 23 h 56 min | Fact | NASA Space Place, "How Long Is One Day on Other Planets?" | Page fetched |
| Day is facing the Sun, night is facing away; the Earth's turning causes it | Fact | NASA StarChild, question of the month, March 2001 | Found by search, not fetched |
| The Earth turns eastward; anticlockwise seen from above the north | Fact | Wikipedia, "Earth's rotation" | Page fetched |
| The same turning is clockwise seen from above the South Pole | Fact | Follows from the line above (same rotation viewed from the other side) | Reasoned, not link-checked |
| The Sun appears to go east to west because the ground turns west to east | Fact | Same Wikipedia page; search results agreed | Page fetched |
| From Sydney the midday Sun is in the north | Fact | Standard: Sydney is south of the Tropic of Capricorn | Not link-checked |
| Midday Sun 56° up at the equinoxes | Fact | Calculation | 90° − 34° latitude |
| About 1,675 km/h at the equator | Fact | Wikipedia, "Earth's rotation" (1,674.7 km/h) | Page fetched |
| About 1,400 km/h at Sydney | Fact | Calculation | 1,675 × cos 34° ≈ 1,390 |
| Midday in Sydney is 10 or 11 pm the previous evening in Rio | Fact | Calculation from time zones | Sydney UTC+10 (UTC+11 in daylight saving), Rio UTC−3. Zones recalled, not link-checked |
| Rio is close to opposite Sydney in longitude | Fact | Calculation | 151°E to 43°W is 194° |
| The Moon shines by reflected sunlight and is up in daytime about half the time | Fact | Standard astronomy | Not link-checked |
| Sun about 109 Earths wide, nearly 12,000 Earth-widths away | Fact | Calculation from standard figures | 1,392,000 ÷ 12,742 km; 149.6 million ÷ 12,742 km. Recalled, not link-checked |
| Tilt of about 23 degrees gives seasons and changing day length | Fact | Search results (Universe Today and teaching sources) agreed | Found by search |
| Moon goes round about once a month, rising later each day | Fact | Standard astronomy | Not link-checked |
| The Sun moves through the galaxy | Fact | Standard astronomy | Not link-checked |
| "Down" is towards the Earth's middle; we do not feel steady motion | Fact | Standard physics | Not link-checked |
| How the young Earth got its spin; giant-impact idea | Unsure | Standard account of the Moon-forming impact | Recalled, not link-checked |
| Sydney Observatory runs booked tours, family tours for ages 6+, conservation works may limit access | n/a | Powerhouse page and listings (City of Sydney, Concrete Playground) | Found by search; listings disagreed on days and hours, so none are quoted |

## How the toy matches the facts (covered by `tests/daynight-sim.test.js`)

- Nothing changes unless the Earth is turned.
- Turning the real way gives midday, sunset, night, sunrise, in that order.
- The Sun is on the east (right) side at sunrise and the west (left) side at sunset.
- Exactly half of each turn is day.
- One whole turn brings the sky back to where it started.
- A flick coasts the real way only, and stops by itself.
- Shadows point away from the Sun and are shortest at midday.
- The Moon is up during part of the day, and part of the night has no Moon.

## Simplifications logged on the page

No tilt (so no seasons and equal days); not to scale; turning backwards allowed by hand;
stopping allowed; Moon held fixed relative to the Sun; one spin treated as one day; the Sun
drawn as still; cartoon land shapes, simplified sky colours, stars that do not drift.

## Kept out on purpose

- Seasons and the tilt (a different idea; one line in the notes only).
- Time zones as a system, and clock times on the child's screens.
- Any drawing of the Sydney Opera House.
- Opening hours for the Observatory, because the listings found did not agree.

## Not verified

- The NASA StarChild page and the Powerhouse Observatory page were found by search but not
  opened; their addresses are as the search returned them.
- Time-zone offsets for Sydney and Rio are from memory.

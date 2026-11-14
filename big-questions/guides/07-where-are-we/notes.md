# Guide 07 — fact-check log

The grown-up notes the parent reads are in `index.html` (the `grownups` part). This file
records where each claim was checked.

Checked 14 November 2026.

| Claim on the page | Label | Checked against | How |
| --- | --- | --- | --- |
| Planet order; Earth third; diameters compared with Earth (Mercury 0.383, Venus 0.949, Mars 0.532, Jupiter 11.21, Saturn 9.45, Uranus 4.01, Neptune 3.88) | Fact | NASA NSSDC, "Planetary Fact Sheet – Ratio to Earth Values" | Page fetched. These are the numbers in `where-sim.js` |
| The Sun is about 109 times as wide as Earth | Fact | Several sources agree (Windows to the Universe, Space.com) | Found by search; the NASA Sun page itself was not read |
| The Sun is about 150 million km away; light takes about eight minutes | Fact | 1 AU = 149.6 million km; UCAR "Meet the Sun" | Found by search |
| Earth is about 12,700 km across | Fact | Standard value (mean diameter 12,742 km) | Not link-checked |
| Sydney is on the east coast; Greater Sydney about 5.6 million people (5,638,800 at 30 June 2025) | Fact | Australian Bureau of Statistics | Found by search, not fetched |
| Sydney is Australia's biggest city | Fact | ABS figures | Found by search. One result questioned this depending on how city boundaries are drawn; by the ABS Greater Capital City figures Sydney is largest |
| Australia is the sixth-largest country, about 7.7 million km² | Fact | Geoscience Australia, "Australia's size compared" (7,688,287 km²) | Found by search |
| All of Australia is south of the equator | Fact | Coordinates; also asserted by a test | Checked in code |
| Earth out to Neptune is about 350,000 Earth-widths | Fact | Arithmetic from the NASA table | 30.18 × 149.6 million km ÷ 12,742 km ≈ 354,000 |
| Peppercorn model: Sun a 23 cm ball, Earth a 2 mm peppercorn 25 m away, Neptune about 750 m away | Model | Arithmetic from the NASA table | Earth 2.1 mm → Sun 109 × 2.1 = 229 mm; 149.6e6 ÷ 12,742 × 2.1 mm ≈ 24.7 m; × 30.18 ≈ 745 m; Neptune 3.88 × 2.1 ≈ 8 mm |
| The Moon would sit more than ten screens away | Model | Arithmetic | Moon is about 30 Earth-widths away; the globe is 220 units wide in a 480-unit picture, so about 6,600 units, or about fourteen picture-widths |
| Gravity pulls towards the centre of the Earth; no up or down in space | Fact | Standard physics | Not link-checked |
| Pluto reclassified as a dwarf planet in 2006; smaller than the Moon (0.187 against 0.272 Earth-widths) | Fact | IAU decision (standard); sizes from the NASA table | Sizes fetched; the IAU page was not read |
| The Sun is a star; the Milky Way holds an enormous number of stars | Fact | Standard astronomy | Not link-checked. No number is quoted |
| Whether space ends; whether anything lives elsewhere | Unsure | — | Open questions |
| Sydney Observatory: grounds free by day, inside by booked tour, family tours, conservation works under way | n/a | City of Sydney "What's On" listing and the Powerhouse page, via search | Found by search, not fetched. Sources disagreed on which days tours run, so no days or prices are quoted |

## Correction made while writing this log

The first draft of the grown-up notes said the Moon would sit "about three screen-widths away".
The arithmetic gives about fourteen picture-widths (30 Earth-widths × 220 units ÷ 480). The page
has been changed to say "more than ten screens away".

## What is not to scale, and where it is admitted

- **Zoom steps** (`LEVELS` ratios 12, 100, 100, 4.4, 22): chosen so each picture reads clearly,
  not measured. Admitted in the notes under "Even steps".
- **Space picture in the zoom**: planet dots and orbits are neither to size nor to distance.
- **Planet parade**: sizes true relative to each other and to the Sun's edge; gaps not.
- **Coastlines**: a few dozen hand-placed corners per land mass. Recognisable, not accurate.
- **City sketch**: the general shape of Sydney only.

## Kept out on purpose

- Any real address, suburb or school.
- Any Aboriginal Country name (guide 4, and only once supplied).
- A count of stars or galaxies, and the age or size of the universe.

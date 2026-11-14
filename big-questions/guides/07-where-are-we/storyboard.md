# Guide 07 — Where are we?

**Built** 14 November 2026, without a review stop. Decisions are listed at the end.
Fact checks are in `notes.md`.

## The guide in one line

| | |
| --- | --- |
| Single idea | Home sits inside a street, inside a city, inside a country, on a planet, in space. Every place is inside a bigger one |
| Her action | She slides one big slider out and back |
| What she sees | The roof of home lifting away into a street, then Sydney, then Australia, then the round Earth, then the planets. A red dot marks home the whole way. Slide back and it all returns |
| Misconception to avoid | That these are separate places rather than the same place seen from further away. That the planets are close together and similar in size. That Australia is "underneath" |

**Taught terms (three):** **city**, **country**, **planet**.

## Map

```
Cover ──► The big zoom (centrepiece)
  ├──► Opening: the balloon
  ├──► Moment: spin the Earth
  ├──► Moment: the planet parade
  ├──► Try it · Wonder more
  └──► Grown-up notes (press and hold)
```

## Opening — the balloon

| Field | |
| --- | --- |
| The insight | From higher up, home looks smaller and you can see more around it |
| What she does | Drags a balloon up from beside the letterbox. Taps the door, the letterbox, the magpie |
| What she sees | The view lifts and widens with the balloon: home shrinks and the whole row of houses and trees comes into view. Drag it down and home is big again. Door opens on a cat; letterbox flag flaps; magpie hops |
| What she can vary | How high; back down again; where she lets go (the balloon stays put) |
| Misconception to avoid | None introduced. This is the side view she knows, before the toy switches to a view from above |
| How we know it works | She takes the balloon up and down more than once |

Caption when the balloon is high: *"From up high, home looks small. What else can we see?"* (11 words).
The toy button then starts to wiggle.

## Centrepiece — the big zoom

| Field | |
| --- | --- |
| The insight | The same spot belongs to a street, a city, a country and a planet all at once. Each is the last one seen from further away |
| What she does | Drags a slider between a house and a planet. (Mouse wheel also works.) At home, taps the dog |
| What she sees | Six pictures, each shrinking into its place inside the next: home from above → street → Sydney → Australia → Earth → the planets round the Sun. The red home dot never jumps. The caption names where she is |
| What she can vary | How far, how fast, where she stops, and straight back again. Stopping halfway shows one place sitting inside the next |
| Misconception to avoid | That the pictures are unrelated. The home roof, car and block are redrawn in the street at their true small size, and the Australia map is literally the globe zoomed in, so nothing swaps when she crosses a step |
| How we know it works | She slides out and back without being shown, and points at the red dot |

Captions, one per place:

- *"This is home, seen from up high."* (7)
- *"Home is in a street, with lots of other homes."* (10)
- *"The streets are part of a big **city**. This one is Sydney."* (12)
- *"Sydney is in a **country** called Australia."* (7)
- *"Australia is on a **planet** called Earth. Earth is a ball."* (11)
- *"Earth is one of eight planets going around the Sun."* (10)

## Moment — spin the Earth

| Field | |
| --- | --- |
| The insight | Earth is a ball with land and sea all the way round. Australia is one piece of land on it |
| What she does | Drags the globe; it turns under her finger. A flick keeps it turning a little |
| What she sees | Lands and seas rolling round. Australia comes into view with the red home dot on its east coast |
| What she can vary | Which way and how fast; tilting up to see the icy top or bottom; spinning Australia right round the back and finding it again |
| Misconception to avoid | That Australia is on the bottom. The ball has no fixed "up": she decides which way it faces |
| How we know it works | She loses Australia round the back and brings it round again |

Caption when Australia faces her: *"Earth is a ball. Australia is one piece of land on it."* (12)

## Moment — the planet parade

| Field | |
| --- | --- |
| The insight | There are eight planets. Earth is the third from the Sun, and a small one |
| What she does | Drags sideways to travel out from the Sun. Taps a planet to make it bounce |
| What she sees | The edge of the enormous Sun, then Mercury, Venus, Earth (with a red flag), Mars, huge Jupiter, ringed Saturn, Uranus, Neptune, all at their true sizes compared with each other |
| What she can vary | How far out she goes and back; which planets she pokes |
| Misconception to avoid | That planets are all about the same size. (The gaps are not true and the notes say so) |
| How we know it works | She travels to Jupiter and comes back to find Earth |

Captions: *"Eight **planets** go around the Sun. Earth is number three."* (10) and, on reaching
Jupiter, *"Jupiter is the biggest planet. Earth could fit across it eleven times."* (12)

## Try it

A peppercorn Earth: a soccer ball for the Sun, 25 big steps, a peppercorn for the Earth.

## Wonder more

- If you flew straight up from our roof, what would you see first?
- People live all the way round the Earth. Which way is down for them?
- What do you think is further away than the planets?

## Decisions made without asking

1. **View from above for the whole zoom.** A roof seen from above can shrink into a street map
   without a change of viewpoint. The side view she knows is in the opening instead.
2. **A slider, not pinch.** One finger, and reversible at any point. Pinch was left out;
   a mouse wheel also zooms.
3. **Each place gets equal room on the slider**, although the real jumps are wildly unequal.
   Logged in the grown-up notes.
4. **A made-up house, street and spot in Sydney.** No real address or suburb. The home dot's
   position in the city is one constant (`LEVELS[2].anchor` in `where-sim.js`) and easy to move.
5. **The city picture is a sketch**, not a map: sea to the east, harbour running west into a
   river, a bay to the south, a bridge, tall buildings, bushland north and south.
6. **No Aboriginal Country is named**, and none is implied. That belongs to guide 4.
7. **Australia's map is the globe zoomed in**, so the map-to-ball step is one continuous picture.
8. **The planets stand still** in the zoom so that Earth is where the zoom lands.
9. **No Moon.** At the globe's size it would sit more than ten screens away.
10. **Place to visit: Sydney Observatory**, with a note to check what is running.

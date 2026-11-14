# Guide 01 — What is everything made of?

**Built** (checkpoint 3, 14 November 2026). This is the plan the build follows; places where the
build differs are marked *Built as*. Fact checks are in `notes.md`.

## The guide in one line

| | |
| --- | --- |
| Single idea | Water is made of tiny bits. Ice, water and steam are the same bits moving differently |
| Her action | She makes it warmer or colder |
| What she sees | The same bits jiggle in place, then slide past each other, then fly apart, and back again |
| Misconception to avoid | That the bits melt, vanish, or turn into something else |

**Taught terms (three):**

- **bits**: the tiny pieces water is made of, far too small to see
- **steam**: water when its bits have flown apart. You can't see it
- **model**: a pretend picture that helps us think about something we can't see

"Ice", "water", "melt" and "freeze" are used as ordinary words, not taught.

## Map

```
Cover ──► The toy (centrepiece)          always one tap from anywhere
  │
  ├──► Opening: the ice cube
  ├──► Moment A: the puddle
  ├──► Moment B: the kettle cloud
  ├──► Try it
  ├──► Wonder more
  └──► Grown-up notes   (press-and-hold to open)
```

Nothing is locked. A home button and a "toy" button sit in the corner of every screen.

---

## Cover

A glass of water with one ice cube, on a windowsill. The cube bobs slowly. The title is
the question. Touching the glass anywhere opens the toy. Smaller picture-buttons along the
bottom lead to the other parts.

---

## Opening — the ice cube

A big ice cube in a glass of cordial, gently bobbing and clinking. No words.

- Touch the cube: it dunks and bobs back up with a clink. Poke it repeatedly: it spins and
  looks dizzy (the funny bit).
- Hold a finger on it: a warm glow spreads from her finger, the cube shrinks and small drops of meltwater slip into
  the drink. Let go: it stops. Her finger did it. *Built as:* the drink level does not move,
  because melting floating ice never raises the level. A melted cube is replaced by a new one.
- The pretend-glasses button in the corner starts to wiggle. Tapping it opens the toy.

Caption (after her first hold): *"Your warm finger is melting the ice. Where does the ice go?"* (12 words)

---

## Centrepiece — the warmth toy

### Interaction specification

| Field | |
| --- | --- |
| The insight | Water is made of tiny bits. They stay the same bits in ice, water and steam and only move differently |
| What she does | Drags a big warmth slider between a snowflake and a flame. Pokes and stirs the bits with a finger. Taps one bit to put a sticker on it |
| What she sees | Cold: bits held in a pattern, jiggling on the spot. Warmer: the pattern lets go and bits slide past each other in a pool. Hot: bits fly apart and bounce around the whole pot. Slide back and each change undoes itself |
| What she can vary | How warm, how fast she changes it, where she stops. Can she get ice back? Does the stickered bit survive? What does poking do in ice versus water versus steam? What happens right at the edge between two states? |
| Misconception to avoid | Bits melting, vanishing or changing. Also: that this is what you'd see through a microscope; that bits in ice are still; that steam is the white cloud |
| How we know it works | Without instructions she moves the slider both ways, and at some point follows one bit or says the bits are still there |

### Layout (tablet, landscape)

```
┌───────────────────────────┬───────────────────────────┐
│   WHAT EYES SEE           │   THE MODEL               │
│                           │   (sketchbook page,       │
│   glass-lidded pot on a   │    crayon-drawn bits,     │
│   bench; painted style    │    taped corners)         │
│                           │                           │
├───────────────────────────┴───────────────────────────┤
│  ❄ ━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━ 🔥   ↺ │
└───────────────────────────────────────────────────────┘
```

- **Left, what eyes see.** A pot with a clear lid. Cold: a block of ice, frost on the pot.
  Middle: the block slumps into a pool of water. Hot: the water bubbles, the level drops,
  and the pot looks nearly empty. There is no white cloud. Cooling from hot: drops gather on
  the lid, run down, and the water comes back.
- **Right, the model.** About 36 bits in a sketchbook drawing of the same pot. Closed lid,
  so no bit ever leaves the page. A light pull downward so the liquid pools at the bottom.
- **Marking the switch.** The two halves are drawn in different styles on purpose: painted
  versus crayon-on-paper. The model page slides in from the side wearing the pretend glasses
  from the opening. It never zooms out of the real pot. First time only, a caption:
  *"This is a **model**: a pretend picture of something too small to see."* (13 words)
- **The slider.** Thumb about 90px. No numbers. The pot's warmth follows the thumb with
  about a second of lag so changes feel caused, not switched. Wherever she stops, it stays.
- **Reset.** One tap returns to cold and clears stickers.

### Behaviours

| She does | Straight away | The idea in it |
| --- | --- | --- |
| Drags toward the flame | Jiggling grows; pattern breaks from the edges; pool forms | Warm means more movement |
| Keeps going | Bits leave the pool one by one, then all fly about | Steam is the same bits, far apart |
| Drags back | Bits slow, gather, pool, click back into the pattern | It undoes. Nothing was lost |
| Stops anywhere | Bits keep moving at that level, forever | Even in ice the bits never stop |
| Taps a bit | It squeaks and wears a star sticker. Tap again to remove | She can follow one bit through everything |
| Drags a finger through | Ice: bits push back and spring to place. Water: they swirl around the finger. Steam: they scatter | Solid, liquid and gas feel different |

Sound: jiggle pitch rises with warmth; soft clicks when the pattern locks; bubbling on the
left when hot. Off switch in the corner.

Captions, one per state, shown small the first time she reaches it:

- *"Cold. The **bits** hold tight and jiggle on the spot."* (10)
- *"Warmer. The bits let go and slide past each other."* (9)
- *"Hot. The bits fly apart. This is **steam**. Same bits!"* (9)

### Design decisions for you

1. **Shape of a bit.** Proposed: one round blob with two small bumps. That is honestly the
   outline of a water molecule, with no atom talk on screen. The alternative is a plain
   circle, which is simpler but reads as "atom" later.
2. **Ice pattern.** Real ice is an open honeycomb, and its bits sit slightly *further*
   apart than in liquid water, which is why ice floats. A generic particle model packs the
   solid tighter, which is wrong for water. Proposed: draw the honeycomb with visible
   gaps and let the pool sit a touch more compact. Not taught, just not false.
3. **No temperatures.** Icons only. 0 °C and 100 °C go in the grown-up notes.
4. **Real physics or steered?** Proposed: bits move by simple real forces, steered toward
   the honeycomb when cold. The rough toy is where we find out whether that feels alive
   or needs more scripting.
5. **Reduce-motion.** The bits' movement is the idea, so it stays, at lower amplitude.
   Everything ambient stops.

---

## Moment A — the puddle

| Field | |
| --- | --- |
| The insight | A puddle that dries up has not vanished. Its bits went into the air |
| What she does | Drags a cloud off the sun and back over it |
| What she sees | Sun out: the puddle on the footpath shrinks while, on a sketchbook card beside it, bits leave the surface one at a time and drift up. Cloud back: they stop leaving |
| What she can vary | Sun in and out; tap the cloud to rain and refill the puddle; sticker a bit and see where it ends up |
| Misconception to avoid | "Dried up" means gone. Also that water must boil to become a gas |
| How we know it works | She makes the puddle shrink and refill more than once |

Caption: *"The puddle didn't vanish. Its bits floated off into the air."* (10 words)

Funny bit: *Built as* a tap on the puddle makes a splash. The magpie was dropped.
In shade the bits leave very slowly rather than stopping, which is the truth.

## Moment B — the kettle cloud

| Field | |
| --- | --- |
| The insight | Steam is invisible. The white cloud above a kettle is tiny drops of water |
| What she does | Taps the kettle to boil it, then drags the sketchbook card. A dashed ring on the card's corner marks the spot it is showing |
| What she sees | A clear gap at the spout, then a white cloud further out. Card over the gap: bits far apart and fast. Card over the cloud: bits bunched into tiny drops. Card over the water inside: bits sliding |
| What she can vary | Where she holds the card; kettle on and off |
| Misconception to avoid | That the white cloud is the gas. That the card is a magnifier (it keeps its crayon style and taped corners) |
| How we know it works | She moves the card between the gap and the cloud to compare |

Caption: *"**Steam** is invisible. The white cloud is tiny drops of water."* (10 words)

---

## Try it (after the screen, about 10 minutes)

**Ice, water, ice.** Hold an ice cube over a bowl until it melts in your hands. Pour the
water into the ice tray and put it back in the freezer. Check after dinner. Same water?

Bonus for a warm day: paint pictures on the footpath with a brush and plain water, and
watch them disappear. Where did the bits go?

Needs: ice cube, bowl, ice tray, paintbrush. Kettles and steam stay with the grown-up.

## Wonder more

- If you were as small as a water bit, what would you see?
- Where do you think the puddle's bits are right now?
- Is there anything that is *not* made of tiny bits?

---

## Grown-up notes (outline only; sources checked at checkpoint 3)

Each statement will carry a label: **fact**, **simplified model** or **still uncertain**.

- Fuller explanation: the bits are water molecules (H₂O); temperature is how energetically
  they move; melting at 0 °C and boiling at 100 °C at sea level; evaporation happens below
  boiling.
- Simplifications to log: bits drawn enormously too big and too few; colours invented;
  speeds slowed vastly; flat instead of 3D; molecules drawn as blobs; no air shown in the
  pot; the lid keeps everything in.
- Follow-up questions with suggested answers: Can we see a bit? What are bits made of? Is
  everything made of bits? (Ordinary stuff, yes. Light, no. And most of what is out in
  space is something nobody has worked out yet.) Why does ice float? Where does rain come from?
- One place and one book to go further: to be chosen and verified as current, not assumed.

---

## Questions for Stephen at this checkpoint

1. **Device.** Which tablet, and roughly how old? This sets the performance budget.
2. **Title versus scope.** The title asks about *everything* but the pilot is only water,
   as the brief requires. Proposed: leave the title, and let "Wonder more" and the notes
   carry the step from water to everything. The alternative is a third moment that holds
   the model card over a spoon and the air, which widens the guide.
3. The five design decisions under the centrepiece, especially 1 and 2.
4. Is **model** the right third term for her, or would you rather spend it on **melt** or **freeze**?

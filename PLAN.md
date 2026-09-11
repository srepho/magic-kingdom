# Myla's Magic Kingdom — Development Plan

A browser game for Myla (almost 5) and her little sister Leah (2).

## Design principles (age 4–5, pre-reader)

1. **No reading required** — navigation is by big pictures; instructions are *spoken*
   (browser speech synthesis) and reinforced with sound effects.
2. **No fail states, no timers, no scores** — a wrong answer gets a friendly wobble and
   an encouraging voice line, never a buzzer. Everything a child does produces reward.
3. **Huge touch targets** — every interactive element is a minimum of ~56px, most far
   larger, with extra invisible padding around moving targets.
4. **Immediate cause-and-effect** — every tap makes something sparkle, bounce, or sing.
   This is the core loop that holds a 4–5 year old.
5. **Sibling-safe** — a dedicated toddler mode (Leah, 2) where *any* tap anywhere is a
   correct answer.
6. **Parent-friendly** — one HTML file, zero installs, zero network requirements at play
   time, no ads/links/purchases, and a mute button.

## v2 — SHIPPED

Single self-contained `index.html` (emoji + inline SVG art, WebAudio synth sound,
speech-synthesis voice prompts — no external assets needed to play).

| Game | Skill it exercises | Loop |
|---|---|---|
| ⭐ Star Pop | hand-eye coordination | pop floaters → musical notes → fill rainbow meter → unicorn flyby celebration |
| 🦄 Dress-Up | creativity, choice-making | mane colours, 3 hats, wings, 3 backgrounds; tap unicorn → happy bounce |
| 🏰 Castle Stickers | creativity, spatial play | pick sticker → stamp on castle scene → broom clears |
| 🔤 Letter Bubbles | letter recognition (pre-reading) | spoken prompt → find letter among 4 → spells MYLA, LEAH, STAR, PONY |
| 🦋 Counting Garden | counting and one-to-one correspondence | count 1–5 garden friends aloud → gentle celebration → new set |
| 🎴 Magic Matching | visual memory and turn-taking | reveal 4 friendly pairs → mismatches turn back → find every pair |
| 👶 Leah's Sparkles | toddler cause-and-effect | any tap = fireworks + chime; every 4th tap a friendly animal bounces in |

This version also saves dress-up and sticker creations locally, adds sticker undo,
improves small-screen menu layout, prevents delayed letter rounds from continuing
after navigation, and removes the online font request so play is fully self-contained.

## v3 — SHIPPED

| Game | Skill it exercises | Loop |
|---|---|---|
| 🧮 Number Magic | early addition | count two emoji groups → tap the sum bubble → five stars = unicorn fly-by |
| 🐝 Spelling Bee | letter order / word building | picture + spoken word → tap letter tiles in order → word spelled aloud |

## v4 — SHIPPED (phone-friendly games)

| Game | Skill it exercises | Loop |
|---|---|---|
| 🦄 Rainbow Run | timing, cause-and-effect | auto-running unicorn → tap to jump (double jump) → collect stars → castle ends the level → next level a little faster. Falling summons a rescue cloud: no fail state |
| 🎨 Paint Pad | creativity, fine motor | fat crayons, rainbow crayon, sparkle stamps → undo / hold-to-wipe → saved locally |
| 🌈 Colour Hunt | colour names | spoken colour + coloured blob → tap the matching picture → wrong taps name their colour |

Rainbow Run is a `<canvas>` game (emoji sprites, world measured in units of the
play-area height, anchored to the bottom so portrait phones show ~10 units of
look-ahead). Physics has coyote time and jump buffering so late taps still work.

## v5 ideas (next sessions)

- **Creation gallery**: add a screen for several saved dress-up and sticker scenes.
- **Record-a-cheer**: let a parent record their own voice for celebrations
  (MediaRecorder), stored locally.
- **Rainbow Run extras**: Leah mode (auto-jump), tap-the-unicorn to change her colour, more scenery (night level).
- **More letters**: lowercase mode; letter → word-with-picture ("M is for Moon 🌙").
- **Install as app**: add PWA manifest + service worker so it can be added to an
  iPad home screen and launched fullscreen offline.

## Technical notes

- Vanilla HTML/CSS/JS in one file; no build step, no dependencies.
- Art: emoji + hand-drawn inline SVG (unicorn, castle). Sound: WebAudio oscillators
  (pentatonic scale so random notes always sound pleasant). Voice: `speechSynthesis`.
- Uses a rounded system-font stack, with no external requests.
- Works with mouse or touch (pointer events); double-tap zoom disabled.
- Sound preference persisted in localStorage (`mk-sound`).

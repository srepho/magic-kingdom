# Style

One look for every guide. The values live in `shared/base.css` (CSS variables) and
`BQ.ink` in `shared/kit.js`; change them there.

## Two kinds of picture

| | What eyes see | The model |
| --- | --- | --- |
| Meaning | The real thing | A pretend picture of what is too small to see |
| Surface | Soft sky blue (`--sky`) | Cream paper (`--paper`) with ruled lines, tape on the corners |
| Drawing | Flat painted shapes, grey outlines, white highlights | Crayon: flat fill with a darker edge, slightly doubled outlines |
| Marker | none | A small pair of pretend glasses on the paper |

The model never zooms out of the real picture and is never round like a lens. It sits
beside the real thing or on a card. This is the brief's "mark the switch to a model" rule.

## Palette

| Use | Value |
| --- | --- |
| Page | `#f3efe6` |
| Ink (outlines, text) | `#3b3a36` |
| Paper / paper edge | `#fbf6e3` / `#c9bb92` |
| Sky | `#dfeef5` |
| Water / deep water | `#7ec4ee` / `#5aa9dc` |
| Ice / ice edge | `#eaf7ff` / `#9cc9e6` |
| Water bit / edge | `#4a90d9` / `#2f6fb5` |
| Cold, middle, warm | `#9fd0ff`, `#ffe9a8`, `#ff8a5c` |
| Sun, stickers, taught-word highlight | `#ffd23f` |

A water bit is always the same blue blob with two small bumps, in every scene.

## Line and shape

- Outlines 3 to 5 units, round caps and joins. Corners rounded.
- Buttons are white circles or rounded tiles with a 3px ink border, at least 60px.
- No gradients except the warmth slider and a finger's warm glow.

## Motion

- Ambient motion (bobbing, drifting, flickering flames) is slow and small.
- Anything that carries the idea moves only because she acted.
- Something touchable that she has not found yet wiggles or breathes gently.
- No flashing. Under reduce-motion, ambient motion stops and simulations run at half speed.

## Words

- Captions sit in the top bar, 15 words or fewer, written to be read aloud.
- A taught term is bold with a yellow underline the first time it matters.

## Sound

Short synthesised effects only (no audio files): clink, squeak, blup, click, drip, plop.
One switch, top right, remembered between visits.

## Technique

Scenes with moving bits are drawn on canvas. Static artwork (covers, tiles) is inline SVG.
Icons are drawn, not emoji, so they look the same on every device.

## Guide character

None in the pilot. To be decided after testing.

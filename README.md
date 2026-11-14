# Magic Kingdom 🦄🌈

A no-reading-required browser game for young children — unicorns, rainbows,
princesses and castles for a 5-year-old, plus a special sparkle mode for a
2-year-old little sister.

## Big Questions

The [Big Questions shelf](https://srepho.github.io/magic-kingdom/big-questions/)
has ten illustrated guides to explore together: matter, money, government,
Australia's history, evolution, time, our place in space, the body, food, and
day and night. Each guide has a toy, smaller scenes, things to try away from
the screen, questions to talk about, and grown-up notes with sources. The notes also
include optional play invitations and links between related guides. In the
government guide, try "Decide together" to see how a leader can be outvoted.

For local development, serve `big-questions/` with `python3 -m http.server`.
From the repository root, run:

```sh
node --test big-questions/tests/
python3 big-questions/tools/build_shelf.py
```

Rebuild after **any published guide, script, style, or worker change**. The build
updates the shelf and offline list, and changes the cache version only when the
release content changes. On the HTTPS site, offline use is available once the
first complete download finishes. Updates download in the background, then
take effect after all Big Questions tabs are closed and the site is reopened.
Existing open guides keep using their current release. External source links
still need an internet connection.

On a tablet or phone, open the shelf and choose **Add to Home Screen**. It then
opens full screen, without the browser's bars, like an app. The icons are drawn
by `big-questions/tools/make_icons.py`.

`big-questions/tests/brief-rules.test.js` checks every guide against the house
rules: the parts each guide needs, captions of 15 words or fewer, at most three
taught words, no outside links or emoji on a child's screen, and labelled
grown-up notes.

## How to play

**Play online from any computer or tablet:**
**https://srepho.github.io/magic-kingdom/**

Or **just double-click `index.html`** — it opens in any browser. No internet needed.

Best experience:
- On a **phone**: Rainbow Run and Paint Pad work in portrait or landscape; add the
  page to the home screen (Share → Add to Home Screen) to hide the browser bar.
- On an **iPad/tablet**: open the file in Safari/Chrome, then use fullscreen so
  stray taps don't hit browser buttons. (Guided Access on iPad is great for the
  2-year-old.)
- **Turn the sound on** 🔊 (top-right button on the home screen) — the game *speaks*
  its instructions, so no reading is needed.

## The games

- ⭐ **Star Pop** — tap the floating stars and balloons; each pop plays a musical
  note, and filling the rainbow makes a unicorn fly by.
- 🦄 **Dress-Up** — colour the unicorn's mane, add crowns, wings and backgrounds.
  Tap the unicorn for a happy bounce!
- 🏰 **Castle Stickers** — pick a sticker at the bottom, then tap anywhere on the
  castle to stamp it. The broom 🧹 sweeps the scene clean.
- 🔤 **Letter Bubbles** — gentle letter recognition: the game says a letter out
  loud and the child finds it. It spells the girls' own names first, then
  friendly words. Wrong taps just wobble — there's no way to lose.
- 🦋 **Counting Garden** — count 1–5 butterflies, flowers and other garden
  friends. Each tap counts aloud, with a celebration after the last one.
- 🎴 **Magic Matching** — find four pairs of friendly pictures. Cards simply
  turn back over when they do not match, so there is no fail state.
- 🧮 **Number Magic** — gentle adding-up: two groups of strawberries (or stars,
  or cupcakes…) to count, then tap the answer bubble. Sums start at 2 and grow
  slowly, never past 10. Five stars earns a unicorn fly-by.
- 🐝 **Spelling Bee** — see a picture (cat, dog, sun…), hear the word, and tap
  the letter tiles in order. Faint letters sit in the slots, so it starts as
  shape-matching and grows into real spelling. The game spells each finished
  word aloud.
- 🦄 **Rainbow Run** — a one-tap platformer for the phone. The unicorn runs by
  herself; tap anywhere to jump (tap again in the air for a second jump) and
  collect stars on the way to the castle. Fall off the edge and a cloud floats
  her straight back — there is no way to lose. Each castle starts a slightly
  faster level.
- 🎨 **Paint Pad** — finger painting with fat crayons, a rainbow crayon and a
  sparkle-stamp brush. ↩️ undoes the last stroke; hold the 🧽 sponge to wipe the
  picture clean. Paintings are saved on the device.
- 🌈 **Colour Hunt** — a big coloured blob and the voice say a colour ("Find
  something pink!"); tap the picture that is that colour. Wrong taps wobble and
  the voice names their colour instead.
- ⭕ **Noughts & Crosses** — Myla is the unicorn. Pick who to play: the baby
  chick 🐣 (easy), the frog 🐸 (medium) or the dragon 🐲 (never loses, so a draw
  earns a star too). The 🦄🌸 card is two players taking turns on one screen.
  Wins fill a five-star meter; losing just starts a new game.
- 👶 **Sparkle Party** — for the 2-year-old: tapping anywhere makes fireworks
  and chimes, and friendly animals pop up. No wrong answers; hold 🏠 to leave.

## For the grown-ups

- No ads, no links, no network calls at play time, nothing to install.
- The home-screen 🔊/🔇 button mutes everything (including the voice) and remembers
  the choice. In a game, tap 🔊 to hear the current instruction again or hold it
  to mute/unmute.
- Letters, counting, number difficulty and spelling words continue where the child
  reached when switching games; reloading the page starts a fresh play session.
- Dress-up choices, castle stickers and paintings are saved on the device automatically;
  the broom clears the sticker scene and ↩️ removes the last sticker.
- Everything is one file (`index.html`) — copy it to any device, email it to
  grandparents, it just works.

# Guide 06 — fact-check log

The grown-up notes the parent reads are in `index.html` (the `grownups` part). This file
records where each claim was checked. All "years ago" are counted from 2026.

Checked 14 November 2026.

| Claim on the page | Label | Checked against | How |
| --- | --- | --- | --- |
| Sydney Harbour Bridge opened in 1932 (94 years ago) | Fact | Standard date | Recalled, not link-checked |
| Stone castles in Europe about 1,000 years ago | Fact | Standard history | Recalled, not link-checked |
| Great Pyramid about 4,500 years old | Fact | Standard date (about 2560 BCE) | Recalled, not link-checked |
| First peoples have lived on this continent for a very long time and still do | Fact | Clarkson et al., *Nature* 2017, and wide agreement | Search results |
| At least 50,000 years; finds in Kakadu dated to about 65,000; that date is questioned by some | Unsure | Clarkson et al., *Nature* 547, 2017 (doi 10.1038/nature22968); news coverage quoting critics | Found by search; the paper itself was not read. The "at least 50,000" floor is my summary of the older consensus (search results mention 47,000) |
| *Diprotodon*: largest marsupial ever, nearly 4 m long, up to about 2,700 kg, a wombat relative | Fact | Australian Museum, "*Diprotodon optatum*" | Found by search (page snippets), not fetched in full |
| *Diprotodon* died out between about 50,000 and 25,000 years ago | Unsure | Australian Museum gives about 25,000; other references give 40,000 to 50,000 | Search results disagree, so the range is given |
| People and *Diprotodon* overlapped | Fact (follows from the two ranges above) | Same sources | Inference |
| Oldest fossils usually counted as our species: about 300,000 years, Morocco; disputed | Unsure | Hublin et al., *Nature* 546, 2017 (doi 10.1038/nature22336); coverage noting dissent | Found by search; DOI recalled, not opened |
| Giant dinosaurs died out about 66 million years ago; birds are living dinosaurs | Fact | Standard palaeontology | Recalled, not link-checked |
| Earth is about 4.54 billion years old | Fact | US Geological Survey, "Age of the Earth" | Found by search |
| The universe is about three times older than the Earth (13.8 billion years) | Fact | Standard cosmology | Recalled, not link-checked |
| What came before the universe | Unsure | Open question | n/a |
| One sheet = 5 years; Dad 8 sheets; bridge about 19; castles one roll of 190; pyramids about 5 rolls | Model | Arithmetic, tested in `tests/long-ago-sim.test.js` | Calculated |
| Dinosaurs about 70,000 rolls ("a big truck full"); Earth nearly 5 million rolls ("two swimming pools") | Model | Arithmetic plus rough volumes: about a litre a roll, a semi-trailer of 80 to 100 cubic metres, an Olympic pool of 2,500 cubic metres | Estimated; the volumes are rough |
| A toilet roll has about 190 sheets | Model | Assumed typical | **Not checked.** The try-it tells the parent to read the pack |
| Australian Museum: free general admission; Surviving Australia gallery with a life-sized *Diprotodon* model | n/a | The museum's admission page and its media release (gallery opened December 2025) | Found by search |

## Could not verify

- That the Australian Museum's dinosaur gallery is open on any given day. A third-party guide
  mentioned one gallery closed in late 2026, so the notes tell the parent to check the website.
- The sheet count of any particular brand of toilet roll.
- The linked DOIs resolve (they are the standard identifiers for the two papers, recalled).

## Kept out on purpose

- Any name of an Aboriginal Country, people or site, any Dreaming story, and any art style.
  The Kakadu site is described only as "a rock shelter in Kakadu". Guide 4 is the place for that story.
- Any picture of what early people looked like.
- A stop for "the universe begins". The timeline ends at the Earth; the universe is in the notes.

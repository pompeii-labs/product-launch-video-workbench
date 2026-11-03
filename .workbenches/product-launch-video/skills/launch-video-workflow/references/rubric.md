# Rubric

Score each axis 1 to 3 from the contact sheet and filmstrips, with one line
of evidence that names a beat and a time. Ship at 2 or above on every axis
with no automatic failure. The gate cannot see most of this; you can.

## Story (from the storyboard, then the contact sheet)

- **3**: a viewer could retell it: who it is about, what went wrong, what
  changed, and why this product. The hook is the insight, in a line or a
  moment the audience recognises. The tension is shown, not stated. The turn
  happens on screen. Every beat's `means` is different.
- **2**: there is an arc, but one act is told rather than shown (the tension
  is a caption), or a beat repeats another's meaning.
- **1**: a tour: screens and captions in sequence, nothing at stake, no turn
  on screen. Compare the tour anchor in `story.md`.

Score Story at 1 also when it is the formula: the arc would fit another
product with the names swapped, or written lines use any move in `story.md`
§7.

## Close

- **3**: the end card shows the brief's call to action word for word, large,
  alone with the URL, held long enough to read twice; the viewer can tell why
  this ask follows from what they just saw.
- **2**: the call is right but competes with a tagline, a logo, or a second
  line, or is cut short.
- **1**: the call is missing, rewritten, generic ("Learn more"), or
  contradicts the brand (a playful product closing on a legal tone, or the
  reverse).

## The product moment

- **3**: the signature beat is the best thing in the video: the product's
  turn, made visible, in motion, with its real commands, labels, or screens.
  You could describe what the product does from that beat alone.
- **2**: the product's moment is clear but static, or shares the screen time
  evenly with weaker beats.
- **1**: the product appears only as screenshots with captions, or as an
  invented UI it does not have.

## Type and copy

- **3**: sentence case, one accent on the word that matters, every line
  legible on a phone, copy specific to this product, no line longer than the
  beat can hold.
- **2**: legible and true, but one line is generic ("Built for teams") or
  the accent is spread over several words.
- **1**: a wall of text, tiny type, several accents, or slogans that could
  sell anything.

## Motion and pacing

- **3**: every beat moves into the next; transitions slide or wipe; timing
  follows the components' natural lengths; at least one moment of craft a
  viewer would notice (a camera push landing on the exact element, type that
  acts out its meaning, the brand art coming alive); the end card holds
  calmly.
- **2**: one beat runs long or one cut is abrupt.
- **1**: dead air, a shot cut mid-move, fades stacking two beats, or
  everything easing the same way.

## Score

Judged from the gate's audio numbers and the music brief, since you cannot
listen: the brief's moments line up with the beats the manifest times, the
cut lands on a downbeat near the end card, the fade sits under the call.

- **3**: every moment in `music/brief.md` matches a beat boundary in the
  manifest within half a second; the score is cut on a downbeat or section
  boundary from `music/analysis.json` and fades over the end card; the gate's
  audio check passes.
- **2**: the cut or the fade is placed by time, not by the music's structure.
- **1**: the brief's moments ignore the beats, or the audio check fails.

## Automatic failures

Any of these is a defect even when the gate passes:

- Dark text on a dark ground, or light on light, anywhere the viewer must
  read.
- A frame where the main element is cut by the frame edge for no reason.
- Browser chrome, a cookie banner, a chat launcher, or a spinner in a shot.
- An empty state, placeholder text, or "Lorem" anywhere.
- The storyboard skeleton's cards or labels in any frame.
- A shot that repeats an earlier shot under a different line.
- Captured footage cut by the frame edge for a whole beat with no camera move
  explaining it.
- A beat whose only job is to show a page of the website.
- Brand art that is soft, grainy, or off-colour, or sits on a rectangle of
  another background: a logo or mascot cropped from a screenshot instead of
  taken as an asset.
- An end card whose call to action is not the brief's, word for word.
- A frame whose type is web-sized: a headline under about 80px or body text
  under about 40px at 1280 wide, outside a recreated UI.
- Six beats on the same flat background with text in the same corner.

## The model's default taste: never ship these

Generated launch videos converge on one template. If a frame looks like any
of these, change it:

- White centred headline on a near-black ground with a soft radial glow
  behind it.
- Opening on the logo or the product name instead of the viewer's problem.
- ALL-CAPS wordmark with wide letter-spacing.
- Three-word slogan stacks ("Fast. Simple. Powerful.").
- A screenshot floating small in the middle of a dark frame with a drop
  shadow.
- Gradient text, neon glows, purple-to-blue washes.
- A feature montage: the same screenshot under four different labels.
- The website tour: home page, then features page, then pricing, each with a
  caption.
- "Introducing" followed by nothing a viewer could not guess.
- Tiny letter-spaced ALL-CAPS eyebrows over every headline.
- The same transition, the same direction, on every cut.

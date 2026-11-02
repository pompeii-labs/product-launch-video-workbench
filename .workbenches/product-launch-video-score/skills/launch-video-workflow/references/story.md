# Story

A marketing video is a short story with the product as the turning point.
It has two failure modes. The tour: one screen after another, each with a
caption, and nothing at stake. And the formula: a story so generic it could
be about any product, told in the model's default voice. The first is
prevented by an arc, the second by specificity: every beat should hold
something only this product, this release, or this audience could supply.

## 1. Understand the product

Read before you write. Capture the text of four to eight pages
(`"textOnly": true` shots): the home page, the product or features page,
pricing, docs or a quickstart, the changelog or blog's latest post, and any
"how it works" or about page. If the site links a GitHub repository, read its
README too. Then answer, in `story.md`, with quotes and page ids:

- **What is it**, in one sentence a stranger would understand.
- **The job**: what a user is trying to get done when they reach for it.
- **The old way**: what they do today without it, and what that costs them
  (time, money, embarrassment, waiting, rework).
- **The turn**: what changes the moment they use it. The concrete before and
  after, not the adjective.
- **The aha**: the first moment a new user gets it. This is usually the
  signature moment.
- **Proof**: the numbers, names, and results the product itself states.

If you cannot answer "the old way" and "the turn" from what you read, the
video will be a tour. Read more pages before writing a beat.

## 2. Understand the audience

- **Who watches**: their role, their tools, how technical they are. Infer it
  from the product's language, pricing tiers, and integrations, and say so.
- **Where**: a launch post on X or LinkedIn (muted, sound off, the first two
  seconds decide everything), or a landing page hero (watched on purpose,
  loops).
- **What they already believe** about this category, and what they are tired
  of hearing. A claim they have heard from ten competitors is invisible.

The **insight** is one true sentence about this audience that the video
turns on. "Finance teams hate manual work" is a platitude. "Every invoice
dispute starts with someone screenshotting a spreadsheet" is an insight: it
is specific, a little painful, and the product answers it.

The **proposition** is the one idea the viewer leaves with. One. If you need
"and", pick.

## 3. Choose the protagonist and the device

The **protagonist** is who we follow: the viewer ("you"), a specific user at
work, or the product's own agent or object made into a character. A video
with a protagonist has stakes; a video without one is a slideshow.

The **device** is how the story moves. Pick the one that fits the turn:

| Device | Shape | Fits when |
|---|---|---|
| Before / after | the old way, failing; a cut; the same task with the product | the turn is a visible difference in effort or result |
| One task, start to finish | follow a single job from prompt to done | the product's value is a flow (agents, automation, dev tools) |
| The race | two runs side by side, one with the product | speed or reliability is the claim and you have the number |
| The question | the viewer's question on screen, answered beat by beat | the audience is skeptical or the category is new |
| The reveal | build tension around a problem, reveal the product as the answer | the product name is the payoff (launches, rebrands) |
| The day | one character's day, the product removing each snag | the product touches many small moments |

## 4. Write the arc in the format's shape

Each format has its own acts, in order (an act may repeat). The gate checks
the shape; the devices in §3 fit inside any of them. Do not reach for
before/after by default: it is one device of six, and three earlier runs of
this bench all chose it.

**launch**: a whole product, new to this audience.

| Act | Job | Time |
|---|---|---|
| hook | stop the scroll: the insight, as a line or a moment the viewer recognises | 0 to 3s |
| tension | make the old way felt: show the struggle, the waiting, the mess | 15 to 25% |
| turn | the product enters and changes it; name it here | by half way |
| payoff | the after: the result, made visible and satisfying | 15 to 25% |
| proof | one thing that makes it credible: a number, a real screen, a name | optional |
| call | the brief's call to action | as long as it takes to read, plus a hold |

**feature**: one new capability, for people who may already know the
product. No long problem setup: they came for the new thing.

| Act | Job | Time |
|---|---|---|
| hook | the moment this feature changes, in a line or an image | 0 to 3s |
| context | where it lives in the product, or what was missing, briefly | optional, under 20% |
| reveal | the feature arrives, named, on the real surface | by 40% |
| demo | the feature doing its job, one task start to finish | the longest act |
| payoff | what that means for the viewer's week | optional |
| call | the brief's call to action | read time plus a hold |

**changelog**: a release. Two to five changes, each shown, never listed.

| Act | Job | Time |
|---|---|---|
| hook | the release's one-line headline, or the change that matters most | 0 to 3s |
| item | one change: what it does, shown in motion (repeat per change) | by 25%, even split |
| call | the brief's call to action | read time plus a hold |

**explainer**: how it works, for someone deciding whether to try it.

| Act | Job | Time |
|---|---|---|
| hook | the viewer's question, or the moment they would ask it | 0 to 3s |
| question | the job they need done, made concrete | short |
| how | one step of how the product does it, shown (repeat per step, two to four) | by half way |
| payoff | what they end up with | optional |
| call | the brief's call to action | read time plus a hold |

For every beat write two lines in the manifest: `shows` (what is literally on
screen) and `means` (what the viewer now understands). If two beats `mean`
the same thing, cut one. If a beat's `means` is "the product has feature X",
rewrite it as what X changes for the protagonist.

The **signature moment** is the one beat a viewer would describe to a
friend. It belongs to the turn or the payoff, it gets the most craft, and it
shows something only this product can claim. Plan it first; build the rest
around it.

## 5. Choose the mode

Show the product as it really is when its screens are the wow; recreate it
in motion when its value happens over time or out of sight. Say which, and
why, in `arc.mode` and `arc.modeWhy`.

- **captured**: the UI itself is impressive and public (design tools,
  dashboards, visual editors, consumer apps). Most beats use captured footage,
  moved with `screen-recording`'s camera.
- **animated**: the product is a CLI, an API, an agent, infrastructure, or
  behind a login; or the value is a process (a run, a sync, a pipeline).
  Recreate the flow with snapcn's motion components: `prompt-send`,
  `search-typing`, `agent-steps`, `terminal-simulator`, `answer-stream`,
  `status-cycle`, `check-cycle`, `cursor-track`, `phone-frame`, `laptop-frame`.
  Every command, label, and number inside a recreation is the product's real
  one, quoted from a captured page or the brief.
- **hybrid** (the usual choice): the story is animated, and the real product
  appears where it proves the claim, typically in the proof beat or as the
  final frame of the payoff.

Never invent UI the product does not have. A recreation simplifies the real
thing; it never adds to it.

## 6. Tone

Match the product's own voice. A product whose site has characters,
illustrations, or jokes can carry a playful video (snapcn `vibe: playful`,
`social`); a security or finance product carries a calm, exact one
(`premium`, `clean`). Capture the brand's illustrations, mascots, and logo
(`selector` shots) and animate them. They are the cheapest way to make a
video feel like this product and nothing else.

## 7. Voice

Written lines are where the model's default voice shows. The gate rejects the
worst of it in `written` copy; this list is the rest. Never:

- **Antithesis on rails**: "not X but Y", "it's not X, it's Y", "great at X and
  bad at Y", "Models are generalists. Projects are not."
- **Parallel pairs**: "same model, same budget", "one command, one result".
- **Taglines that end the thought for the viewer**: "X can be boring again",
  "the way it should be", "finally".
- **Openers**: "Introducing", "Meet X", "What if", "Imagine", "Say hello to".
- **Puffery**: seamless, effortless, supercharge, unlock, elevate, unleash,
  game-changing, next-level, reimagined, empower, "the power of", "the future
  of", "built for teams".
- **Rule of three**: three adjectives or three-word stacks ("Fast. Simple.
  Powerful.").
- **Em or en dashes** anywhere on screen.

Instead: a written line names a thing the viewer can picture (a file, a
command, a person, a number from the site), uses the product's own words where
they are good, and is short enough to read in its beat. If a line would still
be true with another product's name in it, rewrite it.

**The close** shows the brief's call to action word for word, with the
product's URL when the call does not contain it, and nothing else that
competes: no tagline, no second ask, no logo-only end card. It follows from
the proposition: the viewer should know why this ask is the next step after
what they just saw. Hold it long enough to read twice.

## Anchor: a tour (launch format)

The product: Driftcheck (fictional), a CLI that catches config drift between
staging and production before a deploy.

| Beat | shows | means |
|---|---|---|
| hook | "Deploys should be boring." | deploys are risky |
| name | the name beside the homepage screenshot | this is Driftcheck |
| features | the features page, zooming between three cards | it has features |
| docs | the docs page, then a config reference table | it has docs |
| proof | "3x fewer rollbacks" beside a chart | it is better |
| call | the install command | install it |

It can pass every gate check and nobody would share it. The `means` column
is a list of facts about the website. No protagonist, nothing at stake, no
moment, and the turn never happens on screen: we are told it helps and shown
web pages.

## Anchor: a story (launch format, the same product, same facts)

Insight: the outage is always a setting someone changed in one environment
and not the other. Device: before / after, the same Friday deploy twice.
Mode: hybrid. Protagonist: an engineer shipping at 5pm.

| Act | shows | means |
|---|---|---|
| hook | a terminal: `deploy prod` typed, the clock at 4:58pm (`terminal-simulator`) | we know how this ends |
| tension | the deploy goes green, then alerts stack up; a diff of two env files with one line different (`status-cycle`, `text-highlight`) | one drifted value took prod down |
| turn | rewind; same command, Driftcheck runs first and stops on that exact line (`terminal-simulator` with the product's real output format) | it catches the thing that bit you |
| payoff (signature) | the fix lands, the deploy goes green and stays green, the clock reads 5:01 (`check-cycle`) | Friday deploys can be boring again |
| proof | the real dashboard listing environments in sync (captured, one camera push) | it is real and you can see your drift |
| call | the brief's call to action and the URL | the next step |

Same facts, same site. The difference is a protagonist, a before the viewer
feels, and a turn they watch happen.

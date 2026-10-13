# manifest.json

The manifest declares the video before it is built: the arc, the beats, their
timing, and every line of copy with where it came from. The gate checks the
video against it, so a beat or a line cannot quietly disappear. It is the
compact form of `story.md`.

```json
{
  "version": 2,
  "product": "Driftcheck",
  "url": "https://driftcheck.dev",
  "accent": "#F97316",
  "durationSeconds": 24,
  "arc": {
    "audience": "platform engineers at 20 to 200 person startups who deploy daily",
    "insight": "the outage is always a setting someone changed in one environment and not the other",
    "proposition": "Driftcheck stops the deploy on the line that would have broken prod",
    "protagonist": "an engineer shipping at 5pm on a Friday",
    "device": "before / after: the same deploy twice",
    "tone": "dry, calm, a little funny; terminal-first",
    "mode": "hybrid",
    "modeWhy": "the product is a CLI, so the flow is animated; the dashboard is public and proves it",
    "signature": "catch"
  },
  "beats": [
    { "id": "hook", "act": "hook", "start": 0, "end": 3, "ui": false, "shots": [],
      "shows": "deploy prod typed in a terminal, the clock at 4:58pm", "means": "we know how this ends",
      "copy": [{ "text": "deploy prod", "source": "site:docs" }] },
    { "id": "outage", "act": "tension", "start": 3, "end": 8, "ui": false, "shots": [],
      "shows": "alerts stack up; two env files with one line highlighted", "means": "one drifted value took prod down",
      "copy": [{ "text": "Friday afternoon.", "source": "written" }] },
    { "id": "catch", "act": "turn", "start": 8, "end": 15, "ui": false, "shots": [],
      "shows": "rewind; the same command, Driftcheck stops on that exact line", "means": "it catches the thing that bit you",
      "copy": [{ "text": "Driftcheck", "source": "site:home" }, { "text": "Drift found before deploy.", "source": "site:docs" }] },
    { "id": "dashboard", "act": "proof", "start": 15, "end": 20, "ui": true, "shots": ["environments"],
      "shows": "the real dashboard, every environment in sync", "means": "it is real",
      "copy": [] },
    { "id": "call", "act": "call", "start": 20, "end": 24, "ui": false, "shots": [],
      "shows": "the install command typed, the URL", "means": "one command",
      "copy": [{ "text": "brew install driftcheck", "source": "site:docs" }] }
  ]
}
```

(The clock in the hook is a prop of the terminal scene, not copy: it is under
20px. A large clock would need a source or a written line without digits.)

## Fields

- `accent`: the one accent colour, `#rrggbb`, from the product's UI.
- `durationSeconds`: 12 to 60, equal to the last beat's `end` and to the
  composition length.
- `arc`: every field filled. `mode` is `animated`, `captured`, or `hybrid`
  (`references/story.md` §5). `signature` is the id of a `turn` or `payoff`
  beat.
- `beats`: contiguous, starting at 0. `act` is `hook`, `tension`, `turn`,
  `payoff`, `proof`, or `call`, in that order (an act may repeat). The first
  beat is the hook and the last the call; there is at least one tension and
  one turn, and the turn starts before half the runtime.
- `shows`: what is literally on screen. `means`: what the viewer understands
  after it. Both required.
- `ui: true` means the beat shows captured footage filling at least 20% of
  the frame for at least half the beat. `shots` names the capture ids it
  shows; each must appear on screen in the beat. `captured` and `hybrid`
  videos have at least one `ui` beat; `animated` videos may have none.
- `copy`: every line the viewer reads in the beat, including a component's
  eyebrow ("Introducing") and text inside animated recreations. Large text on
  screen that is not declared here (or on a captured page) fails the gate.

## Copy sources

| `source` | Meaning | Checked |
|---|---|---|
| `"site:<shot id>"` | the product's own words, from a captured page | the line must be in `capture/text/<id>.txt` (case and punctuation ignored) |
| `"brief"` | words the user supplied | the line must be in `brief.md` |
| `"written"` | your hook, story, or transition line | may not contain a digit |

Numbers are never written. A metric, price, count, version, or date comes
from a captured page or the brief.

## Timing

A line needs `0.6 + 0.3 x words` seconds on screen. The gate checks the sum
for each beat before rendering, and the real on-screen time after.

With a `TransitionSeries`, sequence `i` starts at the sum of the earlier
sequences minus the earlier transitions. Put a beat boundary at the middle of
its transition. Example with 12-frame transitions and sequences of 94, 170,
and 150 frames: boundaries at 88 and 246 frames, total 390 frames (13.0s).

# manifest.json

The manifest declares the video before it is built: the story, the beats,
their timing, and every line of copy with where it came from. The gate checks
the video against it, so a beat or a line cannot quietly disappear.

```json
{
  "version": 1,
  "product": "Acme",
  "url": "https://acme.com",
  "story": "Finance teams lose a week to reconciliation; Acme matches every invoice as it lands; 500 teams close in a day; start free at acme.com.",
  "accent": "#F97316",
  "durationSeconds": 24,
  "beats": [
    { "id": "hook", "kind": "hook", "start": 0, "end": 3, "ui": false, "shots": [],
      "copy": [{ "text": "Month end takes a week.", "source": "written" }] },
    { "id": "name", "kind": "name", "start": 3, "end": 8, "ui": false, "shots": [],
      "copy": [{ "text": "Acme", "source": "site:home" },
               { "text": "Billing that reconciles itself.", "source": "site:home" }] },
    { "id": "matching", "kind": "product", "start": 8, "end": 16, "ui": true, "shots": ["invoices", "match"],
      "copy": [{ "text": "Every invoice, matched.", "source": "written" }] },
    { "id": "proof", "kind": "proof", "start": 16, "end": 20, "ui": false, "shots": [],
      "copy": [{ "text": "500 teams", "source": "site:customers" }] },
    { "id": "cta", "kind": "cta", "start": 20, "end": 24, "ui": false, "shots": [],
      "copy": [{ "text": "acme.com", "source": "site:home" }] }
  ]
}
```

## Fields

- `story`: the one-line test, written out. If it reads as a list of
  features, the video will too.
- `accent`: the one accent colour, `#rrggbb`. Take it from the product's UI.
- `durationSeconds`: 12 to 60, equal to the last beat's `end` and to the
  composition length.
- `beats`: contiguous, starting at 0. `kind` is `hook`, `name`, `product`,
  `feature`, `proof`, or `cta`. The first beat is the hook; the last is the
  `cta` or the `name`. At least one `product` beat has `ui: true`.
- `ui: true` means the beat shows captured product UI filling at least 20%
  of the frame for at least half the beat. `shots` names the capture ids it
  shows; each must appear on screen in the beat.
- `copy`: every line the viewer reads in the beat, including a component's
  eyebrow ("Introducing") and the text inside simulated UI. Large text on
  screen that is not declared here (or on a captured page) fails the gate.

## Copy sources

| `source` | Meaning | Checked |
|---|---|---|
| `"site:<shot id>"` | the product's own words, from a captured page | the line must be in `capture/text/<id>.txt` (case and punctuation ignored) |
| `"brief"` | words the user supplied | the line must be in `brief.md` |
| `"written"` | your hook, positioning, or transition line | may not contain a digit |

Numbers are never written. A metric, price, count, version, or date comes
from a captured page or the brief.

## Timing

A line needs `0.6 + 0.3 x words` seconds on screen. The gate checks the sum
for each beat before rendering, and the real on-screen time after.

With a `TransitionSeries`, sequence `i` starts at the sum of the earlier
sequences minus the earlier transitions. Put a beat boundary at the middle of
its transition. Example with 12-frame transitions and sequences of 94, 170,
and 150 frames: boundaries at 88 and 246 frames, total 390 frames (13.0s).

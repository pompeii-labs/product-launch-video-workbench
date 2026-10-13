---
name: launch-video-workflow
description: The bench's method for a product launch video - classify the task, capture the live product, write the beat manifest, the storyboard milestone, compose with snapcn, the lvcheck gate loop, the rubric look, and the report. Load at the start of every task.
---

# Launch video workflow

## 1. Classify

| Task | Signal | Bar |
|------|--------|-----|
| New video | no `video/` project, or "make a launch video" | capture, manifest, storyboard, full build, final gate |
| Storyboard only | "storyboard first", "check the direction", "don't render yet" | capture, manifest, storyboard gate, then stop and report |
| Revision | `video/` exists; "change", "shorter", "swap the hook" | read `manifest.json`, `gate.json`, `video/README.md`; change only what was asked; final gate |

A storyboard-only run ends after step 5. The orchestrator reviews
`storyboard.png` and continues the session with approval or changes.

## 2. Brief

`lvnew`, then write `video/brief.md`: the task text verbatim, plus any copy
or facts the user supplied, verbatim. Copy sourced `"brief"` in the manifest
must appear in it. Never paraphrase into it.

## 3. Capture

Plan the shots before writing a beat: `references/capture.md` says what to
capture and how. Fill `video/capture/plan.json`, run `lvcapture`, and open
`video/capture/sheet.png`. Recapture a weak shot with `--only <id>`.
Supplied screenshots or recordings go in with `lvcapture --import`.

Read the captured text (`capture/text/<id>.txt`) for the product's own
words: its name as written, its headline, its real numbers.

## 4. Manifest

Write `video/manifest.json` (format and rules: `references/manifest.md`).
Start from the story, one sentence that passes snapcn's one-line test
(`snapcn/references/anatomy.md` §3): "X has problem Y; here's the product
solving it, here's proof, here's how to get it." Then the beats, each mapped
to a snapcn component (`snapcn/references/archetypes/product-demo.md`,
`snapcn/references/components/index.md`) and budgeted to its natural length.

Give the moment only this product can deliver the most screen time. Do not
spread the runtime evenly across features.

## 5. Storyboard milestone

`lvcheck --storyboard` renders the `lvnew` skeleton: one card per beat with
its first copy line and shot. Open `video/storyboard.png` and judge the
story against the Story axis of `references/rubric.md` before any motion
work. A weak story does not get better with animation. Fix the manifest and
rerun until the storyboard tells the story in six frames.

## 6. Compose

`lvadd` the components the manifest names. Read each installed source's props
interface before using it. Replace the skeleton in `src/LaunchVideo.tsx` with
one `<TransitionSeries>`, one sequence per beat (worked example:
`remotion-launch-video` §4). Follow the field rules in the bench
instructions: explicit backgrounds, natural lengths, slide transitions,
loaded fonts. Remotion rules: `references/remotion.md`.

Keep the manifest true as you compose: when a beat's timing or copy changes
in code, change it in the manifest in the same step.

Keep the runner's todo list current, one item per step of this workflow;
progress bars are drawn from it.

## 7. Gate, look, fix

```
lvcheck            # draft: about 30 seconds
```

Read every FAIL line; each names the beat, the text, and the time. Then open
`gate/runs/<run>/contact.png`, and the filmstrip of every beat you changed.
Score the video against `references/rubric.md`. A PASS with a rubric
automatic failure is a defect: fix it and gate again.

Fix the cause, not the check (`references/gate.md` lists the cheats). Edit
and gate in separate commands. Budget: four more draft gates after the first,
two attempts per failure.

## 8. Final

```
lvcheck --final    # 1920x1080 deliverable, copied to the outbox
```

Open its contact sheet once more. Then write `video/README.md` for the next
agent: the story in one line, a table of beats (time, component, file and
line, copy), how to change the copy, the accent, and the timing, how to
re-gate (`lvcheck`, `lvcheck --final`), and that `node_modules` must be
reinstalled (`rm node_modules && npm ci`) on another machine. Remotion needs
a company license for companies of four or more people
(https://www.remotion.dev/license); say so in the README.

## 9. Report

Lead with the result: where the video is, its length, and whether the final
gate passed (run id). Then the story line; the beats with what each shows;
the rubric scores, one line of evidence each; what was captured and from
where; any fact or asset that was missing and the choice you made; what
remains weak or unverified. Failures first when anything failed.

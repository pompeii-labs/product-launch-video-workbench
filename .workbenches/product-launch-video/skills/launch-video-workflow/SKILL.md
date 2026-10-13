---
name: launch-video-workflow
description: The bench's method for a product launch video - classify the task, understand the product and audience, write story.md and the arc, capture, the storyboard milestone, compose with snapcn, the lvcheck gate loop, the rubric look, and the report. Load at the start of every task.
---

# Launch video workflow

## 1. Classify

| Task | Signal | Bar |
|------|--------|-----|
| New video | no `video/` project, or "make a launch video" | understand, story, storyboard, full build, final gate |
| Storyboard only | "storyboard first", "check the direction", "don't render yet" | understand, story, storyboard gate, then stop and report |
| Revision | `video/` exists; "change", "shorter", "swap the hook" | read `story.md`, `manifest.json`, `gate.json`, `video/README.md`; change only what was asked; final gate |

A storyboard-only run ends after step 6. The orchestrator reviews
`storyboard.png` and `story.md` and continues the session.

## 2. Brief

`lvnew`, then write `video/brief.md`: the task text verbatim, plus any copy
or facts the user supplied, verbatim. Copy sourced `"brief"` in the manifest
must appear in it. Never paraphrase into it.

## 3. Understand

This step decides the video. Spend real time here.

Fill `capture/plan.json` with `"textOnly": true` shots for four to eight
pages of the product (`references/capture.md` lists which), run
`lvcapture`, and read every `capture/text/<id>.txt`. Then write
`video/story.md` following `references/story.md` sections 1 to 6: the
product, the audience, the insight, the proposition, the arc, the mode, and
the look. Quote the product's words with their page ids.

Do not write a beat until `story.md` answers "the old way" and "the turn".

## 4. Footage

Now capture what the arc needs to show, and only that: brand art (logo,
illustrations, mascots) for animated beats, and the real screens that prove
the claim (`references/capture.md`). Open `capture/sheet.png`; recapture
weak shots with `--only <id>`. Supplied screenshots or recordings go in with
`lvcapture --import`.

## 5. Manifest

Write `video/manifest.json` from `story.md` (format: `references/manifest.md`).
Every beat gets an act, `shows`, and `means`. Map each beat to snapcn
components (`snapcn/references/components/index.md`, the `vibe` tag matched
to the tone) and budget it to their natural lengths. The signature beat gets
the most screen time and the most craft.

## 6. Storyboard milestone

`lvcheck --storyboard` renders one card per beat: the act, what it shows,
its first line, its first shot. Open `video/storyboard.png` and read it as a
viewer would. Score it against the Story axis in `references/rubric.md` and
compare it to the two anchors at the end of `references/story.md`. If it
reads like the tour anchor, rewrite the arc, not the animation. Rerun until
the six frames tell a story with a turn.

## 7. Compose

`lvadd` the components the manifest names. Read each installed source's props
interface before using it. Replace the skeleton in `src/LaunchVideo.tsx` with
one `<TransitionSeries>`, one sequence per beat (worked example:
`remotion-launch-video` §4). Build the signature beat first and make it
good; then the rest. Follow the field rules in the bench instructions:
explicit backgrounds, natural lengths, slide transitions, loaded fonts.
Remotion rules: `references/remotion.md`.

Keep the manifest true as you compose: when a beat's timing or copy changes
in code, change it in the manifest in the same step.

Keep the runner's todo list current, one item per step of this workflow;
progress bars are drawn from it.

## 8. Gate, look, fix

```
lvcheck            # draft: about 30 seconds
```

Read every FAIL line; each names the beat, the text, and the time. Then open
`gate/runs/<run>/contact.png`, and the filmstrip of every beat you changed.
Score the video against `references/rubric.md`, strictly: quote the frame
for each score, and check every automatic failure against every frame. A
PASS with an automatic failure is a defect: fix it and gate again.

Fix the cause, not the check (`references/gate.md` lists the cheats). Edit
and gate in separate commands. Budget: four more draft gates after the first,
two attempts per failure.

## 9. Final

```
lvcheck --final    # 1920x1080 deliverable, copied to the outbox
```

Open its contact sheet once more. Then write `video/README.md` for the next
agent: the proposition and arc in two lines, a table of beats (time, act,
component, file and line, copy), how to change the copy, the accent, and the
timing, how to re-gate (`lvcheck`, `lvcheck --final`), and that
`node_modules` must be reinstalled (`rm node_modules && npm ci`) on another
machine. Remotion needs a company license for companies of four or more
people (https://www.remotion.dev/license); say so in the README.

## 10. Report

Lead with the result: where the video is, its length, and whether the final
gate passed (run id). Then the insight, the proposition, and the arc in one
line each; the beats with what each shows and means; the mode and why; the
rubric scores with the frame that justifies each; any fact or asset that was
missing and the choice you made; what remains weak or unverified. Failures
first when anything failed.

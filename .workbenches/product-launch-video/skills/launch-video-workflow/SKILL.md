---
name: launch-video-workflow
description: The bench's method for a product marketing video (launch, feature announcement, changelog, short explainer) - classify the task and format, understand the product and audience, write story.md and the arc, capture, the storyboard milestone, the music checkpoint, compose with snapcn, the lvcheck gate loop, the rubric look, and the report. Load at the start of every task.
---

# Marketing video workflow

## 1. Classify

| Task | Signal | Bar |
|------|--------|-----|
| New video | no `video/` project, or "make a video" | understand, story, storyboard, score, full build, final gate |
| Storyboard only | "storyboard first", "check the direction", "don't render yet" | understand, story, storyboard gate, then stop and report |
| Revision | `video/` exists; "change", "shorter", "swap the hook" | read `story.md`, `manifest.json`, `gate.json`, `video/README.md`; change only what was asked; final gate |

Then the format, from the brief's words, else from what is being announced:

| Format | It is about | Shape (`references/story.md` §4) |
|---|---|---|
| `launch` | a whole product, new to this audience | hook > tension > turn > payoff > proof > call |
| `feature` | one new capability of a product they may know | hook > context > reveal > demo > payoff > call |
| `changelog` | a release: two to five changes | hook > item, item... > call |
| `explainer` | how the product works, for someone deciding | hook > question > how... > payoff > call |

A storyboard-only run ends after step 6. The orchestrator reviews
`storyboard.png` and `story.md` and continues the session.

## 2. Brief

`lvnew`, then write `video/brief.md`: the task text verbatim, plus any copy
or facts the user supplied, verbatim. Copy sourced `"brief"` in the manifest
must appear in it. Never paraphrase into it.

The brief's call to action goes into `manifest.json` `cta.text` word for word.
If the brief has none, the call is the product's own primary ask from its home
page, sourced `site:`, and the report says so.

## 3. Understand

This step decides the video. Spend real time here.

Fill `capture/plan.json` with `"textOnly": true` shots for four to eight
pages of the product (`references/capture.md` lists which), run
`lvcapture`, and read every `capture/text/<id>.txt`. Then write
`video/story.md` following `references/story.md` sections 1 to 7: the
product, the audience, the insight, the proposition, the arc in the format's
shape, the mode, the look, and the voice. Quote the product's words with
their page ids.

Do not write a beat until `story.md` names the one thing this video says that
only this product could say, and its `## Retell` is one sentence with a
person in it (`references/story.md` §3: default to people).

## 4. Footage

Now capture what the arc needs to show, and only that: brand art (logo,
illustrations, mascots) for animated beats, and the real screens that prove
the claim (`references/capture.md`). Open `capture/sheet.png`; recapture
weak shots with `--only <id>`. Supplied screenshots or recordings go in with
`lvcapture --import`.

## 5. Manifest

Write `video/manifest.json` from `story.md` (format: `references/manifest.md`).
Every beat gets an act from its format, `shows`, and `means`. Map each beat to
snapcn components (`snapcn/references/components/index.md`, the `vibe` tag
matched to the tone) and budget it to their natural lengths. The signature
beat gets the most screen time and the most craft. The last beat shows the
call to action.

## 6. Storyboard milestone

`lvcheck --storyboard` renders one card per beat: the act, what it shows,
its first line, its first shot. Open `video/storyboard.png` and read it as a
viewer would. Score it against the Story and Close axes in
`references/rubric.md`. If it reads like the tour anchor or could be about
another product, rewrite the arc, not the animation. Rerun until the frames
tell this product's story.

## 7. Music checkpoint

The timing is now fixed, so the score can be briefed.

1. Write `video/music/brief.md` from the template `lvnew` created: the
   length, every moment the music must hit with its time from the manifest
   (where energy enters, the build, the reveal or turn, any held breath, the
   end card), the style, and what to avoid. The style leads with the energy and
   attitude in plain words ("funky, playful, confident"), then the genre and
   instruments that carry it; it follows the product's voice and this
   format: a changelog can be brisk, a launch can earn a build and a drop, an
   explainer stays out of the way of reading. Never a mood word alone
   ("warm", "handmade", "friendly", "uplifting", "corporate": the gate fails
   them, they came back as hold music); never vocals.
2. Ask with the question tool, once:
   - question: "Music checkpoint. The brief is at video/music/brief.md.
     Put the score at video/public/music/track.mp3 (and its analysis at
     video/music/analysis.json if you have one), then answer."
   - options: "The track is in place", "No score".
   Note the time you asked.
3. When the answer arrives, note the time. Confirm
   `video/public/music/track.mp3` exists and read `video/music/analysis.json`
   if present (tempo, beats, sections). If the answer is "No score", or the
   file is missing after the answer, stop and report.

## 8. Compose

`lvadd` the components the manifest names. Read each installed source's props
interface before using it. Replace the skeleton in `src/LaunchVideo.tsx` with
one `<TransitionSeries>`, one sequence per beat (worked example:
`remotion-launch-video` §4), and the score as one `<Audio>` beside it, cut on
a downbeat near the end card and faded over the last second
(`remotion-best-practices/rules/audio.md`). Lay out every scene by
`remotion-best-practices/rules/video-layout.md`: one focal point, reserved
slots, video-sized type. Build the signature beat first and make it good;
then the rest. Follow the field rules in the bench instructions: explicit
backgrounds, natural lengths, slide transitions, loaded fonts. Remotion rules:
`references/remotion.md`.

Keep the manifest true as you compose: when a beat's timing or copy changes
in code, change it in the manifest in the same step.

Keep the runner's todo list current, one item per step of this workflow;
progress bars are drawn from it.

## 9. Gate, look, fix

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

## 10. Final

```
lvcheck --final    # 1920x1080 deliverable, copied to the outbox
```

Open its contact sheet once more. Then write `video/README.md` for the next
agent: the format, the proposition and arc in two lines, a table of beats
(time, act, component, file and line, copy), the score (file, trim, fade),
how to change the copy, the accent, and the timing, how to re-gate (`lvcheck`,
`lvcheck --final`), and that `node_modules` must be reinstalled
(`rm node_modules && npm ci`) on another machine. Remotion needs a company
license for companies of four or more people
(https://www.remotion.dev/license); say so in the README.

## 11. Report

Lead with the result: where the video is, its length, its format, and whether
the final gate passed (run id). Then the insight, the proposition, and the arc
in one line each; the beats with what each shows and means; the mode and why;
the score (the gate's loudness numbers, where it is cut and faded); the rubric
scores with the frame that justifies each; the checkpoint times (asked,
answered); any fact or asset that was missing and the choice you made; what
remains weak or unverified. Failures first when anything failed.

# What lvcheck checks

Each run lives in `video/gate/runs/<NNN>-<mode>/` with `gate.json`, the
evidence images, and (draft and final) `probe.ndjson`, the raw layout
samples. `video/gate.json` mirrors the latest run.

## Every mode

- **Manifest**: the fields and beat rules in `manifest.md`; every arc field;
  contiguous beats; acts in order, hook first and call last, with a tension
  and a turn, the turn before half way; the signature is a turn or payoff
  beat; a `ui` beat unless the mode is `animated`; `shows` and `means` on
  every beat; each beat's copy fits its length; every copy source verifies;
  every shot exists; `brief.md` is not empty; `story.md` has its Product,
  Audience, Insight, and Arc sections; something was captured.
- **Source**: `src/lv/Probe.tsx` is byte-identical to the template and
  `src/Root.tsx` wraps the video in `<LvProbe>`. Draft and final also reject
  the `lvnew` skeleton.
- **Typecheck**: `tsc --noEmit` on the project.
- **Composition**: `LaunchVideo` is 1280x720 at 30 fps and as long as the
  manifest says.

## Draft and final

The video renders with the layout probe, which samples every third frame and
records each visible text run (box, visible box after clipping, opacity,
effective font size) and each captured shot on screen (traced from its
file, including video frames).

- **Media**: H.264, 4:2:0, the right size and length; no near-black frames
  for 0.3 seconds or more (outside the last 0.6 seconds); nothing frozen for
  2.5 seconds or more (outside a final hold of up to 3 seconds).
- **Title-safe**: text 20px or larger stays inside a 5% margin. Type larger
  than the frame (a rush past the camera) is exempt.
- **Clipped**: text 20px or larger is not cut by a container or the frame.
- **Undeclared copy**: text 20px or larger, on screen for a second, appears
  in the manifest's copy or on a captured page.
- **Readable**: each declared line is complete on screen at some point in
  its beat, and at least half of it is on screen (from its start) for
  `0.6 + 0.3 x words` seconds. Declared copy is at least 14px.
- **Footage**: each `ui` beat shows a captured shot over 20% of the frame for
  half the beat, and shows every shot it names.
- **Contrast**: each declared line, at the middle of its longest read,
  measures at least 3:1 between the text and what it sits on, from the
  rendered pixels.

Faults must persist (0.7 seconds for layout, 1 second for undeclared copy)
so entrances and exits pass.

## Cheats

Each of these turns a failure into a pass without fixing the video. All are
defects:

- Removing a line from the manifest that is still on screen, or shrinking it
  under 20px to escape the undeclared-copy rule.
- Sourcing a written line as `site:` or `brief`, or adding words to
  `brief.md`.
- Marking a beat `ui: false` because its footage is small, instead of making
  the footage bigger.
- Choosing `animated` mode to avoid capturing a product whose screens are
  public and are the point.
- Wrapping a non-captured image in a capture filename.
- Padding a beat with a frozen hold to meet a reading time instead of
  slowing the line.
- Editing the probe, the gate runs, or `Root.tsx`'s wrapper.

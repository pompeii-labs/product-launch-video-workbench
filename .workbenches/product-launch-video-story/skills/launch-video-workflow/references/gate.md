# What lvcheck checks

Each run lives in `video/gate/runs/<NNN>-<mode>/` with `gate.json`, the
evidence images, and (draft and final) `probe.ndjson`, the raw layout
samples. `video/gate.json` mirrors the latest run.

## Every mode

- **Manifest**: the fields and beat rules in `manifest.md`; every arc field;
  contiguous beats; the format's acts in order, hook first and call last,
  with the acts the format needs, the product's moment arriving in time; the
  signature in an act the format allows; the call beat showing `cta.text`;
  no stock move in written copy; in draft and final, the score at
  `public/<music.track>` and `music/brief.md` with its four sections and no
  mood word in its Style; a `ui` beat unless the mode is `animated`; `shows` and `means` on
  every beat; each beat's copy fits its length; every copy source verifies;
  every shot exists; `brief.md` is not empty; `story.md` has its Product,
  Audience, Insight, and Arc sections and a one-sentence Retell; something was captured.
- **Source**: `src/lv/Probe.tsx` is byte-identical to the template and
  `src/Root.tsx` wraps the video in `<LvProbe>`. Draft and final also reject
  the `lvnew` skeleton and any remote URL in `src/`, `components/`, or `lib/`
  (font files and the SVG namespace excepted).
- **Typecheck**: `tsc --noEmit` on the project.
- **Composition**: `LaunchVideo` is 1280x720 at 30 fps and as long as the
  manifest says.

## Draft and final

- **Audio**: the render has an audio stream. It is mastered in place (two-pass
  loudnorm to -14 LUFS, -2 dBTP target, then a -3 dBFS peak limiter, video copied untouched), then
  measured: integrated loudness within 1.5 LU of -14, true peak at most -1.0
  dBTP, no dropout of a second or more before the last two seconds, and the
  last 0.1 seconds below -18 dB (faded or ended, not chopped).

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
  in the manifest's copy or on a captured page. Undeclared ALL-CAPS labels
  below 20px are reported as warnings: cut an eyebrow over a headline; a
  label inside a recreated product UI can stay.
- **Readable**: each declared line is complete on screen at some point in
  its beat, and at least half of it is on screen (from its start) for
  `0.6 + 0.3 x words` seconds. Declared copy is at least 14px.
- **Footage**: each `ui` beat shows a captured shot over 20% of the frame for
  half the beat, and shows every shot it names.
- **Sharpness**: no captured still (screenshot, raster asset) is shown more
  than 1.25x its pixels in the 1080p deliverable, and no recording more than
  2x. SVG assets are exempt.
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
- Upscaling a capture with ffmpeg or another tool to pass the sharpness
  check: the pixels are still the small ones.
- Padding a beat with a frozen hold to meet a reading time instead of
  slowing the line.
- Editing the probe, the gate runs, or `Root.tsx`'s wrapper.
- Rewording the call to action, or moving it out of the last beat.
- Replacing, looping, or synthesizing the score the checkpoint returned, or
  muting it to pass the audio check.
- Re-sourcing a written line as `site:` to dodge the stock-move check.
- Building a remote URL from pieces, or fetching it at render time, to dodge
  the remote check: the asset is still remote.

# product-launch-video Workbench

A [Workbench](https://github.com/pompeii-labs/workbenches) that makes a 15 to 60 second product marketing video (a launch, a feature announcement, a changelog, or a short explainer) scored with music, and proves it frame by frame. It reads the product's own pages, locks the message and story arc with you, shows you a storyboard of the real scenes, then animates the product's flow with snapcn components and cuts to real footage where it proves the point.

Published on [workbenches.dev](https://workbenches.dev) as `pompeii/product-launch-video` (pending).

```sh
wb add pompeii/product-launch-video
wb run product-launch-video --dir ./my-app --task "Make a launch video for https://acme.com. Our tagline: Billing that reconciles itself."
```

Give it a live URL and the call to action, word for word. Screenshots, a screen recording, or exact copy help; it captures the rest itself.

The run stops three times, because a wrong story costs a 25-minute build to discover:

1. **Message** (a few minutes in): three options in `video/story-check.md`, each a one-sentence message, a retell, and the arc. Pick one or write your own.
2. **Storyboard** (about ten minutes later): `video/storyboard.png`, one still per beat built from the real scenes, so what you approve is what ships. Answer "Build it" or send notes; it redraws and asks again until you say build.
3. **Music**: it writes `video/music/brief.md` (length, the moments to hit, energy and style). Put an instrumental at `video/public/music/track.mp3` (any generator; a Suno take works well) and answer. It cuts the score on a downbeat, masters it to -14 LUFS, and checks it.

The result is `video/`, a Remotion project another agent can edit, with `out/launch.mp4` (1920x1080, H.264, with the score and burned-in text), the storyboard, the gate's evidence, and a README that maps every beat to its code. The MP4, contact sheet, and storyboard are also returned as run artifacts.

Rendering uses [Remotion](https://www.remotion.dev), which needs a paid company license for companies of four or more people: https://www.remotion.dev/license

## What is in the bench

```text
.workbenches/product-launch-video/
  workbench.yml
  instructions.md
  Dockerfile           Playwright 1.60 (Node 24, Chromium), ffmpeg, OpenCode, Remotion 4.0.473 prebuilt
  runner/              OpenCode model and permission configuration
  tools/bin/
    lvnew              scaffold video/: Remotion project, manifest, capture plan, storyboard skeleton, layout probe
    lvcapture          read and capture the live product with Playwright (page text, 2x screenshots, brand art as SVG or original files, recordings), or import supplied files
    lvadd              install snapcn components offline from the vendored free registry
    lvcheck            the gate: --storyboard [--frames] (seconds), draft (half scale), --final (1080p, delivered)
  tools/share/
    template/          the Remotion project lvnew copies; src/lv/Probe.tsx is the layout probe
    registry/          snapcn's free registry, vendored (MIT)
  skills/
    launch-video-workflow/   the bench method: understand, message checkpoint, capture, manifest, storyboard checkpoint, music checkpoint, compose, gate, rubric, report
    snapcn/ ...              vendored from snapcndev/snapcn (MIT): catalogue, anatomy, archetypes, motion, anti-patterns
    remotion-best-practices/ vendored from remotion-dev/skills at v4.0.473 (subset)
scripts/
  vendor-snapcn.sh     re-vendor the pinned snapcn registry and skills
```

- Runner: OpenCode. Model: Claude Opus 5.5 through OpenRouter.
- Runtime: Docker, 4 CPUs and 8 GB. No GPU; Remotion renders on the CPU.
- Music arrives through the music checkpoint; the runtime cannot generate it.

## How it is judged

`lvcheck` exit 0 is the definition of done. The agent writes `video/story.md` (product, audience, insight, arc) and declares the video in `video/manifest.json` (the arc, beats as acts with what each shows and means, timing, and every line of copy with its source). The gate checks the structure (hook, tension, turn before half way, call; a signature moment) and the render:

- copy sourced from the product's site must be on the captured page; written lines may not contain numbers
- every declared line is on screen long enough to read, and has 3:1 contrast against what it sits on, measured on rendered pixels
- no large text outside the title-safe area, clipped, or missing from the manifest
- beats that declare captured footage show it at a readable size; whether to animate or capture is the arc's call
- no black frames, no 2.5 seconds without motion, correct codec, size, and length
- the scenes are composed from snapcn components; no remote URLs in the source (fonts excepted)
- the call to action appears on the last beat, word for word from the brief
- the score is mastered to -14 LUFS, peaks under -1 dBTP, no dropouts, faded or ended at the cut; the music brief's style may not be a mood word alone

The layout probe is a React wrapper that samples every third frame during the render; the gate refuses an edited probe. After the gate, the agent must open the contact sheet and filmstrips and score the video against a rubric (story, the product moment, type and copy, motion) and two anchor storyboards: a website tour and a story with a list of automatic failures and default-taste patterns to avoid.

## Upstream

`skills/snapcn`, `skills/remotion-launch-video`, `skills/remotion-product-demo`, and `tools/share/registry/` are vendored from [snapcndev/snapcn](https://github.com/snapcndev/snapcn) (MIT); the pinned commit and the changes (docs-fetch lines pointed at the local copy, Pro sections removed) are in `skills/snapcn/NOTICE.md`. Only the free components are included.

```sh
scripts/vendor-snapcn.sh [commit]
```

## Verify locally

```sh
wb validate .#product-launch-video
wb build .#product-launch-video
wb smoke .#product-launch-video
```

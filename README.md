# product-launch-video Workbench

A [Workbench](https://github.com/pompeii-labs/workbenches) that makes a 15 to 60 second launch video for a software product from its live UI, and proves it frame by frame.

Published on [workbenches.dev](https://workbenches.dev) as `pompeii/product-launch-video` (pending).

```sh
wb add pompeii/product-launch-video
wb run product-launch-video --dir ./my-app --task "Make a launch video for https://acme.com. Our tagline: Billing that reconciles itself."
```

Give it a live URL. Screenshots, a screen recording, or exact copy help; it captures the rest itself. Ask for "storyboard first" to review the direction before it animates anything, then continue the session.

The result is `video/`, a Remotion project another agent can edit, with `out/launch.mp4` (1920x1080, H.264, silent with burned-in text), the storyboard, the gate's evidence, and a README that maps every beat to its code. The MP4, contact sheet, and storyboard are also returned as run artifacts.

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
    lvcapture          capture the live product with Playwright (2x screenshots, recordings, page text), or import supplied files
    lvadd              install snapcn components offline from the vendored free registry
    lvcheck            the gate: --storyboard (seconds), draft (half scale), --final (1080p, delivered)
  tools/share/
    template/          the Remotion project lvnew copies; src/lv/Probe.tsx is the layout probe
    registry/          snapcn's free registry, vendored (MIT)
  skills/
    launch-video-workflow/   the bench method: brief, capture, manifest, storyboard milestone, compose, gate, rubric, report
    snapcn/ ...              vendored from snapcndev/snapcn (MIT): catalogue, anatomy, archetypes, motion, anti-patterns
scripts/
  vendor-snapcn.sh     re-vendor the pinned snapcn registry and skills
```

- Runner: OpenCode. Model: Claude Opus 5.5 through OpenRouter.
- Runtime: Docker, 4 CPUs and 8 GB. No GPU; Remotion renders on the CPU.
- No audio in this version.

## How it is judged

`lvcheck` exit 0 is the definition of done. The agent declares the video up front in `video/manifest.json` (story, beats, timing, and every line of copy with its source), and the gate checks the render against it:

- copy sourced from the product's site must be on the captured page; written lines may not contain numbers
- every declared line is on screen long enough to read, and has 3:1 contrast against what it sits on, measured on rendered pixels
- no large text outside the title-safe area, clipped, or missing from the manifest
- real captured product UI fills at least 20% of the frame in every product beat and for 30% of the video
- no black frames, no 2.5 seconds without motion, correct codec, size, and length

The layout probe is a React wrapper that samples every third frame during the render; the gate refuses an edited probe. After the gate, the agent must open the contact sheet and filmstrips and score the video against a rubric (story, product as hero, type and copy, motion) with a list of automatic failures and default-taste patterns to avoid.

## Upstream

`skills/snapcn`, `skills/remotion-launch-video`, `skills/remotion-product-demo`, and `tools/share/registry/` are vendored unmodified from [snapcndev/snapcn](https://github.com/snapcndev/snapcn) (MIT); the pinned commit is in `skills/snapcn/NOTICE.md`. Only the free components are included.

```sh
scripts/vendor-snapcn.sh [commit]
```

## Verify locally

```sh
wb validate .#product-launch-video
wb build .#product-launch-video
wb smoke .#product-launch-video
```

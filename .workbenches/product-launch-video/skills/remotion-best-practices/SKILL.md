---
name: remotion-best-practices
description: Remotion's own rules for this bench's Remotion 4.0.473 - audio (the score, trimming, volume curves, fades), video-first layout and text sizes, timing and easing, sequencing, transitions, trimming, text animation, and images. Load when composing scenes, sizing type, or adding the score.
---

# Remotion best practices (4.0.473)

Remotion's official agent skill, pinned to the tag that matches this bench's Remotion
(`remotion-dev/remotion` `v4.0.473`, `packages/skills/skills/remotion`). Only the rules this
bench uses are vendored; provenance and changes are in `NOTICE.md`.

Every package these rules use is already installed: `remotion`, `@remotion/media` (the `<Audio>`
and `<Video>` components), `@remotion/transitions`, `@remotion/google-fonts`. Nothing can be
installed in this runtime: never run `npx remotion add`, `npm install`, or `create-video`.
`@remotion/light-leaks` is not installed, so its examples do not apply.

Where a rule here conflicts with `launch-video-workflow` or the bench instructions (for example
`fade()` between beats), the bench wins.

| Load | When |
|---|---|
| [rules/audio.md](rules/audio.md) | adding the score: `<Audio>`, `trimBefore`/`trimAfter`, volume curves for the fade over the end card |
| [rules/video-layout.md](rules/video-layout.md) | before laying out any scene: one focal point, slots, text sizes (scale its 1080px-wide minimums by 1280/1080 for this composition) |
| [rules/timing.md](rules/timing.md) | easing, springs, and interpolation curves |
| [rules/sequencing.md](rules/sequencing.md) | delaying, limiting, and offsetting elements |
| [rules/transitions.md](rules/transitions.md) | `TransitionSeries` mechanics |
| [rules/trimming.md](rules/trimming.md) | cutting the start or end of an animation |
| [rules/text-animations.md](rules/text-animations.md) | typewriter and word highlight patterns (examples in `rules/assets/`) |
| [rules/images.md](rules/images.md) | sizing and positioning images |

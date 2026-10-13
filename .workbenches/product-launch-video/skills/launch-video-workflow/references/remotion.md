# Remotion rules for this bench

Remotion 4.0.473. The project is 1280x720 at 30 fps; the final renders at
1.5x scale.

- Everything is a pure function of `useCurrentFrame()`. Never `Math.random()`
  (use `random(seed)` from `remotion`), `Date.now()`, `setTimeout`,
  `setInterval`, or CSS animations and transitions.
- Animate with `interpolate()` and `spring()`, always with
  `extrapolateLeft/Right: "clamp"` where a value must stop. Animate
  `transform` and `opacity`, not `top`, `left`, `width`, or `height`.
- Time inside a `<Sequence>` or `<TransitionSeries.Sequence>` restarts at 0.
- Images: `<Img src={staticFile(...)}>` (waits for load). Video:
  `<OffthreadVideo src={staticFile(...)} muted />`, or `screen-recording`.
  Never `<img>` or `<video>` directly: frames render before they load.
- Fonts: load with `loadFont()` from `@remotion/google-fonts/<Family>` at
  module scope and use the `fontFamily` it returns. snapcn's `lib/snap-cn-ui`
  font helpers do this for its families.
- `TransitionSeries`: alternate `.Sequence` and `.Transition`; transitions
  overlap their neighbours, so they shorten the total. Presentations:
  `slide({ direction })` from `@remotion/transitions/slide`, `wipe()` from
  `@remotion/transitions/wipe`, timing `linearTiming({ durationInFrames: 12 })`
  or `springTiming()`.
- Layout: `<AbsoluteFill>` stacks full-frame layers. Set a background on the
  bottom layer of every scene.
- Do not edit `remotion.config.ts`, `src/index.ts`, or the `<Composition>` in
  `src/Root.tsx` beyond what a task needs; the gate expects the id
  `LaunchVideo`, 1280x720, 30 fps, and the manifest's length.

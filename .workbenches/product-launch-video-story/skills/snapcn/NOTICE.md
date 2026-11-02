# Provenance

Vendored from https://github.com/snapcndev/snapcn at commit
`afce9f0aa8c9d464409efd1e4d4f227ca4809c04` (MIT, Copyright (c) 2026 Sri Nath (snap-cn)):

- `skills/snapcn`, `skills/remotion-launch-video`, `skills/remotion-product-demo`
- the free component registry, `public/r/*.json`, at `tools/share/registry/`

The workflow skills carry their own THIRD_PARTY_NOTICES.md for material adapted from
everyinc/product-launch-video (MIT) and heygen-com/hyperframes (Apache-2.0).
Local changes (product-launch-video 0.3.0), so the vendored text agrees with this bench:

- `remotion-launch-video/SKILL.md`: the close beat and end-card lesson use the brief's call to
  action; the worked example slides between beats instead of fading and its eyebrow is not
  "Introducing".
- `snapcn/references/anatomy.md`: the positioning and CTA rows and the outro line use the brief's
  call to action instead of "Meet Acme" and a logo-only lockup.
- `snapcn/references/archetypes/feature-announcement.md`: the "Introducing" kicker default is
  marked as banned.

Re-vendoring overwrites these; reapply them. Re-vendor with `scripts/vendor-snapcn.sh [commit]`.

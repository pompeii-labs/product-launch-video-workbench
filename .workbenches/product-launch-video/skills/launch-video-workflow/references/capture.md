# Capturing the product

What you capture decides the video. A launch video is only as convincing as
the product footage in it.

## What to capture

1. **The product doing its job, not its marketing page.** A landing page's
   hero is a poster of the product. Look for the real surface: the app, a
   public demo or playground, a docs page with live examples, a registry or
   catalogue page, a pricing calculator. Use the marketing page for the
   product's own words (name, headline, numbers), and as footage only when
   nothing else is public.
2. **One hero state**: the moment only this product delivers, fully
   populated. This gets the most screen time.
3. **Two or three workflow states** leading to it: the input, the work
   happening, the result. Each is a shot in a `product` or `feature` beat.
4. **One proof detail**: the number, badge, or result that makes the claim
   credible, cropped tight (`selector` or `clip`).
5. **Populated, never empty.** Empty states, loading spinners, skeletons, and
   lorem data read as unfinished. Navigate or interact until the screen is
   full.

Plan four to eight shots. More shots than beats is fine; footage you do not
use costs seconds.

## How to capture

`video/capture/plan.json`:

```json
{
  "url": "https://acme.com",
  "viewport": { "width": 1440, "height": 900 },
  "deviceScaleFactor": 2,
  "colorScheme": "dark",
  "hide": [".promo-bar", "#announcement"],
  "css": "",
  "shots": [
    { "id": "dashboard", "path": "/demo", "steps": [{ "waitFor": "text=Reconciled" }] },
    { "id": "match", "path": "/demo", "steps": [{ "click": "text=Invoice 1042" }, { "waitFor": ".match-panel" }], "selector": ".match-panel" },
    { "id": "search", "path": "/demo", "steps": [{ "click": "input[type=search]" }, { "type": ["input[type=search]", "unpaid over 30 days"] }, { "press": "Enter" }], "record": { "tail": 1.5 } }
  ]
}
```

- Shot fields: `id` (lowercase slug), `path` or `url`, `steps`, then one of
  `selector` (screenshot one element), `clip` (`{x, y, width, height}` in CSS
  pixels), `fullPage`, or `record` (`{ "tail": seconds }` to keep filming
  after the last step).
- Steps: `click`, `fill: [selector, text]`, `type: [selector, text]` (key by
  key, for recordings), `press`, `hover`, `scroll` (pixels or a selector),
  `waitFor`, `wait` (ms, at most 5000), each with an optional `settle` ms.
- `colorScheme` follows the product's brand; a dark product filmed light
  looks like a different product.
- `hide` removes promo bars, announcement banners, and anything else that is
  not the product. Consent banners and chat launchers are hidden already.
- Viewport 1440x900 at 2x gives footage that survives a camera push to 1.6x
  in a 1080p frame. Do not go below 1280 wide; layouts switch to tablet.

## After capturing

- Open `capture/sheet.png`. Recapture with `--only <id>` any shot that shows
  a banner, a spinner, an empty state, or the wrong page.
- A shot that failed is listed in `capture/index.json` with its error. Fix
  the selector or drop the shot; never reference a failed shot.
- Note each shot's focal point (where the eye should land, as fractions of
  width and height). That is the `x`, `y` of the camera push in
  `screen-recording`.
- Browser chrome is never in a bench screenshot. Supplied recordings usually
  have it: crop it off with `screen-recording`'s `crop` fractions.

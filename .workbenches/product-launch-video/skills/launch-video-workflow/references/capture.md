# Capturing the product

Capture serves the story in two passes: first to understand the product,
then to get the footage and art the arc needs. Never the other way round:
footage captured before the story exists becomes the story, and that story
is a tour.

## Pass 1: research (text only)

Four to eight `"textOnly": true` shots: the home page, the product or
features page, pricing, docs or a quickstart (its real commands and output
are what animated beats recreate), the latest changelog or blog post, and
any "how it works" or about page. Follow the site's own navigation; read the
links in its header and footer. If it links a GitHub repository, capture its
README page too. Everything you capture here becomes a valid copy source.

## Pass 2: footage and art

Capture only what a beat in the arc shows:

1. **Brand art**: the logo, mascots, illustrations, icons, as `"asset": true`
   shots of the element. Animated beats built from the product's own art
   look like this product and nothing else, but only at source quality:
   brand art is the centre of the frame, and a grainy logo cropped out of a
   screenshot, sitting on a rectangle of the site's background, cheapens
   everything around it.
2. **Proof screens**: the real UI where the arc says "it is real": the app,
   a public demo or playground, a dashboard, a result page. Cropped tight to
   what proves the point (`selector` or `clip`).
3. **The product's output**: a generated result, a report, a rendered page,
   a terminal output in the docs. The payoff often shows this.
4. **Populated, never empty.** Empty states, spinners, skeletons, and lorem
   data read as unfinished. Navigate or interact until the screen is full.

A marketing page's hero is a poster of the product. Use it for words and
art, and as footage only when the arc needs exactly that frame.

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
    { "id": "docs", "path": "/docs/quickstart", "textOnly": true },
    { "id": "logo", "path": "/", "selector": "header a[href='/']", "asset": true },
    { "id": "dashboard", "path": "/demo", "steps": [{ "waitFor": "text=Reconciled" }] },
    { "id": "match", "path": "/demo", "steps": [{ "click": "text=Invoice 1042" }, { "waitFor": ".match-panel" }], "selector": ".match-panel" },
    { "id": "search", "path": "/demo", "steps": [{ "click": "input[type=search]" }, { "type": ["input[type=search]", "unpaid over 30 days"] }, { "press": "Enter" }], "record": { "tail": 1.5 } }
  ]
}
```

- Shot fields: `id` (lowercase slug), `path` or `url`, `steps`, then one of
  `textOnly` (page text only), `asset` (with `selector`: brand art at source
  quality, below), `selector` (screenshot one element), `clip` (`{x, y, width, height}` in CSS
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

## Brand art: `"asset": true`

An asset shot takes the element (or its only `svg` or `img` child) at the
best quality the page has, and `capture/index.json` records which it got
(`quality`):

- `vector`: an inline `<svg>`, saved as `capture/<id>.svg` with the page's
  CSS colours, strokes, and transforms written onto it, so it renders the
  same anywhere and stays sharp at any size. Its `width` and `height` are the
  viewBox.
- `original`: an `<img>` or CSS background, saved as the site's own file
  (SVG, PNG, WebP). Check its pixel size before showing it large.
- `raster-4x`: anything else, rendered alone on a transparent background at
  4x.

Point the selector at the logo or mascot itself, not the header around it.
Show a raster no larger than its pixels allow: the gate fails any captured
still shown more than 1.25x its pixels in the 1080p deliverable. Never crop
brand art out of a screenshot; if a mark has no clean source, rebuild it
from shapes or use type instead.

## After capturing

- Open `capture/sheet.png` (PNG shots only; open each `.svg` asset on its
  own once, rendered in the composition, to check its colours). Recapture with `--only <id>` any shot that shows
  a banner, a spinner, an empty state, or the wrong page.
- A shot that failed is listed in `capture/index.json` with its error. Fix
  the selector or drop the shot; never reference a failed shot.
- Note each shot's focal point (where the eye should land, as fractions of
  width and height). That is the `x`, `y` of the camera push in
  `screen-recording`.
- Browser chrome is never in a bench screenshot. Supplied recordings usually
  have it: crop it off with `screen-recording`'s `crop` fractions.

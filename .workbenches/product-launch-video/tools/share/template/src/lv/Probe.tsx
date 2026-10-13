import React, { useLayoutEffect, useRef } from "react";
import {
  continueRender,
  delayRender,
  getInputProps,
  getRemotionEnvironment,
  useCurrentFrame,
} from "remotion";

// Layout probe for the lvcheck gate. Inert unless the gate renders with { lvProbe: true }.
// On sampled frames it measures every visible text run and every captured product shot
// (anything served from public/capture/) and logs one LVPROBE line the gate reads.
// Removing it fails the gate; it adds nothing to a normal render.

const SAMPLE_EVERY = 3; // frames: 10 samples per second at 30 fps

type Rect = { x: number; y: number; w: number; h: number };

const round = (n: number) => Math.round(n * 10) / 10;

function intersect(a: DOMRect | Rect, b: DOMRect | Rect): Rect {
  const ax = "x" in a ? a.x : 0;
  const ay = "y" in a ? a.y : 0;
  const aw = "w" in a ? a.w : (a as DOMRect).width;
  const ah = "h" in a ? a.h : (a as DOMRect).height;
  const bw = "w" in b ? b.w : (b as DOMRect).width;
  const bh = "h" in b ? b.h : (b as DOMRect).height;
  const x = Math.max(ax, b.x);
  const y = Math.max(ay, b.y);
  const r = Math.min(ax + aw, b.x + bw);
  const btm = Math.min(ay + ah, b.y + bh);
  return { x, y, w: Math.max(0, r - x), h: Math.max(0, btm - y) };
}

// Visible part of a box after every clipping ancestor up to the probe root.
function clipped(el: Element, box: Rect, root: Element): Rect {
  let r = box;
  for (let a = el.parentElement; a && a !== root; a = a.parentElement) {
    const s = getComputedStyle(a);
    if (s.overflow !== "visible" || s.overflowX !== "visible" || s.overflowY !== "visible" || s.clipPath !== "none") {
      r = intersect(r, a.getBoundingClientRect());
    }
  }
  return r;
}

function opacityOf(el: Element, root: Element): number {
  let o = 1;
  for (let a: Element | null = el; a && a !== root.parentElement; a = a.parentElement) {
    const s = getComputedStyle(a);
    if (s.visibility === "hidden" || s.display === "none") return 0;
    o *= parseFloat(s.opacity || "1");
  }
  return o;
}

// Video frames reach the page as blob: URLs. Remember which request each blob came from so a
// frame of public/capture/<shot>.mp4 is still recognised as that shot.
const blobSources = new Map<string, string>();
if (typeof window !== "undefined" && !(window as unknown as { __lvBlobs?: boolean }).__lvBlobs) {
  (window as unknown as { __lvBlobs?: boolean }).__lvBlobs = true;
  const origBlob = Response.prototype.blob;
  Response.prototype.blob = async function (this: Response) {
    const b = await origBlob.call(this);
    (b as Blob & { __lvSrc?: string }).__lvSrc = this.url;
    return b;
  };
  const origCreate = URL.createObjectURL;
  URL.createObjectURL = (obj: Blob | MediaSource) => {
    const url = origCreate.call(URL, obj);
    const src = (obj as Blob & { __lvSrc?: string }).__lvSrc;
    if (src) blobSources.set(url, src);
    return url;
  };
}

function captureSrc(el: Element): string | null {
  const raw =
    el instanceof HTMLImageElement
      ? el.currentSrc || el.src
      : el instanceof HTMLVideoElement
        ? el.currentSrc || el.src
        : getComputedStyle(el).backgroundImage;
  if (!raw || raw === "none") return null;
  let decoded = raw.startsWith("blob:") ? (blobSources.get(raw) ?? raw) : raw;
  for (let i = 0; i < 3; i++) {
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      break;
    }
  }
  const m = decoded.match(/\/capture\/([^"')?&#]+)/);
  return m ? m[1] : null;
}

function measure(root: HTMLElement, frame: number) {
  const frameBox = root.getBoundingClientRect();
  const origin = { x: frameBox.x, y: frameBox.y };
  const rel = (r: Rect | DOMRect): Rect => ({
    x: round(r.x - origin.x),
    y: round(r.y - origin.y),
    w: round("w" in r ? r.w : r.width),
    h: round("h" in r ? r.h : r.height),
  });
  const texts: Array<{ s: string; b: Rect; v: Rect; o: number; px: number }> = [];
  const media: Array<{ src: string; b: Rect; v: Rect; o: number }> = [];
  const other: Array<{ tag: string; src: string; a: number }> = []; // large media that is not a capture

  root.querySelectorAll("*").forEach((el) => {
    const src = captureSrc(el);
    if (!src && (el instanceof HTMLImageElement || el instanceof HTMLVideoElement || el instanceof HTMLCanvasElement)) {
      const r = el.getBoundingClientRect();
      const a = (r.width * r.height) / (frameBox.width * frameBox.height);
      if (a >= 0.05) other.push({ tag: el.tagName.toLowerCase(), src: ((el as HTMLImageElement).currentSrc || (el as HTMLImageElement).src || "").slice(0, 160), a: round(a) });
    }
    if (src) {
      const box = el.getBoundingClientRect();
      if (box.width > 0 && box.height > 0) {
        const vis = intersect(clipped(el, { x: box.x, y: box.y, w: box.width, h: box.height }, root), frameBox);
        media.push({ src, b: rel(box), v: rel(vis), o: round(opacityOf(el, root)) });
      }
    }
    let s = "";
    const range = document.createRange();
    let box: Rect | null = null;
    el.childNodes.forEach((n) => {
      if (n.nodeType !== Node.TEXT_NODE || !n.textContent || !n.textContent.trim()) return;
      s += n.textContent;
      range.selectNodeContents(n);
      const r = range.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      box = box
        ? {
            x: Math.min(box.x, r.x),
            y: Math.min(box.y, r.y),
            w: Math.max(box.x + box.w, r.right) - Math.min(box.x, r.x),
            h: Math.max(box.y + box.h, r.bottom) - Math.min(box.y, r.y),
          }
        : { x: r.x, y: r.y, w: r.width, h: r.height };
    });
    if (!box || !s.trim()) return;
    const o = opacityOf(el, root);
    if (o < 0.05) return;
    const html = el as HTMLElement;
    const scale = html.offsetHeight > 0 ? el.getBoundingClientRect().height / html.offsetHeight : 1;
    const px = parseFloat(getComputedStyle(el).fontSize) * (Number.isFinite(scale) && scale > 0 ? scale : 1);
    const vis = intersect(clipped(el, box, root), frameBox);
    texts.push({ s: s.replace(/\s+/g, " ").trim(), b: rel(box), v: rel(vis), o: round(o), px: round(px) });
  });

  // debug level keeps the renderer from echoing every sample to the terminal
  console.debug("LVPROBE " + JSON.stringify({ f: frame, w: round(frameBox.width), h: round(frameBox.height), t: texts, m: media, x: other }));
}

export const LvProbe: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const active = Boolean((getInputProps() as { lvProbe?: boolean }).lvProbe) && getRemotionEnvironment().isRendering;

  useLayoutEffect(() => {
    if (!active || frame % SAMPLE_EVERY !== 0 || !ref.current) return;
    const el = ref.current;
    const handle = delayRender(`lvprobe ${frame}`);
    // Measure once everything else on this frame has loaded (fonts, images, video frames:
    // every other delayRender handle cleared), before the screenshot is taken.
    const pending = () => {
      const t = (window as unknown as { remotion_delayRenderTimeouts?: Record<string, { label?: string }> }).remotion_delayRenderTimeouts ?? {};
      return Object.values(t).filter((h) => !String(h?.label ?? "").startsWith("lvprobe")).length;
    };
    const started = performance.now();
    const tick = () => {
      if (pending() > 0 && performance.now() - started < 20000) return void setTimeout(tick, 10);
      requestAnimationFrame(() => {
        try {
          measure(el, frame);
        } finally {
          continueRender(handle);
        }
      });
    };
    document.fonts.ready.then(tick);
  }, [active, frame]);

  return (
    <div ref={ref} data-lv-probe style={{ position: "absolute", inset: 0 }}>
      {children}
    </div>
  );
};

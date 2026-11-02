// lvcheck [dir] [--storyboard | --final]: the gate. Exit 0 is the only definition of done.
//
//   --storyboard  manifest, captures, typecheck, composition, and one still per beat tiled into
//                 storyboard.png. Seconds, not minutes: the direction check before motion work.
//   (default)     draft: everything above, then a half-scale render with the layout probe, the
//                 media checks, and a contact sheet plus one filmstrip per beat.
//   --final       the draft checks on the deliverable: out/launch.mp4 at 1920x1080, copied with
//                 its evidence to the run outbox when it passes.
//
// Every invocation is a new numbered run under gate/runs/; gate.json mirrors the latest one.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { TEMPLATE, die, norm, projectDir, readJson, run, sha256, writeJson } from "./lib.mjs";

const W = 1280, H = 720, FPS = 30, COMPOSITION = "LaunchVideo";
const MIN_SECONDS = 12, MAX_SECONDS = 60;
const SAFE = { x0: 64, y0: 36, x1: W - 64, y1: H - 36 }; // 5% title-safe margin
const HEADLINE_PX = 20; // text this size or larger is copy the viewer reads
const MIN_COPY_PX = 14; // declared copy smaller than this is unreadable on a phone
const HOLD = 0.7; // seconds a layout fault must persist to count (entrances and exits pass)
const UNDECLARED_HOLD = 1.0;
const UI_MIN_AREA = 0.2; // a product shot counts when it fills at least 20% of the frame
const OUT_SCALE = 1920 / W; // the final deliverable is 1080p: judge sharpness at that size
// Largest upscale of a captured raster in the deliverable before it reads soft: stills (logos,
// screenshots) must hold up; recordings are filmed at 1x and blur in motion anyway.
const MAX_UPSCALE = { still: 1.25, recording: 2 };
const UPSCALE_MIN_AREA = 0.005; // ignore specks
const MIN_CONTRAST = 3; // WCAG ratio for large text, measured on rendered pixels
// The shape of each format, in order. A beat's act may repeat (two tension beats, three changelog
// items) but never goes backwards. `need` lists acts that must appear (an act listed twice must
// appear twice); `arrive` is the act that carries the product's moment and the share of the video
// it must start by; `signature` lists the acts the signature beat may belong to.
const FORMATS = {
  launch: { acts: ["hook", "tension", "turn", "payoff", "proof", "call"], need: ["tension", "turn"], arrive: ["turn", 0.5], signature: ["turn", "payoff"] },
  feature: { acts: ["hook", "context", "reveal", "demo", "payoff", "call"], need: ["reveal", "demo"], arrive: ["reveal", 0.4], signature: ["reveal", "demo", "payoff"] },
  changelog: { acts: ["hook", "item", "call"], need: ["item", "item"], arrive: ["item", 0.25], signature: ["item"] },
  explainer: { acts: ["hook", "question", "how", "payoff", "call"], need: ["question", "how"], arrive: ["how", 0.5], signature: ["how", "payoff"] },
};
// The model's default copywriting, named so a written line cannot ship it. Checked on "written"
// copy only: the product's own words and the brief are theirs to choose.
const SCENT = [
  [/[\u2014\u2013]/, "an em or en dash"],
  [/^\s*introducing\b/i, `the "Introducing" kicker`],
  [/^\s*meet\s+\S+/i, `a "Meet X" opener`],
  [/^\s*what if\b/i, `a rhetorical "What if"`],
  [/\bnot (just|only|merely)\b[^.]*\b(but|it'?s|it is)\b/i, `"not just X, but Y"`],
  [/\b(it'?s|this is|that'?s) not\b[^.]*[.,;]\s*(it'?s|this is|that'?s)\b/i, `"it's not X, it's Y"`],
  [/\bnot for (a )?lack of\b/i, `"not for lack of X"`],
  [/\bsame \w+, same \w+/i, `"same X, same Y"`],
  [/\b(are|is) not\.?\s*$/i, `a two-beat antithesis ("X are not.")`],
  [/\b(seamless(ly)?|effortless(ly)?|supercharg\w*|unleash\w*|elevat\w*|revolutioni[sz]\w*|game[- ]?chang\w*|next[- ]level|reimagin\w*|empower\w*|the power of|the future of)\b/i, "a stock marketing word"],
];
// Loudness of the delivered mix: the web and social norm, measured on the rendered file.
const LOUDNESS = { I: -14, TP: -2, LRA: 11, tolerance: 1.5, maxTP: -1.0, limit: 0.708 }; // limit: -3 dBFS sample peak, so the AAC encode stays under maxTP
const MUSIC_BRIEF_SECTIONS = ["## Length", "## Moments", "## Style", "## Avoid"];
const MODES = ["animated", "captured", "hybrid"];
const ARC_FIELDS = ["audience", "insight", "proposition", "protagonist", "device", "tone", "mode", "modeWhy", "signature"];
const STORY_SECTIONS = ["## Product", "## Audience", "## Insight", "## Arc"];
const STEP_WARN = 240;

const args = process.argv.slice(2);
const mode = args.includes("--final") ? "final" : args.includes("--storyboard") ? "storyboard" : "draft";
const project = projectDir(args.find((a) => !a.startsWith("--")));
process.chdir(project);

const runsDir = path.join(project, "gate", "runs");
fs.mkdirSync(runsDir, { recursive: true });
const runNo = fs.readdirSync(runsDir).map((d) => parseInt(d, 10)).filter(Number.isFinite).reduce((a, b) => Math.max(a, b), 0) + 1;
const runId = `${String(runNo).padStart(3, "0")}-${mode}`;
const runDir = path.join(runsDir, runId);
fs.mkdirSync(path.join(runDir, "frames"), { recursive: true });
const rel = (p) => path.relative(project, p);

process.on("uncaughtException", crash);
process.on("unhandledRejection", crash);
function crash(e) {
  const msg = String(e?.message ?? e).split("\n").slice(0, 6).join("\n");
  console.log("");
  fail("error", msg);
  finish(1);
}

const report = { run: runId, mode, ok: false, startedAt: new Date().toISOString(), steps: {}, checks: [], failures: [], warnings: [], artifacts: {} };
const t0 = Date.now();
const fail = (check, detail) => {
  report.failures.push(`${check}: ${detail}`);
  report.checks.push({ check, ok: false, detail });
};
const pass = (check, detail = "") => report.checks.push({ check, ok: true, detail });
const warn = (detail) => report.warnings.push(detail);

async function step(name, fn) {
  const s = Date.now();
  process.stdout.write(`${name.padEnd(12)} `);
  try {
    const out = await fn();
    const secs = (Date.now() - s) / 1000;
    report.steps[name] = secs;
    console.log(`${secs.toFixed(1)}s${secs > STEP_WARN ? "  (over 4 minutes: split the work or use a draft gate)" : ""}`);
    return out;
  } catch (e) {
    report.steps[name] = (Date.now() - s) / 1000;
    console.log("FAILED");
    throw e;
  }
}

const bundleDir = path.join(os.tmpdir(), `lv-bundle-${process.pid}`);

function finish(code) {
  fs.rmSync(bundleDir, { recursive: true, force: true }); // each bundle copies public/; /tmp is small
  report.ok = code === 0 && report.failures.length === 0;
  report.seconds = (Date.now() - t0) / 1000;
  writeJson(path.join(runDir, "gate.json"), report);
  writeJson(path.join(project, "gate.json"), report);
  console.log("");
  for (const f of report.failures) console.log(`FAIL  ${f}`);
  for (const w of report.warnings) console.log(`warn  ${w}`);
  for (const [k, v] of Object.entries(report.artifacts)) console.log(`look  ${k}: ${Array.isArray(v) ? v.join(", ") : v}`);
  console.log(`\n${report.ok ? "PASS" : "FAIL"} ${mode} gate run ${runId} in ${report.seconds.toFixed(0)}s (${rel(path.join(runDir, "gate.json"))})`);
  process.exit(report.ok ? 0 : 1);
}

// ---------- 1. manifest and captures ----------

const manifestFile = path.join(project, "manifest.json");
let manifest;
try {
  manifest = readJson(manifestFile);
} catch (e) {
  fail("manifest", e.message);
  finish(1);
}
report.manifestSha256 = sha256(manifestFile);

const capIndex = fs.existsSync("capture/index.json") ? readJson("capture/index.json") : { shots: [] };
const shots = new Map(capIndex.shots.filter((s) => s.ok && s.file).map((s) => [s.id, s])); // footage; text-only pages are copy sources
const shotText = (id) => {
  const f = path.join("capture", "text", `${id}.txt`);
  return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null;
};
const brief = fs.existsSync("brief.md") ? fs.readFileSync("brief.md", "utf8") : "";
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const readSeconds = (s) => 0.6 + 0.3 * words(s);

function checkManifest() {
  const m = manifest;
  const errs = [];
  if (m.version !== 3) errs.push("version must be 3");
  if (typeof m.product !== "string" || !m.product.trim()) errs.push(`"product" is empty`);
  const fmt = FORMATS[m.format];
  if (!fmt) errs.push(`"format" must be one of ${Object.keys(FORMATS).join(", ")}`);
  const ACTS = fmt?.acts ?? [];
  const cta = m.cta?.text ?? "";
  if (!cta.trim()) errs.push(`cta.text is empty; the call to action comes from the brief, word for word`);
  else if (!norm(brief).includes(norm(cta)) && !capIndex.shots.some((s) => norm(shotText(s.id) ?? "").includes(norm(cta))))
    errs.push(`cta.text "${cta}" is not in brief.md or on a captured page; the call to action is the brief's (else the product's own), never written`);
  const track = m.music?.track ?? "";
  if (!/^music\/[A-Za-z0-9._-]+\.(mp3|wav|m4a|aac)$/.test(track)) errs.push(`music.track must name the score under public/, e.g. "music/track.mp3"`);
  else if (mode !== "storyboard") {
    if (!fs.existsSync(path.join("public", track))) errs.push(`public/${track} does not exist; the score arrives through the music checkpoint before composing`);
    const mb = fs.existsSync("music/brief.md") ? fs.readFileSync("music/brief.md", "utf8") : "";
    if (!mb.trim()) errs.push("music/brief.md is missing; write the music brief before asking for the score");
    else for (const h of MUSIC_BRIEF_SECTIONS) if (!mb.includes(h)) errs.push(`music/brief.md lacks "${h}"`);
  }
  const arc = m.arc ?? {};
  for (const k of ARC_FIELDS) if (typeof arc[k] !== "string" || !arc[k].trim()) errs.push(`arc.${k} is empty`);
  if (arc.mode && !MODES.includes(arc.mode)) errs.push(`arc.mode must be one of ${MODES.join(", ")}`);
  if (!/^#[0-9a-fA-F]{6}$/.test(m.accent ?? "")) errs.push(`"accent" must be one #rrggbb colour`);
  const dur = m.durationSeconds;
  if (typeof dur !== "number" || dur < MIN_SECONDS || dur > MAX_SECONDS) errs.push(`durationSeconds must be ${MIN_SECONDS} to ${MAX_SECONDS}`);
  const beats = Array.isArray(m.beats) ? m.beats : [];
  if (beats.length < 3) errs.push("at least 3 beats");
  const ids = new Set();
  beats.forEach((b, i) => {
    const at = `beat ${b.id ?? i}`;
    if (!/^[a-z0-9-]+$/.test(b.id ?? "") || ids.has(b.id)) errs.push(`${at}: id must be a unique lowercase slug`);
    ids.add(b.id);
    if (fmt && !ACTS.includes(b.act)) errs.push(`${at}: act must be one of ${ACTS.join(", ")} for a ${m.format} video`);
    else if (i > 0 && ACTS.indexOf(b.act) < ACTS.indexOf(beats[i - 1].act)) errs.push(`${at}: act "${b.act}" comes after "${beats[i - 1].act}"; the arc runs ${ACTS.join(" > ")}`);
    for (const k of ["shows", "means"]) if (typeof b[k] !== "string" || !b[k].trim()) errs.push(`${at}: "${k}" is empty (what the viewer sees, and what they understand after it)`);
    if (typeof b.start !== "number" || typeof b.end !== "number" || b.end <= b.start) errs.push(`${at}: needs numeric start < end`);
    const expected = i === 0 ? 0 : beats[i - 1].end;
    if (Math.abs(b.start - expected) > 0.05) errs.push(`${at}: starts at ${b.start}s, expected ${expected}s (beats are contiguous)`);
    if (!Array.isArray(b.copy)) errs.push(`${at}: copy must be a list`);
    if (b.ui && !(Array.isArray(b.shots) && b.shots.length)) errs.push(`${at}: ui beat names no shots`);
    for (const id of b.shots ?? []) if (!shots.has(id)) errs.push(`${at}: shot "${id}" is not a captured or imported shot`);
    let budget = 0;
    for (const c of b.copy ?? []) {
      if (!c.text?.trim()) {
        errs.push(`${at}: empty copy line`);
        continue;
      }
      budget += readSeconds(c.text);
      const src = c.source ?? "";
      if (src === "written") {
        if (/\d/.test(c.text)) errs.push(`${at}: "${c.text}" has a number but is sourced "written"; numbers come from the site or the brief`);
        for (const [re, what] of SCENT) if (re.test(c.text)) errs.push(`${at}: "${c.text}" uses ${what}; say the specific thing this product does instead`);
      } else if (src === "brief") {
        if (!norm(brief).includes(norm(c.text))) errs.push(`${at}: "${c.text}" is sourced "brief" but brief.md does not contain it`);
      } else if (src.startsWith("site:")) {
        const t = shotText(src.slice(5));
        if (t === null) errs.push(`${at}: "${c.text}" cites ${src}, which has no captured text`);
        else if (!norm(t).includes(norm(c.text))) errs.push(`${at}: "${c.text}" is not on the page captured as ${src}`);
      } else errs.push(`${at}: copy source must be "written", "brief", or "site:<shot id>"`);
    }
    if (b.end > b.start && budget > b.end - b.start + 0.5) errs.push(`${at}: its copy needs ${budget.toFixed(1)}s to read in a ${(b.end - b.start).toFixed(1)}s beat; cut words or lengthen the beat`);
  });
  if (beats.length && fmt) {
    if (beats[0].act !== "hook") errs.push("the first beat must be the hook");
    if (beats.at(-1).act !== "call") errs.push("the last beat must be the call");
    for (const act of new Set(fmt.need)) {
      const want = fmt.need.filter((a) => a === act).length;
      const have = beats.filter((b) => b.act === act).length;
      if (have < want) errs.push(`a ${m.format} video needs ${want > 1 ? `${want} ` : "a "}${act} beat${want > 1 ? "s" : ""}, it has ${have} (shape: ${ACTS.join(" > ")})`);
    }
    const [arriveAct, arriveBy] = fmt.arrive;
    const first = beats.find((b) => b.act === arriveAct);
    if (first && first.start > dur * arriveBy) errs.push(`the ${arriveAct} starts at ${first.start}s; in a ${m.format} video the product's moment must arrive by ${(dur * arriveBy).toFixed(1)}s`);
    const sig = beats.find((b) => b.id === arc.signature);
    if (arc.signature && !sig) errs.push(`arc.signature "${arc.signature}" is not a beat id`);
    else if (sig && !fmt.signature.includes(sig.act)) errs.push(`the signature beat "${sig.id}" must be a ${fmt.signature.join(" or ")} beat in a ${m.format} video`);
    const call = beats.at(-1);
    if (cta.trim() && !norm((call.copy ?? []).map((c) => c.text).join(" ")).includes(norm(cta))) errs.push(`the call beat does not show the brief's call to action "${cta}" (it may span several copy lines, sourced "brief")`);
    if (arc.mode && arc.mode !== "animated" && !beats.some((b) => b.ui)) errs.push(`mode "${arc.mode}" needs at least one beat with ui: true showing captured footage`);
    if (Math.abs(beats.at(-1).end - dur) > 0.05) errs.push(`beats end at ${beats.at(-1).end}s but durationSeconds is ${dur}`);
  }
  if (!brief.trim()) errs.push("brief.md is missing or empty; it holds the task brief verbatim");
  const story = fs.existsSync("story.md") ? fs.readFileSync("story.md", "utf8") : "";
  const templateStory = fs.readFileSync(path.join(TEMPLATE, "story.md"), "utf8");
  const section = (h) => {
    const i = story.indexOf(h);
    if (i < 0) return null;
    const rest = story.slice(i + h.length);
    const next = rest.search(/\n## /);
    return next < 0 ? rest : rest.slice(0, next);
  };
  if (!story.trim() || story === templateStory) errs.push("story.md is still the template; write the creative brief before the manifest");
  else
    for (const h of STORY_SECTIONS) {
      const body = section(h);
      if (body === null) errs.push(`story.md lacks "${h}"`);
      else if (words(body) < 25 || templateStory.includes(body.trim())) errs.push(`story.md "${h}" is not written yet (25 words at least)`);
    }
  if (capIndex.shots.length === 0) errs.push("nothing captured or imported (capture/index.json); research the product's pages first");
  for (const s of capIndex.shots.filter((s) => !s.ok)) warn(`capture "${s.id}" failed: ${s.error}`);
  if (errs.length) errs.forEach((e) => fail("manifest", e));
  else pass("manifest", `${m.format}, ${beats.length} beats, ${dur}s, ${arc.mode}, ${shots.size} shots`);
}

function checkSource() {
  const probe = path.join("src", "lv", "Probe.tsx");
  if (!fs.existsSync(probe) || sha256(probe) !== sha256(path.join(TEMPLATE, "src", "lv", "Probe.tsx"))) fail("probe", "src/lv/Probe.tsx is missing or edited; restore it from the template");
  const root = fs.existsSync("src/Root.tsx") ? fs.readFileSync("src/Root.tsx", "utf8") : "";
  if (!root.includes("<LvProbe>")) fail("probe", "src/Root.tsx no longer wraps the video in <LvProbe>");
  if (mode !== "storyboard" && fs.readFileSync("src/LaunchVideo.tsx", "utf8").includes("STORYBOARD SKELETON")) fail("skeleton", "src/LaunchVideo.tsx is still the lvnew storyboard skeleton");
  if (mode !== "storyboard") checkRemote();
}

// Every asset in the video is local. Vendored components ship remote default media
// (snapcn showcase images, picsum) that render into the video when a prop is missed, and a
// remote asset is a network call at render time. Font files and the SVG namespace are allowed.
const REMOTE_OK = [/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, /^https:\/\/cdn\.jsdelivr\.net\/npm\/@fontsource\//, /^http:\/\/www\.w3\.org\//];
function checkRemote() {
  const files = [];
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(tsx?|jsx?|mjs|css)$/.test(e.name)) files.push(p);
    }
  };
  for (const d of ["src", "components", "lib"]) walk(d);
  for (const f of files) {
    fs.readFileSync(f, "utf8").split("\n").forEach((line, i) => {
      for (const m of line.matchAll(/["'`(](https?:\/\/[^"'`)\s]+)/g)) {
        if (REMOTE_OK.some((r) => r.test(m[1]))) continue;
        fail("remote", `${f}:${i + 1} loads ${m[1].slice(0, 80)}; put the asset under public/ and pass it as a prop, and delete the remote default from the installed source`);
      }
    });
  }
}

await step("manifest", async () => {
  checkManifest();
  checkSource();
});
if (report.failures.length) finish(1);

// ---------- 2. typecheck, bundle, composition ----------

await step("typecheck", async () => {
  const r = run(path.join("node_modules", ".bin", "tsc"), ["--noEmit", "-p", "."]);
  if (r.status !== 0) fail("typecheck", "\n" + (r.stdout + r.stderr).trim().split("\n").slice(0, 30).join("\n"));
  else pass("typecheck");
});
if (report.failures.length) finish(1);

const req = createRequire(path.join(project, "package.json"));
const { bundle } = await import(pathToFileURL(req.resolve("@remotion/bundler")).href);
const renderer = await import(pathToFileURL(req.resolve("@remotion/renderer")).href);
const browserExecutable = process.env.LV_BROWSER || null;
const chromiumOptions = { gl: "swangle" };
const concurrency = "100%"; // Remotion counts cgroup-limited cores; os.cpus() reports the host

const serveUrl = await step("bundle", () =>
  bundle({
    entryPoint: path.join(project, "src", "index.ts"),
    publicDir: path.join(project, "public"),
    enableCaching: false,
    outDir: bundleDir,
    webpackOverride: (c) => ({ ...c, resolve: { ...c.resolve, alias: { ...(c.resolve?.alias ?? {}), "@": project } } }),
  }),
);

const probeLogs = [];
const onBrowserLog = (log) => {
  if (log.text.startsWith("LVPROBE ")) probeLogs.push(log.text.slice(8));
  else if (log.type === "error") warn(`browser error: ${log.text.slice(0, 200)}`);
};
const inputProps = { lvProbe: true };

const composition = await step("composition", async () => {
  const c = await renderer.selectComposition({ serveUrl, id: COMPOSITION, inputProps, browserExecutable, chromiumOptions, logLevel: "error" });
  const want = Math.round(manifest.durationSeconds * FPS);
  if (c.width !== W || c.height !== H) fail("composition", `canvas is ${c.width}x${c.height}; snapcn components are laid out for ${W}x${H}`);
  if (c.fps !== FPS) fail("composition", `fps is ${c.fps}, must be ${FPS}`);
  if (c.durationInFrames !== want) fail("composition", `${c.durationInFrames} frames, manifest says ${want}`);
  if (!report.failures.length) pass("composition", `${COMPOSITION} ${c.width}x${c.height} ${c.fps}fps ${c.durationInFrames} frames`);
  return c;
});
if (report.failures.length) finish(1);

const beats = manifest.beats;
const FONT = ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/System/Library/Fonts/Supplemental/Arial.ttf"].find((f) => fs.existsSync(f));
const label = (s) => s.replace(/[^A-Za-z0-9 .\-]/g, " ");

// Pad a frame with a caption strip so a tiled sheet names every tile.
function captioned(src, dest, caption, width) {
  const vf = [`scale=${width}:-2`, "pad=iw:ih+30:0:30:color=0x111111"];
  if (FONT) vf.push(`drawtext=fontfile=${FONT}:text='${label(caption)}':x=10:y=7:fontsize=16:fontcolor=white`);
  const r = run("ffmpeg", ["-v", "error", "-y", "-i", src, "-vf", vf.join(","), dest]);
  if (r.status !== 0) throw new Error(`ffmpeg caption: ${r.stderr.trim()}`);
}

function tile(files, cols, dest) {
  if (files.length === 1) return fs.copyFileSync(files[0], dest);
  const rows = Math.ceil(files.length / cols);
  const inputs = files.flatMap((f) => ["-i", f]);
  const pads = cols * rows - files.length;
  const graph = [];
  const labels = files.map((_, i) => `[${i}:v]`);
  const [tw, th] = run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", files[0]]).stdout.trim().split(",");
  for (let i = 0; i < pads; i++) {
    graph.push(`color=c=0x111111:s=${tw}x${th}:d=1[p${i}]`);
    labels.push(`[p${i}]`);
  }
  const layout = labels.map((_, i) => `${i % cols === 0 ? "0" : Array.from({ length: i % cols }, () => "w0").join("+")}_${Math.floor(i / cols) === 0 ? "0" : Array.from({ length: Math.floor(i / cols) }, () => "h0").join("+")}`).join("|");
  graph.push(`${labels.join("")}xstack=inputs=${labels.length}:layout=${layout}`);
  const r = run("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", graph.join(";"), "-frames:v", "1", dest]);
  if (r.status !== 0) throw new Error(`ffmpeg tile: ${r.stderr.trim()}`);
}

// ---------- 3. storyboard ----------

if (mode === "storyboard") {
  await step("stills", async () => {
    const tiles = [];
    for (const [i, b] of beats.entries()) {
      const frame = Math.min(composition.durationInFrames - 1, Math.round(((b.start + b.end) / 2) * FPS));
      const raw = path.join(runDir, "frames", `beat-${i}.png`);
      await renderer.renderStill({ composition, serveUrl, output: raw, frame, scale: 0.5, inputProps: { lvProbe: false }, browserExecutable, chromiumOptions, logLevel: "error" });
      const cap = path.join(runDir, "frames", `beat-${i}-cap.png`);
      captioned(raw, cap, `${i + 1} ${b.act} ${b.id} ${b.start}-${b.end}s${b.ui ? " ui" : ""}${b.id === manifest.arc?.signature ? " signature" : ""}`, 640);
      tiles.push(cap);
    }
    const sheet = path.join(runDir, "storyboard.png");
    tile(tiles, 3, sheet);
    fs.copyFileSync(sheet, path.join(project, "storyboard.png"));
    report.artifacts.storyboard = "storyboard.png";
    pass("stills", `${tiles.length} beats`);
  });
  finish(0);
}

// ---------- 4. render with the probe ----------

const scale = mode === "final" ? 1.5 : 0.5;
const outW = W * scale, outH = H * scale;
const output = mode === "final" ? path.join(project, "out", "launch.mp4") : path.join(runDir, "draft.mp4");
fs.mkdirSync(path.dirname(output), { recursive: true });

// The renderer echoes every browser console line; the probe's samples are data, not output.
for (const stream of [process.stdout, process.stderr]) {
  const write = stream.write.bind(stream);
  stream.write = (chunk, ...rest) => (String(chunk).includes("LVPROBE") ? true : write(chunk, ...rest));
}

await step("render", async () => {
  let last = 0;
  await renderer.renderMedia({
    composition, serveUrl, codec: "h264", outputLocation: output, inputProps, scale, concurrency,
    crf: mode === "final" ? 18 : 28, pixelFormat: "yuv420p", browserExecutable, chromiumOptions, onBrowserLog,
    timeoutInMilliseconds: 60000, overwrite: true, logLevel: "error",
    onProgress: ({ progress }) => {
      if (progress - last >= 0.25) {
        last = progress;
        process.stdout.write(`${Math.round(progress * 100)}% `);
      }
    },
  });
});

// ---------- 5. master the score, then check it ----------

// The mix is mastered here, the same way on every run: two-pass loudnorm to the web norm and a
// peak limiter (loudnorm alone lets the AAC encode overshoot the true-peak ceiling), video
// copied untouched. Then the delivered file is measured: loudness, true peak, a music dropout, and
// whether the score fades or ends with the cut instead of being chopped on the last frame.
const duration = composition.durationInFrames / FPS;
await step("audio", async () => {
  const errs = [];
  const streams = JSON.parse(run("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", output]).stdout).streams;
  if (!streams.some((s) => s.codec_type === "audio")) {
    fail("audio", `the render has no audio; play the score with <Audio src={staticFile("${manifest.music?.track}")} /> in the composition`);
    return;
  }
  const L = LOUDNESS;
  const first = run("ffmpeg", ["-v", "info", "-i", output, "-vn", "-af", `loudnorm=I=${L.I}:TP=${L.TP}:LRA=${L.LRA}:print_format=json`, "-f", "null", "-"]).stderr;
  const meas = JSON.parse(first.slice(first.lastIndexOf("{"), first.lastIndexOf("}") + 1));
  const mastered = output.replace(/\.mp4$/, ".mastered.mp4");
  const af = `loudnorm=I=${L.I}:TP=${L.TP}:LRA=${L.LRA}:measured_I=${meas.input_i}:measured_TP=${meas.input_tp}:measured_LRA=${meas.input_lra}:measured_thresh=${meas.input_thresh}:offset=${meas.target_offset}:linear=true,alimiter=limit=${L.limit}:level=false:attack=5:release=50`;
  const r = run("ffmpeg", ["-v", "error", "-y", "-i", output, "-c:v", "copy", "-af", af, "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", mastered]);
  if (r.status !== 0) throw new Error(`ffmpeg master: ${r.stderr.trim()}`);
  fs.renameSync(mastered, output);

  const ebu = run("ffmpeg", ["-v", "info", "-nostats", "-i", output, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr;
  const summary = ebu.slice(ebu.lastIndexOf("Summary:"));
  const I = parseFloat(summary.match(/I:\s+(-?[\d.]+) LUFS/)?.[1]);
  const TP = parseFloat(summary.match(/Peak:\s+(-?[\d.]+|-inf) dBFS/)?.[1]);
  const LRA = parseFloat(summary.match(/LRA:\s+(-?[\d.]+) LU/)?.[1]);
  const tail = run("ffmpeg", ["-v", "info", "-sseof", "-0.1", "-i", output, "-vn", "-af", "volumedetect", "-f", "null", "-"]).stderr;
  const tailMax = parseFloat(tail.match(/max_volume:\s+(-?[\d.]+|-inf) dB/)?.[1] ?? "-inf");
  const sil = run("ffmpeg", ["-v", "info", "-i", output, "-vn", "-af", "silencedetect=noise=-50dB:d=1", "-f", "null", "-"]).stderr;
  report.audio = { lufs: I, truePeak: TP, lra: LRA, tailMaxDb: tailMax };
  if (!Number.isFinite(I) || Math.abs(I - L.I) > L.tolerance) errs.push(`integrated loudness ${I} LUFS after mastering, want ${L.I} +/- ${L.tolerance}; is the score quiet or mostly silence?`);
  if (Number.isFinite(TP) && TP > L.maxTP) errs.push(`true peak ${TP} dBTP, want at most ${L.maxTP}`);
  if (Number.isFinite(tailMax) && tailMax > -18) errs.push(`the score is still at ${tailMax} dB in the last 0.1s: it is chopped on the last frame. Fade it over the end card or end it on a section boundary`);
  for (const m of sil.matchAll(/silence_start: ([\d.]+)/g)) {
    const s = parseFloat(m[1]);
    if (s < duration - 2) errs.push(`the score drops out at ${s.toFixed(1)}s for a second or more; it must run under the whole video`);
  }
  if (errs.length) errs.forEach((e) => fail("audio", e));
  else pass("audio", `${I} LUFS, ${TP} dBTP, LRA ${LRA}, tail ${tailMax} dB`);
});

// ---------- 6. media checks ----------

const copyMoments = []; // where each declared line is first complete, for the contrast check
await step("media", async () => {
  const p = JSON.parse(run("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", output]).stdout);
  const v = p.streams.find((s) => s.codec_type === "video");
  const d = parseFloat(p.format.duration);
  report.output = { path: rel(output), sha256: sha256(output), width: v.width, height: v.height, seconds: d, bytes: Number(p.format.size) };
  const errs = [];
  if (v.codec_name !== "h264" || !["yuv420p", "yuvj420p"].includes(v.pix_fmt)) errs.push(`codec ${v.codec_name}/${v.pix_fmt}, want h264/yuv420p`);
  if (v.width !== outW || v.height !== outH) errs.push(`${v.width}x${v.height}, want ${outW}x${outH}`);
  if (v.r_frame_rate !== "30/1") errs.push(`frame rate ${v.r_frame_rate}`);
  if (Math.abs(d - duration) > 0.15) errs.push(`duration ${d.toFixed(2)}s, manifest ${duration}s`);

  const det = run("ffmpeg", ["-v", "info", "-i", output, "-vf", "blackdetect=d=0.3:pic_th=0.995:pix_th=0.08,freezedetect=n=0.003:d=2.5", "-an", "-f", "null", "-"]).stderr;
  for (const m of det.matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)) {
    const [s, e] = [parseFloat(m[1]), parseFloat(m[2])];
    if (e > 0.35 && s < duration - 0.6) errs.push(`empty black frames ${s.toFixed(1)}-${e.toFixed(1)}s`);
  }
  for (const m of det.matchAll(/freeze_start: ([\d.]+)[\s\S]*?freeze_duration: ([\d.]+)/g)) {
    const [s, len] = [parseFloat(m[1]), parseFloat(m[2])];
    if (s < duration - 3.2) errs.push(`nothing moves for ${len.toFixed(1)}s from ${s.toFixed(1)}s (dead air)`);
  }
  if (errs.length) errs.forEach((e) => fail("media", e));
  else pass("media", `${v.width}x${v.height} h264 ${d.toFixed(2)}s`);
});

// ---------- 7. layout probe checks ----------

await step("probe", async () => {
  const byFrame = new Map();
  for (const line of probeLogs) {
    try {
      const s = JSON.parse(line);
      byFrame.set(s.f, s);
    } catch {}
  }
  const samples = [...byFrame.values()].sort((a, b) => a.f - b.f);
  fs.writeFileSync(path.join(runDir, "probe.ndjson"), samples.map((x) => JSON.stringify(x)).join("\n") + "\n");
  const expected = Math.ceil(composition.durationInFrames / 3);
  if (samples.length < expected * 0.9) {
    fail("probe", `${samples.length} of ${expected} probe samples arrived; is <LvProbe> wrapping the whole video?`);
    return;
  }
  const dt = 3 / FPS;
  const area = (r) => Math.max(0, r.w) * Math.max(0, r.h);
  const declared = beats.flatMap((b) => (b.copy ?? []).map((c) => norm(c.text)));
  const declaredAll = declared.join("|");
  const siteText = capIndex.shots.map((s) => norm(shotText(s.id) ?? "")).join("|");
  const upscale = new Map(); // worst upscale per shot, for the message
  const capFiles = new Map(capIndex.shots.filter((s) => s.ok && s.file).map((s) => [path.basename(s.file), s]));
  const errs = [];

  // Faults that must persist to count, keyed by text, merged into time ranges.
  const runs = new Map();
  const mark = (kind, key, t, on) => {
    const k = `${kind}\u0000${key}`;
    const r = runs.get(k) ?? { kind, key, cur: null, worst: null };
    if (on) {
      r.cur = r.cur ?? { from: t, to: t };
      r.cur.to = t;
    } else if (r.cur) {
      const len = r.cur.to - r.cur.from + dt;
      if (!r.worst || len > r.worst.to - r.worst.from + dt) r.worst = r.cur;
      r.cur = null;
    }
    runs.set(k, r);
  };

  const uiOn = [];
  const shownShots = new Map();
  for (const s of samples) {
    const t = s.f / FPS;
    const seen = new Set();
    for (const x of s.t) {
      const key = x.s.slice(0, 80);
      const visFrac = area(x.b) > 0 ? area(x.v) / area(x.b) : 0;
      const shown = x.o >= 0.5 && visFrac > 0;
      const big = x.px >= HEADLINE_PX;
      // A small all-caps eyebrow is still copy the viewer reads: declare it (and so size it) or cut it.
      const letters = x.s.replace(/[^A-Za-z]/g, "");
      const capsLabel = letters.length >= 4 && letters === letters.toUpperCase() && x.px >= 9;
      // Type larger than the frame is texture in a camera move (announce-title's rush), not a layout fault.
      const texture = x.b.w > W * 0.9 || x.b.h > H * 0.5;
      const outside = x.b.x < SAFE.x0 - 2 || x.b.y < SAFE.y0 - 2 || x.b.x + x.b.w > SAFE.x1 + 2 || x.b.y + x.b.h > SAFE.y1 + 2;
      const n = norm(x.s);
      const faults = {
        "outside the title-safe area": shown && big && !texture && outside,
        "clipped": shown && big && !texture && visFrac < 0.9,
        "undeclared copy": x.o >= 0.5 && visFrac >= 0.9 && big && n.length >= 4 && !declaredAll.includes(n) && !siteText.includes(n),
        "small all-caps label": x.o >= 0.5 && visFrac >= 0.9 && capsLabel && !big && !declaredAll.includes(n) && !siteText.includes(n),
        "too small to read on a phone": x.o >= 0.5 && visFrac >= 0.9 && x.px < MIN_COPY_PX && n.length >= 4 && declared.some((d) => d.includes(n)),
      };
      for (const [kind, on] of Object.entries(faults)) {
        if (on) {
          mark(kind, key, t, true);
          seen.add(`${kind}\u0000${key}`);
        }
      }
    }

    let best = 0;
    const soft = new Set();
    for (const m of s.m) {
      if (m.o < 0.5) continue;
      // A raster shown larger than its pixels is soft and grainy: the low-resolution logo defect.
      const shot = capFiles.get(path.basename(m.src));
      if (shot && !shot.file.endsWith(".svg") && shot.width && area(m.v) / (W * H) >= UPSCALE_MIN_AREA) {
        const scale = Math.max(m.b.w / shot.width, m.b.h / shot.height) * OUT_SCALE;
        const max = shot.kind === "recording" ? MAX_UPSCALE.recording : MAX_UPSCALE.still;
        if (scale > max) {
          const beat = beats.find((b) => t >= b.start && t < b.end)?.id ?? "end";
          const key = `${shot.id} (${shot.width}x${shot.height}) in beat ${beat}`;
          if (!soft.has(key)) mark("upscaled", key, t, true);
          soft.add(key);
          seen.add(`upscaled\u0000${key}`);
          upscale.set(key, Math.max(upscale.get(key) ?? 0, scale));
        }
      }
      const frac = area(m.v) / (W * H);
      best = Math.max(best, frac);
      const id = path.basename(m.src).replace(/\.[a-z0-9]+$/i, "");
      if (frac >= 0.05) shownShots.set(id, [...(shownShots.get(id) ?? []), t]);
    }
    for (const [k, r] of runs) if (!seen.has(k)) mark(r.kind, r.key, t, false);
    uiOn.push({ t, on: best >= UI_MIN_AREA, best });
  }
  for (const [, r] of runs) mark(r.kind, r.key, Infinity, false);
  for (const r of runs.values()) {
    if (!r.worst) continue;
    const len = r.worst.to - r.worst.from + dt;
    const need = r.kind === "undeclared copy" ? UNDECLARED_HOLD : HOLD;
    if (len < need) continue;
    if (r.kind === "small all-caps label") warn(`"${r.key}" is a small all-caps label for ${len.toFixed(1)}s at ${r.worst.from.toFixed(1)}s: an eyebrow over a headline is the template look; cut it or make it real copy (declared, 14px or more). Inside a recreated product UI it can stay`);
    else if (r.kind === "upscaled") errs.push(`capture ${r.key} is upscaled up to ${upscale.get(r.key).toFixed(1)}x in the 1080p deliverable for ${len.toFixed(1)}s at ${r.worst.from.toFixed(1)}s; it will look soft. Use a vector or original file ("asset": true), capture at higher resolution, or show it smaller`);
    else errs.push(`"${r.key}" ${r.kind} for ${len.toFixed(1)}s at ${r.worst.from.toFixed(1)}s`);
  }

  // Declared copy must be fully on screen long enough to read, inside its beat.
  for (const b of beats) {
    const win = samples.filter((s) => s.f / FPS >= b.start - 0.5 && s.f / FPS <= b.end + 0.5);
    // A line counts as being read while at least half of it is on screen from its start (a typed
    // or word-by-word reveal is read as it lands), and it must also be complete at some point.
    for (const c of b.copy ?? []) {
      const want = norm(c.text);
      let best = 0, cur = 0, complete = false, bestMid = 0;
      const completes = [];
      for (const s of win) {
        const vis = s.t.filter((x) => x.o >= 0.5 && area(x.b) > 0 && area(x.v) / area(x.b) >= 0.9);
        const visible = norm(vis.map((x) => x.s).join(" "));
        let lo = 0, hi = want.length;
        while (lo < hi) {
          const mid = Math.ceil((lo + hi) / 2);
          if (visible.includes(want.slice(0, mid))) lo = mid;
          else hi = mid - 1;
        }
        if (lo === want.length) {
          complete = true;
          const parts = vis.filter((x) => norm(x.s) && want.includes(norm(x.s)));
          if (parts.length) completes.push({ t: s.f / FPS, boxes: parts.map((x) => x.v) });
        }
        cur = lo >= want.length / 2 ? cur + dt : 0;
        if (cur > best) {
          best = cur;
          bestMid = s.f / FPS - cur / 2;
        }
      }
      const need = Math.min(readSeconds(c.text), b.end - b.start);
      // Judge contrast where the line is settled: the complete sample nearest the middle of its longest read.
      const moment = completes.sort((a, b2) => Math.abs(a.t - bestMid) - Math.abs(b2.t - bestMid))[0];
      if (moment) copyMoments.push({ beat: b.id, text: c.text, ...moment });
      if (!complete) errs.push(`beat ${b.id}: "${c.text}" is never fully on screen in its beat`);
      else if (best + 1e-6 < need) errs.push(`beat ${b.id}: "${c.text}" is readable for ${best.toFixed(1)}s, needs ${need.toFixed(1)}s`);
    }
    // The product is the hero: a ui beat shows a captured shot at a readable size most of the time.
    if (b.ui) {
      const inBeat = uiOn.filter((u) => u.t >= b.start && u.t < b.end);
      const share = inBeat.filter((u) => u.on).length / Math.max(1, inBeat.length);
      if (share < 0.5) errs.push(`beat ${b.id}: the product fills ${Math.round(UI_MIN_AREA * 100)}% of the frame for only ${Math.round(share * 100)}% of the beat (needs 50%)`);
      for (const id of b.shots ?? []) {
        const ts = (shownShots.get(id) ?? []).filter((t) => t >= b.start - 0.5 && t <= b.end + 0.5);
        if (!ts.length) errs.push(`beat ${b.id}: shot "${id}" is declared but never on screen in the beat`);
      }
    }
  }
  const share = uiOn.filter((u) => u.on).length / Math.max(1, uiOn.length);
  report.capturedShare = Math.round(share * 100) / 100;

  if (errs.length) errs.forEach((e) => fail("probe", e));
  else pass("probe", `${samples.length} samples, captured footage on screen ${Math.round(share * 100)}%`);
});

// ---------- 8. contrast on rendered pixels ----------

// Relative luminance from 8-bit gray, then the WCAG ratio between the light and dark ends of
// the text box (5th and 95th percentile): text and whatever it actually sits on.
await step("contrast", async () => {
  const lin = (y) => {
    const c = Math.min(1, Math.max(0, (y - 16) / 219));
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const errs = [];
  for (const m of copyMoments) {
    const r = run("ffmpeg", ["-v", "error", "-ss", m.t.toFixed(3), "-i", output, "-frames:v", "1", "-vf", `scale=${W}:${H}`, "-pix_fmt", "gray", "-f", "rawvideo", "-"], { encoding: "buffer" });
    if (r.status !== 0) continue;
    const px = r.stdout;
    const vals = [];
    for (const b of m.boxes) {
      for (let y = Math.max(0, Math.floor(b.y)); y < Math.min(H, Math.ceil(b.y + b.h)); y++)
        for (let x = Math.max(0, Math.floor(b.x)); x < Math.min(W, Math.ceil(b.x + b.w)); x++) vals.push(px[y * W + x]);
    }
    if (vals.length < 50) continue;
    vals.sort((a, b) => a - b);
    const lo = lin(vals[Math.floor(vals.length * 0.05)]);
    const hi = lin(vals[Math.floor(vals.length * 0.95)]);
    const ratio = (hi + 0.05) / (lo + 0.05);
    m.contrast = Math.round(ratio * 10) / 10;
    if (ratio < MIN_CONTRAST) errs.push(`beat ${m.beat}: "${m.text}" has contrast ${ratio.toFixed(1)}:1 against what it sits on at ${m.t.toFixed(1)}s (needs ${MIN_CONTRAST}:1)`);
  }
  report.contrast = copyMoments.map(({ beat, text, t, contrast }) => ({ beat, text, t, contrast }));
  if (errs.length) errs.forEach((e) => fail("contrast", e));
  else pass("contrast", `${copyMoments.length} lines`);
});

// ---------- 9. evidence sheets ----------

await step("sheets", async () => {
  const grab = (t, dest) => {
    const r = run("ffmpeg", ["-v", "error", "-y", "-ss", Math.max(0, Math.min(duration - 0.05, t)).toFixed(3), "-i", output, "-frames:v", "1", dest]);
    if (r.status !== 0) throw new Error(`ffmpeg grab: ${r.stderr.trim()}`);
  };
  const contact = [];
  const strips = [];
  for (const [i, b] of beats.entries()) {
    const len = b.end - b.start;
    for (const [j, [tag, t]] of [["in", b.start + Math.min(0.3, len / 4)], ["mid", (b.start + b.end) / 2], ["out", b.end - Math.min(0.3, len / 4)]].entries()) {
      const raw = path.join(runDir, "frames", `c-${i}-${j}.png`);
      grab(t, raw);
      const cap = path.join(runDir, "frames", `c-${i}-${j}-cap.png`);
      captioned(raw, cap, `${b.id} ${tag} ${t.toFixed(1)}s`, 480);
      contact.push(cap);
    }
    const frames = [];
    for (let k = 0; k < 8; k++) {
      const t = b.start + (len * (k + 0.5)) / 8;
      const raw = path.join(runDir, "frames", `s-${i}-${k}.png`);
      grab(t, raw);
      const cap = path.join(runDir, "frames", `s-${i}-${k}-cap.png`);
      captioned(raw, cap, `${t.toFixed(2)}s`, 400);
      frames.push(cap);
    }
    const strip = path.join(runDir, `beat-${String(i + 1).padStart(2, "0")}-${b.id}.png`);
    tile(frames, 4, strip);
    strips.push(rel(strip));
  }
  const sheet = path.join(runDir, "contact.png");
  tile(contact, 3, sheet);
  report.artifacts.contact = rel(sheet);
  report.artifacts.filmstrips = strips;
  for (const f of fs.readdirSync(path.join(runDir, "frames"))) fs.rmSync(path.join(runDir, "frames", f));
});

// ---------- 10. deliver ----------

if (mode === "final" && report.failures.length === 0) {
  const outbox = process.env.WORKBENCH_OUTPUT_DIR;
  fs.copyFileSync(path.join(runDir, "contact.png"), path.join(project, "out", "contact.png"));
  if (outbox) {
    const dest = path.join(outbox, "launch-video");
    fs.mkdirSync(dest, { recursive: true });
    fs.copyFileSync(output, path.join(dest, "launch.mp4"));
    fs.copyFileSync(path.join(runDir, "contact.png"), path.join(dest, "contact-sheet.png"));
    if (fs.existsSync("storyboard.png")) fs.copyFileSync("storyboard.png", path.join(dest, "storyboard.png"));
    report.delivered = rel(dest).startsWith("..") ? dest : rel(dest);
  } else warn("WORKBENCH_OUTPUT_DIR is not set; the video stays at out/launch.mp4");
}
if (mode === "final" && !fs.readdirSync(runsDir).some((d) => d.endsWith("-storyboard"))) warn("no storyboard gate was ever run for this video");
finish(0);

// lvcapture [dir] [--only id,id] : capture the real product from a live URL, per capture/plan.json.
// lvcapture [dir] --import <file> --id <id> [--text <file>] : register a supplied screenshot or recording.
//
// A shot with "textOnly": true saves only the page text, for research and copy sources.
// Writes public/capture/<id>.png (or .mp4 for recordings), the page text to capture/text/<id>.txt
// (copy sourced "site:<id>" in the manifest is checked against it), capture/index.json, and a
// contact sheet at capture/sheet.png. Exit 1 when any planned shot failed.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { LV_HOME, die, projectDir, readJson, run, writeJson } from "./lib.mjs";

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args.splice(i, 2)[1] : undefined;
};
const only = opt("--only")?.split(",");
const importFile = opt("--import");
const importId = opt("--id");
const importText = opt("--text");
const project = projectDir(args.find((a) => !a.startsWith("--")));
const capDir = path.join(project, "capture");
const pubDir = path.join(project, "public", "capture");
const indexFile = path.join(capDir, "index.json");
fs.mkdirSync(path.join(capDir, "text"), { recursive: true });
fs.mkdirSync(pubDir, { recursive: true });

const index = fs.existsSync(indexFile) ? readJson(indexFile) : { shots: [] };
const upsert = (entry) => {
  index.shots = index.shots.filter((s) => s.id !== entry.id).concat(entry);
};
const ID = /^[a-z0-9][a-z0-9-]*$/;

function toMp4(src, dest) {
  const r = run("ffmpeg", ["-v", "error", "-y", "-i", src, "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30", "-an", dest]);
  if (r.status !== 0) throw new Error(`ffmpeg: ${r.stderr.trim().split("\n").pop()}`);
}

function probeSize(file) {
  const r = run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", file]);
  const [w, h] = r.stdout.trim().split(",").map(Number);
  return { width: w || null, height: h || null };
}

function sheet() {
  const files = index.shots.filter((s) => s.ok && s.file?.endsWith(".png")).map((s) => path.join(project, "public", s.file));
  if (files.length === 0) return;
  const cols = Math.min(3, files.length);
  const rows = Math.ceil(files.length / cols);
  const inputs = files.flatMap((f) => ["-i", f]);
  const scaled = files.map((_, i) => `[${i}:v]scale=640:400:force_original_aspect_ratio=decrease,pad=640:400:(ow-iw)/2:(oh-ih)/2:color=0x202020[s${i}]`);
  const pads = Array.from({ length: cols * rows - files.length }, (_, i) => `color=c=0x202020:s=640x400:d=1[p${i}]`);
  const labels = files.map((_, i) => `[s${i}]`).concat(pads.map((_, i) => `[p${i}]`)).join("");
  const layout = Array.from({ length: cols * rows }, (_, i) => `${(i % cols) * 640}_${Math.floor(i / cols) * 400}`).join("|");
  const graph = [...scaled, ...pads, `${labels}xstack=inputs=${cols * rows}:layout=${layout}`].join(";");
  const r = run("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", graph, "-frames:v", "1", path.join(capDir, "sheet.png")]);
  if (r.status === 0) console.log(`sheet    capture/sheet.png (open it before writing the manifest)`);
}

if (importFile) {
  if (!importId || !ID.test(importId)) die("--import needs --id <lowercase-slug>");
  const ext = path.extname(importFile).toLowerCase();
  const isVideo = [".mp4", ".mov", ".webm", ".mkv", ".m4v"].includes(ext);
  const file = `capture/${importId}${isVideo ? ".mp4" : ".png"}`;
  const dest = path.join(project, "public", file);
  if (isVideo) toMp4(importFile, dest);
  else if (ext === ".png") fs.copyFileSync(importFile, dest);
  else {
    const r = run("ffmpeg", ["-v", "error", "-y", "-i", importFile, dest]);
    if (r.status !== 0) die(`cannot convert ${importFile}: ${r.stderr.trim()}`);
  }
  if (importText) fs.copyFileSync(importText, path.join(capDir, "text", `${importId}.txt`));
  upsert({ id: importId, ok: true, kind: isVideo ? "recording" : "screenshot", source: "supplied", from: path.basename(importFile), file, ...probeSize(dest), capturedAt: new Date().toISOString() });
  writeJson(indexFile, index);
  console.log(`imported ${file}`);
  sheet();
  process.exit(0);
}

const plan = readJson(path.join(capDir, "plan.json"));
if (!plan.url) die("capture/plan.json has no url");
const require = createRequire(path.join(LV_HOME, "share", "package.json"));
const { chromium } = require("playwright");

// Consent banners, chat launchers, and dev toolbars that ruin a product shot.
const DEFAULT_HIDE = [
  "#onetrust-consent-sdk", "#onetrust-banner-sdk", "#CybotCookiebotDialog", ".cc-window", ".cookie-banner",
  "[id*='cookie-banner' i]", "[class*='cookie-banner' i]", "[aria-label*='cookie' i][role='dialog']",
  "#intercom-container", ".intercom-lightweight-app", "#hubspot-messages-iframe-container", "#crisp-chatbox",
  "iframe[title*='chat' i]", "#vercel-live-feedback", "nextjs-portal",
];

const viewport = plan.viewport ?? { width: 1440, height: 900 };
const dpr = plan.deviceScaleFactor ?? 2;
const hideCss = `${[...DEFAULT_HIDE, ...(plan.hide ?? [])].join(",")}{display:none!important}` + (plan.css ?? "");
const browser = await chromium.launch({ channel: "chromium" });
let failed = 0;

async function runSteps(page, steps) {
  for (const s of steps ?? []) {
    if (s.click) await page.locator(s.click).first().click({ timeout: 10000 });
    else if (s.fill) await page.locator(s.fill[0]).first().fill(s.fill[1], { timeout: 10000 });
    else if (s.type) await page.locator(s.type[0]).first().pressSequentially(s.type[1], { delay: s.delay ?? 60 });
    else if (s.press) await page.keyboard.press(s.press);
    else if (s.hover) await page.locator(s.hover).first().hover({ timeout: 10000 });
    else if (s.scroll !== undefined) {
      if (typeof s.scroll === "number") await page.mouse.wheel(0, s.scroll);
      else await page.locator(s.scroll).first().scrollIntoViewIfNeeded();
    } else if (s.waitFor) await page.locator(s.waitFor).first().waitFor({ timeout: 15000 });
    else if (s.wait) await page.waitForTimeout(Math.min(s.wait, 5000));
    else throw new Error(`unknown step ${JSON.stringify(s)}`);
    await page.waitForTimeout(s.settle ?? 250);
  }
}

for (const shot of plan.shots ?? []) {
  if (only && !only.includes(shot.id)) continue;
  if (!ID.test(shot.id ?? "")) die(`shot id "${shot.id}" must be a lowercase slug`);
  const url = shot.url ?? new URL(shot.path ?? "/", plan.url).toString();
  const recording = Boolean(shot.record);
  const tmpVideo = path.join(process.env.HOME ?? "/tmp", ".lv-rec", shot.id);
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: recording ? 1 : dpr,
    colorScheme: shot.colorScheme ?? plan.colorScheme ?? "light",
    reducedMotion: recording ? "no-preference" : "reduce",
    ...(recording ? { recordVideo: { dir: tmpVideo, size: viewport } } : {}),
  });
  const page = await context.newPage();
  const started = Date.now();
  try {
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    } catch {
      await page.goto(url, { waitUntil: "load", timeout: 30000 });
    }
    await page.addStyleTag({ content: hideCss });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    await runSteps(page, shot.steps);
    const text = await page.evaluate(() => document.body?.innerText ?? "");
    fs.writeFileSync(path.join(capDir, "text", `${shot.id}.txt`), text);
    const title = await page.title();
    let file;
    if (shot.textOnly) {
      await context.close();
      upsert({ id: shot.id, ok: true, kind: "text", source: "captured", url, title, textChars: text.length, capturedAt: new Date().toISOString() });
      console.log(`ok       ${shot.id.padEnd(18)} text only, ${text.length} chars "${title.slice(0, 60)}"`);
      continue;
    }
    if (recording) {
      await page.waitForTimeout((shot.record.tail ?? 1) * 1000);
      const video = page.video();
      await context.close();
      file = `capture/${shot.id}.mp4`;
      toMp4(await video.path(), path.join(project, "public", file));
    } else {
      file = `capture/${shot.id}.png`;
      const dest = path.join(project, "public", file);
      if (shot.selector) await page.locator(shot.selector).first().screenshot({ path: dest, animations: "disabled" });
      else await page.screenshot({ path: dest, fullPage: Boolean(shot.fullPage), clip: shot.clip, animations: "disabled" });
      await context.close();
    }
    const size = probeSize(path.join(project, "public", file));
    upsert({ id: shot.id, ok: true, kind: recording ? "recording" : "screenshot", source: "captured", url, title, file, ...size, textChars: text.length, capturedAt: new Date().toISOString() });
    console.log(`ok       ${shot.id.padEnd(18)} ${file} ${size.width}x${size.height} ${((Date.now() - started) / 1000).toFixed(1)}s "${title.slice(0, 60)}"`);
  } catch (e) {
    failed++;
    await context.close().catch(() => {});
    upsert({ id: shot.id, ok: false, url, error: String(e.message ?? e).split("\n")[0], capturedAt: new Date().toISOString() });
    console.log(`FAIL     ${shot.id.padEnd(18)} ${String(e.message ?? e).split("\n")[0]}`);
  }
}
await browser.close();
writeJson(indexFile, index);
sheet();
process.exit(failed ? 1 : 0);

// Shared helpers for the lv tools.
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export const LV_HOME = process.env.LV_HOME ?? path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export const TEMPLATE = path.join(LV_HOME, "share", "template");
export const REGISTRY = path.join(LV_HOME, "share", "registry");

export function die(msg, code = 1) {
  console.error(`error: ${msg}`);
  process.exit(code);
}

export function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    throw new Error(`${file}: ${e.code === "ENOENT" ? "missing" : e.message}`);
  }
}

export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

export function sha256(file) {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, ...opts });
  if (r.error) throw r.error;
  return r;
}

// Lowercase letters and digits only: compares copy across splits, casing, and punctuation.
export const norm = (s) => (s ?? "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

// Resolve the project directory: an explicit arg, else ./video, else the cwd when it holds a manifest.
export function projectDir(arg) {
  const candidates = arg ? [arg] : ["video", "."];
  for (const c of candidates) {
    const d = path.resolve(c);
    if (fs.existsSync(path.join(d, "manifest.json")) && fs.existsSync(path.join(d, "package.json"))) return d;
  }
  die(`no video project at ${arg ?? "./video"}; create one with lvnew`);
}

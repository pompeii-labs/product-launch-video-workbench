// lvadd <name...> [--dir video] [--list]: install snapcn components from the vendored free
// registry, offline. Same files and targets as `shadcn add @snapcn/<name>`, plus their
// registry dependencies. Fails on names that are not in the free registry.
import fs from "node:fs";
import path from "node:path";
import { REGISTRY, TEMPLATE, die, projectDir, readJson } from "./lib.mjs";

const args = process.argv.slice(2);
const dirIdx = args.indexOf("--dir");
const dir = dirIdx >= 0 ? args.splice(dirIdx, 2)[1] : undefined;
const force = args.includes("--force");
const names = args.filter((a) => !a.startsWith("--")).map((n) => n.replace(/^@snapcn\//, "").replace(/\.json$/, ""));

const available = fs.readdirSync(REGISTRY).filter((f) => f.endsWith(".json") && f !== "registry.json").map((f) => f.slice(0, -5)).sort();

if (args.includes("--list")) {
  for (const n of available) {
    const item = readJson(path.join(REGISTRY, `${n}.json`));
    console.log(`${n.padEnd(20)} ${(item.description ?? "").split(/(?<=\.)\s/)[0]}`);
  }
  process.exit(0);
}
if (names.length === 0) die("usage: lvadd <name...> [--dir video] [--force] | lvadd --list");

const project = projectDir(dir);
const installed = new Set(Object.keys(readJson(path.join(TEMPLATE, "package.json")).dependencies));
const done = new Set();

function add(name) {
  if (done.has(name)) return;
  done.add(name);
  if (name === "utils") return; // the template ships lib/utils.ts
  if (!available.includes(name)) die(`"${name}" is not in the free snapcn registry; lvadd --list shows every name`);
  const item = readJson(path.join(REGISTRY, `${name}.json`));
  for (const dep of item.registryDependencies ?? []) add(path.basename(dep).replace(/\.json$/, ""));
  for (const dep of item.dependencies ?? []) {
    const pkg = dep.replace(/(?<=.)@.*$/, "");
    if (!installed.has(pkg)) die(`${name} needs npm package ${pkg}, which the bench image does not ship`);
  }
  for (const f of item.files ?? []) {
    const target = path.join(project, f.target ?? f.path);
    if (fs.existsSync(target) && fs.readFileSync(target, "utf8") !== f.content && !force) {
      console.log(`kept     ${path.relative(project, target)} (edited locally; --force overwrites)`);
      continue;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, f.content);
    console.log(`added    ${path.relative(project, target)}`);
  }
}

for (const n of names) add(n);

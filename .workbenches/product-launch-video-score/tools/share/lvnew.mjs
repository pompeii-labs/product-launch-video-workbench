// lvnew [dir]: scaffold the launch video project (default ./video) from the bench template.
import fs from "node:fs";
import path from "node:path";
import { TEMPLATE, die } from "./lib.mjs";

const dir = path.resolve(process.argv[2] ?? "video");
if (fs.existsSync(path.join(dir, "manifest.json"))) die(`${dir} already holds a video project; edit it in place`);
fs.mkdirSync(dir, { recursive: true });
fs.cpSync(TEMPLATE, dir, {
  recursive: true,
  filter: (src) => !["node_modules", "out", "gate"].some((d) => src.startsWith(path.join(TEMPLATE, d))),
});
// Dependencies are prebuilt in the image. Link them so a run needs no network and the
// workspace never carries a node_modules tree; on another machine, delete the link and npm ci.
fs.symlinkSync(path.join(TEMPLATE, "node_modules"), path.join(dir, "node_modules"), "dir");
for (const d of ["out", "gate", "capture/text"]) fs.mkdirSync(path.join(dir, d), { recursive: true });
console.log(`created ${path.relative(process.cwd(), dir) || "."}/`);
console.log("next: write brief.md, fill capture/plan.json, run lvcapture, then write manifest.json");

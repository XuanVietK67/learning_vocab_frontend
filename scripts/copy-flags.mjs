// Copies circle-flags SVGs from node_modules into public/flags so Next can serve them statically.
// Runs automatically after `npm install` via the "postinstall" hook in package.json.
import { mkdirSync, copyFileSync, readdirSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, "..", "node_modules", "circle-flags", "flags");
const dst = join(__dirname, "..", "public", "flags");

if (!existsSync(src)) {
  console.warn("[copy-flags] circle-flags not installed, skipping.");
  process.exit(0);
}

if (existsSync(dst)) rmSync(dst, { recursive: true, force: true });
mkdirSync(dst, { recursive: true });

let n = 0;
for (const file of readdirSync(src)) {
  if (file.endsWith(".svg")) {
    copyFileSync(join(src, file), join(dst, file));
    n++;
  }
}
console.log(`[copy-flags] copied ${n} flags → public/flags/`);

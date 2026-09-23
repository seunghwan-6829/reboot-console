/* ../app → ./app 복사 (EXE 에 들어갈 파일만). Vercel 전용 파일은 뺀다. */
const fs = require("fs"), path = require("path");
const SRC = path.resolve(__dirname, "..", "app"), DST = path.join(__dirname, "app");
const SKIP = new Set(["node_modules"]);
fs.rmSync(DST, { recursive: true, force: true });
function copy(s, d) {
  fs.mkdirSync(d, { recursive: true });
  for (const f of fs.readdirSync(s)) {
    if (SKIP.has(f)) continue;
    const a = path.join(s, f), b = path.join(d, f);
    fs.statSync(a).isDirectory() ? copy(a, b) : fs.copyFileSync(a, b);
  }
}
copy(SRC, DST);
console.log("app/ synced →", DST);

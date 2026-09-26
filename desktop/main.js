/* ═══════════════════════════════════════════════════════
   re:boot 제작 콘솔 — EXE 본체 (Electron main)  v4.8

   파이썬 _launch.py 와 같은 로컬 API 를 Node 로 내장한다.
   + 도구 연결(브라우저 로그인, 창 없이) + Claude Code 헤드리스 실행(제작·검수 반영)
   + v4.8: 기획안 먼저 · 제품 컷 A/B · 타일 버전 되돌리기 · 이 장만 다시/뒤에 추가 · 글자 수정
           OCR 오타 검수 · 가독성 · PSD · 채널별 내보내기 · 사용량 계기판 · 실패 자동 이어하기
           대기열/야간 배치 · 피드백 수신함 · 경쟁사 분석 · 칸반 · 작업 기록
   앱(app/) 은 이 EXE 안에 들어 있고, 프로젝트 루트(ROOT) 는
   설정(userData/config.json) → 포터블 EXE 위치 순으로 정한다.
   ═══════════════════════════════════════════════════════ */
"use strict";
const { app, BrowserWindow, dialog, shell, nativeImage, Menu, clipboard, Tray, Notification, powerSaveBlocker, session } = require("electron");
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec, execFile, spawn } = require("child_process");
let autoUpdater = null; try { autoUpdater = require("electron-updater").autoUpdater; } catch (e) {}

/* 메인 프로세스 오류는 창이 없으면 아무 데도 안 보인다 → userData/main-error.log 에 남긴다 */
const logErr = e => { try { const d = app.getPath("userData"); fs.mkdirSync(d, { recursive: true }); fs.appendFileSync(path.join(d, "main-error.log"), new Date().toISOString() + " " + (e && e.stack || e) + "\n"); } catch (x) {} };
process.on("uncaughtException", e => { logErr(e); try { dialog.showErrorBox("re:boot 콘솔 오류", String(e && e.stack || e)); } catch (x) {} app.exit(1); });
process.on("unhandledRejection", e => logErr(e));

const APP_DIR = path.join(__dirname, "app");
const IMG = new Set([".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff", ".avif", ".heic", ".heif"]);
const SAVE_OK = new Set(["brief.json", "order.json", "review.json", "suggest.json", "tiles/manifest.json", "project.json", "plan.json", "product/approved.json", "feedback.json"]);
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".ico": "image/x-icon", ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".md": "text/markdown; charset=utf-8" };
const HIGGSFIELD_URL = "https://mcp.higgsfield.ai/mcp";
const IS_WIN = process.platform === "win32";

let ROOT = "", PORT = 0, win = null;
const APP_VERSION = (() => { try { return require("./package.json").version; } catch (e) { return app.getVersion(); } })();   // 개발 실행에서도 앱 버전

/* ── 설정 ─────────────────────────────────────────────── */
const cfgPath = () => path.join(app.getPath("userData"), "config.json");
function readCfg() { try { return JSON.parse(fs.readFileSync(cfgPath(), "utf8")); } catch (e) { return {}; } }
function writeCfg(c) { try { fs.mkdirSync(path.dirname(cfgPath()), { recursive: true }); fs.writeFileSync(cfgPath(), JSON.stringify(c, null, 2)); } catch (e) {} }
const isDir = p => { try { return !!p && fs.statSync(p).isDirectory(); } catch (e) { return false; } };
const isFile = p => { try { return !!p && fs.statSync(p).isFile(); } catch (e) { return false; } };
const clampN = (v, a, b) => Math.max(a, Math.min(b, v));

/* 프로젝트 루트처럼 보이는가: YYMMDD_ 폴더가 하나라도 있거나 app/ 이 있는 폴더 */
function looksLikeRoot(p) { try { return fs.readdirSync(p).some(n => /^\d{6}_/.test(n) && isDir(path.join(p, n))); } catch (e) { return false; } }
/* 바탕화면·문서 아래(2단계)에서 프로젝트 폴더를 품은 곳을 찾는다 */
function findRootNearby() {
  const bases = [path.join(os.homedir(), "Desktop"), path.join(os.homedir(), "OneDrive", "Desktop"), path.join(os.homedir(), "OneDrive", "바탕 화면"), path.join(os.homedir(), "Documents")];
  const hits = [];
  for (const b of bases) {
    if (!isDir(b)) continue;
    if (looksLikeRoot(b)) hits.push(b);
    let l1 = []; try { l1 = fs.readdirSync(b).filter(n => !/^[._$]/.test(n)).map(n => path.join(b, n)).filter(isDir); } catch (e) {}
    for (const d1 of l1) { if (looksLikeRoot(d1)) hits.push(d1); let l2 = []; try { l2 = fs.readdirSync(d1).filter(n => !/^[._$]/.test(n)).map(n => path.join(d1, n)).filter(isDir); } catch (e) {} for (const d2 of l2) if (looksLikeRoot(d2)) hits.push(d2); }
  }
  // 프로젝트 폴더가 가장 많은 곳
  const score = p => { try { return fs.readdirSync(p).filter(n => /^\d{6}_/.test(n)).length; } catch (e) { return 0; } };
  return hits.sort((a, b) => score(b) - score(a))[0] || "";
}
function resolveRoot() {
  const c = readCfg();
  if (isDir(c.root)) return c.root;
  if (!app.isPackaged) return path.resolve(__dirname, "..");
  const near = findRootNearby();
  if (near) { writeCfg(Object.assign(c, { root: near })); return near; }
  const def = path.join(os.homedir(), "Documents", "re-boot 콘솔");     // 없으면 만들어서 조용히 시작
  try { fs.mkdirSync(def, { recursive: true }); writeCfg(Object.assign(c, { root: def })); return def; } catch (e) { return ""; }
}

/* ── 작업 기록 (타임라인) — userData/activity.jsonl ───────── */
const logPath = () => path.join(app.getPath("userData"), "activity.jsonl");
function actLog(project, kind, text, extra) {
  try {
    const p = logPath(); fs.appendFileSync(p, JSON.stringify(Object.assign({ t: Date.now(), p: project || "", k: kind, x: String(text || "").slice(0, 300) }, extra || {})) + "\n");
    if (Math.random() < 0.02) { const st = fs.statSync(p); if (st.size > 4 * 1024 * 1024) { const ls = fs.readFileSync(p, "utf8").split("\n").filter(Boolean); fs.writeFileSync(p, ls.slice(-15000).join("\n") + "\n"); } }
  } catch (e) {}
}
function readLog(project, limit) {
  let ls = []; try { ls = fs.readFileSync(logPath(), "utf8").split("\n").filter(Boolean); } catch (e) { return []; }
  const out = [];
  for (let i = ls.length - 1; i >= 0 && out.length < limit; i--) { let j; try { j = JSON.parse(ls[i]); } catch (e) { continue; } if (project && j.p !== project) continue; out.push(j); }
  return out;
}

/* ── 프로젝트 스캔 (파이썬 scan() 과 동일 형태 + v4.8 확장) ─── */
function isProjectDir(name) {
  if (!name || name === "." || name === ".." || /^[._]/.test(name) || name === "app" || name === "desktop") return false;
  if (name.includes("/") || name.includes("\\")) return false;
  const p = path.join(ROOT, name);
  return isDir(p) && path.dirname(path.resolve(p)) === path.resolve(ROOT);
}
const vtag = ms => Math.round(ms).toString(36);                       // 캐시 무력화 — 파일이 바뀌면 주소도 바뀐다
function listImages(d, urlPrefix) {
  if (!isDir(d)) return [];
  const out = [];
  for (const f of fs.readdirSync(d).sort()) {
    if (!IMG.has(path.extname(f).toLowerCase())) continue;
    let st; try { st = fs.statSync(path.join(d, f)); } catch (e) { continue; }
    if (!st.isFile()) continue;
    out.push({ name: f, size: st.size, mtime: Math.round(st.mtimeMs), url: urlPrefix + encodeURIComponent(f) + "?v=" + vtag(st.mtimeMs) });
  }
  return out;
}
function readJson(p) { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { return null; } }
const stemOf = f => f.replace(/\.[^.]+$/, "");
/* 타일 버전 기록: tiles/_history/<stem>/*, (구) tiles/v_prev/*, tiles/edits/* */
function tileHistory(name) {
  const td = path.join(ROOT, name, "tiles"), base = "/" + encodeURIComponent(name) + "/tiles/", out = {};
  if (!isDir(td)) return out;
  const cur = {};
  for (const f of fs.readdirSync(td)) { const ext = path.extname(f).toLowerCase(); if (!IMG.has(ext) || f.startsWith("_")) continue; try { const st = fs.statSync(path.join(td, f)); if (st.isFile()) cur[stemOf(f)] = st; } catch (e) {} }
  const stems = Object.keys(cur).sort((a, b) => b.length - a.length);
  const add = (stem, rel, st, src) => {
    const c = cur[stem]; if (c && c.size === st.size) return;                                    // 현재 파일과 같은 백업은 숨김 (바이트 크기가 같으면 같은 파일)
    if ((out[stem] || []).some(x => x.size === st.size)) return;                                   // 같은 버전이 여러 폴더에 있으면 한 번만
    (out[stem] = out[stem] || []).push({ file: rel, url: base + rel.split("/").map(encodeURIComponent).join("/") + "?v=" + vtag(st.mtimeMs), at: Math.round(st.mtimeMs), size: st.size, src });
  };
  const hd = path.join(td, "_history");
  if (isDir(hd)) for (const stem of fs.readdirSync(hd)) {
    const sd = path.join(hd, stem); if (!isDir(sd)) continue;
    for (const f of fs.readdirSync(sd)) { if (!IMG.has(path.extname(f).toLowerCase())) continue; try { add(stem, "_history/" + stem + "/" + f, fs.statSync(path.join(sd, f)), "history"); } catch (e) {} }
  }
  // (구) v_prev · edits · v1 · v2 · v1.1 … 같은 버전 폴더도 파일명 앞 번호로 짝을 맞춘다
  const subs = fs.readdirSync(td).filter(s => s !== "_history" && !s.startsWith(".") && isDir(path.join(td, s)));
  for (const sub of subs) {
    const sd = path.join(td, sub);
    for (const f of fs.readdirSync(sd)) {
      if (!IMG.has(path.extname(f).toLowerCase())) continue;
      const stem = stems.find(s => f.startsWith(s) && !/[0-9A-Za-z가-힣]/.test(f.charAt(s.length) || "."));
      if (!stem) continue;
      try { add(stem, sub + "/" + f, fs.statSync(path.join(sd, f)), sub); } catch (e) {}
    }
  }
  for (const k in out) out[k].sort((a, b) => b.at - a.at);
  return out;
}
/* 타일을 바꾸기 전에 지금 파일을 _history 로 백업 (같은 파일은 한 번만) */
function snapshotTiles(name, stems) {
  const td = path.join(ROOT, name, "tiles"); if (!isDir(td)) return 0; let n = 0;
  for (const f of fs.readdirSync(td)) {
    const ext = path.extname(f).toLowerCase(); if (!IMG.has(ext) || f.startsWith("_")) continue;
    const stem = stemOf(f); if (stems && !stems.includes(stem)) continue;
    const src = path.join(td, f); let st; try { st = fs.statSync(src); } catch (e) { continue; } if (!st.isFile()) continue;
    const hd = path.join(td, "_history", stem); fs.mkdirSync(hd, { recursive: true });
    const stamp = new Date(st.mtimeMs).toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "_");
    const dst = path.join(hd, stamp + ext);
    if (!fs.existsSync(dst)) { try { fs.copyFileSync(src, dst); fs.utimesSync(dst, st.atime, st.mtime); n++; } catch (e) { logErr(e); } }
    try { const all = fs.readdirSync(hd).filter(x => IMG.has(path.extname(x).toLowerCase())).sort(); while (all.length > 25) fs.unlinkSync(path.join(hd, all.shift())); } catch (e) {}
  }
  return n;
}
function restoreTile(name, stem, rel) {
  if (!/^[\w가-힣\-]+$/.test(stem)) throw new Error("잘못된 타일 이름");
  if (!/^[\w가-힣.\-]+\//.test(rel) || rel.includes("..") || rel.includes("\\") || rel.split("/").length > 3) throw new Error("되돌릴 수 없는 파일");
  const td = path.join(ROOT, name, "tiles"), src = path.normalize(path.join(td, rel));
  if (!src.startsWith(path.normalize(td + path.sep)) || !isFile(src) || !IMG.has(path.extname(src).toLowerCase())) throw new Error("없는 파일");
  snapshotTiles(name, [stem]);
  const ext = path.extname(src).toLowerCase(), dst = path.join(td, stem + ext);
  for (const f of fs.readdirSync(td)) { const e2 = path.extname(f).toLowerCase(); if (IMG.has(e2) && stemOf(f) === stem && path.join(td, f) !== dst) { try { fs.unlinkSync(path.join(td, f)); } catch (e) {} } }
  fs.copyFileSync(src, dst); const now = new Date(); fs.utimesSync(dst, now, now);
  return { ok: true, file: path.basename(dst) };
}
function tileFiles(name) {
  const td = path.join(ROOT, name, "tiles"); if (!isDir(td)) return [];
  const meta = readJson(path.join(td, "manifest.json")) || {};
  const files = fs.readdirSync(td).filter(f => IMG.has(path.extname(f).toLowerCase()) && !f.startsWith("_") && isFile(path.join(td, f)));
  return orderedTiles(files, meta).map(f => ({ stem: stemOf(f), file: path.join(td, f), name: f }));
}
const readRuns = name => readJson(path.join(ROOT, name, "runs.json")) || { runs: [] };
function writeRuns(name, fn) { try { const p = path.join(ROOT, name, "runs.json"); const j = readRuns(name); fn(j); if (Array.isArray(j.runs) && j.runs.length > 120) j.runs = j.runs.slice(-120); fs.writeFileSync(p, JSON.stringify(j, null, 2), "utf8"); } catch (e) { logErr(e); } }
function scan(name) {
  const d = path.join(ROOT, name), base = "/" + encodeURIComponent(name) + "/";
  return { name, images: listImages(d, base), tiles: listImages(path.join(d, "tiles"), base + "tiles/"),
    tileMeta: readJson(path.join(d, "tiles", "manifest.json")) || {}, brief: readJson(path.join(d, "brief.json")), order: readJson(path.join(d, "order.json")),
    review: readJson(path.join(d, "review.json")), suggest: readJson(path.join(d, "suggest.json")),
    hasBrief: fs.existsSync(path.join(d, "brief.json")), hasOrder: fs.existsSync(path.join(d, "order.json")), mtime: fs.statSync(d).mtimeMs / 1000 };
}
/* 화면에서 쓰는 전체 정보 (scan + 버전·기획안·제품 컷·경쟁사·오타·피드백·실행 기록) */
function scanFull(name) {
  const d = path.join(ROOT, name), base = "/" + encodeURIComponent(name) + "/", s = scan(name);
  const rs = readRuns(name);
  return Object.assign(s, {
    history: tileHistory(name), meta: readJson(path.join(d, "project.json")) || {}, plan: readJson(path.join(d, "plan.json")),
    hasPlanMd: fs.existsSync(path.join(d, "기획안.md")),
    cuts: listImages(path.join(d, "product"), base + "product/").filter(i => /^cut_/i.test(i.name)), cutsMeta: readJson(path.join(d, "product", "cuts.json")), approved: readJson(path.join(d, "product", "approved.json")),
    refs: listImages(path.join(d, "ref"), base + "ref/"), ref: readJson(path.join(d, "ref.json")),
    typo: readJson(path.join(d, "review", "typo.json")), feedback: readJson(path.join(d, "feedback.json")),
    lastRun: rs.last || null, runCount: (rs.runs || []).length
  });
}
const STAGE_IDS = ["photos", "brief", "ready", "making", "review", "sent", "done", "hold"];
function autoStage(p) { return p.images === 0 ? "photos" : !p.hasOrder ? "brief" : p.tiles === 0 ? "ready" : p.exports === 0 ? "review" : "sent"; }
function projectList() {
  const out = [];
  for (const n of fs.readdirSync(ROOT).sort()) {
    if (!isProjectDir(n)) continue;
    const s = scan(n), d = path.join(ROOT, n), tdir = path.join(d, "tiles");
    const tiles = s.tiles.filter(t => !t.name.startsWith("_"));
    const tm = tiles.map(t => { try { return fs.statSync(path.join(tdir, t.name)).mtimeMs / 1000; } catch (e) { return null; } }).filter(x => x != null);
    const edir = path.join(d, "export");
    const exports = isDir(edir) ? fs.readdirSync(edir).filter(f => f.toLowerCase().endsWith(".html")).length : 0;
    const ims = s.images.map(i => { try { return fs.statSync(path.join(d, i.name)).mtimeMs / 1000; } catch (e) { return Infinity; } });
    const meta = readJson(path.join(d, "project.json")) || {}, rs = readRuns(n), run = runFor(n);
    const p = { name: n, images: s.images.length, tiles: tiles.length, hasBrief: s.hasBrief, hasOrder: s.hasOrder, mtime: s.mtime,
      ctime: Math.min(fs.statSync(d).birthtimeMs / 1000, ...ims), tileFirst: tm.length ? Math.min(...tm) : null, tileLast: tm.length ? Math.max(...tm) : null,
      exports, briefAt: (s.brief || {}).savedAt || null, orderAt: (s.order || {}).savedAt || null,
      cover: tiles[0] ? tiles[0].url : (s.images[0] ? s.images[0].url : ""), meta, lastRun: rs.last || null,
      running: !!(run && run.proc && run.exit == null), pct: run && run.proc && run.exit == null ? run.pct() : null };
    const auto = autoStage(p);
    // 수동 단계는 '그때의 자동 단계' 가 그대로일 때만 유지 — 작업이 진척되면 자동 단계가 이긴다
    p.autoStage = auto; p.stage = p.running ? "making" : (meta.stage && STAGE_IDS.includes(meta.stage) && (meta.stageAuto === auto || !meta.stageAuto) ? meta.stage : auto);
    p.canResume = !p.running && !!(rs.last && rs.last.exit != null && rs.last.exit !== 0 && rs.last.mode);
    out.push(p);
  }
  return out.sort((a, b) => b.mtime - a.mtime);
}
/* 타일 표시 순서: manifest._order (파일명 stem 배열) → 없는 건 이름순 뒤에 */
function orderedTiles(files, meta) {
  const ord = Array.isArray(meta && meta._order) ? meta._order : [];
  return files.slice().sort((a, b) => { const ia = ord.indexOf(stemOf(a)), ib = ord.indexOf(stemOf(b)); if (ia === -1 && ib === -1) return a.localeCompare(b, "en", { numeric: true }); if (ia === -1) return 1; if (ib === -1) return -1; return ia - ib; });
}
/* '뒤에 1장 추가' 새 타일 id: 03 → 03a, 03b … */
function newTileId(name, after) {
  const td = path.join(ROOT, name, "tiles"), meta = readJson(path.join(td, "manifest.json")) || {};
  const have = new Set([...tileFiles(name).map(t => t.stem), ...Object.keys(meta)]);
  const base = after.replace(/[a-z]+$/, "");
  for (let c = 97; c <= 122; c++) { const id = base + String.fromCharCode(c); if (!have.has(id)) return id; }
  return base + "z" + Date.now().toString(36).slice(-3);
}
function insertOrder(name, after, id) {
  const mp = path.join(ROOT, name, "tiles", "manifest.json"), meta = readJson(mp) || {};
  let ord = Array.isArray(meta._order) ? meta._order.slice() : tileFiles(name).map(t => t.stem);
  ord = ord.filter(s => s !== id); const i = ord.indexOf(after); ord.splice(i < 0 ? ord.length : i + 1, 0, id);
  meta._order = ord; fs.writeFileSync(mp, JSON.stringify(meta, null, 2), "utf8");
}

/* ── 클라이언트 프리뷰 내보내기 (템플릿은 app/export_template.html 공용) ── */
function buildExport(name, ver) {
  const d = path.join(ROOT, name), td = path.join(d, "tiles");
  const meta = readJson(path.join(td, "manifest.json")) || {};
  const files = orderedTiles(fs.readdirSync(td).filter(f => IMG.has(path.extname(f).toLowerCase()) && !f.startsWith("_")), meta);
  const figs = files.map(f => {
    const n = stemOf(f), m = meta[n] || {};
    const img = nativeImage.createFromPath(path.join(td, f));       // 리샘플 없음 — JPEG 인코딩만
    const sz = img.getSize();
    return { n, name: m.name || "", copy: m.copy || "", w: sz.width, h: sz.height, b64: img.toJPEG(82).toString("base64") };
  });
  const title = name.includes("_") ? name.split("_").slice(1).join("_") : name;
  const tpl = fs.readFileSync(path.join(APP_DIR, "export_template.html"), "utf8");
  const html = tpl.replace("__TITLE__", title).replace("__VER__", ver).replace("__DATE__", new Date().toISOString().slice(0, 10))
    .replace("__COUNT__", String(figs.length)).replace("__FIGS__", JSON.stringify(figs));
  const out = path.join(d, "export"); fs.mkdirSync(out, { recursive: true });
  const p = path.join(out, `${title}_시안_${ver}.html`);
  fs.writeFileSync(p, html, "utf8");
  return { path: p, count: figs.length, size: fs.statSync(p).size };
}

/* ── Claude 로그인 상태(캐시) · claude 실행 간격 게이트 ──────
   claude 를 짧은 간격으로 여러 개 띄우면 만료된 토큰을 동시에 갱신하다 서로 부딪혀
   "OAuth session expired and could not be refreshed" 로 로그인이 통째로 풀릴 수 있다.
   → 모든 claude 실행을 한 줄로 세워 3.5초 간격을 두고, AI 작업 전에는 로그인 상태를 먼저 확인한다. */
const sleepMs = ms => new Promise(r => setTimeout(r, ms));
const LOGIN_RE = /failed to authenticate|oauth (session|token)|session expired|could not be refreshed|not logged in|authentication_error|invalid api key|please run \/login|\b401\b|로그인이 만료/i;
let GATE = Promise.resolve(), GATE_LAST = 0;
function claudeGate() { const p = GATE.then(async () => { const w = GATE_LAST + 3500 - Date.now(); if (w > 0) await sleepMs(w); GATE_LAST = Date.now(); }); GATE = p.catch(() => {}); return p; }
const AUTH = { at: 0, v: null, p: null };
function authState(maxAge) {
  maxAge = maxAge == null ? 20000 : maxAge;
  if (AUTH.v && Date.now() - AUTH.at < maxAge) return Promise.resolve(AUTH.v);
  if (AUTH.p) return AUTH.p;
  AUTH.p = claudeGate().then(() => sh2("claude auth status --json", 15000)).then(t => {
    let j = null; try { const a = t.indexOf("{"), b = t.lastIndexOf("}"); if (a >= 0 && b > a) j = JSON.parse(t.slice(a, b + 1)); } catch (e) {}   // 로그아웃이면 종료 코드가 1 이어도 JSON 은 나온다
    AUTH.v = j ? { loggedIn: !!j.loggedIn, email: j.email || "", org: j.orgName || "", plan: j.subscriptionType || "", keySource: j.apiKeySource || "" } : { loggedIn: false, unknown: true };
    AUTH.at = Date.now(); return AUTH.v;
  }).finally(() => { AUTH.p = null; });
  return AUTH.p;
}
const NEED_LOGIN = { ok: false, needLogin: true, error: "Claude 로그인이 만료됐습니다 — [다시 로그인] 을 누르고 브라우저에서 로그인만 하면 됩니다" };
async function loginOk() { const a = await authState(); return !(a.loggedIn === false && !a.unknown); }

/* ── 도구 연결 (Claude Code · Codex · Higgsfield MCP) ───── */
const sh = (cmd, ms) => new Promise(res => exec(cmd, { timeout: ms || 8000, windowsHide: true, encoding: "utf8" }, (err, out) => res(err ? "" : String(out || "").trim())));
const sh2 = (cmd, ms) => new Promise(res => exec(cmd, { timeout: ms || 8000, windowsHide: true, encoding: "utf8" }, (err, out, se) => res(String(out || "") + String(se || ""))));  // stdout+stderr, 실패해도 텍스트
async function toolStatus() {
  const node = await sh("node -v");
  const claudeV = await sh("claude --version"), codexV = await sh("codex --version");
  let claudeAuth = null;
  if (claudeV) { const a = await authState(AUTH.v && AUTH.v.loggedIn ? 20000 : 4000); claudeAuth = a.unknown ? null : { loggedIn: a.loggedIn, email: a.email, orgName: a.org, subscriptionType: a.plan, apiKeySource: a.keySource }; }
  let codexIn = false;
  if (codexV) { const st = await sh2("codex login status", 12000); codexIn = /logged in/i.test(st) && !/not logged in/i.test(st); }
  let hfReg = false, hfAuth = false;
  try {
    const j = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".claude.json"), "utf8"));
    if (j.mcpServers && j.mcpServers.higgsfield) hfReg = true;
    for (const p of Object.values(j.projects || {})) if (p && p.mcpServers && p.mcpServers.higgsfield) hfReg = true;
  } catch (e) {}
  try { const c = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".claude", ".credentials.json"), "utf8")); hfAuth = Object.keys(c.mcpOAuth || {}).some(k => k.startsWith("higgsfield|")); } catch (e) {}
  // 실제 연결 확인(claude mcp list)은 느릴 수 있다 → 화면을 막지 않게 백그라운드로 갱신, 결과가 있을 때만 그것을 쓴다
  if (hfReg && hfAuth) {
    const now = Date.now();
    if (!MCPCHK.busy && (!MCPCHK.at || now - MCPCHK.at > 5 * 60 * 1000)) { MCPCHK.busy = true; claudeGate().then(() => sh2("claude mcp list", 60000)).then(out => { const line = out.split(/\r?\n/).find(l => /^higgsfield:/i.test(l.trim())) || ""; MCPCHK.ok = !!line && !/needs authentication|failed/i.test(line); MCPCHK.line = line.trim(); MCPCHK.at = Date.now(); }).finally(() => { MCPCHK.busy = false; }); }
    if (MCPCHK.at) hfAuth = MCPCHK.ok;
  }
  return { ok: true, root: ROOT, node,
    claude: { installed: !!claudeV, version: claudeV.replace(/\s*\(Claude Code\)\s*/i, ""), loggedIn: !!(claudeAuth && claudeAuth.loggedIn), email: (claudeAuth && claudeAuth.email) || "", org: (claudeAuth && claudeAuth.orgName) || "", plan: (claudeAuth && claudeAuth.subscriptionType) || "", keySource: (claudeAuth && claudeAuth.apiKeySource) || "" },
    codex: { installed: !!codexV, version: codexV.replace(/^codex-cli\s*/i, ""), loggedIn: codexIn },
    higgsfield: { connected: hfReg, authed: hfAuth },
    runs: [...RUNS.values()].map(r => r.summary()), run: (() => { const r = [...RUNS.values()].find(x => x.proc && x.exit == null); return r ? r.summary() : { running: false }; })() };
}
const MCPCHK = { at: 0, ok: false, line: "", busy: false };
/* 창 없이 실행 — 로그인 명령은 스스로 브라우저를 연다. 결과는 상태 폴링으로 확인. */
const hidden = {};
function spawnHidden(key, cmd, args) {
  if (hidden[key] && hidden[key].exitCode == null) return false;
  const p = spawn(cmd, args, { cwd: ROOT || os.homedir(), windowsHide: true, shell: IS_WIN, stdio: ["ignore", "ignore", "ignore"], detached: false });
  p.on("error", logErr); hidden[key] = p; return true;
}
/* 검은 터미널 창 — 설치처럼 진행 출력이 필요한 것만 */
function openTerminal(title, lines, cwd) {
  const dir = path.join(app.getPath("userData"), "run"); fs.mkdirSync(dir, { recursive: true });
  const f = path.join(dir, "run-" + Date.now() + ".cmd");
  const body = ["@echo off", "chcp 65001>nul", `title re:boot 콘솔 - ${title}`, `cd /d "${cwd || ROOT}"`, ...lines, "echo.", "echo [끝] 이 창은 닫아도 됩니다.", "pause>nul"].join("\r\n");
  fs.writeFileSync(f, body, "utf8");
  spawn("cmd.exe", ["/c", "start", "", f], { detached: true, stdio: "ignore", windowsHide: false }).unref();
}
async function toolAction(q) {
  const act = q.get("do") || "";
  const hasNpm = async () => !!(await sh("npm -v"));
  switch (act) {
    case "install-claude":
      if (!(await hasNpm())) { shell.openExternal("https://nodejs.org/"); return { ok: false, error: "Node.js(npm)가 없습니다. 열린 페이지에서 LTS 를 설치한 뒤 다시 누르세요." }; }
      openTerminal("Claude Code 설치", ["npm i -g @anthropic-ai/claude-code", "echo.", "echo 설치가 끝났습니다. 이 창을 닫으면 콘솔이 다시 확인합니다."]);
      return { ok: true, message: "터미널에서 설치 중입니다", poll: true };
    case "install-codex":
      if (!(await hasNpm())) { shell.openExternal("https://nodejs.org/"); return { ok: false, error: "Node.js(npm)가 없습니다. 열린 페이지에서 LTS 를 설치한 뒤 다시 누르세요." }; }
      openTerminal("Codex CLI 설치", ["npm i -g @openai/codex", "echo.", "echo 설치가 끝났습니다. 이 창을 닫으면 콘솔이 다시 확인합니다."]);
      return { ok: true, message: "터미널에서 설치 중입니다", poll: true };
    case "login-claude":
      AUTH.at = 0; MCPCHK.at = 0;
      spawnHidden("claude-login", "claude", ["auth", "login", "--claudeai"]);   // 구독(Max/Pro) 경로로 — Console 키로 붙으면 API 과금·크레딧 오류
      return { ok: true, message: "브라우저에서 Anthropic 로그인을 마치세요", poll: true };
    case "logout-claude":
      await sh("claude auth logout", 12000); MCPCHK.at = 0; AUTH.at = 0; return { ok: true, message: "로그아웃했습니다 — 다시 로그인하면 Higgsfield 인증도 다시 필요할 수 있습니다", poll: true };
    case "login-codex":
      spawnHidden("codex-login", "codex", ["login"]);
      return { ok: true, message: "브라우저에서 ChatGPT 로그인을 마치세요", poll: true };
    case "add-mcp": {
      const out = await new Promise(res => exec(`claude mcp add --transport http --scope user higgsfield ${HIGGSFIELD_URL}`, { timeout: 20000, windowsHide: true, encoding: "utf8" }, (err, so, se) => res({ err, txt: String(so || "") + String(se || "") })));
      if (out.err && !/already exists/i.test(out.txt)) return { ok: false, error: "MCP 등록 실패: " + out.txt.trim().slice(0, 300) };
      MCPCHK.at = 0; USAGE.hAt = 0; spawnHidden("mcp-login", "claude", ["mcp", "login", "higgsfield"]);
      return { ok: true, message: "등록 완료 — 브라우저에서 Higgsfield 인증을 마치세요", poll: true };
    }
    case "auth-mcp":
      MCPCHK.at = 0; USAGE.hAt = 0; spawnHidden("mcp-login", "claude", ["mcp", "login", "higgsfield"]);
      return { ok: true, message: "브라우저에서 Higgsfield 인증을 마치세요", poll: true };
    case "run-claude": {                       // 터미널로 열기 (대화형)
      const name = q.get("name") || "";
      if (!isProjectDir(name)) return { ok: false, error: "없는 프로젝트입니다" };
      openTerminal(name, [`claude "${name} 만들어줘"`]);
      return { ok: true, message: `Claude Code 가 '${name} 만들어줘' 로 시작합니다` };
    }
    case "open-root": shell.openPath(ROOT); return { ok: true, message: "폴더를 열었습니다" };
    case "open-folder": {
      const name = q.get("name") || "", sub = q.get("sub") || "";
      if (!isProjectDir(name)) return { ok: false, error: "없는 프로젝트입니다" };
      const segs = sub.split(/[\\/]/).map(s => s.replace(/[.:*?"<>|]/g, "")).filter(Boolean).slice(0, 3);
      const p = path.join(ROOT, name, ...segs); shell.openPath(isDir(p) ? p : path.join(ROOT, name)); return { ok: true, message: "폴더를 열었습니다" };
    }
    case "open-file": {                        // 프로젝트 안의 파일(기획안.md 등)을 기본 앱으로
      const name = q.get("name") || "", f = q.get("file") || "";
      if (!isProjectDir(name) || f.includes("..") || !/^[\w가-힣 .()\-\/]+$/.test(f)) return { ok: false, error: "열 수 없는 파일" };
      const p = path.join(ROOT, name, f); if (!isFile(p)) return { ok: false, error: "파일이 없습니다" };
      shell.openPath(p); return { ok: true, message: "열었습니다" };
    }
    case "pick-root": {
      const r = await dialog.showOpenDialog(win, { title: "프로젝트 루트 폴더", defaultPath: ROOT, properties: ["openDirectory"] });
      if (r.canceled || !r.filePaths[0]) return { ok: false, error: "취소했습니다" };
      ROOT = r.filePaths[0]; writeCfg(Object.assign(readCfg(), { root: ROOT }));
      return { ok: true, message: "루트 폴더를 바꿨습니다", root: ROOT };
    }
    default: return { ok: false, error: "모르는 동작: " + act };
  }
}

/* ── Claude Code 헤드리스 실행 (제작 · 검수 반영 · 기획안 · 한 장 · 제품 컷 · 이어하기) ── */
const STAGES = { make: ["준비", "사진 분석", "기획안", "타일 생성", "오타 검수", "정리"], revise: ["준비", "영역 확인", "수정 생성", "오타 검수", "교체"],
  plan: ["준비", "사진 분석", "기획안", "정리"], tile: ["준비", "참고 확인", "타일 생성", "오타 검수", "정리"], productcut: ["준비", "사진 분석", "컷 생성", "대조 검수", "정리"], custom: ["준비", "작업", "정리"] };
const MAINSTAGE = { make: "타일 생성", revise: "수정 생성", plan: "기획안", tile: "타일 생성", productcut: "컷 생성", custom: "작업" };
const MODE_LABEL = { make: "제작", revise: "검수 반영", plan: "기획안", tile: "한 장 제작", productcut: "제품 컷", custom: "AI 작업", resume: "이어서 하기" };
const NEED_HF = new Set(["make", "revise", "tile", "productcut"]);
const MARK = mode => `[진행 표시 규칙] 작업 중 아래 형식의 줄을 답변 텍스트에 그대로 남겨라(콘솔이 진행률로 읽는다): 단계가 바뀔 때마다 "▶ 단계: ${(STAGES[mode] || STAGES.custom).join("|")}" 중 하나, ${mode === "plan" ? "기획 한 장을 확정할 때마다" : "이미지 한 장을 저장할 때마다"} "▶ 타일: n/N 이름". N 은 총 장수.`;
const PROMPTS = {
  photo: mode => mode === "keep"
    ? `제품 사진 처리 = 원본 그대로 합성(TRACK A): 제품이 등장하는 타일은 remove_background → upscale_image → PIL 합성으로 원본 픽셀을 보존한다. 재생성 금지.`
    : `제품 사진 처리 = AI 고화질 재현(사용자 선택): 원본 사진이 저화질이므로 그대로 쓰지 말고, 원본을 image_references 로 넣어(먼저 upscale_image 를 최대 2회) 제품의 형태·비율·색·로고·라벨 글자(글자 모양·배치까지)를 원본과 똑같이 유지한 스튜디오 품질 제품 컷을 gpt_image_2_5 · resolution 2k · quality high 로 새로 만든다(깨끗한 조명·선명한 라벨·있어 보이는 연출). 라벨 글자는 확대해서 한 글자씩 원본과 대조한다. 라벨에 실제로 있는 글자는 철자를 프롬프트에 그대로 명시하고, 없는 글자·인증마크·원산지·수치는 절대 추가하지 않는다. 생성 후 원본과 나란히 놓고 로고·글자·형태가 다르면 최대 2회 재생성, 그래도 다르면 그 타일만 TRACK A(원본 합성)로 후퇴하고 기획안에 【확인】 을 남긴다.`,
  /* 승인된 기획안 · 승인된 제품 컷이 있으면 그것을 따른다 */
  extras(n) {
    const d = path.join(ROOT, n), out = [];
    const plan = readJson(path.join(d, "plan.json"));
    if (plan && plan.approvedAt && Array.isArray(plan.tiles) && plan.tiles.length) out.push(`[승인된 기획안] ${n}/plan.json 은 사용자가 검토·수정 후 승인한 기획안이다(${plan.tiles.length}장). 기획안 단계는 새로 짜지 말고, 타일 수·순서·섹션·카피(head/sub/body)를 plan.json 과 글자 하나까지 똑같이 쓴다. visual 은 연출 지시로 따른다. ${n}/기획안.md 는 plan.json 과 맞게만 갱신한다. 타일 파일명은 plan.json 의 n 값(예: 01.png)을 쓴다.`);
    const ap = readJson(path.join(d, "product", "approved.json"));
    if (ap && ap.file && isFile(path.join(d, "product", ap.file))) out.push(`[승인된 제품 컷] ${n}/product/${ap.file} 은 사용자가 원본과 비교해 승인한 제품 이미지다. 제품이 크게 나오는 타일은 이 컷을 remove_background → PIL 합성으로 그대로 쓰고(픽셀 보존), 각도·연출이 달라야 하는 타일만 이 컷을 image_references 첫 번째로 넣어 생성하되 형태·로고·라벨 글자를 이 컷과 똑같이 유지한다. 제품 컷 자체를 다시 만들지 않는다.`);
    return out.join("\n");
  },
  make: (n, o) => `${MARK("make")}
${n} 만들어줘. 먼저 README.md 를 읽고 그 규칙(6절 기술 규칙, 특히 6-4 제품 무왜곡 TRACK A, 8절 절대 금지)을 그대로 따른다. ${n}/order.json 의 브리프·사진 분석·페이지 구성을 읽고 기획안(${n}/기획안.md) → Higgsfield gpt_image_2_5 로 타일 생성 → 한 글자씩 오타 검수 → ${n}/tiles/NN.png 와 tiles/manifest.json(name·copy·ratio) 저장까지 끝낸다. ${PROMPTS.photo(o.photoMode)}
${PROMPTS.extras(n)}
기존 tiles/ 파일은 콘솔이 tiles/_history 에 이미 백업했으니 덮어써도 된다. 수치·인증·후기·마감은 order.json 에 있는 실제 값만 쓴다. 질문이 있으면 멈추지 말고 가장 안전한 쪽으로 진행하고 기획안에 【확인】 으로 남긴다. 끝나면 마지막 줄에 '완료: 타일 N장' 이라고 답한다.`,
  plan: (n, o) => `${MARK("plan")}
${n} 의 기획안만 먼저 짜줘. 이번에는 이미지를 만들지 않는다(Higgsfield 호출 금지). 먼저 README.md 를 읽고 카피·섹션 규칙과 8절 절대 금지를 따른다. ${n}/order.json 의 브리프·사진 분석·페이지 구성을 읽고, ${n} 폴더의 제품 사진(최상위 이미지 파일)을 Read 로 한 번에 모두 본 뒤 ${n}/기획안.md 와 ${n}/plan.json 을 쓴다.
plan.json 형식(JSON 하나, 다른 키 금지): {"tiles":[{"n":"01","name":"섹션 이름","goal":"이 장의 역할 한 줄","head":"메인 카피","sub":"서브 카피","body":"본문·보조 문구(여러 줄은 \\n)","visual":"비주얼 연출 설명 1~2문장","product":true}],"confirm":["고객에게 확인이 필요한 사항"]}
n 은 01부터 두 자리. 섹션 순서는 order.json 의 페이지 구성을 따른다. 수치·인증·후기·마감은 order.json 에 있는 실제 값만 쓰고, 없으면 해당 문구 자리에 【실제 데이터】 라고 쓴다. ${o.note ? "사용자 요청: " + o.note : ""} 끝나면 마지막 줄에 '완료: 기획 N장' 이라고 답한다.`,
  tile: (n, o) => {
    const list = tileFiles(n).map(t => t.stem), i = list.indexOf(o.tile), prev = list[i - 1] || "", next = list[i + 1] || "";
    const refs = [o.tile, prev, next].filter(Boolean).map(s => `${n}/tiles/${s}.png`).join(", ");
    return o.op === "insert"
      ? `${MARK("tile")}
${n} 에서 타일 ${o.tile} 바로 뒤에 새 타일 한 장을 추가해줘. 먼저 README.md 규칙을 읽는다. ${n}/기획안.md 와 tiles/manifest.json 으로 전체 흐름을 파악하고, 앞뒤 타일(${refs})을 Read 로 보고 image_references 로 넣어 폭·비율·톤앤매너·팔레트·서체·여백을 똑같이 맞춘다. 사용자 요청: ${o.note || "(없음 — 흐름상 빠진 내용을 한 장 보강)"}. ${PROMPTS.photo(o.photoMode)}
${PROMPTS.extras(n)}
결과 파일명은 반드시 ${n}/tiles/${o.newId}.png. manifest.json 에 "${o.newId}": {"name","copy","ratio"} 항목만 추가하고 _order 를 포함한 다른 키는 그대로 둔다(순서는 콘솔이 넣는다). 기획안.md 에도 이 장을 추가한다. 한 글자씩 오타 검수. 끝나면 마지막 줄에 '완료: 타일 1장'.`
      : `${MARK("tile")}
${n} 의 타일 ${o.tile} 한 장만 다시 만들어줘. 먼저 README.md 규칙을 읽는다. ${n}/tiles/manifest.json 과 ${n}/기획안.md 에서 ${o.tile} 의 섹션 이름·카피를 확인하고, 지금 이미지와 앞뒤 타일(${refs})을 Read 로 보고 image_references 로 넣어 톤앤매너·팔레트·서체·여백을 맞춘다. 사용자 요청: ${o.note || "(없음 — 같은 기획으로 완성도를 더 높여서)"}. 요청에 없는 카피는 바꾸지 않는다. ${PROMPTS.photo(o.photoMode)}
${PROMPTS.extras(n)}
결과는 ${n}/tiles/${o.tile}.png 로 저장한다(기존 파일은 콘솔이 tiles/_history 에 이미 백업했다). manifest.json 은 ${o.tile} 항목(name·copy)만 필요할 때 갱신하고 _order 등 다른 키는 그대로 둔다. 한 글자씩 오타 검수. 끝나면 마지막 줄에 '완료: 타일 1장'.`;
  },
  productcut: (n, o) => `${MARK("productcut")}
${n} 의 제품 컷만 먼저 만들어줘(상세페이지 타일은 만들지 말 것). 먼저 README.md 의 6-4 제품 무왜곡 규칙을 읽는다. ${n} 폴더의 원본 제품 사진(최상위 이미지 파일)을 Read 로 한 번에 모두 보고, 제품의 형태·비율·색·로고·라벨 글자(글자 모양·배치까지)를 원본과 똑같이 유지한 스튜디오 품질 제품 컷 2장을 만든다.
- ${o.k1} = 흰 배경 정면 누끼 컷, ${o.k2} = 연출 컷(${o.note || "order.json 브리프의 분위기에 맞는 배경·조명"}).
- 방법: 가장 선명한 원본을 upscale_image(최대 2회) 한 뒤 image_references 로 넣고 gpt_image_2_5 · resolution 2k · quality high. 라벨에 실제로 있는 글자는 철자를 프롬프트에 그대로 명시하고, 없는 글자·인증마크·원산지·수치는 절대 추가하지 않는다.
- 생성 후 원본과 나란히 놓고 로고·글자·형태를 한 글자씩 대조, 다르면 최대 2회 재생성.
결과: ${n}/product/${o.k1}, ${n}/product/${o.k2}. 그리고 ${n}/product/cuts.json 의 "cuts" 배열에 {"file":"파일명","kind":"누끼|연출","from":"참고한 원본 파일명","check":"대조 결과 한 줄"} 를 추가한다(기존 항목 유지). 끝나면 마지막 줄에 '완료: 제품 컷 2장'.`,
  revise: (n, o) => `${MARK("revise")}
${n} 검수 반영해줘. 먼저 README.md 의 규칙을 읽는다. ${n}/review.json 을 읽어라 — 타일마다 regions(이미지 기준 0~1 비율 x,y,w,h 와 코멘트 text) 와 note 가 있고, ${n}/review/NN_marked.png 에는 그 영역이 빨간 번호 박스로 표시돼 있다.
- 일반 영역: 원본 tiles/NN.png 를 image_references 로 넣고 marked 이미지도 함께 참조해 '번호 영역만 코멘트대로 바꾸고 나머지는 전부 동일하게 유지'(MAKE EXACTLY N CHANGES) 방식으로 Higgsfield gpt_image_2_5 편집을 돌린다.
- kind 가 "text" 인 영역은 글자 교체 요청이다: 그 영역 안의 글자 from 을 to 로 정확히 바꾼다. to 는 사용자가 적은 그대로 한 글자도 바꾸지 말고, 서체·굵기·크기·색·자간·정렬·줄 위치는 원래 글자와 동일하게, 다른 글자·이미지는 그대로 둔다. 편집 프롬프트에 'Replace the text "from" with "to"' 처럼 두 문자열을 그대로 명시한다.
톤앤매너·팔레트·서체·제품 형태는 요청에 명시되지 않는 한 절대 바꾸지 않는다. 결과는 tiles/edits/NN_v{k}.png 에 저장하고 한 글자씩 대조(특히 text 영역은 to 와 정확히 같은지)한 뒤 tiles/NN.png 를 수정본으로 덮어쓴다(원본은 콘솔이 tiles/_history 에 이미 백업했다). 끝나면 마지막 줄에 '완료: 수정 N장' 이라고 답한다.`
};
const RESUME_PROMPT = mode => `이전 작업이 중간에 끊겼다. 같은 규칙과 [진행 표시 규칙] 그대로 이어서 진행해라. 이미 저장된 파일은 다시 만들지 말고 확인만 한 뒤 남은 작업을 끝낸다. 지금 단계를 "▶ 단계:" 로 먼저 알려라. 끝나면 마지막 줄에 '완료: …' 형식으로 답한다. (작업 종류: ${MODE_LABEL[mode] || mode})`;
const RESUME_TAIL = `\n[이어서 하기] 이전 실행이 중간에 끊겼다. 이미 저장된 tiles·기획안은 그대로 두고, 먼저 무엇이 끝났는지 확인한 뒤 남은 것만 이어서 만든다.`;
/* AI 쪽 오류를 사람 말로 */
function friendlyErr(t) {
  t = String(t || "");
  if (/credit balance is too low/i.test(t)) return "Max 플랜 사용량 한도에 도달했고 '추가 사용량' 잔액이 0입니다 — claude.ai 설정 → 사용량에서 리셋 시각을 확인하거나 추가 사용량을 충전하세요. (" + t.slice(0, 80) + ")";
  if (LOGIN_RE.test(t)) { AUTH.at = 0; return "Claude 로그인이 만료됐습니다 — [다시 로그인] 을 누르고 브라우저에서 로그인만 하면 됩니다. (" + t.slice(0, 90) + ")"; }
  if (/rate limit|429|usage limit|limit reached/i.test(t)) return "사용량 한도에 도달했습니다 — 리셋 시각 이후 다시 시도하세요. (" + t.slice(0, 120) + ")";
  if (/max turns|max_turns/i.test(t)) return "작업이 턴 한도에 걸려 중단됐습니다 — 다시 실행하면 이어서 진행합니다. (" + t.slice(0, 120) + ")";
  return "AI 응답 오류: " + t.slice(0, 300);
}
const RUNS = new Map();                                   // 프로젝트 이름 → 실행 객체 (동시에 여러 프로젝트 제작 가능)
const anyRunning = () => [...RUNS.values()].some(r => r.proc && r.exit == null);
const runningCount = () => [...RUNS.values()].filter(r => r.proc && r.exit == null).length;
const runFor = name => RUNS.get(name) || null;
function makeRun() { return Object.assign(Object.create(RUN_PROTO), { proc: null, name: "", mode: "", lines: [], startedAt: 0, done: false, exit: null, stage: "", stageIdx: -1, tileDone: 0, tileTotal: 0, tileName: "", last: "",
  sid: "", hf: 0, gen: 0, cost: 0, turns: 0, userStopped: false, abortReason: "", resumes: 0, pendingResume: false, resumeTimer: null, resultError: false, lastErr: "", segStart: 0, opts: {}, qid: null, resumed: false }); }
async function startRun(name, mode, b, qid) {
  if (!isProjectDir(name)) return { ok: false, error: "없는 프로젝트입니다" };
  if (!(await loginOk())) return NEED_LOGIN;
  const cur = runFor(name); if (cur && cur.proc && cur.exit == null) return { ok: false, error: "이 프로젝트는 이미 AI 작업 중입니다" };
  if (runningCount() >= 3) return { ok: false, error: "동시에 3개까지만 돌릴 수 있습니다" };
  const r = makeRun(); r.qid = qid || null;
  const out = r.start(name, mode, b || {});
  if (out.ok) { RUNS.set(name, r); power(); }
  return out;
}
const RUN_PROTO = {
  stages() { return STAGES[this.mode] || STAGES.custom; },
  mainStage() { return MAINSTAGE[this.mode] || "작업"; },
  pct() {
    const st = this.stages(); if (this.done && this.exit === 0) return 100;
    if (this.stageIdx < 0) return 2;
    const mainIdx = Math.max(0, st.indexOf(this.mainStage()));
    // 생성 단계가 가장 길다: 앞 단계 25%, 생성 60%, 뒤 단계 15%
    if (this.stageIdx < mainIdx) return Math.round(4 + 21 * (this.stageIdx + 1) / Math.max(1, mainIdx));
    if (this.stageIdx === mainIdx) return Math.round(25 + 60 * (this.tileTotal ? Math.min(1, this.tileDone / this.tileTotal) : 0.15));
    return Math.round(85 + 15 * (this.stageIdx - mainIdx) / Math.max(1, st.length - 1 - mainIdx));
  },
  summary() { return { running: !!(this.proc && this.exit == null), name: this.name, mode: this.mode, done: this.done, exit: this.exit, count: this.lines.length, startedAt: this.startedAt, runId: this.startedAt,
    stages: this.stages(), stage: this.stage, stageIdx: this.stageIdx, tileDone: this.tileDone, tileTotal: this.tileTotal, tileName: this.tileName, pct: this.pct(), last: this.last,
    resumes: this.resumes, pendingResume: this.pendingResume, stopped: this.userStopped, abort: this.abortReason, hf: this.hf, gen: this.gen, cost: this.cost, resumed: this.resumed,
    tile: this.opts.tile || "", op: this.opts.op || "", newId: this.opts.newId || "", canResume: !!(this.done && this.exit !== 0 && !this.abortReason), qid: this.qid, needLogin: !!(this.done && this.exit !== 0 && LOGIN_RE.test(this.lastErr)) }; },
  setStage(name) { const st = this.stages(); const i = st.indexOf(name); if (i >= 0 && i >= this.stageIdx) { this.stageIdx = i; this.stage = name; } },
  /* 텍스트 마커(▶ 단계 / ▶ 타일) 우선, 없으면 도구 호출로 추정 */
  track(kind, text) {
    if (kind === "ai") {
      let m; const re1 = /▶\s*단계\s*[:：]\s*([^\n]+)/g; while ((m = re1.exec(text))) this.setStage(m[1].trim());
      const re2 = /▶\s*타일\s*[:：]\s*(\d+)\s*\/\s*(\d+)\s*([^\n]*)/g; while ((m = re2.exec(text))) { this.tileDone = +m[1]; this.tileTotal = +m[2]; this.tileName = m[3].trim(); this.setStage(this.mainStage()); }
      const plain = text.replace(/▶[^\n]*/g, "").trim(); if (plain) this.last = plain.slice(0, 140);
    } else if (kind === "tool") {
      const t = text;
      if (this.stageIdx < 0) this.setStage("준비");
      if (/^Read — .*\.(png|jpe?g|webp)/i.test(t)) { this.setStage(this.mode === "tile" ? "참고 확인" : this.mode === "revise" ? "영역 확인" : "사진 분석"); }
      if (/기획안|plan\.json/.test(t) && /^(Write|Edit)/.test(t)) this.setStage(this.mode === "plan" ? (/plan\.json/.test(t) ? "정리" : "기획안") : "기획안");
      if (/^mcp__higgsfield/.test(t)) this.setStage(this.mainStage());
      if (/manifest\.json|cuts\.json/.test(t) && /^(Write|Edit)/.test(t)) this.setStage("정리");
      this.last = t.slice(0, 140);
    }
  },
  push(kind, text) { this.lines.push({ t: Date.now(), kind, text: String(text).slice(0, 4000) }); if (this.lines.length > 2000) this.lines.splice(0, this.lines.length - 2000); if (kind === "err") this.lastErr = String(text).slice(0, 400); },
  start(name, mode, o) {
    o = o || {};
    const photoMode = o.photoMode === "keep" ? "keep" : "regen";
    let prompt = o.prompt || "", extra = [], disp = mode;
    if (mode === "resume") {
      const last = readRuns(name).last;
      if (!last || !last.mode || !PROMPTS[last.mode]) return { ok: false, error: "이어서 할 작업 기록이 없습니다" };
      disp = last.mode; this.opts = Object.assign({}, last.opts || {}, { photoMode: (last.opts && last.opts.photoMode) || photoMode });
      if (last.sid) { prompt = RESUME_PROMPT(disp); extra = ["--resume", last.sid]; this.sid = last.sid; }
      else prompt = PROMPTS[disp](name, this.opts) + RESUME_TAIL;
      this.resumed = true;
    } else if (!prompt) {
      if (!PROMPTS[mode] || mode === "photo" || mode === "extras") return { ok: false, error: "모르는 모드" };
      this.opts = { photoMode, note: String(o.note || "").slice(0, 1500) };
      if (mode === "tile") {
        const stems = tileFiles(name).map(t => t.stem);
        if (!stems.includes(o.tile)) return { ok: false, error: "없는 타일입니다: " + (o.tile || "") };
        this.opts.tile = o.tile; this.opts.op = o.op === "insert" ? "insert" : "regen";
        if (this.opts.op === "insert") this.opts.newId = newTileId(name, o.tile);
      }
      if (mode === "productcut") {
        const pd = path.join(ROOT, name, "product"); let k = 1; const have = f => fs.existsSync(path.join(pd, f));
        while (have(`cut_${k}.png`) || have(`cut_${k + 1}.png`)) k++;
        this.opts.k1 = `cut_${k}.png`; this.opts.k2 = `cut_${k + 1}.png`;
        if (!listImages(path.join(ROOT, name), "").length) return { ok: false, error: "원본 제품 사진이 없습니다" };
      }
      if (mode === "plan" && !fs.existsSync(path.join(ROOT, name, "order.json"))) return { ok: false, error: "브리프(order.json)가 없습니다 — 브리프를 저장한 뒤 다시 누르세요" };
      prompt = PROMPTS[mode](name, this.opts);
    } else this.opts = { photoMode };
    this.name = name; this.mode = STAGES[disp] ? disp : "custom"; this.lines = []; this.done = false; this.exit = null; this.startedAt = Date.now();
    this.stage = ""; this.stageIdx = -1; this.tileDone = 0; this.tileTotal = 0; this.tileName = ""; this.last = "";
    // 바꾸기 전에 지금 타일을 버전 기록으로
    try { if (this.mode === "make" || this.mode === "revise") snapshotTiles(name); else if (this.mode === "tile" && this.opts.op !== "insert") snapshotTiles(name, [this.opts.tile]); } catch (e) { logErr(e); }
    writeRuns(name, j => { j.last = { mode: this.mode, opts: this.opts, at: this.startedAt, sid: this.sid || "", exit: null }; });
    actLog(name, "run", `${MODE_LABEL[this.mode] || this.mode}${this.opts.tile ? " " + this.opts.tile + (this.opts.op === "insert" ? " 뒤에 추가" : " 다시") : ""} 시작${this.resumed ? " (이어서)" : ""}${this.qid ? " · 대기열" : ""}`);
    this.push("sys", `시작 — ${MODE_LABEL[this.mode] || this.mode}${this.resumed ? " (이어서)" : ""} · ${name}`);
    return this.launch(prompt, extra);
  },
  launch(prompt, extra) {
    // 프롬프트는 stdin 으로 — 한글·공백이 든 인자를 cmd.exe 가 쪼개 버린다(첫 단어만 전달되는 사고)
    // 사용자 기본 모델이 opus[1m](1M 컨텍스트)이면 Max 한도를 훨씬 빨리 소진한다 → 일반 opus 로 고정
    const args = ["-p", ...(extra || []), "--model", "claude-opus-5", "--output-format", "stream-json", "--verbose", "--permission-mode", "acceptEdits",
      "--allowedTools", "Read", "Write", "Edit", "MultiEdit", "Glob", "Grep", "Bash", "mcp__higgsfield", "WebFetch"];
    if (!this.proc) this.proc = { pending: true };
    claudeGate().then(() => this.spawnSeg(prompt, args));
    return { ok: true, message: "시작했습니다" };
  },
  spawnSeg(prompt, args) {
    if (this.exit != null) return;
    if (this.userStopped) return this.finish(-2);
    let p;
    try { p = spawn("claude", args, { cwd: ROOT, windowsHide: true, shell: IS_WIN, stdio: ["pipe", "pipe", "pipe"], env: Object.assign({}, process.env, { PYTHONUTF8: "1" }) }); }
    catch (e) { this.push("err", "실행 실패: " + e.message); return this.finish(-1); }
    this.proc = p; this.segStart = Date.now(); this.resultError = false;
    try { p.stdin.write(prompt, "utf8"); p.stdin.end(); } catch (e) { this.push("err", "프롬프트 전달 실패: " + e.message); }
    let buf = "", ended = false;
    const end = code => { if (ended) return; ended = true; if (buf.trim()) { this.ingest(buf.trim()); buf = ""; } this.segEnd(code); };
    p.stdout.on("data", d => { buf += d.toString("utf8"); let i; while ((i = buf.indexOf("\n")) >= 0) { const ln = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (ln) this.ingest(ln); } });
    p.stderr.on("data", d => { const s = d.toString("utf8").trim(); if (s) this.push("err", s); });
    p.on("error", e => { this.push("err", "실행 오류: " + e.message); end(-1); });
    p.on("close", code => end(code == null ? -1 : code));
  },
  /* 한 번의 claude 실행이 끝났을 때: 실패면 조건이 맞을 때 같은 세션으로 자동 이어하기 */
  segEnd(code) {
    if (this.exit != null) return;
    const ok = code === 0 && !this.resultError;
    if (this.userStopped) return this.finish(-2);
    if (!ok && this.canAutoResume()) {
      this.resumes++; this.pendingResume = true;
      this.push("sys", `작업이 중간에 끊겼습니다 — 8초 뒤 같은 세션으로 자동으로 이어서 진행합니다 (${this.resumes}/2)`);
      this.resumeTimer = setTimeout(() => {
        this.resumeTimer = null; this.pendingResume = false;
        if (this.userStopped) return this.finish(-2);
        this.push("sys", "이어서 진행 — 세션 " + this.sid.slice(0, 8));
        actLog(this.name, "run", `${MODE_LABEL[this.mode]} 자동 이어하기 (${this.resumes}회)`);
        this.launch(RESUME_PROMPT(this.mode), ["--resume", this.sid]);
      }, 8000);
      return;
    }
    this.finish(ok ? 0 : (code === 0 ? 1 : code));
  },
  canAutoResume() {
    if (this.abortReason || !this.sid || this.resumes >= 2) return false;
    if (readCfg().autoResume === false) return false;
    if (LOGIN_RE.test(this.lastErr) || /로그인|사용량 한도|credit|limit|Higgsfield MCP 가 연결/i.test(this.lastErr)) return false;
    return Date.now() - this.segStart > 45000;                           // 시작하자마자 죽는 오류는 되풀이하지 않는다
  },
  finish(code) {
    if (this.exit != null) return;
    this.exit = code; this.done = true; this.pendingResume = false;
    if (code === 0) this.stageIdx = this.stages().length - 1;
    this.push("sys", code === 0 ? "끝" : code === -2 ? "중단됨" : "종료 코드 " + code);
    try {
      if (code === 0 && this.mode === "tile" && this.opts.op === "insert" && this.opts.newId) {
        if (tileFiles(this.name).some(t => t.stem === this.opts.newId)) insertOrder(this.name, this.opts.tile, this.opts.newId);
        else this.push("err", `새 타일(${this.opts.newId}.png)을 찾지 못했습니다`);
      }
    } catch (e) { logErr(e); }
    const rec = { mode: this.mode, at: this.startedAt, end: Date.now(), exit: code, cost: +this.cost.toFixed(4), turns: this.turns, hf: this.hf, gen: this.gen, sid: this.sid, resumes: this.resumes, resumed: this.resumed, opts: this.opts, stopped: this.userStopped, abort: this.abortReason, err: code === 0 ? "" : this.lastErr.slice(0, 200), qid: this.qid };
    writeRuns(this.name, j => { j.runs = j.runs || []; j.runs.push(rec); j.last = rec; });
    actLog(this.name, code === 0 ? "done" : "fail", `${MODE_LABEL[this.mode] || this.mode} ${code === 0 ? "완료" : code === -2 ? "중단" : "실패"} · ${Math.max(1, Math.round((Date.now() - this.startedAt) / 60000))}분${this.gen ? " · 이미지 호출 " + this.gen + "회" : ""}${code === 0 ? "" : " — " + this.lastErr.slice(0, 80)}`);
    onRunFinished(code, this);
    try { Q.onFinish(this); } catch (e) { logErr(e); }
    power();
    if (!anyRunning() && UPD.state === "downloaded-wait") { UPD.state = "downloaded"; setTimeout(() => UPD.tryInstall(), 15000); }
  },
  ingest(ln) {
    let j; try { j = JSON.parse(ln); } catch (e) { return this.push("raw", ln); }
    if (j.type === "assistant" && j.message && Array.isArray(j.message.content)) {
      for (const c of j.message.content) {
        if (c.type === "text" && c.text && c.text.trim()) { this.push("ai", c.text.trim()); this.track("ai", c.text); }
        else if (c.type === "tool_use") {
          const inp = c.input || {}; const brief = inp.description || inp.file_path || inp.command || inp.prompt || inp.pattern || ""; const line = c.name + (brief ? " — " + String(brief).slice(0, 160) : "");
          if (/^mcp__higgsfield/.test(c.name || "")) { this.hf++; if (/generat|edit|upscale|remove_background|create|image/i.test(c.name)) this.gen++; }
          this.push("tool", line); this.track("tool", line);
        }
      }
    } else if (j.type === "result") {
      if (j.total_cost_usd != null) this.cost += +j.total_cost_usd || 0; if (j.num_turns) this.turns += +j.num_turns || 0;
      if (j.is_error) this.resultError = true;
      this.push("sys", (j.is_error ? "오류로 끝남" : "완료") + (j.total_cost_usd != null ? ` · $${(+j.total_cost_usd).toFixed(3)}` : "") + (j.num_turns ? ` · ${j.num_turns}턴` : ""));
      if (j.is_error) this.push("err", friendlyErr(String(j.result || j.subtype || "")));
    } else if (j.type === "system" && j.subtype === "init") {
      if (j.session_id) { this.sid = j.session_id; writeRuns(this.name, r => { r.last = Object.assign(r.last || {}, { sid: this.sid }); }); }
      this.push("sys", `모델 ${j.model || ""} · MCP ${(j.mcp_servers || []).map(m => m.name + ":" + m.status).join(", ") || "없음"}`);
      const hf = (j.mcp_servers || []).find(m => m.name === "higgsfield");
      if (NEED_HF.has(this.mode) && (!hf || /needs-auth|failed|error/i.test(hf.status || ""))) { this.abortReason = "hf"; this.push("err", "Higgsfield MCP 가 연결되지 않았습니다(" + (hf ? hf.status : "미등록") + ") — 설정 → 연결에서 Higgsfield 인증을 다시 하세요. 이미지 생성이 안 되므로 작업을 중단합니다."); MCPCHK.at = 0; setTimeout(() => this.stop(), 300); }
    }
  },
  stop() {
    if (this.exit != null) return { ok: false, error: "실행 중이 아닙니다" };
    this.userStopped = true;
    if (this.resumeTimer) { clearTimeout(this.resumeTimer); this.resumeTimer = null; this.push("sys", "사용자가 중단"); this.finish(-2); return { ok: true, message: "중단했습니다" }; }
    if (this.proc && this.proc.pid) { try { if (IS_WIN) exec(`taskkill /PID ${this.proc.pid} /T /F`, { windowsHide: true }); else this.proc.kill("SIGTERM"); } catch (e) {} }
    this.push("sys", this.abortReason === "hf" ? "Higgsfield 미연결로 중단" : "사용자가 중단"); return { ok: true, message: "중단했습니다" };
  }
};

/* ── 대기열 + 야간 배치 (userData/queue.json) ──────────── */
const Q = {
  items: [], timer: null,
  file() { return path.join(app.getPath("userData"), "queue.json"); },
  load() {
    let j = null; try { j = JSON.parse(fs.readFileSync(this.file(), "utf8")); } catch (e) {}
    this.items = Array.isArray(j && j.items) ? j.items : [];
    for (const it of this.items) if (it.status === "running") { it.status = "waiting"; it.mode = "resume"; it.info = "앱이 꺼져서 이어서 하기로 다시 대기"; }
    this.save();
  },
  save() { try { fs.mkdirSync(path.dirname(this.file()), { recursive: true }); fs.writeFileSync(this.file(), JSON.stringify({ items: this.items }, null, 2)); } catch (e) {} },
  conc() { return clampN(+(readCfg().queueConc || 1) || 1, 1, 3); },
  get() { return { ok: true, items: this.items, conc: this.conc(), now: Date.now() }; },
  pending() { return this.items.some(i => i.status === "waiting"); },
  add(b) {
    const name = b.name || "", mode = b.mode || "make";
    if (!isProjectDir(name)) return { ok: false, error: "없는 프로젝트입니다" };
    if (!["make", "revise", "plan", "tile", "productcut", "resume"].includes(mode)) return { ok: false, error: "대기열에 넣을 수 없는 작업" };
    if (this.items.some(i => i.status === "waiting" && i.name === name && i.mode === mode && (i.tile || "") === (b.tile || ""))) return { ok: false, error: "같은 작업이 이미 대기 중입니다" };
    const it = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, mode, photoMode: b.photoMode || "", tile: b.tile || "", op: b.op || "", note: String(b.note || "").slice(0, 1500),
      startAt: +b.startAt || 0, addedAt: Date.now(), status: "waiting" };
    this.items.push(it); this.save();
    actLog(name, "queue", `대기열 추가 — ${MODE_LABEL[mode] || mode}${it.startAt ? " · " + new Date(it.startAt).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) + " 예약" : ""}`);
    setTimeout(() => this.tick(), 400); power();
    return { ok: true, item: it, message: it.startAt ? "예약했습니다" : "대기열에 넣었습니다" };
  },
  act(what, id, b) {
    const i = this.items.findIndex(x => x.id === id);
    if (what === "clear") { this.items = this.items.filter(x => x.status === "waiting" || x.status === "running"); this.save(); return { ok: true }; }
    if (i < 0) return { ok: false, error: "없는 항목" };
    const it = this.items[i];
    if (what === "remove") { if (it.status === "running") return { ok: false, error: "실행 중인 작업은 실행 패널에서 중단하세요" }; this.items.splice(i, 1); this.save(); power(); return { ok: true }; }
    if (what === "now") { if (it.status !== "waiting") return { ok: false, error: "대기 중인 항목이 아닙니다" }; it.startAt = 0; this.items.splice(i, 1); const w = this.items.findIndex(x => x.status === "waiting"); this.items.splice(w < 0 ? this.items.length : w, 0, it); this.save(); setTimeout(() => this.tick(), 200); return { ok: true }; }
    if (what === "retry") { if (it.status !== "failed") return { ok: false, error: "실패한 항목만" }; it.status = "waiting"; it.mode = "resume"; it.error = ""; it.startAt = 0; this.save(); setTimeout(() => this.tick(), 200); return { ok: true }; }
    if (what === "time") { it.startAt = +(b && b.startAt) || 0; this.save(); power(); return { ok: true }; }
    if (what === "up" || what === "down") { const j = what === "up" ? i - 1 : i + 1; if (j < 0 || j >= this.items.length) return { ok: true }; [this.items[i], this.items[j]] = [this.items[j], this.items[i]]; this.save(); return { ok: true }; }
    return { ok: false, error: "모르는 동작" };
  },
  async tick() {
    if (this.ticking) return; this.ticking = true;
    try { await this.tick1(); } catch (e) { logErr(e); } finally { this.ticking = false; }
  },
  async tick1() {
    const now = Date.now(); let changed = false;
    for (const it of this.items) {
      if (it.status !== "waiting" || (it.startAt && it.startAt > now)) continue;
      if (runningCount() >= this.conc()) break;
      const cur = runFor(it.name); if (cur && cur.proc && cur.exit == null) continue;
      const out = await startRun(it.name, it.mode, { photoMode: it.photoMode, tile: it.tile, op: it.op, note: it.note }, it.id);
      if (out.needLogin) { if (it.info !== "Claude 로그인 필요 — 로그인하면 이어서 시작") { it.info = "Claude 로그인 필요 — 로그인하면 이어서 시작"; changed = true; } break; }
      it.info = "";
      if (out.ok) { it.status = "running"; it.startedAt = now; } else { it.status = "failed"; it.error = out.error; it.endedAt = now; }
      changed = true;
    }
    if (changed) this.save();
    power();
  },
  onFinish(run) {
    if (!run.qid) return; const it = this.items.find(x => x.id === run.qid); if (!it) return;
    it.status = run.exit === 0 ? "done" : "failed"; it.endedAt = Date.now(); it.error = run.exit === 0 ? "" : (run.lastErr || "종료 코드 " + run.exit).slice(0, 200);
    const fin = this.items.filter(x => x.status === "done" || x.status === "failed"); if (fin.length > 30) { const drop = new Set(fin.slice(0, fin.length - 30).map(x => x.id)); this.items = this.items.filter(x => !drop.has(x.id)); }
    this.save(); setTimeout(() => this.tick(), 1500);
  },
  start() { this.load(); this.timer = setInterval(() => this.tick(), 20000); setTimeout(() => this.tick(), 4000); }
};
/* 작업 중·예약 대기 중에는 PC 가 절전으로 앱을 멈추지 않게 */
let psbId = null;
function power() {
  const soon = Q.items.some(i => i.status === "waiting" && (!i.startAt || i.startAt - Date.now() < 14 * 3600 * 1000));
  const need = anyRunning() || soon;
  try { if (need && psbId == null) psbId = powerSaveBlocker.start("prevent-app-suspension"); else if (!need && psbId != null) { powerSaveBlocker.stop(psbId); psbId = null; } } catch (e) {}
}

/* ── 자동 업데이트 (GitHub Releases · electron-updater) ── */
const UPD = {
  state: "idle", version: "", notes: "", progress: 0, error: "", checkedAt: 0, current: APP_VERSION,
  get() { return { ok: true, state: this.state, version: this.version, notes: this.notes, progress: this.progress, error: this.error, current: this.current, checkedAt: this.checkedAt, portable: !!process.env.PORTABLE_EXECUTABLE_DIR, packaged: app.isPackaged }; },
  init() {
    if (!autoUpdater || !app.isPackaged) { this.state = "unsupported"; return; }
    autoUpdater.autoDownload = true; autoUpdater.autoInstallOnAppQuit = true; autoUpdater.allowPrerelease = false;   // 조용히: 알아서 받고, 틈 나면 알아서 재시작
    autoUpdater.logger = null;
    autoUpdater.on("checking-for-update", () => { this.state = "checking"; this.error = ""; });
    autoUpdater.on("update-available", i => { this.state = "available"; this.version = i.version; this.notes = typeof i.releaseNotes === "string" ? i.releaseNotes : ""; this.checkedAt = Date.now(); });
    autoUpdater.on("update-not-available", () => { this.state = "latest"; this.checkedAt = Date.now(); });
    autoUpdater.on("download-progress", p => { this.state = "downloading"; this.progress = Math.round(p.percent || 0); });
    autoUpdater.on("update-downloaded", i => { this.state = "downloaded"; this.version = i.version; this.progress = 100; this.tryInstall(); });
    autoUpdater.on("error", e => { this.state = "error"; this.error = String(e && e.message || e).slice(0, 300); logErr(e); });
    this.check(); setInterval(() => this.check(), 6 * 3600 * 1000);
  },
  /* AI 작업·예약 대기 중이 아니면 5초 뒤 무음 설치 + 재실행. 작업 중이면 끝날 때 다시 시도, 그래도 아니면 종료 시 설치 */
  tryInstall() {
    if (this.state !== "downloaded" || this.installing) return;
    if (anyRunning() || JOBS_RUNNING()) { this.state = "downloaded-wait"; return; }
    this.installing = true; this.state = "installing";
    setTimeout(() => { try { autoUpdater.quitAndInstall(true, true); } catch (e) { this.installing = false; this.state = "error"; this.error = String(e.message || e); } }, 5000);
  },
  check() { if (!autoUpdater || !app.isPackaged) return; if (process.env.PORTABLE_EXECUTABLE_DIR) { this.state = "portable"; return; } try { autoUpdater.checkForUpdates().catch(e => { this.state = "error"; this.error = String(e && e.message || e).slice(0, 300); }); } catch (e) { this.state = "error"; this.error = String(e.message || e); } },
  async act(what) {
    if (!autoUpdater || !app.isPackaged) return { ok: false, error: "설치형 EXE 에서만 됩니다" };
    if (what === "check") { this.check(); return { ok: true, message: "확인 중" }; }
    if (what === "download") { if (this.state !== "available") return { ok: false, error: "받을 업데이트가 없습니다" }; this.state = "downloading"; this.progress = 0; autoUpdater.downloadUpdate().catch(e => { this.state = "error"; this.error = String(e && e.message || e).slice(0, 300); }); return { ok: true, message: "내려받는 중" }; }
    if (what === "install") { if (!/^downloaded/.test(this.state)) return { ok: false, error: "아직 내려받지 않았습니다" }; this.state = "downloaded"; this.installing = false; this.tryInstall(); return { ok: true, message: "설치를 시작합니다" }; }
    return { ok: false, error: "모르는 동작" };
  }
};

/* ── 사진 보고 브리프 예시문 제안 (Claude Code 헤드리스, Read 만 허용) ── */
const SUG = {
  proc: null, name: "", running: false, error: "", data: null, startedAt: 0,
  get() { return { ok: true, running: this.running, name: this.name, error: this.error, needLogin: !!this.needLogin, data: this.data, startedAt: this.startedAt }; },
  async start(name, hint) {
    if (!isProjectDir(name)) return { ok: false, error: "없는 프로젝트입니다" };
    if (this.running) return { ok: false, error: "이미 사진을 보는 중입니다" };
    if (!(await loginOk())) return NEED_LOGIN;
    const d = path.join(ROOT, name);
    const photos = listImages(d, "").map(i => path.join(d, i.name)).slice(0, 5);
    if (!photos.length) return { ok: false, error: "사진이 없습니다" };
    const h = hint || {};
    const prompt = `너는 한국 커머스 상세페이지 기획자다. 아래 사진 파일을 Read 도구로 전부 열어 보되 한 번의 응답에서 여러 Read 를 동시에 호출해 한꺼번에 읽어라(사진마다 따로 턴을 쓰지 말 것). 무엇이 찍혔는지 파악한 뒤 브리프 예시문을 제안하라.
사진 파일:
${photos.map(p => "- " + p).join("\n")}
상품명(사용자 입력): ${h.name || "(없음)"} / 카테고리: ${h.category || "(없음)"} / 판매가: ${h.price || "(없음)"}

반드시 아래 형식의 JSON 객체 하나만 출력한다. 설명·마크다운·코드펜스 금지.
{"photo":"사진에 보이는 것 1~2문장 — 제품 형태·포장·라벨에 적힌 글자·색·배경","name":"상품명 제안 (사용자 입력이 있으면 그대로)","who":"누가 어떤 상황에서 사는지 2문장, 구체적인 사람으로","specs":"스펙·구성·성분 3~5줄을 줄바꿈으로. 사진·라벨에서 읽은 것만 사실로 쓰고 추정은 끝에 (확인 필요)","usp":"경쟁 제품 대비 차별점 한 줄. 추정이면 끝에 (추정)","mood":"어울리는 비주얼 분위기 한 줄","avoid":"피해야 할 톤 한 줄","sections":["추가하면 좋은 섹션 id 0~3개: brand,howto,awards,reviews 중"]}
규칙: 라벨·사진에 없는 수치·인증·후기·원산지·수상은 절대 지어내지 않는다. 한국어. 각 값은 짧고 바로 쓸 수 있게.`;
    this.name = name; this.running = true; this.error = ""; this.needLogin = false; this.data = null; this.startedAt = Date.now();
    await claudeGate();
    let out = "", err = "";
    let pr;
    try { pr = spawn("claude", ["-p", "--model", "claude-sonnet-5", "--output-format", "json", "--max-turns", "40", "--allowedTools", "Read"], { cwd: ROOT, windowsHide: true, shell: IS_WIN, stdio: ["pipe", "pipe", "pipe"], env: Object.assign({}, process.env, { PYTHONUTF8: "1" }) }); }
    catch (e) { this.running = false; this.error = e.message; return { ok: false, error: e.message }; }
    this.proc = pr;
    try { pr.stdin.write(prompt, "utf8"); pr.stdin.end(); } catch (e) {}
    pr.stdout.on("data", c => { out += c.toString("utf8"); });
    pr.stderr.on("data", c => { err += c.toString("utf8"); });
    pr.on("error", e => { this.running = false; this.error = "실행 오류: " + e.message; });
    pr.on("close", code => {
      this.running = false;
      try {
        const line = out.trim().split(/\r?\n/).filter(l => l.trim().startsWith("{")).pop() || out.trim();
        const j = JSON.parse(line); const txt = String(j.result || "");
        if (j.is_error) throw new Error(friendlyErr(txt));
        const m = txt.match(/\{[\s\S]*\}/); if (!m) throw new Error("응답에 JSON 이 없습니다 — " + txt.slice(0, 160));
        const data = JSON.parse(m[0]); data.at = new Date().toISOString(); data.photos = photos.map(p => path.basename(p)); data.cost = j.total_cost_usd || null;
        this.data = data; fs.writeFileSync(path.join(d, "suggest.json"), JSON.stringify(data, null, 2), "utf8");
        actLog(name, "ai", "사진 분석 → 브리프 예시문 제안");
      } catch (e) { const raw = e.message + " " + err + " " + out.slice(0, 400); this.needLogin = LOGIN_RE.test(raw); this.error = this.needLogin ? friendlyErr(raw) : "제안을 읽지 못했습니다: " + e.message + (err ? " / " + err.slice(0, 200) : "") + (code ? " (code " + code + ")" : ""); logErr(e); }
    });
    return { ok: true, message: "AI 가 사진을 보는 중" };
  }
};

/* ── 가벼운 AI 작업 (오타 검수 · 피드백 구조화 · 경쟁사 분석) — sonnet, JSON 하나로 답 ── */
const JOBS = new Map();
const JOBS_RUNNING = () => [...JOBS.values()].some(j => j.running);
function jobGet(kind, name) { const j = JOBS.get(kind + "|" + name); return j ? { ok: true, kind, name, running: j.running, stage: j.stage, error: j.error, needLogin: !!(j.error && LOGIN_RE.test(j.error)), data: j.data, startedAt: j.startedAt, cost: j.cost, done: j.done, total: j.total } : { ok: true, kind, name, running: false }; }
function jobNew(kind, name) { const k = kind + "|" + name, cur = JOBS.get(k); if (cur && cur.running) return null; const j = { running: true, stage: "준비", error: "", data: null, startedAt: Date.now(), cost: null, done: 0, total: 0 }; JOBS.set(k, j); return j; }
function pickJson(txt) { txt = String(txt || ""); const s = txt.indexOf("{"), e = txt.lastIndexOf("}"); if (s < 0 || e <= s) throw new Error("응답에 JSON 이 없습니다 — " + txt.slice(0, 160)); return JSON.parse(txt.slice(s, e + 1)); }
function jobClaude(j, prompt, o, onResult) { j.stage = "차례를 기다리는 중"; claudeGate().then(() => jobClaude1(j, prompt, o, onResult)); }
function jobClaude1(j, prompt, o, onResult) {
  const args = ["-p", "--model", o.model || "claude-sonnet-5", "--output-format", "json", "--max-turns", String(o.turns || 30), "--allowedTools", ...(o.tools || ["Read"])];
  let pr; try { pr = spawn("claude", args, { cwd: ROOT, windowsHide: true, shell: IS_WIN, stdio: ["pipe", "pipe", "pipe"], env: Object.assign({}, process.env, { PYTHONUTF8: "1" }) }); }
  catch (e) { j.running = false; j.error = "실행 실패: " + e.message; return; }
  j.stage = o.stage || "AI 가 보는 중"; let out = "", err = "";
  try { pr.stdin.write(prompt, "utf8"); pr.stdin.end(); } catch (e) {}
  pr.stdout.on("data", c => { out += c.toString("utf8"); });
  pr.stderr.on("data", c => { err += c.toString("utf8"); });
  pr.on("error", e => { j.error = "실행 오류: " + e.message; j.running = false; });
  pr.on("close", code => {
    try {
      const line = out.trim().split(/\r?\n/).filter(l => l.trim().startsWith("{")).pop() || out.trim();
      const r = JSON.parse(line); if (r.is_error) throw new Error(friendlyErr(String(r.result || r.subtype || "")));
      j.cost = r.total_cost_usd || null;
      const data = pickJson(r.result); j.data = onResult(data, r) || data;
    } catch (e) { const raw = e.message + " " + err + " " + out.slice(0, 400); j.error = LOGIN_RE.test(raw) ? friendlyErr(raw) : e.message + (err && !/JSON/.test(e.message) ? "" : (err ? " / " + err.slice(0, 200) : "")) + (code ? " (code " + code + ")" : ""); logErr(e); }
    j.running = false; j.stage = j.error ? "실패" : "완료";
  });
}

/* ── OCR (Windows 내장 Windows.Media.Ocr) + 줄별 대비·글자색 ── */
function ocrScript() {
  const dst = path.join(app.getPath("userData"), "ocr.ps1");
  try { const s = fs.readFileSync(path.join(__dirname, "ocr.ps1"), "utf8"); let cur = ""; try { cur = fs.readFileSync(dst, "utf8"); } catch (e) {} if (cur !== s) { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.writeFileSync(dst, s, "utf8"); } } catch (e) { logErr(e); }
  return dst;
}
function runOcr(paths) {
  return new Promise(resolve => {
    const lf = path.join(os.tmpdir(), `reboot-ocr-${process.pid}-${Date.now()}.txt`);
    try { fs.writeFileSync(lf, paths.join("\r\n"), "utf8"); } catch (e) { return resolve([]); }
    const ps = path.join(process.env.SystemRoot || "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
    execFile(ps, ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", ocrScript(), "-ListFile", lf, "-Lang", "ko"],
      { windowsHide: true, timeout: 60000 + 10000 * paths.length, maxBuffer: 64 * 1024 * 1024, encoding: "utf8" }, (err, so, se) => {
        try { fs.unlinkSync(lf); } catch (e) {}
        let arr = []; try { const t = String(so || "").trim(); const j = JSON.parse(t.slice(t.search(/[\[{]/))); arr = Array.isArray(j) ? j : [j]; } catch (e) { logErr("OCR 결과 해석 실패: " + String(se || (err && err.message) || e.message).slice(0, 300)); }
        resolve(arr);
      });
  });
}
const LIN = (() => { const a = new Float32Array(256); for (let i = 0; i < 256; i++) { const c = i / 255; a[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); } return a; })();
/* 글자 줄 둘레의 픽셀을 두 무리(글자/배경)로 나눠 WCAG 대비와 글자색을 잰다 */
function lineStats(bm, W, H, b) {
  const pad = Math.round(b.h * 0.3), x0 = clampN(b.x - pad, 0, W - 1), y0 = clampN(b.y - pad, 0, H - 1), x1 = clampN(b.x + b.w + pad, 1, W), y1 = clampN(b.y + b.h + pad, 1, H);
  const area = (x1 - x0) * (y1 - y0); if (area < 16) return null;
  const step = Math.max(1, Math.floor(Math.sqrt(area / 7000)));
  const L = [], R = [], G = [], B = [];
  for (let y = y0; y < y1; y += step) for (let x = x0; x < x1; x += step) { const i = (y * W + x) * 4; const bb = bm[i], g = bm[i + 1], r = bm[i + 2]; L.push(0.2126 * LIN[r] + 0.7152 * LIN[g] + 0.0722 * LIN[bb]); R.push(r); G.push(g); B.push(bb); }
  const N = L.length, bins = new Array(64).fill(0); for (const l of L) bins[Math.min(63, Math.floor(l * 64))]++;
  let sum = 0; for (let i = 0; i < 64; i++) sum += i * bins[i];
  let sB = 0, wB = 0, best = 0, th = 32;
  for (let i = 0; i < 64; i++) { wB += bins[i]; if (!wB) continue; const wF = N - wB; if (!wF) break; sB += i * bins[i]; const mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF); if (v > best) { best = v; th = i; } }
  const g = [{ n: 0, l: 0, r: 0, g: 0, b: 0 }, { n: 0, l: 0, r: 0, g: 0, b: 0 }];
  for (let k = 0; k < N; k++) { const o = g[Math.min(63, Math.floor(L[k] * 64)) > th ? 1 : 0]; o.n++; o.l += L[k]; o.r += R[k]; o.g += G[k]; o.b += B[k]; }
  if (!g[0].n || !g[1].n) return { contrast: 1, color: [128, 128, 128], bg: [128, 128, 128] };
  const avg = o => [Math.round(o.r / o.n), Math.round(o.g / o.n), Math.round(o.b / o.n)];
  const lo = g[0].l / g[0].n, hi = g[1].l / g[1].n, text = g[0].n <= g[1].n ? g[0] : g[1], bg = text === g[0] ? g[1] : g[0];
  return { contrast: +((hi + 0.05) / (lo + 0.05)).toFixed(2), color: avg(text), bg: avg(bg) };
}
const OCR_V = 2;
let OCRQ = Promise.resolve();
function ocrTiles(name, stems) {
  const job = async () => {
    const all = tileFiles(name).filter(t => !stems || stems.includes(t.stem));
    const cdir = path.join(ROOT, name, "review", "ocr"); fs.mkdirSync(cdir, { recursive: true });
    const out = {}, need = [];
    for (const t of all) { const st = fs.statSync(t.file); const c = readJson(path.join(cdir, t.stem + ".json")); if (c && c.v === OCR_V && c.mtime === Math.round(st.mtimeMs) && c.size === st.size) out[t.stem] = c; else need.push(Object.assign({ st }, t)); }
    for (let i = 0; i < need.length; i += 8) {
      const part = need.slice(i, i + 8), res = await runOcr(part.map(t => t.file));
      part.forEach((t, k) => {
        const r = res[k]; if (!r || !r.ok) { out[t.stem] = { v: OCR_V, ok: false, error: (r && r.error) || "OCR 실패", lines: [], w: 0, h: 0 }; return; }
        const img = nativeImage.createFromPath(t.file), sz = img.getSize(), bm = sz.width ? img.toBitmap() : null;
        const lines = (Array.isArray(r.lines) ? r.lines : r.lines ? [r.lines] : []).map((ln, idx) => {
          const words = (Array.isArray(ln.words) ? ln.words : ln.words ? [ln.words] : []).map(w => ({ t: w.t, x: w.x, y: w.y, w: w.w, h: w.h }));
          const base = { id: "L" + (idx + 1), text: String(ln.text || ""), x: ln.x, y: ln.y, w: ln.w, h: ln.h, words };
          const s = bm && sz.width === r.w ? lineStats(bm, sz.width, sz.height, ln) : null;
          return Object.assign(base, s || {});
        });
        const doc = { v: OCR_V, ok: true, mtime: Math.round(t.st.mtimeMs), size: t.st.size, w: r.w, h: r.h, lines };
        try { fs.writeFileSync(path.join(cdir, t.stem + ".json"), JSON.stringify(doc), "utf8"); } catch (e) {}
        out[t.stem] = doc;
      });
    }
    return out;
  };
  const p = OCRQ.then(job, job); OCRQ = p.catch(() => {}); return p;
}
const rbox = (ln, doc) => doc && doc.w ? { x: +(ln.x / doc.w).toFixed(4), y: +(ln.y / doc.h).toFixed(4), w: +(ln.w / doc.w).toFixed(4), h: +(ln.h / doc.h).toFixed(4) } : null;
const lineById = (doc, id) => { if (!doc || !id) return null; const m = String(id).match(/\d+/); return m ? doc.lines[+m[0] - 1] || null : null; };
function ocrListText(doc) { return doc && doc.ok ? doc.lines.map(l => `${l.id} [y${Math.round(l.y / doc.h * 100)}%] ${l.text}`).join("\n") : "(글자 위치를 읽지 못함)"; }
function intendedCopy(name, stem) {
  const d = path.join(ROOT, name), man = readJson(path.join(d, "tiles", "manifest.json")) || {}, plan = readJson(path.join(d, "plan.json"));
  const pt = plan && Array.isArray(plan.tiles) ? plan.tiles.find(t => t.n === stem) : null;
  const parts = [];
  if (man[stem]) parts.push(`manifest: ${man[stem].name || ""} / ${man[stem].copy || ""}`);
  if (pt) parts.push(`기획안: ${[pt.head, pt.sub, pt.body].filter(Boolean).join(" / ")}`);
  return parts.join("\n") || "(의도 카피 기록 없음)";
}

/* 오타 검수 (#4): 이미지 + OCR 줄 위치 → AI 가 실제 글자를 읽고 오타만 짚는다 → review/typo.json */
async function startTypo(name) {
  if (!(await loginOk())) return NEED_LOGIN;
  const j = jobNew("typo", name); if (!j) return { ok: false, error: "이미 오타 검사 중입니다" };
  (async () => {
    j.stage = "글자 위치 읽는 중";
    const tiles = tileFiles(name); j.total = tiles.length;
    if (!tiles.length) { j.running = false; j.error = "타일이 없습니다"; return; }
    const ocr = await ocrTiles(name);
    const blocks = tiles.map(t => `### 타일 ${t.stem}\n파일: ${t.file}\n의도 카피:\n${intendedCopy(name, t.stem)}\nOCR 줄(위치용, 글자는 틀릴 수 있음):\n${ocrListText(ocr[t.stem])}`).join("\n\n");
    const prompt = `너는 한국어 교정 전문가다. 아래 상세페이지 타일 이미지들을 Read 도구로 한 번의 응답에서 동시에 모두 열어라(여러 번 나눠 읽지 말 것). 각 이미지에 실제로 적힌 글자를 직접 읽고, 오타·맞춤법·띄어쓰기 오류·깨진 글자(뭉개지거나 없는 글자)·같은 문구 중복·의도 카피와 다른 부분만 찾아라.
OCR 줄 목록은 위치를 찾기 위한 것이고 OCR 글자 자체는 자주 틀린다 — 반드시 이미지를 보고 판단하고, OCR 오인식을 오타로 보고하지 마라. 디자인상 의도된 줄바꿈·영문·숫자 표기는 오류가 아니다. 확실한 것만 보고한다.

${blocks}

반드시 JSON 객체 하나만 출력한다(설명·코드펜스 금지):
{"tiles":{"타일번호":{"lines":{"L1":"그 줄에 실제로 적힌 정확한 글자"},"issues":[{"line":"L3","found":"이미지에 적힌 틀린 표기","fix":"바른 표기","why":"오타|맞춤법|띄어쓰기|깨진 글자|중복|의도 카피와 다름"}]}}}
lines 에는 OCR 줄 id 별로 네가 읽은 정확한 글자를 넣는다(글자가 아닌 줄은 빼도 된다). 문제가 없는 타일은 issues 를 빈 배열로.`;
    jobClaude(j, prompt, { turns: 12, stage: `AI 가 타일 ${tiles.length}장을 한 글자씩 읽는 중` }, data => {
      const out = { at: new Date().toISOString(), tiles: {} };
      let n = 0;
      for (const t of tiles) {
        const doc = ocr[t.stem], d = (data.tiles || {})[t.stem] || {}, read = d.lines && typeof d.lines === "object" ? d.lines : {};
        const issues = (Array.isArray(d.issues) ? d.issues : []).map(is => { const ln = lineById(doc, is.line); return { line: is.line || null, found: String(is.found || ""), fix: String(is.fix || ""), why: String(is.why || ""), box: ln ? rbox(ln, doc) : null }; }).filter(x => x.found || x.fix);
        n += issues.length;
        out.tiles[t.stem] = { mtime: doc ? doc.mtime : null, read, issues };
      }
      out.count = n;
      fs.mkdirSync(path.join(ROOT, name, "review"), { recursive: true });
      fs.writeFileSync(path.join(ROOT, name, "review", "typo.json"), JSON.stringify(out, null, 2), "utf8");
      actLog(name, "check", `오타 검사 — ${n ? n + "건 발견" : "이상 없음"} (${tiles.length}장)`);
      return out;
    });
  })().catch(e => { j.running = false; j.error = e.message; logErr(e); });
  return { ok: true, message: "오타 검사를 시작했습니다" };
}

/* 클라이언트 피드백 (#15): 붙여넣은 글 → 타일별 수정 지시로 구조화 (+ 글자 교체는 위치까지) */
async function startFeedback(name, text) {
  if (!(await loginOk())) return NEED_LOGIN;
  text = String(text || "").trim(); if (!text) return { ok: false, error: "피드백 내용이 비었습니다" };
  const j = jobNew("feedback", name); if (!j) return { ok: false, error: "이미 피드백을 정리하는 중입니다" };
  (async () => {
    j.stage = "타일 글자 위치 읽는 중";
    const tiles = tileFiles(name), man = readJson(path.join(ROOT, name, "tiles", "manifest.json")) || {};
    const ocr = await ocrTiles(name);
    const typo = readJson(path.join(ROOT, name, "review", "typo.json")) || {};
    const list = tiles.map((t, i) => { const tr = (typo.tiles || {})[t.stem] || {}, doc = ocr[t.stem]; const lines = doc && doc.ok ? doc.lines.map(l => `${l.id}: ${(tr.read || {})[l.id] || l.text}`).join(" | ") : ""; return `- ${t.stem} (${i + 1}번째 장) ${man[t.stem] && man[t.stem].name ? "「" + man[t.stem].name + "」" : ""} ${man[t.stem] && man[t.stem].copy ? "카피: " + man[t.stem].copy : ""}\n  파일: ${t.file}\n  글자 줄: ${lines || "(없음)"}`; }).join("\n");
    const prompt = `너는 상세페이지 디자이너의 어시스턴트다. 클라이언트가 보낸 피드백 원문을 타일별 수정 지시로 나눠라. 글자 줄은 자동 인식(OCR)이라 글자가 틀릴 수 있다 — 문구 교체(kind "text") 항목이 있으면 해당 타일 파일을 Read 도구로 (한 번의 응답에서 동시에) 열어 from 을 이미지에 실제로 적힌 글자 그대로 확인하라. 그 밖에는 도구를 쓰지 마라.
[타일 목록 — 번호·이름·카피·글자 줄(id: 글자)]
${list}

[클라이언트 피드백 원문]
${text.slice(0, 12000)}

규칙: 원문의 뜻을 그대로 옮기고 지어내지 않는다. 몇 번째 장·섹션 이름·카피 내용으로 타일을 찾아라. 문구를 바꿔 달라는 요청은 kind "text" 로, 바꿀 원래 글자(from)는 글자 줄에서 찾은 실제 문자열 그대로, 새 글자(to)는 클라이언트가 원한 문구 그대로 쓰고 그 줄 id 를 line 에 넣는다. 그 밖의 디자인 요청은 kind "change" 와 수정 지시 한 줄(comment), 위치를 알면 line 또는 where(top|middle|bottom|all). 타일을 특정할 수 없는 의견은 general, 애매해서 되물어야 할 것은 questions.
반드시 JSON 객체 하나만 출력(설명·코드펜스 금지):
{"items":[{"tile":"03","kind":"text","from":"원래 글자","to":"새 글자","line":"L2","comment":"한 줄 요약"},{"tile":"05","kind":"change","comment":"디자이너가 바로 실행할 수정 지시","line":null,"where":"top"}],"general":["전체 의견"],"questions":["되물을 것"]}`;
    jobClaude(j, prompt, { turns: 8, tools: ["Read"], stage: "AI 가 피드백을 장별로 나누는 중" }, data => {
      const stems = tiles.map(t => t.stem);
      const band = { top: { x: 0.02, y: 0.02, w: 0.96, h: 0.32 }, middle: { x: 0.02, y: 0.34, w: 0.96, h: 0.32 }, bottom: { x: 0.02, y: 0.66, w: 0.96, h: 0.32 } };
      const items = (Array.isArray(data.items) ? data.items : []).map(it => {
        let tile = String(it.tile || "").trim(); if (!stems.includes(tile)) { const k = stems.find(s => s.replace(/^0+/, "") === tile.replace(/^0+/, "")); tile = k || ""; }
        const doc = ocr[tile], ln = lineById(doc, it.line);
        const box = ln ? rbox(ln, doc) : band[it.where] || null;
        return { tile, kind: it.kind === "text" ? "text" : "change", from: String(it.from || ""), to: String(it.to || ""), comment: String(it.comment || ""), line: it.line || null, where: it.where || "", box };
      }).filter(it => it.tile && (it.comment || it.to));
      const out = { at: new Date().toISOString(), raw: text, items, general: (data.general || []).map(String), questions: (data.questions || []).map(String) };
      fs.writeFileSync(path.join(ROOT, name, "feedback.json"), JSON.stringify(out, null, 2), "utf8");
      actLog(name, "feedback", `클라이언트 피드백 정리 — ${items.length}건${out.questions.length ? " · 확인 " + out.questions.length : ""}`);
      return out;
    });
  })().catch(e => { j.running = false; j.error = e.message; logErr(e); });
  return { ok: true, message: "피드백을 정리하는 중" };
}

/* 경쟁사 상세페이지 (#19): URL 은 숨은 창으로 열어 화면을 캡처 → ref/ 스크린샷 + 올린 캡처 → AI 분석 → ref.json */
async function captureUrl(url, dir, idx) {
  const w = new BrowserWindow({ show: false, width: 860, height: 1500, webPreferences: { offscreen: true, sandbox: true, contextIsolation: true, nodeIntegration: false, partition: "refcap", images: true } });
  const files = []; let text = "";
  try {
    w.webContents.setAudioMuted(true);
    w.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
    w.webContents.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36");
    await Promise.race([w.loadURL(url), new Promise((_, rej) => setTimeout(() => rej(new Error("페이지 로딩 시간 초과")), 30000))]).catch(e => { if (!/ERR_ABORTED/.test(String(e.message))) throw e; });
    await new Promise(r => setTimeout(r, 2500));
    const H = await w.webContents.executeJavaScript("Math.max(document.body ? document.body.scrollHeight : 0, document.documentElement.scrollHeight)").catch(() => 1500);
    // 지연 로딩 이미지를 깨우려고 한 번 끝까지 내려갔다 올라온다
    for (let y = 0; y < Math.min(H, 60000); y += 1400) { await w.webContents.executeJavaScript(`window.scrollTo(0, ${y})`).catch(() => {}); await new Promise(r => setTimeout(r, 250)); }
    const H2 = await w.webContents.executeJavaScript("Math.max(document.body ? document.body.scrollHeight : 0, document.documentElement.scrollHeight)").catch(() => H);
    const vh = Math.max(400, +(await w.webContents.executeJavaScript("window.innerHeight").catch(() => 1000)) || 1000), view = vh - 40;   // 실제 보이는 높이 기준으로 겹치게
    const shots = Math.min(14, Math.max(1, Math.ceil((H2 - 40) / view)));
    const stepY = shots > 1 ? Math.max(view, Math.floor((H2 - vh) / (shots - 1))) : 0;
    for (let k = 0; k < shots; k++) {
      await w.webContents.executeJavaScript(`window.scrollTo(0, ${k * stepY})`).catch(() => {}); await new Promise(r => setTimeout(r, 900));
      const img = await w.webContents.capturePage(); if (img.isEmpty()) continue;
      const f = path.join(dir, `web${idx}_${String(k + 1).padStart(2, "0")}.png`); fs.writeFileSync(f, img.toPNG()); files.push(f);
    }
    text = String(await w.webContents.executeJavaScript("document.title + '\\n' + (document.body ? document.body.innerText : '')").catch(() => "")).slice(0, 15000);
  } finally { try { w.destroy(); } catch (e) {} }
  return { files, text };
}
async function startRef(name, urls, note) {
  urls = (Array.isArray(urls) ? urls : []).map(u => String(u || "").trim()).filter(u => /^https?:\/\/[^\s]+$/i.test(u)).slice(0, 3);
  const dir = path.join(ROOT, name, "ref"); fs.mkdirSync(dir, { recursive: true });
  const uploaded = listImages(dir, "").filter(i => !/^web\d+_/.test(i.name)).map(i => path.join(dir, i.name));
  if (!urls.length && !uploaded.length) return { ok: false, error: "경쟁사 URL 을 넣거나 상세페이지 캡처를 올려주세요" };
  if (!(await loginOk())) return NEED_LOGIN;
  const j = jobNew("ref", name); if (!j) return { ok: false, error: "이미 분석 중입니다" };
  (async () => {
    const texts = [], shots = [];
    for (let i = 0; i < urls.length; i++) {
      j.stage = `페이지 여는 중 (${i + 1}/${urls.length})`;
      for (const f of fs.readdirSync(dir)) if (new RegExp(`^web${i + 1}_`).test(f)) { try { fs.unlinkSync(path.join(dir, f)); } catch (e) {} }
      try { const c = await captureUrl(urls[i], dir, i + 1); shots.push(...c.files); if (c.text) { texts.push(`[URL ${i + 1}] ${urls[i]}\n${c.text.slice(0, 6000)}`); fs.writeFileSync(path.join(dir, `web${i + 1}.txt`), c.text, "utf8"); } }
      catch (e) { texts.push(`[URL ${i + 1}] ${urls[i]} — 열지 못함: ${e.message}`); }
    }
    const imgs = [...uploaded, ...shots].slice(0, 20);
    if (!imgs.length && !texts.some(t => t.length > 200)) { j.running = false; j.error = "페이지를 캡처하지 못했습니다 — 경쟁사 상세페이지를 캡처해서 올려주세요"; return; }
    const brief = readJson(path.join(ROOT, name, "brief.json")) || {}, b = brief.brief || {};
    const prompt = `너는 한국 커머스 상세페이지 전략가다. 경쟁사 상세페이지 캡처를 Read 도구로 한 번의 응답에서 동시에 모두 열어 보고(여러 턴으로 나누지 말 것), 우리 상품 상세페이지를 더 잘 만들기 위한 분석을 하라.
[우리 상품] ${(b.product || {}).name || name} · ${(b.product || {}).category || ""} · 타깃: ${String((b.target || {}).who || "").slice(0, 200)} · 차별점: ${String((b.fact || {}).usp || "").slice(0, 200)}
${note ? "[디자이너 메모] " + String(note).slice(0, 500) : ""}
[경쟁사 캡처 파일]
${imgs.map(p => "- " + p).join("\n") || "(없음)"}
[페이지 텍스트 일부]
${texts.join("\n\n").slice(0, 14000) || "(없음)"}

우리가 쓸 수 있는 섹션 id: ${CATALOG_IDS.join(", ")}
규칙: 경쟁사 문구·이미지를 그대로 베끼자고 하지 말 것(구성·흐름·설득 방식만 참고). 캡처에 없는 내용을 지어내지 말 것. 한국어, 짧고 실행 가능하게.
반드시 JSON 객체 하나만 출력(설명·코드펜스 금지):
{"summary":"경쟁사 페이지 흐름과 설득 전략 2~3문장","flow":["경쟁사 섹션 흐름을 순서대로 짧게"],"strengths":["잘한 점 3~5"],"gaps":["빈틈·약점 2~4 — 우리가 파고들 곳"],"ideas":["우리 페이지에 적용할 구성·연출 아이디어 3~5"],"differ":["차별화 메시지 2~3"],"sections":["추천 섹션 id"],"avoid":["피해야 할 것 1~3"]}`;
    jobClaude(j, prompt, { turns: 10, tools: ["Read"], stage: `AI 가 경쟁사 페이지 ${imgs.length}장을 읽는 중` }, data => {
      const out = Object.assign({ at: new Date().toISOString(), urls, shots: imgs.map(p => path.basename(p)) }, data);
      out.sections = (Array.isArray(data.sections) ? data.sections : []).filter(id => CATALOG_IDS.includes(id));
      fs.writeFileSync(path.join(ROOT, name, "ref.json"), JSON.stringify(out, null, 2), "utf8");
      actLog(name, "ai", `경쟁사 분석 — 캡처 ${imgs.length}장${urls.length ? " · URL " + urls.length : ""}`);
      return out;
    });
  })().catch(e => { j.running = false; j.error = e.message; logErr(e); });
  return { ok: true, message: "경쟁사 페이지를 분석합니다" };
}
const CATALOG_IDS = ["intro", "brand", "shipping", "box", "problem", "solution", "points", "scenes", "howto", "compare", "awards", "reviews", "spec", "qna", "recommend", "cta", "returns"];

/* ── PSD (#6): 타일 이미지 + 숨긴 '편집용 텍스트' 레이어(OCR 위치·AI 가 읽은 글자·글자색) ── */
function startPsd(name, stems) {
  const j = jobNew("psd", name); if (!j) return { ok: false, error: "이미 PSD 를 만드는 중입니다" };
  (async () => {
    let psdlib; try { psdlib = require("ag-psd"); } catch (e) { throw new Error("PSD 모듈이 없습니다"); }
    const tiles = tileFiles(name).filter(t => !stems || stems.includes(t.stem)); j.total = tiles.length;
    if (!tiles.length) throw new Error("타일이 없습니다");
    j.stage = "글자 위치 읽는 중";
    const ocr = await ocrTiles(name, tiles.map(t => t.stem));
    const typo = readJson(path.join(ROOT, name, "review", "typo.json")) || {};
    const out = path.join(ROOT, name, "export", "psd"); fs.mkdirSync(out, { recursive: true });
    const title = name.includes("_") ? name.split("_").slice(1).join("_") : name;
    j.files = [];
    for (const t of tiles) {
      j.stage = `PSD 만드는 중 ${j.done + 1}/${tiles.length}`;
      await new Promise(r => setImmediate(r));
      const img = nativeImage.createFromPath(t.file); const { width: W, height: H } = img.getSize(); if (!W) continue;
      const bgra = img.toBitmap(), rgba = new Uint8ClampedArray(bgra.length);
      for (let i = 0; i < bgra.length; i += 4) { rgba[i] = bgra[i + 2]; rgba[i + 1] = bgra[i + 1]; rgba[i + 2] = bgra[i]; rgba[i + 3] = bgra[i + 3]; }
      const imageData = { width: W, height: H, data: rgba };
      const doc = ocr[t.stem], tr = (typo.tiles || {})[t.stem] || {}, read = doc && tr.mtime === doc.mtime ? (tr.read || {}) : {};
      const texts = (doc && doc.ok ? doc.lines : []).filter(l => l.h >= 8 && (read[l.id] || String(l.text).replace(/[^0-9A-Za-z가-힣]/g, "").length >= 2)).map(l => {
        const size = Math.max(8, Math.round(l.h * 1.12)), c = l.color || [0, 0, 0], txt = String(read[l.id] || l.text);
        return { name: (read[l.id] ? "" : "(자동인식·확인) ") + txt.slice(0, 60), hidden: true, text: { text: txt, transform: [1, 0, 0, 1, l.x, l.y + Math.round(l.h * 0.9)],
          style: { font: { name: "MalgunGothicBold" }, fontSize: size, fillColor: { r: c[0], g: c[1], b: c[2] } } } };
      });
      const psd = { width: W, height: H, imageData, children: [
        { name: "원본 타일", imageData },
        { name: "편집용 텍스트 (눈 켜고 글자 수정)", opened: true, hidden: true, children: texts }
      ] };
      const buf = psdlib.writePsdBuffer(psd, { invalidateTextLayers: true, generateThumbnail: false });
      const f = path.join(out, `${title}_${t.stem}.psd`); fs.writeFileSync(f, buf); j.files.push(path.basename(f));
      j.done++;
    }
    j.data = { dir: out, files: j.files, count: j.files.length };
    actLog(name, "export", `PSD 내보내기 — ${j.files.length}장`, { dir: "export/psd" });
    j.running = false; j.stage = "완료";
  })().catch(e => { j.running = false; j.error = "PSD 실패: " + e.message; j.stage = "실패"; logErr(e); });
  return { ok: true, message: "PSD 를 만드는 중" };
}

/* ── 사용량 계기판 (#11): Claude 구독 사용량 · Higgsfield 크레딧 · 이번 달 기록 ── */
const USAGE = { c: null, cAt: 0, h: null, hAt: 0 };
function readCreds() { try { return JSON.parse(fs.readFileSync(path.join(os.homedir(), ".claude", ".credentials.json"), "utf8")); } catch (e) { return null; } }
async function claudeUsage(force) {
  if (!force && USAGE.c && Date.now() - USAGE.cAt < 60000) return USAGE.c;
  let out;
  try {
    const cr = readCreds(), tok = cr && cr.claudeAiOauth && cr.claudeAiOauth.accessToken;
    if (!tok) out = { ok: false, reason: "구독 로그인 정보가 없습니다" };
    else {
      const r = await fetch("https://api.anthropic.com/api/oauth/usage", { headers: { Authorization: "Bearer " + tok, "anthropic-beta": "oauth-2025-04-20", "Content-Type": "application/json" }, signal: AbortSignal.timeout(10000) });
      if (!r.ok) out = { ok: false, reason: r.status === 401 ? "로그인 갱신 필요 — AI 작업을 한 번 돌리면 자동 갱신됩니다" : "HTTP " + r.status };
      else {
        const j = await r.json(); const w = x => x && typeof x === "object" && x.utilization != null ? { pct: Math.round(+x.utilization), resetsAt: x.resets_at || null } : null;
        out = { ok: true, five: w(j.five_hour), week: w(j.seven_day), weekOpus: w(j.seven_day_opus), weekSonnet: w(j.seven_day_sonnet),
          extra: j.extra_usage ? { on: !!j.extra_usage.is_enabled, limit: j.extra_usage.monthly_limit, used: j.extra_usage.used_credits } : null };
      }
    }
  } catch (e) { out = { ok: false, reason: String(e.message || e).slice(0, 120) }; }
  USAGE.c = out; USAGE.cAt = Date.now(); return out;
}
/* Higgsfield MCP 에 직접 JSON-RPC (initialize → tools/list → balance 류 도구 호출). 토큰은 로컬에서만 쓴다 */
async function hfBalance(force) {
  if (!force && USAGE.h && Date.now() - USAGE.hAt < (USAGE.h.ok ? 5 : 1) * 60000) return USAGE.h;
  let out;
  try {
    const cr = readCreds() || {}, ent = Object.entries(cr.mcpOAuth || {}).find(([k]) => k.startsWith("higgsfield|"));
    const e = ent && ent[1], tok = e && e.accessToken;
    if (!tok) out = { ok: false, reason: "Higgsfield 인증 필요" };
    else if (e.expiresAt && +e.expiresAt < Date.now()) out = { ok: false, reason: "Higgsfield 토큰 만료 — AI 작업을 돌리거나 재인증하면 갱신됩니다" };
    else {
      const url = e.serverUrl || HIGGSFIELD_URL; let sid = "";
      const rpc = async (body, idWanted) => {
        const h = { Authorization: "Bearer " + tok, "Content-Type": "application/json", Accept: "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18" }; if (sid) h["mcp-session-id"] = sid;
        const r = await fetch(url, { method: "POST", headers: h, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
        if (!sid && r.headers.get("mcp-session-id")) sid = r.headers.get("mcp-session-id");
        if (r.status === 401 || r.status === 403) throw new Error("AUTH");
        if (idWanted == null) return null;
        const ct = r.headers.get("content-type") || "", t = await r.text();
        if (/event-stream/.test(ct)) { for (const ln of t.split(/\r?\n/)) { if (!ln.startsWith("data:")) continue; try { const m = JSON.parse(ln.slice(5).trim()); if (m.id === idWanted) return m; } catch (x) {} } return null; }
        try { return JSON.parse(t); } catch (x) { return null; }
      };
      await rpc({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "reboot-console", version: APP_VERSION } } }, 1);
      await rpc({ jsonrpc: "2.0", method: "notifications/initialized" });
      const lst = await rpc({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }, 2);
      const tools = (lst && lst.result && lst.result.tools) || [];
      const tool = tools.find(t => /balance|credit/i.test(t.name)) || tools.find(t => /account|user_info|me$|profile/i.test(t.name));
      if (!tool) out = { ok: false, reason: "잔액 도구를 찾지 못함", tools: tools.map(t => t.name).slice(0, 30) };
      else {
        const res = await rpc({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: tool.name, arguments: {} } }, 3);
        const txt = ((res && res.result && res.result.content) || []).map(c => c.text || "").join(" ").slice(0, 600);
        let credits = null; const sc = res && res.result && res.result.structuredContent;
        if (sc && typeof sc === "object") { for (const k of Object.keys(sc)) if (/credit|balance/i.test(k) && typeof sc[k] === "number") { credits = sc[k]; break; } }
        if (credits == null) { try { const jj = JSON.parse(txt); for (const k of Object.keys(jj)) if (/credit|balance/i.test(k) && !isNaN(+jj[k])) { credits = +jj[k]; break; } } catch (x) {} }
        if (credits == null) { const m = txt.match(/(?:credits?|balance|잔액|크레딧)[^\d-]{0,20}(-?[\d,]+(?:\.\d+)?)/i) || txt.match(/(-?[\d,]+(?:\.\d+)?)\s*(?:credits?|크레딧)/i); if (m) credits = +m[1].replace(/,/g, ""); }
        out = { ok: credits != null, credits, tool: tool.name, text: txt.slice(0, 200), reason: credits == null ? "잔액을 읽지 못함" : "" };
      }
    }
  } catch (e) { out = { ok: false, reason: e.message === "AUTH" ? "Higgsfield 재인증 필요" : String(e.message || e).slice(0, 120) }; }
  USAGE.h = out; USAGE.hAt = Date.now(); return out;
}
function localStats() {
  const now = new Date(), m0 = new Date(now.getFullYear(), now.getMonth(), 1).getTime(), d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const s = { month: { runs: 0, ok: 0, gen: 0, hf: 0, cost: 0, min: 0 }, today: { runs: 0, gen: 0 }, byProject: [] };
  if (!ROOT) return s;
  for (const n of fs.readdirSync(ROOT)) {
    if (!isProjectDir(n)) continue; const rs = readRuns(n).runs || []; let pg = 0, pr = 0;
    for (const r of rs) { if (!r.at || r.at < m0) continue; s.month.runs++; if (r.exit === 0) s.month.ok++; s.month.gen += r.gen || 0; s.month.hf += r.hf || 0; s.month.cost += r.cost || 0; s.month.min += Math.max(0, ((r.end || r.at) - r.at) / 60000); pg += r.gen || 0; pr++; if (r.at >= d0) { s.today.runs++; s.today.gen += r.gen || 0; } }
    if (pr) s.byProject.push({ name: n, runs: pr, gen: pg });
  }
  s.month.cost = +s.month.cost.toFixed(2); s.month.min = Math.round(s.month.min);
  s.byProject.sort((a, b) => b.gen - a.gen); s.byProject = s.byProject.slice(0, 8);
  return s;
}

/* ── HTTP 서버 ───────────────────────────────────────── */
function json(res, code, obj) { const b = Buffer.from(JSON.stringify(obj), "utf8"); res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Content-Length": b.length, "Cache-Control": "no-store" }); res.end(b); }
function serveFile(res, base, rel) {
  const p = path.normalize(path.join(base, rel));
  if (!p.startsWith(path.normalize(base + path.sep)) && p !== path.normalize(base)) { res.writeHead(403); return res.end(); }
  let st; try { st = fs.statSync(p); } catch (e) { res.writeHead(404); return res.end("File not found"); }
  if (st.isDirectory()) return serveFile(res, base, path.join(rel, "index.html"));
  res.writeHead(200, { "Content-Type": MIME[path.extname(p).toLowerCase()] || "application/octet-stream", "Content-Length": st.size, "Cache-Control": "no-store" });
  fs.createReadStream(p).pipe(res);
}
function readBody(req, max) { return new Promise((res, rej) => { const ch = []; let n = 0; req.on("data", c => { n += c.length; if (n > max) { rej(new Error("too large")); req.destroy(); } else ch.push(c); }); req.on("end", () => res(Buffer.concat(ch))); req.on("error", rej); }); }
async function bodyJson(req, max) { const t = (await readBody(req, max || 200000)).toString("utf8"); try { return t ? JSON.parse(t) : {}; } catch (e) { return {}; } }
const needProj = (res, n) => { if (!isProjectDir(n)) { json(res, 404, { ok: false, error: "없는 폴더입니다" }); return false; } return true; };

async function handle(req, res) {
  const u = new URL(req.url, "http://127.0.0.1"), q = u.searchParams, p = decodeURIComponent(u.pathname);
  try {
    if (p === "/local/ping") return json(res, 200, { ok: true, root: ROOT, desktop: true, version: APP_VERSION });
    if (p === "/local/projects") return json(res, 200, { ok: true, projects: ROOT ? projectList() : [] });
    if (p === "/local/project") { const n = q.get("name") || ""; if (!needProj(res, n)) return; return json(res, 200, Object.assign({ ok: true }, scanFull(n))); }
    if (p === "/local/export") { const n = q.get("name") || "", ver = (q.get("ver") || "v1").slice(0, 12); if (!needProj(res, n)) return;
      try { const r = buildExport(n, ver); actLog(n, "export", `클라이언트 프리뷰 ${ver} — ${r.count}장`, { file: "export/" + path.basename(r.path) }); return json(res, 200, Object.assign({ ok: true }, r)); } catch (e) { return json(res, 500, { ok: false, error: "내보내기 실패: " + e.message }); } }
    if (p === "/local/suggest") {
      if (req.method === "POST") { const b = await bodyJson(req, 100000); return json(res, 200, await SUG.start(b.name || q.get("name") || "", b.hint || {})); }
      return json(res, 200, SUG.get());
    }
    if (p === "/local/update") { if (req.method === "POST") return json(res, 200, await UPD.act(q.get("do") || "check")); return json(res, 200, UPD.get()); }
    if (p === "/local/tools") { if (req.method === "POST") return json(res, 200, await toolAction(q)); return json(res, 200, await toolStatus()); }
    if (p === "/local/run") {
      if (req.method === "POST") {
        const act = q.get("do") || "start";
        if (act === "stop") { const r = runFor(q.get("name") || ""); return json(res, 200, r ? r.stop() : { ok: false, error: "실행 중이 아닙니다" }); }
        const b = await bodyJson(req, 200000);
        return json(res, 200, await startRun(b.name || q.get("name") || "", b.mode || q.get("mode") || "make", b, null));
      }
      const name = q.get("name") || "";
      if (!name) return json(res, 200, { ok: true, runs: [...RUNS.values()].map(r => r.summary()) });
      const r = runFor(name); if (!r) return json(res, 200, { ok: true, running: false, done: false, lines: [], next: 0, name });
      const since = Math.max(0, +(q.get("since") || 0)), rid = +(q.get("rid") || 0);
      const from = rid && rid !== r.startedAt ? 0 : since;          // 다른 실행으로 바뀌었으면 처음부터
      return json(res, 200, Object.assign({ ok: true, lines: r.lines.slice(from), next: r.lines.length, reset: from === 0 && since > 0 }, r.summary()));
    }
    if (p === "/local/queue") {
      if (req.method === "POST") { const act = q.get("do") || "add"; const b = await bodyJson(req); return json(res, 200, act === "add" ? Q.add(b) : Q.act(act, q.get("id") || b.id || "", b)); }
      return json(res, 200, Q.get());
    }
    if (p === "/local/config") {
      if (req.method === "POST") { const b = await bodyJson(req); const c = readCfg(); if (typeof b.autoResume === "boolean") c.autoResume = b.autoResume; if (b.queueConc != null) c.queueConc = clampN(+b.queueConc || 1, 1, 3); writeCfg(c); setTimeout(() => Q.tick(), 200); return json(res, 200, { ok: true }); }
      const c = readCfg(); return json(res, 200, { ok: true, autoResume: c.autoResume !== false, queueConc: clampN(+(c.queueConc || 1) || 1, 1, 3) });
    }
    if (p === "/local/log") {
      if (req.method === "POST") { const b = await bodyJson(req, 20000); if (b.name && !isProjectDir(b.name)) return json(res, 404, { ok: false, error: "없는 폴더입니다" }); const dir = typeof b.dir === "string" && /^[\w가-힣 .()\-\/]{1,80}$/.test(b.dir) && !b.dir.includes("..") ? b.dir : ""; actLog(b.name || "", String(b.kind || "note").slice(0, 20), b.text, dir ? { dir } : null); return json(res, 200, { ok: true }); }
      return json(res, 200, { ok: true, items: readLog(q.get("name") || "", clampN(+(q.get("limit") || 200) || 200, 1, 2000)) });
    }
    if (p === "/local/usage") {
      const force = q.get("force") === "1";
      const [c, h] = await Promise.all([claudeUsage(force), q.get("hf") === "0" ? Promise.resolve(USAGE.h) : hfBalance(force)]);
      return json(res, 200, { ok: true, claude: c, hf: h, local: localStats(), queue: { waiting: Q.items.filter(i => i.status === "waiting").length, running: Q.items.filter(i => i.status === "running").length }, running: runningCount() });
    }
    if (p === "/local/job") return json(res, 200, jobGet(q.get("kind") || "", q.get("name") || ""));
    if (p === "/local/ocr") {
      const n = q.get("name") || ""; if (!needProj(res, n)) return;
      const stems = (q.get("tiles") || "").split(",").map(s => s.trim()).filter(Boolean);
      const r = await ocrTiles(n, stems.length ? stems : null); return json(res, 200, { ok: true, tiles: r });
    }
    if (p === "/local/typo" && req.method === "POST") { const n = q.get("name") || ""; if (!needProj(res, n)) return; return json(res, 200, await startTypo(n)); }
    if (p === "/local/feedback" && req.method === "POST") { const n = q.get("name") || ""; if (!needProj(res, n)) return; const b = await bodyJson(req, 300000); return json(res, 200, await startFeedback(n, b.text)); }
    if (p === "/local/ref" && req.method === "POST") { const n = q.get("name") || ""; if (!needProj(res, n)) return; const b = await bodyJson(req); return json(res, 200, await startRef(n, b.urls, b.note)); }
    if (p === "/local/psd" && req.method === "POST") { const n = q.get("name") || ""; if (!needProj(res, n)) return; const st = (q.get("tiles") || "").split(",").filter(Boolean); return json(res, 200, startPsd(n, st.length ? st : null)); }
    if (p === "/local/tile-restore" && req.method === "POST") {
      const n = q.get("name") || ""; if (!needProj(res, n)) return;
      const cur = runFor(n); if (cur && cur.proc && cur.exit == null) return json(res, 200, { ok: false, error: "AI 작업 중에는 되돌릴 수 없습니다" });
      try { const r = restoreTile(n, q.get("tile") || "", q.get("file") || ""); actLog(n, "restore", `타일 ${q.get("tile")} 이전 버전으로 되돌림`); return json(res, 200, r); } catch (e) { return json(res, 400, { ok: false, error: e.message }); }
    }
    if (p === "/local/save" && req.method === "POST") {
      const n = q.get("name") || "", f = q.get("file") || "";
      if (!needProj(res, n)) return;
      if (!SAVE_OK.has(f)) return json(res, 400, { ok: false, error: "허용되지 않는 파일" });
      const body = (await readBody(req, 5 * 1024 * 1024)).toString("utf8");
      try { JSON.parse(body); } catch (e) { return json(res, 400, { ok: false, error: "JSON 이 아닙니다" }); }
      const out = path.join(ROOT, n, f); fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, body, "utf8"); return json(res, 200, { ok: true, path: out });
    }
    if (p === "/local/save-image" && req.method === "POST") {
      const n = q.get("name") || "", f = q.get("file") || "";
      if (!needProj(res, n)) return;
      const isPng = /^review\/[\w.\-]+\.png$/.test(f), isJpg = /^export\/[\w가-힣\-]{1,30}\/[\w가-힣 .()\-]{1,80}\.jpg$/.test(f) && !f.includes("..");
      if (!isPng && !isJpg) return json(res, 400, { ok: false, error: "review/*.png 또는 export/<채널>/*.jpg 만 저장할 수 있습니다" });
      const body = await readBody(req, 40 * 1024 * 1024);
      if (isPng && (body.length < 8 || body.readUInt32BE(0) !== 0x89504e47)) return json(res, 400, { ok: false, error: "PNG 가 아닙니다" });
      if (isJpg && (body.length < 4 || body[0] !== 0xFF || body[1] !== 0xD8)) return json(res, 400, { ok: false, error: "JPG 가 아닙니다" });
      const out = path.join(ROOT, n, f); fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, body); return json(res, 200, { ok: true, path: out, size: body.length });
    }
    if (p === "/local/clear-dir" && req.method === "POST") {            // 채널 내보내기 전에 그 채널 폴더만 비운다 (jpg 만)
      const n = q.get("name") || "", sub = q.get("sub") || ""; if (!needProj(res, n)) return;
      if (!/^export\/[\w가-힣\-]{1,30}$/.test(sub)) return json(res, 400, { ok: false, error: "비울 수 없는 폴더" });
      const d = path.join(ROOT, n, sub); let k = 0; if (isDir(d)) for (const f of fs.readdirSync(d)) if (/\.jpg$/i.test(f)) { try { fs.unlinkSync(path.join(d, f)); k++; } catch (e) {} }
      return json(res, 200, { ok: true, removed: k, path: d });
    }
    if (p === "/local/project-create" && req.method === "POST") {
      const raw = (q.get("name") || "").trim().replace(/[\\/:*?"<>|]/g, "").slice(0, 60);
      if (!raw || /^[._]/.test(raw)) return json(res, 400, { ok: false, error: "폴더 이름이 비었거나 쓸 수 없는 글자입니다" });
      const dir = path.join(ROOT, raw);
      if (isDir(dir)) return json(res, 200, { ok: true, name: raw, existed: true });
      fs.mkdirSync(dir, { recursive: true }); actLog(raw, "project", "프로젝트 생성"); return json(res, 200, { ok: true, name: raw });
    }
    if (p === "/local/photo" && req.method === "POST") {
      const n = q.get("name") || ""; if (!needProj(res, n)) return;
      const sub = q.get("sub") === "ref" ? "ref" : "";
      let f = (q.get("file") || "photo.png").replace(/[\\/:*?"<>|]/g, "_").replace(/^[._]+/, "").slice(0, 80) || "photo.png";
      if (sub === "ref") f = f.replace(/^web\d+_/i, "");                  // 자동 캡처 이름과 겹치지 않게
      if (!IMG.has(path.extname(f).toLowerCase())) return json(res, 400, { ok: false, error: "이미지 파일만 넣을 수 있습니다" });
      const body = await readBody(req, 60 * 1024 * 1024);
      if (body.length < 16) return json(res, 400, { ok: false, error: "빈 파일" });
      const dir = path.join(ROOT, n, sub); fs.mkdirSync(dir, { recursive: true });
      let out = path.join(dir, f), k = 1; const stem = stemOf(f), ext = path.extname(f);
      while (fs.existsSync(out)) out = path.join(dir, `${stem} (${k++})${ext}`);
      fs.writeFileSync(out, body); if (!sub) actLog(n, "photo", "사진 추가 — " + path.basename(out)); return json(res, 200, { ok: true, file: path.basename(out), size: body.length });
    }
    if (p === "/local/paste" && req.method === "POST") {
      // 렌더러의 paste 이벤트에 의존하지 않고 메인에서 클립보드 이미지를 직접 읽는다 (메뉴 없는 창에서도 Ctrl+V 확실히)
      const n = q.get("name") || ""; if (!needProj(res, n)) return;
      const sub = q.get("sub") === "ref" ? "ref" : "", dir = path.join(ROOT, n, sub); fs.mkdirSync(dir, { recursive: true });
      const img = clipboard.readImage();
      if (!img || img.isEmpty()) {
        // 파일 복사(탐색기 Ctrl+C) 도 받는다
        let files = [];
        try { const raw = clipboard.readBuffer("FileNameW"); if (raw && raw.length) files = raw.toString("ucs2").split("\0").filter(Boolean); } catch (e) {}
        files = files.filter(f => IMG.has(path.extname(f).toLowerCase()) && fs.existsSync(f));
        if (!files.length) return json(res, 200, { ok: false, empty: true, error: "클립보드에 이미지가 없습니다" });
        const saved = [];
        for (const f of files) { let out = path.join(dir, path.basename(f)), k = 1; const stem = stemOf(path.basename(f)), ext = path.extname(f); while (fs.existsSync(out)) out = path.join(dir, `${stem} (${k++})${ext}`); fs.copyFileSync(f, out); saved.push(path.basename(out)); }
        if (!sub) actLog(n, "photo", `사진 붙여넣기 — ${saved.length}장`);
        return json(res, 200, { ok: true, files: saved });
      }
      const sz = img.getSize(); const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
      let out = path.join(dir, `붙여넣기_${stamp}.png`), k = 1; while (fs.existsSync(out)) out = path.join(dir, `붙여넣기_${stamp} (${k++}).png`);
      fs.writeFileSync(out, img.toPNG());
      if (!sub) actLog(n, "photo", "사진 붙여넣기 — 1장");
      return json(res, 200, { ok: true, files: [path.basename(out)], w: sz.width, h: sz.height });
    }
    if (p === "/local/photo-delete" && req.method === "POST") {
      const n = q.get("name") || "", f = q.get("file") || ""; if (!needProj(res, n)) return;
      const sub = q.get("sub") === "ref" ? "ref" : q.get("sub") === "product" ? "product" : "";
      if (f.includes("/") || f.includes("\\") || !IMG.has(path.extname(f).toLowerCase())) return json(res, 400, { ok: false, error: "삭제할 수 없는 파일" });
      const fp = path.join(ROOT, n, sub, f); if (!fs.existsSync(fp)) return json(res, 404, { ok: false, error: "없는 파일" });
      const trash = path.join(ROOT, n, "_trash"); fs.mkdirSync(trash, { recursive: true });
      fs.renameSync(fp, path.join(trash, Date.now() + "_" + (sub ? sub + "_" : "") + f));   // 바로 지우지 않고 _trash 로
      if (!sub) actLog(n, "photo", "사진 뺌 — " + f);
      return json(res, 200, { ok: true });
    }
    if (p === "/" ) { res.writeHead(302, { Location: "/app/" }); return res.end(); }
    if (p === "/app" || p.startsWith("/app/")) return serveFile(res, APP_DIR, p.slice(4) || "/");
    if (!ROOT) { res.writeHead(404); return res.end(); }
    return serveFile(res, ROOT, p);
  } catch (e) { logErr(e); return json(res, 500, { ok: false, error: e.message }); }
}
function startServer() {
  return new Promise((resolve, reject) => {
    const srv = http.createServer(handle);
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => { PORT = srv.address().port; resolve(srv); });
  });
}

/* ── 트레이 (작업 중·예약 대기 중 창을 닫으면 백그라운드 유지) ─── */
let tray = null, hiddenForRun = false;
function trayIcon() { try { return nativeImage.createFromPath(path.join(APP_DIR, "assets", "icon-32.png")); } catch (e) { return nativeImage.createEmpty(); } }
function toTray() {
  if (!tray) { tray = new Tray(trayIcon()); tray.setContextMenu(Menu.buildFromTemplate([{ label: "콘솔 열기", click: () => restoreWin() }, { type: "separator" }, { label: "AI 작업 모두 중단하고 종료 (대기열은 저장됨)", click: () => { RUNS.forEach(r => { try { r.stop(); } catch (e) {} }); setTimeout(() => app.exit(0), 800); } }])); tray.on("click", () => restoreWin()); }
  tray.setToolTip(anyRunning() ? "re:boot 콘솔 — AI 작업 중 (클릭해서 열기)" : "re:boot 콘솔 — 예약된 작업 대기 중 (클릭해서 열기)");
  if (!hiddenForRun && !SMOKE && !anyRunning()) { try { if (Notification.isSupported()) new Notification({ title: "re:boot 콘솔은 트레이에서 기다립니다", body: "예약된 작업 시간이 되면 알아서 시작합니다. 완전히 끄려면 트레이 아이콘 우클릭.", icon: trayIcon(), silent: true }).show(); } catch (e) {} }
  trayWhy = anyRunning() ? "run" : Q.pending() ? "queue" : "jobs";
  hiddenForRun = true; if (win) win.hide();
}
let trayWhy = "";
/* 창을 닫았는데 가벼운 AI 작업(오타 검사 등)만 남아 있던 경우: 끝나면 조용히 종료 */
setInterval(() => { if (hiddenForRun && trayWhy === "jobs" && !JOBS_RUNNING() && !anyRunning() && !Q.pending()) app.quit(); }, 5000);
function restoreWin() { hiddenForRun = false; if (win) { win.show(); win.focus(); } else createWindow(); if (tray) { tray.destroy(); tray = null; } }
const SMOKE = process.argv.includes("--smoke");
function onRunFinished(code, run) {
  if (SMOKE) return;                                                       // 검증 인스턴스는 알림·창 조작 없음
  const away = hiddenForRun || !win || !win.isFocused();                  // 콘솔을 보고 있으면 굳이 OS 알림까지 안 띄움
  try { if (away && Notification.isSupported()) new Notification({ title: code === 0 ? "re:boot — AI 작업 완료" : "re:boot — AI 작업 종료", body: `${run.name} · ${MODE_LABEL[run.mode] || ""} ${code === 0 ? "— 확인하세요" : code === -2 ? "중단됨" : "실패 — [이어서 하기] 로 재개할 수 있습니다"}`, icon: trayIcon() }).show(); } catch (e) {}
  if (hiddenForRun && !anyRunning() && !Q.pending()) restoreWin(); else if (win && !hiddenForRun) { win.flashFrame(true); }
}

/* ── 창 ─────────────────────────────────────────────── */
async function ensureRoot() {
  ROOT = resolveRoot();
  while (!ROOT) {
    const r = await dialog.showMessageBox({ type: "info", title: "re:boot 콘솔", message: "프로젝트 루트 폴더를 정해주세요", detail: "상품 폴더(YYMMDD_상품명)들이 들어 있는 상위 폴더입니다. 나중에 [설정] 에서 바꿀 수 있습니다.", buttons: ["폴더 선택", "종료"], defaultId: 0, cancelId: 1 });
    if (r.response === 1) { app.quit(); return false; }
    const d = await dialog.showOpenDialog({ title: "프로젝트 루트 폴더", properties: ["openDirectory", "createDirectory"] });
    if (!d.canceled && d.filePaths[0]) { ROOT = d.filePaths[0]; writeCfg(Object.assign(readCfg(), { root: ROOT })); }
  }
  return true;
}
function createWindow() {
  const st = readCfg().win || {};
  win = new BrowserWindow({ width: st.w || 1440, height: st.h || 900, x: st.x, y: st.y, minWidth: 980, minHeight: 640, title: "re:boot 제작 콘솔",
    backgroundColor: "#FFFFFF", autoHideMenuBar: true, show: false,
    icon: path.join(APP_DIR, "assets", "icon-256.png"),
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false, spellcheck: false } });
  Menu.setApplicationMenu(Menu.buildFromTemplate([{ label: "편집", submenu: [{ role: "undo" }, { role: "redo" }, { type: "separator" }, { role: "cut" }, { role: "copy" }, { role: "paste" }, { role: "selectAll" }] }]));   // 숨김 메뉴: Ctrl+C/V/A 보장
  win.webContents.setVisualZoomLevelLimits(1, 1);
  win.webContents.on("before-input-event", (e, i) => { if (i.type === "keyDown" && i.key === "F5") { win.webContents.reload(); e.preventDefault(); } if (i.type === "keyDown" && i.key === "F12" && !app.isPackaged) win.webContents.toggleDevTools(); });
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  win.once("ready-to-show", () => { win.show(); if (st.max) win.maximize(); });
  const save = () => { if (!win) return; const b = win.getNormalBounds(); writeCfg(Object.assign(readCfg(), { win: { x: b.x, y: b.y, w: b.width, h: b.height, max: win.isMaximized() } })); };
  win.on("close", e => { save(); if (UPD.installing) return; if (anyRunning() || Q.pending() || JOBS_RUNNING()) { e.preventDefault(); toTray(); } });
  win.on("closed", () => { win = null; });
  win.loadURL(`http://127.0.0.1:${PORT}/app/`);
}

if (process.argv.includes("--smoke")) app.setPath("userData", path.join(os.tmpdir(), "reboot-smoke-data"));   // 검증용: 실행 중인 콘솔과 잠금·설정 분리
app.setAppUserModelId("kr.rebootdesign.console");   // 알림에 electron.app.Electron 대신 앱 이름
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); } else if (hiddenForRun) restoreWin(); });
  app.whenReady().then(async () => {
    if (!(await ensureRoot())) return;
    try { session.fromPartition("refcap").on("will-download", (e, item) => { try { item.cancel(); } catch (x) {} }); } catch (e) {}   // 경쟁사 캡처 창은 아무것도 내려받지 않는다
    await startServer();
    UPD.init();
    Q.start();
    if (process.argv.includes("--smoke")) {           // 빌드 검증용: 서버만 띄우고 포트를 임시 파일에 기록
      fs.writeFileSync(path.join(app.getPath("temp"), "reboot-smoke.json"), JSON.stringify({ port: PORT, root: ROOT, packaged: app.isPackaged }));
      setTimeout(() => app.quit(), 20 * 60 * 1000);
      return;
    }
    createWindow();
  });
  // 경쟁사 캡처용 숨은 창이 닫힐 때도 이 이벤트가 온다 → 메인 창이 없고 트레이 대기도 아닐 때만 종료
  app.on("window-all-closed", () => { if (hiddenForRun || SMOKE || (win && !win.isDestroyed())) return; app.quit(); });
}

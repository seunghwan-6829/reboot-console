/* ═══════════════════════════════════════════════════════
   re:boot 제작 콘솔 — EXE 본체 (Electron main)  v4.1

   파이썬 _launch.py 와 같은 로컬 API 를 Node 로 내장한다.
   + 도구 연결(브라우저 로그인, 창 없이) + Claude Code 헤드리스 실행(제작·검수 반영)
   앱(app/) 은 이 EXE 안에 들어 있고, 프로젝트 루트(ROOT) 는
   설정(userData/config.json) → 포터블 EXE 위치 순으로 정한다.
   ═══════════════════════════════════════════════════════ */
"use strict";
const { app, BrowserWindow, dialog, shell, nativeImage, Menu } = require("electron");
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec, spawn } = require("child_process");
let autoUpdater = null; try { autoUpdater = require("electron-updater").autoUpdater; } catch (e) {}

/* 메인 프로세스 오류는 창이 없으면 아무 데도 안 보인다 → userData/main-error.log 에 남긴다 */
const logErr = e => { try { const d = app.getPath("userData"); fs.mkdirSync(d, { recursive: true }); fs.appendFileSync(path.join(d, "main-error.log"), new Date().toISOString() + " " + (e && e.stack || e) + "\n"); } catch (x) {} };
process.on("uncaughtException", e => { logErr(e); try { dialog.showErrorBox("re:boot 콘솔 오류", String(e && e.stack || e)); } catch (x) {} app.exit(1); });
process.on("unhandledRejection", e => logErr(e));

const APP_DIR = path.join(__dirname, "app");
const IMG = new Set([".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff", ".avif", ".heic", ".heif"]);
const SAVE_OK = new Set(["brief.json", "order.json", "review.json", "tiles/manifest.json"]);
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".ico": "image/x-icon", ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".md": "text/markdown; charset=utf-8" };
const HIGGSFIELD_URL = "https://mcp.higgsfield.ai/mcp";
const IS_WIN = process.platform === "win32";

let ROOT = "", PORT = 0, win = null;

/* ── 설정 ─────────────────────────────────────────────── */
const cfgPath = () => path.join(app.getPath("userData"), "config.json");
function readCfg() { try { return JSON.parse(fs.readFileSync(cfgPath(), "utf8")); } catch (e) { return {}; } }
function writeCfg(c) { try { fs.mkdirSync(path.dirname(cfgPath()), { recursive: true }); fs.writeFileSync(cfgPath(), JSON.stringify(c, null, 2)); } catch (e) {} }
const isDir = p => { try { return !!p && fs.statSync(p).isDirectory(); } catch (e) { return false; } };

/* 프로젝트 루트처럼 보이는가: YYMMDD_ 폴더가 하나라도 있거나 app/ 이 있는 폴더 */
function looksLikeRoot(p) { try { return fs.readdirSync(p).some(n => /^\d{6}_/.test(n) && isDir(path.join(p, n))); } catch (e) { return false; } }
function resolveRoot() {
  const c = readCfg();
  if (isDir(c.root)) return c.root;
  const cands = [process.env.PORTABLE_EXECUTABLE_DIR, app.isPackaged ? path.dirname(process.execPath) : path.resolve(__dirname, "..")];
  for (const p of cands) if (isDir(p) && (looksLikeRoot(p) || !app.isPackaged || process.env.PORTABLE_EXECUTABLE_DIR === p)) return p;
  return "";   // 설치형은 Program Files 안에 있으니 첫 실행에 폴더를 묻는다
}

/* ── 프로젝트 스캔 (파이썬 scan() 과 동일 형태) ─────────── */
function isProjectDir(name) {
  if (!name || name === "." || name === ".." || /^[._]/.test(name) || name === "app" || name === "desktop") return false;
  if (name.includes("/") || name.includes("\\")) return false;
  const p = path.join(ROOT, name);
  return isDir(p) && path.dirname(path.resolve(p)) === path.resolve(ROOT);
}
function listImages(d, urlPrefix) {
  if (!isDir(d)) return [];
  return fs.readdirSync(d).sort().filter(f => IMG.has(path.extname(f).toLowerCase()) && fs.statSync(path.join(d, f)).isFile())
    .map(f => ({ name: f, size: fs.statSync(path.join(d, f)).size, url: urlPrefix + encodeURIComponent(f) }));
}
function readJson(p) { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { return null; } }
function scan(name) {
  const d = path.join(ROOT, name), base = "/" + encodeURIComponent(name) + "/";
  return { name, images: listImages(d, base), tiles: listImages(path.join(d, "tiles"), base + "tiles/"),
    tileMeta: readJson(path.join(d, "tiles", "manifest.json")) || {}, brief: readJson(path.join(d, "brief.json")), order: readJson(path.join(d, "order.json")),
    review: readJson(path.join(d, "review.json")),
    hasBrief: fs.existsSync(path.join(d, "brief.json")), hasOrder: fs.existsSync(path.join(d, "order.json")), mtime: fs.statSync(d).mtimeMs / 1000 };
}
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
    out.push({ name: n, images: s.images.length, tiles: tiles.length, hasBrief: s.hasBrief, hasOrder: s.hasOrder, mtime: s.mtime,
      ctime: Math.min(fs.statSync(d).birthtimeMs / 1000, ...ims), tileFirst: tm.length ? Math.min(...tm) : null, tileLast: tm.length ? Math.max(...tm) : null,
      exports, briefAt: (s.brief || {}).savedAt || null, orderAt: (s.order || {}).savedAt || null });
  }
  return out.sort((a, b) => b.mtime - a.mtime);
}
/* 타일 표시 순서: manifest._order (파일명 stem 배열) → 없는 건 이름순 뒤에 */
function orderedTiles(files, meta) {
  const ord = Array.isArray(meta && meta._order) ? meta._order : [];
  const stem = f => f.replace(/\.[^.]+$/, "");
  return files.slice().sort((a, b) => { const ia = ord.indexOf(stem(a)), ib = ord.indexOf(stem(b)); if (ia === -1 && ib === -1) return a.localeCompare(b, "en", { numeric: true }); if (ia === -1) return 1; if (ib === -1) return -1; return ia - ib; });
}

/* ── 클라이언트 프리뷰 내보내기 (템플릿은 app/export_template.html 공용) ── */
function buildExport(name, ver) {
  const d = path.join(ROOT, name), td = path.join(d, "tiles");
  const meta = readJson(path.join(td, "manifest.json")) || {};
  const files = orderedTiles(fs.readdirSync(td).filter(f => IMG.has(path.extname(f).toLowerCase()) && !f.startsWith("_")), meta);
  const figs = files.map(f => {
    const n = f.replace(/\.[^.]+$/, ""), m = meta[n] || {};
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

/* ── 도구 연결 (Claude Code · Codex · Higgsfield MCP) ───── */
const sh = (cmd, ms) => new Promise(res => exec(cmd, { timeout: ms || 8000, windowsHide: true, encoding: "utf8" }, (err, out) => res(err ? "" : String(out || "").trim())));
const sh2 = (cmd, ms) => new Promise(res => exec(cmd, { timeout: ms || 8000, windowsHide: true, encoding: "utf8" }, (err, out, se) => res(String(out || "") + String(se || ""))));  // stdout+stderr, 실패해도 텍스트
async function toolStatus() {
  const node = await sh("node -v");
  const claudeV = await sh("claude --version"), codexV = await sh("codex --version");
  let claudeAuth = null;
  if (claudeV) { try { claudeAuth = JSON.parse(await sh("claude auth status --json", 12000)); } catch (e) { claudeAuth = null; } }
  let codexIn = false;
  if (codexV) { const st = await sh2("codex login status", 12000); codexIn = /logged in/i.test(st) && !/not logged in/i.test(st); }
  let hfReg = false, hfAuth = false;
  try {
    const j = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".claude.json"), "utf8"));
    if (j.mcpServers && j.mcpServers.higgsfield) hfReg = true;
    for (const p of Object.values(j.projects || {})) if (p && p.mcpServers && p.mcpServers.higgsfield) hfReg = true;
  } catch (e) {}
  try { const c = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".claude", ".credentials.json"), "utf8")); hfAuth = Object.keys(c.mcpOAuth || {}).some(k => k.startsWith("higgsfield|")); } catch (e) {}
  return { ok: true, root: ROOT, node,
    claude: { installed: !!claudeV, version: claudeV.replace(/\s*\(Claude Code\)\s*/i, ""), loggedIn: !!(claudeAuth && claudeAuth.loggedIn), email: (claudeAuth && claudeAuth.email) || "" },
    codex: { installed: !!codexV, version: codexV.replace(/^codex-cli\s*/i, ""), loggedIn: codexIn },
    higgsfield: { connected: hfReg, authed: hfAuth },
    run: RUN.summary() };
}
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
      spawnHidden("claude-login", "claude", ["auth", "login"]);
      return { ok: true, message: "브라우저에서 Anthropic 로그인을 마치세요", poll: true };
    case "logout-claude":
      await sh("claude auth logout", 12000); return { ok: true, message: "로그아웃했습니다", poll: true };
    case "login-codex":
      spawnHidden("codex-login", "codex", ["login"]);
      return { ok: true, message: "브라우저에서 ChatGPT 로그인을 마치세요", poll: true };
    case "add-mcp": {
      const out = await new Promise(res => exec(`claude mcp add --transport http --scope user higgsfield ${HIGGSFIELD_URL}`, { timeout: 20000, windowsHide: true, encoding: "utf8" }, (err, so, se) => res({ err, txt: String(so || "") + String(se || "") })));
      if (out.err && !/already exists/i.test(out.txt)) return { ok: false, error: "MCP 등록 실패: " + out.txt.trim().slice(0, 300) };
      spawnHidden("mcp-login", "claude", ["mcp", "login", "higgsfield"]);
      return { ok: true, message: "등록 완료 — 브라우저에서 Higgsfield 인증을 마치세요", poll: true };
    }
    case "auth-mcp":
      spawnHidden("mcp-login", "claude", ["mcp", "login", "higgsfield"]);
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
      const p = path.join(ROOT, name, sub.replace(/[\\/.]/g, "")); shell.openPath(isDir(p) ? p : path.join(ROOT, name)); return { ok: true, message: "폴더를 열었습니다" };
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

/* ── Claude Code 헤드리스 실행 (제작 · 검수 반영) ────────── */
const PROMPTS = {
  make: n => `${n} 만들어줘. 먼저 README.md 를 읽고 그 규칙(6절 기술 규칙, 특히 6-4 제품 무왜곡 TRACK A, 8절 절대 금지)을 그대로 따른다. ${n}/order.json 의 브리프·사진 분석·페이지 구성을 읽고 기획안(${n}/기획안.md) → Higgsfield gpt_image_2_5 로 타일 생성 → 한 글자씩 오타 검수 → ${n}/tiles/NN.png 와 tiles/manifest.json(name·copy·ratio) 저장까지 끝낸다. 제품 사진이 들어가는 타일은 원본을 재해석하지 말고 TRACK A(remove_background → upscale → PIL 합성)로 원본 픽셀을 보존한다(브리프의 photoMode 가 reinterpret 일 때만 예외). 수치·인증·후기·마감은 order.json 에 있는 실제 값만 쓴다. 질문이 있으면 멈추지 말고 가장 안전한 쪽으로 진행하고 기획안에 【확인】 으로 남긴다. 끝나면 마지막 줄에 '완료: 타일 N장' 이라고 답한다.`,
  revise: n => `${n} 검수 반영해줘. 먼저 README.md 의 규칙을 읽는다. ${n}/review.json 을 읽어라 — 타일마다 regions(이미지 기준 0~1 비율 x,y,w,h 와 코멘트) 와 note 가 있고, ${n}/review/NN_marked.png 에는 그 영역이 빨간 번호 박스로 표시돼 있다. 각 타일에 대해: 원본 tiles/NN.png 를 image_references 로 넣고 marked 이미지도 함께 참조해 '번호 영역만 코멘트대로 바꾸고 나머지는 전부 동일하게 유지'(MAKE EXACTLY N CHANGES) 방식으로 Higgsfield gpt_image_2_5 편집을 돌린다. 톤앤매너·팔레트·서체·제품 형태는 요청에 명시되지 않는 한 절대 바꾸지 않는다. 결과는 tiles/edits/NN_v{k}.png 에 저장하고 한 글자씩 대조한 뒤 원본을 tiles/NN.png 로 교체하기 전에 원본을 tiles/v_prev/ 에 백업한다. 끝나면 마지막 줄에 '완료: 수정 N장' 이라고 답한다.`
};
const RUN = {
  proc: null, name: "", mode: "", lines: [], startedAt: 0, done: false, exit: null,
  summary() { return { running: !!(this.proc && this.exit == null), name: this.name, mode: this.mode, done: this.done, exit: this.exit, count: this.lines.length, startedAt: this.startedAt }; },
  push(kind, text) { this.lines.push({ t: Date.now(), kind, text: String(text).slice(0, 4000) }); if (this.lines.length > 2000) this.lines.splice(0, this.lines.length - 2000); },
  start(name, mode, custom) {
    if (this.proc && this.exit == null) return { ok: false, error: "이미 실행 중입니다" };
    if (!isProjectDir(name)) return { ok: false, error: "없는 프로젝트입니다" };
    const prompt = custom || (PROMPTS[mode] ? PROMPTS[mode](name) : null);
    if (!prompt) return { ok: false, error: "모르는 모드" };
    this.name = name; this.mode = mode; this.lines = []; this.done = false; this.exit = null; this.startedAt = Date.now();
    // 프롬프트는 stdin 으로 — 한글·공백이 든 인자를 cmd.exe 가 쪼개 버린다(첫 단어만 전달되는 사고)
    const args = ["-p", "--output-format", "stream-json", "--verbose", "--permission-mode", "acceptEdits",
      "--allowedTools", "Read", "Write", "Edit", "MultiEdit", "Glob", "Grep", "Bash", "mcp__higgsfield", "WebFetch"];
    let p;
    try { p = spawn("claude", args, { cwd: ROOT, windowsHide: true, shell: IS_WIN, stdio: ["pipe", "pipe", "pipe"], env: Object.assign({}, process.env, { PYTHONUTF8: "1" }) }); }
    catch (e) { return { ok: false, error: "실행 실패: " + e.message }; }
    this.proc = p;
    try { p.stdin.write(prompt, "utf8"); p.stdin.end(); } catch (e) { this.push("err", "프롬프트 전달 실패: " + e.message); }
    this.push("sys", `시작 — ${mode} · ${name}`);
    let buf = "";
    p.stdout.on("data", d => { buf += d.toString("utf8"); let i; while ((i = buf.indexOf("\n")) >= 0) { const ln = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (ln) this.ingest(ln); } });
    p.stderr.on("data", d => { const s = d.toString("utf8").trim(); if (s) this.push("err", s); });
    p.on("error", e => { this.push("err", "실행 오류: " + e.message); this.exit = -1; this.done = true; });
    p.on("close", code => { if (buf.trim()) this.ingest(buf.trim()); this.exit = code; this.done = true; this.push("sys", code === 0 ? "끝" : "종료 코드 " + code); });
    return { ok: true, message: "시작했습니다" };
  },
  ingest(ln) {
    let j; try { j = JSON.parse(ln); } catch (e) { return this.push("raw", ln); }
    if (j.type === "assistant" && j.message && Array.isArray(j.message.content)) {
      for (const c of j.message.content) {
        if (c.type === "text" && c.text && c.text.trim()) this.push("ai", c.text.trim());
        else if (c.type === "tool_use") { const inp = c.input || {}; const brief = inp.description || inp.file_path || inp.command || inp.prompt || inp.pattern || ""; this.push("tool", c.name + (brief ? " — " + String(brief).slice(0, 160) : "")); }
      }
    } else if (j.type === "result") {
      this.push("sys", (j.is_error ? "오류로 끝남" : "완료") + (j.total_cost_usd != null ? ` · $${(+j.total_cost_usd).toFixed(3)}` : "") + (j.num_turns ? ` · ${j.num_turns}턴` : ""));
      if (j.result && j.is_error) this.push("err", String(j.result).slice(0, 1000));
    } else if (j.type === "system" && j.subtype === "init") {
      this.push("sys", `모델 ${j.model || ""} · MCP ${(j.mcp_servers || []).map(m => m.name + ":" + m.status).join(", ") || "없음"}`);
    }
  },
  stop() { if (this.proc && this.exit == null) { try { if (IS_WIN) exec(`taskkill /PID ${this.proc.pid} /T /F`, { windowsHide: true }); else this.proc.kill("SIGTERM"); } catch (e) {} this.push("sys", "사용자가 중단"); return { ok: true, message: "중단했습니다" }; } return { ok: false, error: "실행 중이 아닙니다" }; }
};

/* ── 자동 업데이트 (GitHub Releases · electron-updater) ── */
const UPD = {
  state: "idle", version: "", notes: "", progress: 0, error: "", checkedAt: 0, current: app.getVersion(),
  get() { return { ok: true, state: this.state, version: this.version, notes: this.notes, progress: this.progress, error: this.error, current: this.current, checkedAt: this.checkedAt, portable: !!process.env.PORTABLE_EXECUTABLE_DIR, packaged: app.isPackaged }; },
  init() {
    if (!autoUpdater || !app.isPackaged) { this.state = "unsupported"; return; }
    autoUpdater.autoDownload = false; autoUpdater.autoInstallOnAppQuit = true; autoUpdater.allowPrerelease = false;
    autoUpdater.logger = null;
    autoUpdater.on("checking-for-update", () => { this.state = "checking"; this.error = ""; });
    autoUpdater.on("update-available", i => { this.state = "available"; this.version = i.version; this.notes = typeof i.releaseNotes === "string" ? i.releaseNotes : ""; this.checkedAt = Date.now(); });
    autoUpdater.on("update-not-available", () => { this.state = "latest"; this.checkedAt = Date.now(); });
    autoUpdater.on("download-progress", p => { this.state = "downloading"; this.progress = Math.round(p.percent || 0); });
    autoUpdater.on("update-downloaded", i => { this.state = "downloaded"; this.version = i.version; this.progress = 100; });
    autoUpdater.on("error", e => { this.state = "error"; this.error = String(e && e.message || e).slice(0, 300); logErr(e); });
    this.check(); setInterval(() => this.check(), 6 * 3600 * 1000);
  },
  check() { if (!autoUpdater || !app.isPackaged) return; if (process.env.PORTABLE_EXECUTABLE_DIR) { this.state = "portable"; return; } try { autoUpdater.checkForUpdates().catch(e => { this.state = "error"; this.error = String(e && e.message || e).slice(0, 300); }); } catch (e) { this.state = "error"; this.error = String(e.message || e); } },
  async act(what) {
    if (!autoUpdater || !app.isPackaged) return { ok: false, error: "설치형 EXE 에서만 됩니다" };
    if (what === "check") { this.check(); return { ok: true, message: "확인 중" }; }
    if (what === "download") { if (this.state !== "available") return { ok: false, error: "받을 업데이트가 없습니다" }; this.state = "downloading"; this.progress = 0; autoUpdater.downloadUpdate().catch(e => { this.state = "error"; this.error = String(e && e.message || e).slice(0, 300); }); return { ok: true, message: "내려받는 중" }; }
    if (what === "install") { if (this.state !== "downloaded") return { ok: false, error: "아직 내려받지 않았습니다" }; setTimeout(() => autoUpdater.quitAndInstall(false, true), 300); return { ok: true, message: "설치를 시작합니다" }; }
    return { ok: false, error: "모르는 동작" };
  }
};

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

async function handle(req, res) {
  const u = new URL(req.url, "http://127.0.0.1"), q = u.searchParams, p = decodeURIComponent(u.pathname);
  try {
    if (p === "/local/ping") return json(res, 200, { ok: true, root: ROOT, desktop: true, version: app.getVersion() });
    if (p === "/local/projects") return json(res, 200, { ok: true, projects: ROOT ? projectList() : [] });
    if (p === "/local/project") { const n = q.get("name") || ""; if (!isProjectDir(n)) return json(res, 404, { ok: false, error: "없는 폴더입니다" }); return json(res, 200, Object.assign({ ok: true }, scan(n))); }
    if (p === "/local/export") { const n = q.get("name") || "", ver = (q.get("ver") || "v1").slice(0, 12); if (!isProjectDir(n)) return json(res, 404, { ok: false, error: "없는 폴더입니다" });
      try { return json(res, 200, Object.assign({ ok: true }, buildExport(n, ver))); } catch (e) { return json(res, 500, { ok: false, error: "내보내기 실패: " + e.message }); } }
    if (p === "/local/update") { if (req.method === "POST") return json(res, 200, await UPD.act(q.get("do") || "check")); return json(res, 200, UPD.get()); }
    if (p === "/local/tools") { if (req.method === "POST") return json(res, 200, await toolAction(q)); return json(res, 200, await toolStatus()); }
    if (p === "/local/run") {
      if (req.method === "POST") {
        const act = q.get("do") || "start";
        if (act === "stop") return json(res, 200, RUN.stop());
        const body = (await readBody(req, 200000)).toString("utf8"); let b = {}; try { b = body ? JSON.parse(body) : {}; } catch (e) {}
        return json(res, 200, RUN.start(b.name || q.get("name") || "", b.mode || q.get("mode") || "make", b.prompt || ""));
      }
      const since = Math.max(0, +(q.get("since") || 0));
      return json(res, 200, Object.assign({ ok: true, lines: RUN.lines.slice(since), next: RUN.lines.length }, RUN.summary()));
    }
    if (p === "/local/save" && req.method === "POST") {
      const n = q.get("name") || "", f = q.get("file") || "";
      if (!isProjectDir(n)) return json(res, 404, { ok: false, error: "없는 폴더입니다" });
      if (!SAVE_OK.has(f)) return json(res, 400, { ok: false, error: "허용되지 않는 파일" });
      const body = (await readBody(req, 5 * 1024 * 1024)).toString("utf8");
      try { JSON.parse(body); } catch (e) { return json(res, 400, { ok: false, error: "JSON 이 아닙니다" }); }
      const out = path.join(ROOT, n, f); fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, body, "utf8"); return json(res, 200, { ok: true, path: out });
    }
    if (p === "/local/save-image" && req.method === "POST") {
      const n = q.get("name") || "", f = q.get("file") || "";
      if (!isProjectDir(n)) return json(res, 404, { ok: false, error: "없는 폴더입니다" });
      if (!/^review\/[\w.\-]+\.png$/.test(f)) return json(res, 400, { ok: false, error: "review/*.png 만 저장할 수 있습니다" });
      const body = await readBody(req, 30 * 1024 * 1024);
      if (body.length < 8 || body.readUInt32BE(0) !== 0x89504e47) return json(res, 400, { ok: false, error: "PNG 가 아닙니다" });
      const out = path.join(ROOT, n, f); fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, body); return json(res, 200, { ok: true, path: out, size: body.length });
    }
    if (p === "/local/project-create" && req.method === "POST") {
      const raw = (q.get("name") || "").trim().replace(/[\\/:*?"<>|]/g, "").slice(0, 60);
      if (!raw || /^[._]/.test(raw)) return json(res, 400, { ok: false, error: "폴더 이름이 비었거나 쓸 수 없는 글자입니다" });
      const dir = path.join(ROOT, raw);
      if (isDir(dir)) return json(res, 200, { ok: true, name: raw, existed: true });
      fs.mkdirSync(dir, { recursive: true }); return json(res, 200, { ok: true, name: raw });
    }
    if (p === "/local/photo" && req.method === "POST") {
      const n = q.get("name") || ""; if (!isProjectDir(n)) return json(res, 404, { ok: false, error: "없는 폴더입니다" });
      let f = (q.get("file") || "photo.png").replace(/[\\/:*?"<>|]/g, "_").replace(/^[._]+/, "").slice(0, 80) || "photo.png";
      if (!IMG.has(path.extname(f).toLowerCase())) return json(res, 400, { ok: false, error: "이미지 파일만 넣을 수 있습니다" });
      const body = await readBody(req, 60 * 1024 * 1024);
      if (body.length < 16) return json(res, 400, { ok: false, error: "빈 파일" });
      let out = path.join(ROOT, n, f), k = 1; const stem = f.replace(/\.[^.]+$/, ""), ext = path.extname(f);
      while (fs.existsSync(out)) out = path.join(ROOT, n, `${stem} (${k++})${ext}`);
      fs.writeFileSync(out, body); return json(res, 200, { ok: true, file: path.basename(out), size: body.length });
    }
    if (p === "/local/photo-delete" && req.method === "POST") {
      const n = q.get("name") || "", f = q.get("file") || ""; if (!isProjectDir(n)) return json(res, 404, { ok: false, error: "없는 폴더입니다" });
      if (f.includes("/") || f.includes("\\") || !IMG.has(path.extname(f).toLowerCase())) return json(res, 400, { ok: false, error: "삭제할 수 없는 파일" });
      const fp = path.join(ROOT, n, f); if (!fs.existsSync(fp)) return json(res, 404, { ok: false, error: "없는 파일" });
      const trash = path.join(ROOT, n, "_trash"); fs.mkdirSync(trash, { recursive: true });
      fs.renameSync(fp, path.join(trash, Date.now() + "_" + f));   // 바로 지우지 않고 _trash 로
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
  Menu.setApplicationMenu(null);
  win.webContents.setVisualZoomLevelLimits(1, 1);
  win.webContents.on("before-input-event", (e, i) => { if (i.type === "keyDown" && i.key === "F5") { win.webContents.reload(); e.preventDefault(); } if (i.type === "keyDown" && i.key === "F12" && !app.isPackaged) win.webContents.toggleDevTools(); });
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  win.once("ready-to-show", () => { win.show(); if (st.max) win.maximize(); });
  const save = () => { if (!win) return; const b = win.getNormalBounds(); writeCfg(Object.assign(readCfg(), { win: { x: b.x, y: b.y, w: b.width, h: b.height, max: win.isMaximized() } })); };
  win.on("close", e => { save(); if (RUN.proc && RUN.exit == null) { const r = dialog.showMessageBoxSync(win, { type: "warning", buttons: ["계속 실행", "중단하고 닫기"], defaultId: 0, cancelId: 0, message: "AI 작업이 아직 진행 중입니다", detail: "창을 닫으면 제작이 중단됩니다." }); if (r === 0) { e.preventDefault(); return; } RUN.stop(); } });
  win.on("closed", () => { win = null; });
  win.loadURL(`http://127.0.0.1:${PORT}/app/`);
}

if (process.argv.includes("--smoke")) app.setPath("userData", path.join(os.tmpdir(), "reboot-smoke-data"));   // 검증용: 실행 중인 콘솔과 잠금·설정 분리
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(async () => {
    if (!(await ensureRoot())) return;
    await startServer();
    UPD.init();
    if (process.argv.includes("--smoke")) {           // 빌드 검증용: 서버만 띄우고 포트를 임시 파일에 기록
      fs.writeFileSync(path.join(app.getPath("temp"), "reboot-smoke.json"), JSON.stringify({ port: PORT, root: ROOT, packaged: app.isPackaged }));
      setTimeout(() => app.quit(), 25000);
      return;
    }
    createWindow();
  });
  app.on("window-all-closed", () => app.quit());
}

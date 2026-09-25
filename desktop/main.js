/* ═══════════════════════════════════════════════════════
   re:boot 제작 콘솔 — EXE 본체 (Electron main)  v4.1

   파이썬 _launch.py 와 같은 로컬 API 를 Node 로 내장한다.
   + 도구 연결(브라우저 로그인, 창 없이) + Claude Code 헤드리스 실행(제작·검수 반영)
   앱(app/) 은 이 EXE 안에 들어 있고, 프로젝트 루트(ROOT) 는
   설정(userData/config.json) → 포터블 EXE 위치 순으로 정한다.
   ═══════════════════════════════════════════════════════ */
"use strict";
const { app, BrowserWindow, dialog, shell, nativeImage, Menu, clipboard, Tray, Notification } = require("electron");
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
const SAVE_OK = new Set(["brief.json", "order.json", "review.json", "suggest.json", "tiles/manifest.json"]);
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
    review: readJson(path.join(d, "review.json")), suggest: readJson(path.join(d, "suggest.json")),
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
    claude: { installed: !!claudeV, version: claudeV.replace(/\s*\(Claude Code\)\s*/i, ""), loggedIn: !!(claudeAuth && claudeAuth.loggedIn), email: (claudeAuth && claudeAuth.email) || "", org: (claudeAuth && claudeAuth.orgName) || "", plan: (claudeAuth && claudeAuth.subscriptionType) || "", keySource: (claudeAuth && claudeAuth.apiKeySource) || "" },
    codex: { installed: !!codexV, version: codexV.replace(/^codex-cli\s*/i, ""), loggedIn: codexIn },
    higgsfield: { connected: hfReg, authed: hfAuth },
    runs: [...RUNS.values()].map(r => r.summary()), run: (() => { const r = [...RUNS.values()].find(x => x.proc && x.exit == null); return r ? r.summary() : { running: false }; })() };
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
      spawnHidden("claude-login", "claude", ["auth", "login", "--claudeai"]);   // 구독(Max/Pro) 경로로 — Console 키로 붙으면 API 과금·크레딧 오류
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
  photo: mode => mode === "keep"
    ? `제품 사진 처리 = 원본 그대로 합성(TRACK A): 제품이 등장하는 타일은 remove_background → upscale_image → PIL 합성으로 원본 픽셀을 보존한다. 재생성 금지.`
    : `제품 사진 처리 = AI 고화질 재현(사용자 선택): 원본 사진이 저화질이므로 그대로 쓰지 말고, 원본을 image_references 로 넣어(먼저 upscale_image 를 최대 2회) 제품의 형태·비율·색·로고·라벨 글자(글자 모양·배치까지)를 원본과 똑같이 유지한 스튜디오 품질 제품 컷을 gpt_image_2_5 · resolution 2k · quality high 로 새로 만든다(깨끗한 조명·선명한 라벨·있어 보이는 연출). 라벨 글자는 확대해서 한 글자씩 원본과 대조한다. 라벨에 실제로 있는 글자는 철자를 프롬프트에 그대로 명시하고, 없는 글자·인증마크·원산지·수치는 절대 추가하지 않는다. 생성 후 원본과 나란히 놓고 로고·글자·형태가 다르면 최대 2회 재생성, 그래도 다르면 그 타일만 TRACK A(원본 합성)로 후퇴하고 기획안에 【확인】 을 남긴다.`,
  make: (n, photoMode) => `[진행 표시 규칙] 작업 중 아래 형식의 줄을 답변 텍스트에 그대로 남겨라(콘솔이 진행률로 읽는다): 단계가 바뀔 때마다 "▶ 단계: 준비|사진 분석|기획안|타일 생성|오타 검수|정리" 중 하나, 타일 한 장을 저장할 때마다 "▶ 타일: n/N 섹션이름". N 은 만들 총 타일 수.
${n} 만들어줘. 먼저 README.md 를 읽고 그 규칙(6절 기술 규칙, 특히 6-4 제품 무왜곡 TRACK A, 8절 절대 금지)을 그대로 따른다. ${n}/order.json 의 브리프·사진 분석·페이지 구성을 읽고 기획안(${n}/기획안.md) → Higgsfield gpt_image_2_5 로 타일 생성 → 한 글자씩 오타 검수 → ${n}/tiles/NN.png 와 tiles/manifest.json(name·copy·ratio) 저장까지 끝낸다. ${PROMPTS.photo(photoMode)} 수치·인증·후기·마감은 order.json 에 있는 실제 값만 쓴다. 질문이 있으면 멈추지 말고 가장 안전한 쪽으로 진행하고 기획안에 【확인】 으로 남긴다. 끝나면 마지막 줄에 '완료: 타일 N장' 이라고 답한다.`,
  revise: n => `[진행 표시 규칙] 작업 중 아래 형식의 줄을 답변 텍스트에 그대로 남겨라: 단계가 바뀔 때마다 "▶ 단계: 준비|영역 확인|수정 생성|오타 검수|교체", 타일 한 장을 끝낼 때마다 "▶ 타일: n/N 섹션이름".
${n} 검수 반영해줘. 먼저 README.md 의 규칙을 읽는다. ${n}/review.json 을 읽어라 — 타일마다 regions(이미지 기준 0~1 비율 x,y,w,h 와 코멘트) 와 note 가 있고, ${n}/review/NN_marked.png 에는 그 영역이 빨간 번호 박스로 표시돼 있다. 각 타일에 대해: 원본 tiles/NN.png 를 image_references 로 넣고 marked 이미지도 함께 참조해 '번호 영역만 코멘트대로 바꾸고 나머지는 전부 동일하게 유지'(MAKE EXACTLY N CHANGES) 방식으로 Higgsfield gpt_image_2_5 편집을 돌린다. 톤앤매너·팔레트·서체·제품 형태는 요청에 명시되지 않는 한 절대 바꾸지 않는다. 결과는 tiles/edits/NN_v{k}.png 에 저장하고 한 글자씩 대조한 뒤 원본을 tiles/NN.png 로 교체하기 전에 원본을 tiles/v_prev/ 에 백업한다. 끝나면 마지막 줄에 '완료: 수정 N장' 이라고 답한다.`
};
/* AI 쪽 오류를 사람 말로 */
function friendlyErr(t) {
  t = String(t || "");
  if (/credit balance is too low/i.test(t)) return "Max 플랜 사용량 한도에 도달했고 '추가 사용량' 잔액이 0입니다 — claude.ai 설정 → 사용량에서 리셋 시각을 확인하거나 추가 사용량을 충전하세요. (" + t.slice(0, 80) + ")";
  if (/rate limit|429|usage limit|limit reached/i.test(t)) return "사용량 한도에 도달했습니다 — 리셋 시각 이후 다시 시도하세요. (" + t.slice(0, 120) + ")";
  if (/not logged in|authentication|401|invalid api key/i.test(t)) return "Claude Code 로그인이 풀렸습니다 — 설정 → 연결에서 다시 로그인하세요. (" + t.slice(0, 120) + ")";
  if (/max turns/i.test(t)) return "작업이 턴 한도에 걸려 중단됐습니다 — 다시 실행하면 이어서 진행합니다. (" + t.slice(0, 120) + ")";
  return "AI 응답 오류: " + t.slice(0, 300);
}
const STAGES = { make: ["준비", "사진 분석", "기획안", "타일 생성", "오타 검수", "정리"], revise: ["준비", "영역 확인", "수정 생성", "오타 검수", "교체"], custom: ["준비", "작업", "정리"] };
const RUNS = new Map();                                   // 프로젝트 이름 → 실행 객체 (동시에 여러 프로젝트 제작 가능)
const anyRunning = () => [...RUNS.values()].some(r => r.proc && r.exit == null);
const runFor = name => RUNS.get(name) || null;
function makeRun() { return Object.assign(Object.create(RUN_PROTO), { proc: null, name: "", mode: "", lines: [], startedAt: 0, done: false, exit: null, stage: "", stageIdx: -1, tileDone: 0, tileTotal: 0, tileName: "", last: "" }); }
const RUN_PROTO = {
  stages() { return STAGES[this.mode] || STAGES.custom; },
  pct() {
    const st = this.stages(); if (this.done && this.exit === 0) return 100;
    if (this.stageIdx < 0) return 2;
    const mainIdx = st.indexOf(this.mode === "revise" ? "수정 생성" : "타일 생성");
    // 생성 단계가 가장 길다: 앞 단계 25%, 생성 60%, 뒤 단계 15%
    if (this.stageIdx < mainIdx) return Math.round(4 + 21 * (this.stageIdx + 1) / Math.max(1, mainIdx));
    if (this.stageIdx === mainIdx) return Math.round(25 + 60 * (this.tileTotal ? Math.min(1, this.tileDone / this.tileTotal) : 0.15));
    return Math.round(85 + 15 * (this.stageIdx - mainIdx) / Math.max(1, st.length - 1 - mainIdx));
  },
  summary() { return { running: !!(this.proc && this.exit == null), name: this.name, mode: this.mode, done: this.done, exit: this.exit, count: this.lines.length, startedAt: this.startedAt,
    stages: this.stages(), stage: this.stage, stageIdx: this.stageIdx, tileDone: this.tileDone, tileTotal: this.tileTotal, tileName: this.tileName, pct: this.pct(), last: this.last }; },
  setStage(name) { const st = this.stages(); const i = st.indexOf(name); if (i >= 0 && i >= this.stageIdx) { this.stageIdx = i; this.stage = name; } },
  /* 텍스트 마커(▶ 단계 / ▶ 타일) 우선, 없으면 도구 호출로 추정 */
  track(kind, text) {
    if (kind === "ai") {
      let m; const re1 = /▶\s*단계\s*[:：]\s*([^\n]+)/g; while ((m = re1.exec(text))) this.setStage(m[1].trim());
      const re2 = /▶\s*타일\s*[:：]\s*(\d+)\s*\/\s*(\d+)\s*([^\n]*)/g; while ((m = re2.exec(text))) { this.tileDone = +m[1]; this.tileTotal = +m[2]; this.tileName = m[3].trim(); this.setStage(this.mode === "revise" ? "수정 생성" : "타일 생성"); }
      const plain = text.replace(/▶[^\n]*/g, "").trim(); if (plain) this.last = plain.slice(0, 140);
    } else if (kind === "tool") {
      const t = text;
      if (this.stageIdx < 0) this.setStage("준비");
      if (/^Read — .*\.(png|jpe?g|webp)/i.test(t) && this.mode === "make") this.setStage("사진 분석");
      if (/기획안/.test(t) && /^(Write|Edit)/.test(t)) this.setStage("기획안");
      if (/^mcp__higgsfield/.test(t)) this.setStage(this.mode === "revise" ? "수정 생성" : "타일 생성");
      if (/manifest\.json/.test(t) && /^(Write|Edit)/.test(t)) this.setStage("정리");
      this.last = t.slice(0, 140);
    }
  },
  push(kind, text) { this.lines.push({ t: Date.now(), kind, text: String(text).slice(0, 4000) }); if (this.lines.length > 2000) this.lines.splice(0, this.lines.length - 2000); },
  start(name, mode, custom, photoMode) {
    if (!isProjectDir(name)) return { ok: false, error: "없는 프로젝트입니다" };
    const prompt = custom || (PROMPTS[mode] ? PROMPTS[mode](name, photoMode || "regen") : null);
    if (!prompt) return { ok: false, error: "모르는 모드" };
    this.name = name; this.mode = mode; this.lines = []; this.done = false; this.exit = null; this.startedAt = Date.now();
    this.stage = ""; this.stageIdx = -1; this.tileDone = 0; this.tileTotal = 0; this.tileName = ""; this.last = "";
    // 프롬프트는 stdin 으로 — 한글·공백이 든 인자를 cmd.exe 가 쪼개 버린다(첫 단어만 전달되는 사고)
    // 사용자 기본 모델이 opus[1m](1M 컨텍스트)이면 Max 한도를 훨씬 빨리 소진한다 → 일반 opus 로 고정
    const args = ["-p", "--model", "claude-opus-5", "--output-format", "stream-json", "--verbose", "--permission-mode", "acceptEdits",
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
    p.on("close", code => { if (buf.trim()) this.ingest(buf.trim()); this.exit = code; this.done = true; if (code === 0) this.stageIdx = this.stages().length - 1; this.push("sys", code === 0 ? "끝" : "종료 코드 " + code); onRunFinished(code, this); if (!anyRunning() && UPD.state === "downloaded-wait") { UPD.state = "downloaded"; setTimeout(() => UPD.tryInstall(), 15000); } });
    return { ok: true, message: "시작했습니다" };
  },
  ingest(ln) {
    let j; try { j = JSON.parse(ln); } catch (e) { return this.push("raw", ln); }
    if (j.type === "assistant" && j.message && Array.isArray(j.message.content)) {
      for (const c of j.message.content) {
        if (c.type === "text" && c.text && c.text.trim()) { this.push("ai", c.text.trim()); this.track("ai", c.text); }
        else if (c.type === "tool_use") { const inp = c.input || {}; const brief = inp.description || inp.file_path || inp.command || inp.prompt || inp.pattern || ""; const line = c.name + (brief ? " — " + String(brief).slice(0, 160) : ""); this.push("tool", line); this.track("tool", line); }
      }
    } else if (j.type === "result") {
      this.push("sys", (j.is_error ? "오류로 끝남" : "완료") + (j.total_cost_usd != null ? ` · $${(+j.total_cost_usd).toFixed(3)}` : "") + (j.num_turns ? ` · ${j.num_turns}턴` : ""));
      if (j.result && j.is_error) this.push("err", friendlyErr(String(j.result)));
    } else if (j.type === "system" && j.subtype === "init") {
      this.push("sys", `모델 ${j.model || ""} · MCP ${(j.mcp_servers || []).map(m => m.name + ":" + m.status).join(", ") || "없음"}`);
    }
  },
  stop() { if (this.proc && this.exit == null) { try { if (IS_WIN) exec(`taskkill /PID ${this.proc.pid} /T /F`, { windowsHide: true }); else this.proc.kill("SIGTERM"); } catch (e) {} this.push("sys", "사용자가 중단"); return { ok: true, message: "중단했습니다" }; } return { ok: false, error: "실행 중이 아닙니다" }; }
};

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
  /* AI 작업 중이 아니면 5초 뒤 무음 설치 + 재실행. 작업 중이면 끝날 때(RUN close) 다시 시도, 그래도 아니면 종료 시 설치 */
  tryInstall() {
    if (this.state !== "downloaded" || this.installing) return;
    if (anyRunning()) { this.state = "downloaded-wait"; return; }
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
  get() { return { ok: true, running: this.running, name: this.name, error: this.error, data: this.data, startedAt: this.startedAt }; },
  start(name, hint) {
    if (!isProjectDir(name)) return { ok: false, error: "없는 프로젝트입니다" };
    if (this.running) return { ok: false, error: "이미 사진을 보는 중입니다" };
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
    this.name = name; this.running = true; this.error = ""; this.data = null; this.startedAt = Date.now();
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
        const j = JSON.parse(out); const txt = String(j.result || "");
        if (j.is_error) throw new Error(friendlyErr(txt));
        const m = txt.match(/\{[\s\S]*\}/); if (!m) throw new Error("응답에 JSON 이 없습니다 — " + txt.slice(0, 160));
        const data = JSON.parse(m[0]); data.at = new Date().toISOString(); data.photos = photos.map(p => path.basename(p)); data.cost = j.total_cost_usd || null;
        this.data = data; fs.writeFileSync(path.join(d, "suggest.json"), JSON.stringify(data, null, 2), "utf8");
      } catch (e) { this.error = "제안을 읽지 못했습니다: " + e.message + (err ? " / " + err.slice(0, 200) : "") + (code ? " (code " + code + ")" : ""); logErr(e); }
    });
    return { ok: true, message: "AI 가 사진을 보는 중" };
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
    if (p === "/local/ping") return json(res, 200, { ok: true, root: ROOT, desktop: true, version: APP_VERSION });
    if (p === "/local/projects") return json(res, 200, { ok: true, projects: ROOT ? projectList() : [] });
    if (p === "/local/project") { const n = q.get("name") || ""; if (!isProjectDir(n)) return json(res, 404, { ok: false, error: "없는 폴더입니다" }); return json(res, 200, Object.assign({ ok: true }, scan(n))); }
    if (p === "/local/export") { const n = q.get("name") || "", ver = (q.get("ver") || "v1").slice(0, 12); if (!isProjectDir(n)) return json(res, 404, { ok: false, error: "없는 폴더입니다" });
      try { return json(res, 200, Object.assign({ ok: true }, buildExport(n, ver))); } catch (e) { return json(res, 500, { ok: false, error: "내보내기 실패: " + e.message }); } }
    if (p === "/local/suggest") {
      if (req.method === "POST") { const body = (await readBody(req, 100000)).toString("utf8"); let b = {}; try { b = body ? JSON.parse(body) : {}; } catch (e) {} return json(res, 200, SUG.start(b.name || q.get("name") || "", b.hint || {})); }
      return json(res, 200, SUG.get());
    }
    if (p === "/local/update") { if (req.method === "POST") return json(res, 200, await UPD.act(q.get("do") || "check")); return json(res, 200, UPD.get()); }
    if (p === "/local/tools") { if (req.method === "POST") return json(res, 200, await toolAction(q)); return json(res, 200, await toolStatus()); }
    if (p === "/local/run") {
      if (req.method === "POST") {
        const act = q.get("do") || "start";
        if (act === "stop") { const r = runFor(q.get("name") || ""); return json(res, 200, r ? r.stop() : { ok: false, error: "실행 중이 아닙니다" }); }
        const body = (await readBody(req, 200000)).toString("utf8"); let b = {}; try { b = body ? JSON.parse(body) : {}; } catch (e) {}
        const name = b.name || q.get("name") || "";
        const cur = runFor(name); if (cur && cur.proc && cur.exit == null) return json(res, 200, { ok: false, error: "이 프로젝트는 이미 AI 작업 중입니다" });
        if ([...RUNS.values()].filter(r => r.proc && r.exit == null).length >= 3) return json(res, 200, { ok: false, error: "동시에 3개까지만 돌릴 수 있습니다" });
        const r = makeRun(); const out = r.start(name, b.mode || q.get("mode") || "make", b.prompt || "", b.photoMode || "");
        if (out.ok) RUNS.set(name, r);
        return json(res, 200, out);
      }
      const name = q.get("name") || "";
      if (!name) return json(res, 200, { ok: true, runs: [...RUNS.values()].map(r => r.summary()) });
      const r = runFor(name); if (!r) return json(res, 200, { ok: true, running: false, done: false, lines: [], next: 0, name });
      const since = Math.max(0, +(q.get("since") || 0));
      return json(res, 200, Object.assign({ ok: true, lines: r.lines.slice(since), next: r.lines.length }, r.summary()));
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
    if (p === "/local/paste" && req.method === "POST") {
      // 렌더러의 paste 이벤트에 의존하지 않고 메인에서 클립보드 이미지를 직접 읽는다 (메뉴 없는 창에서도 Ctrl+V 확실히)
      const n = q.get("name") || ""; if (!isProjectDir(n)) return json(res, 404, { ok: false, error: "없는 폴더입니다" });
      const img = clipboard.readImage();
      if (!img || img.isEmpty()) {
        // 파일 복사(탐색기 Ctrl+C) 도 받는다
        let files = [];
        try { const raw = clipboard.readBuffer("FileNameW"); if (raw && raw.length) files = raw.toString("ucs2").split("\0").filter(Boolean); } catch (e) {}
        files = files.filter(f => IMG.has(path.extname(f).toLowerCase()) && fs.existsSync(f));
        if (!files.length) return json(res, 200, { ok: false, empty: true, error: "클립보드에 이미지가 없습니다" });
        const saved = [];
        for (const f of files) { let out = path.join(ROOT, n, path.basename(f)), k = 1; const stem = path.basename(f).replace(/\.[^.]+$/, ""), ext = path.extname(f); while (fs.existsSync(out)) out = path.join(ROOT, n, `${stem} (${k++})${ext}`); fs.copyFileSync(f, out); saved.push(path.basename(out)); }
        return json(res, 200, { ok: true, files: saved });
      }
      const sz = img.getSize(); const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
      let out = path.join(ROOT, n, `붙여넣기_${stamp}.png`), k = 1; while (fs.existsSync(out)) out = path.join(ROOT, n, `붙여넣기_${stamp} (${k++}).png`);
      fs.writeFileSync(out, img.toPNG());
      return json(res, 200, { ok: true, files: [path.basename(out)], w: sz.width, h: sz.height });
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

/* ── 트레이 (작업 중 창을 닫으면 백그라운드 유지) ─────── */
let tray = null, hiddenForRun = false;
function trayIcon() { try { return nativeImage.createFromPath(path.join(APP_DIR, "assets", "icon-32.png")); } catch (e) { return nativeImage.createEmpty(); } }
function toTray() {
  if (!tray) { tray = new Tray(trayIcon()); tray.setContextMenu(Menu.buildFromTemplate([{ label: "콘솔 열기", click: () => restoreWin() }, { type: "separator" }, { label: "AI 작업 모두 중단하고 종료", click: () => { RUNS.forEach(r => { try { r.stop(); } catch (e) {} }); setTimeout(() => app.exit(0), 800); } }])); tray.on("click", () => restoreWin()); }
  tray.setToolTip("re:boot 콘솔 — AI 작업 중 (클릭해서 열기)");
  hiddenForRun = true; if (win) win.hide();
}
function restoreWin() { hiddenForRun = false; if (win) { win.show(); win.focus(); } else createWindow(); if (tray) { tray.destroy(); tray = null; } }
const SMOKE = process.argv.includes("--smoke");
function onRunFinished(code, run) {
  if (SMOKE) return;                                                       // 검증 인스턴스는 알림·창 조작 없음
  const away = hiddenForRun || !win || !win.isFocused();                  // 콘솔을 보고 있으면 굳이 OS 알림까지 안 띄움
  try { if (away && Notification.isSupported()) new Notification({ title: code === 0 ? "re:boot — AI 작업 완료" : "re:boot — AI 작업 종료", body: `${run.name} · ${code === 0 ? "검수 화면에서 확인하세요" : "종료 코드 " + code}`, icon: trayIcon() }).show(); } catch (e) {}
  if (hiddenForRun && !anyRunning()) restoreWin(); else if (win && !hiddenForRun) { win.flashFrame(true); }
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
  win.on("close", e => { save(); if (UPD.installing) return; if (anyRunning()) { e.preventDefault(); toTray(); } });
  win.on("closed", () => { win = null; });
  win.loadURL(`http://127.0.0.1:${PORT}/app/`);
}

if (process.argv.includes("--smoke")) app.setPath("userData", path.join(os.tmpdir(), "reboot-smoke-data"));
app.setAppUserModelId("kr.rebootdesign.console");   // 알림에 electron.app.Electron 대신 앱 이름   // 검증용: 실행 중인 콘솔과 잠금·설정 분리
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(async () => {
    if (!(await ensureRoot())) return;
    await startServer();
    UPD.init();
    if (process.argv.includes("--smoke")) {           // 빌드 검증용: 서버만 띄우고 포트를 임시 파일에 기록
      fs.writeFileSync(path.join(app.getPath("temp"), "reboot-smoke.json"), JSON.stringify({ port: PORT, root: ROOT, packaged: app.isPackaged }));
      setTimeout(() => app.quit(), 20 * 60 * 1000);
      return;
    }
    createWindow();
  });
  app.on("window-all-closed", () => { if (!hiddenForRun) app.quit(); });
}

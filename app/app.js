/* ═══════════════════════════════════════════
   re:boot — 상세페이지 제작 콘솔  (v4.8)
   서버(파이썬 _launch.py 또는 EXE 내장 Node)가 폴더를 읽고 쓴다.
   EXE 에서는 도구 로그인(창 없음)·Claude Code 헤드리스 제작·검수 반영까지 여기서 돈다.
   ═══════════════════════════════════════════ */
(function () {
"use strict";

/* ── 아이콘 ─────────────────────────── */
const P = { fill: "none", stroke: "currentColor", "stroke-linecap": "round", "stroke-linejoin": "round" };
const ICON = {
  home:     'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5',
  photo:    'M3 5.5h18v13H3zM3 15l4.5-4.5 4 4L15 11l6 6M8 9.5a1 1 0 1 0 0-.01',
  doc:      'M6 3h8l4 4v14H6zM14 3v4h4',
  grid:     'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  check:    'M4 12.5 9 17.5 20 6.5',
  gear:     'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.9 19.4l-.1.1A2 2 0 1 1 5 16.7l.1-.1A1.6 1.6 0 0 0 4 13.9H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7.9l-.1-.1A2 2 0 1 1 7.3 5l.1.1a1.6 1.6 0 0 0 1.8.3H9.3a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1A2 2 0 1 1 20 7l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z',
  folder:   'M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z',
  chev:     'm6 9 6 6 6-6',
  chevR:    'm9 6 6 6-6 6',
  plus:     'M12 5v14M5 12h14',
  info:     'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 7.6v.1',
  warn:     'M12 3.5 22 20H2ZM12 10v4.5M12 17.4v.1',
  copy:     'M9 9h10v12H9zM5 15V3h10',
  down:     'M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M4 19h16',
  x:        'M6 6l12 12M18 6 6 18',
  layers:   'M12 3 3 8l9 5 9-5zM3 13l9 5 9-5M3 18l9 4 9-4',
  sparkles: 'M10 3 11.6 7.9 16.5 9.5 11.6 11.1 10 16 8.4 11.1 3.5 9.5 8.4 7.9ZM17.5 14l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8Z',
  cloud:    'M7 19a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18 9.6 4 4 0 0 1 17.5 19Z',
  lock:     'M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3',
  trash:    'M4 7h16M9 7V5h6v2M6.5 7l.8 13h9.4l.8-13',
  edit:     'M4 20h4l10.5-10.5-4-4L4 16zM13 7l4 4',
  eye:      'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z M14.5 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z',
  flag:     'M5 21V4h11l-1.5 4L16 12H5',
  arrowR:   'M5 12h14m-6-6 6 6-6 6',
  term:     'M3 5h18v14H3zM7 9l3 3-3 3M12 15h5',
  refresh:  'M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5',
  ext:      'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  drag:     'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
  stop:     'M6 6h12v12H6z',
  gauge:    'M4 15a8 8 0 1 1 16 0M12 15l4-5M7 19h10',
  clock:    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  spell:    'M3 17 7 6l4 11M4.5 13h5M13 14l3 3 5-6',
  inbox:    'M3 13h5l1.5 3h5L16 13h5M5 5h14l2 8v6H3v-6Z',
  kanban:   'M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v7h-4z',
  globe:    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z',
  history:  'M3 12a9 9 0 1 0 3-6.7M3 4v4h4M12 8v4l3 2',
  keyboard: 'M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M7 14h10',
  type:     'M5 7V5h14v2M12 5v14M9 19h6',
  chevU:    'm6 15 6-6 6 6',
  mobile:   'M7 3h10v18H7zM11 18h2'
};
function svg(name, cls) {
  const d = ICON[name] || "";
  return `<svg viewBox="0 0 24 24" ${Object.entries(P).map(([k, v]) => `${k}="${v}"`).join(" ")}${cls ? ` class="${cls}"` : ""}>` +
    d.split(" M").map((seg, i) => `<path d="${i ? "M" + seg : seg}"/>`).join("") + `</svg>`;
}

/* ── 유틸 ───────────────────────────── */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
const fmtKB = b => b < 1024 * 1024 ? (b / 1024).toFixed(0) + " KB" : (b / 1048576).toFixed(1) + " MB";
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ═══ UI — 모달·토스트·라이트박스 ═══ */
const UI = {
  _ovl: null, _resolve: null,
  _ensure() {
    if (this._ovl) return;
    this._ovl = el("div", "ovl", `<div class="dlg" role="dialog" aria-modal="true"></div>`);
    document.body.appendChild(this._ovl);
    this._ovl.addEventListener("click", e => { if (e.target === this._ovl && this._dismissable) this._close(null); });
  },
  _close(v) { if (!this._ovl) return; this._ovl.classList.remove("on"); const r = this._resolve; this._resolve = null; if (r) r(v); },
  dialog(o) {
    this._ensure();
    if (this._resolve) { const prev = this._resolve; this._resolve = null; prev(null); }
    this._dismissable = o.dismissable !== false;
    const d = $(".dlg", this._ovl);
    d.className = "dlg" + (o.wide ? " wide" : "");
    const tone = o.tone || "b";
    d.innerHTML =
      `<div class="dh"><div class="dico ${tone}">${svg(o.icon || "info")}</div>
        <div style="flex:1;min-width:0"><h3>${esc(o.title)}</h3>${o.sub ? `<p class="dsub">${o.sub}</p>` : ""}</div></div>` +
      (o.body ? `<div class="db">${o.body}</div>` : "") + `<div class="df"></div>`;
    const f = $(".df", d);
    (o.buttons || [{ label: "확인", value: true, kind: "pri" }]).forEach(b => {
      const btn = el("button", "btn " + (b.kind || ""), esc(b.label));
      btn.onclick = () => this._close(b.value);
      f.appendChild(btn);
    });
    this._ovl.classList.add("on");
    setTimeout(() => { const p = $(".df .btn.pri", d) || $(".df .btn", d); if (p) p.focus(); }, 40);
    if (o.onOpen) o.onOpen(d);
    return new Promise(res => { this._resolve = res; });
  },
  alert(title, sub, tone) { return this.dialog({ title, sub, tone: tone || "b", icon: tone === "w" || tone === "d" ? "warn" : "info" }); },
  confirm(title, sub, o) {
    o = o || {};
    return this.dialog({ title, sub, tone: o.tone || "w", icon: "warn",
      buttons: [{ label: o.cancel || "취소", value: false }, { label: o.ok || "계속", value: true, kind: o.danger ? "dgr" : "pri" }] });
  },
  close() { this._close(null); },
  toast(msg, kind) {
    let box = $(".toasts"); if (!box) { box = el("div", "toasts"); document.body.appendChild(box); }
    while (box.children.length >= 3) box.firstChild.remove();
    const t = el("div", "toast " + (kind || ""), svg(kind === "d" || kind === "w" ? "warn" : "check") + `<span>${esc(msg)}</span>`);
    box.appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 240); }, Math.round((SET.toastSec || 2.6) * 1000));
  },
  lightbox(src) {
    let b = $(".lbx");
    if (!b) { b = el("div", "lbx", `<img alt="">`); b.onclick = () => b.classList.remove("on"); document.body.appendChild(b); }
    $("img", b).src = src; b.classList.add("on");
  }
};
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  const lb = $(".lbx.on"); if (lb) { lb.classList.remove("on"); return; }
  if (UI._ovl && UI._ovl.classList.contains("on") && UI._dismissable) UI._close(null);
});

/* ═══ 저장소 ═══ */
const Store = {
  k(n) { return "reboot:" + n; },
  get(n, d) { try { const v = localStorage.getItem(this.k(n)); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(n, v) { try { localStorage.setItem(this.k(n), JSON.stringify(v)); } catch (e) {} },
  del(n) { try { localStorage.removeItem(this.k(n)); } catch (e) {} }
};

/* ═══ 설정값 (설정 탭에서 조정) ═══ */
const SET_DEF = { theme: "system", baseW: 860, autoNext: true, minLong: 1200, tabFill: true, toastSec: 2.6, jpegQ: 82, readPx: 12, readContrast: 4.5 };
const SET = Object.assign({}, SET_DEF, Store.get("settings", {}));
function saveSet() { Store.set("settings", SET); applyTheme(); }
function applyTheme() {
  const r = document.documentElement;
  if (SET.theme === "light" || SET.theme === "dark") r.dataset.theme = SET.theme; else delete r.dataset.theme;
}
applyTheme();

/* ═══ 사진 분석 ═══ */
const IMG_EXT = ["jpg", "jpeg", "png", "webp", "bmp", "tif", "tiff", "avif", "heic", "heif"];
const isImg = n => IMG_EXT.indexOf(String(n).split(".").pop().toLowerCase()) !== -1;
const Analyze = {
  async file(f) {
    let bmp;
    try { bmp = await createImageBitmap(f); } catch (e) { return { name: f.name, size: f.size, error: "읽을 수 없는 파일" }; }
    const W = bmp.width, H = bmp.height, S = 96;
    const cv = document.createElement("canvas"); cv.width = S; cv.height = S;
    const cx = cv.getContext("2d", { willReadFrequently: true });
    cx.drawImage(bmp, 0, 0, S, S);
    const px = cx.getImageData(0, 0, S, S).data;
    bmp.close && bmp.close();
    let sum = 0, sum2 = 0, n = S * S; const lum = new Float32Array(n);
    for (let i = 0; i < n; i++) { const L = (px[i*4]*.299 + px[i*4+1]*.587 + px[i*4+2]*.114) / 255; lum[i] = L; sum += L; sum2 += L*L; }
    const mean = sum / n, sd = Math.sqrt(Math.max(0, sum2 / n - mean * mean));
    const bins = {};
    for (let i = 0; i < n; i++) {
      const k = ((px[i*4] >> 5) << 10) | ((px[i*4+1] >> 5) << 5) | (px[i*4+2] >> 5);
      if (!bins[k]) bins[k] = { n: 0, r: 0, g: 0, b: 0 };
      const o = bins[k]; o.n++; o.r += px[i*4]; o.g += px[i*4+1]; o.b += px[i*4+2];
    }
    const pal = Object.values(bins).sort((a, b) => b.n - a.n).slice(0, 5).map(o => ({
      hex: "#" + [o.r/o.n, o.g/o.n, o.b/o.n].map(v => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase(), pct: Math.round(o.n * 100 / n) }));
    const edge = [];
    for (let i = 0; i < S; i++) edge.push(lum[i], lum[(S-1)*S+i], lum[i*S], lum[i*S+S-1]);
    const em = edge.reduce((a, b) => a + b, 0) / edge.length;
    const esd = Math.sqrt(edge.reduce((a, b) => a + (b-em)*(b-em), 0) / edge.length);
    const long = Math.max(W, H);
    return { name: f.name, size: f.size, w: W, h: H, long, orient: W > H*1.1 ? "가로형" : H > W*1.1 ? "세로형" : "정사각",
      resGrade: long >= 2400 ? "good" : long >= SET.minLong ? "ok" : "low", bright: mean, contrast: sd, pal,
      bgSimple: esd < .06 ? "high" : esd < .14 ? "mid" : "low", thumb: URL.createObjectURL(f) };
  },
  summarize(list) {
    const good = list.filter(a => !a.error); if (!good.length) return null;
    const low = good.filter(a => a.resGrade === "low"), cut = good.filter(a => a.bgSimple === "high");
    const all = []; good.forEach(a => (a.pal || []).forEach(p => all.push(p)));
    const sat = h => { const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), b = parseInt(h.slice(5,7),16); return (Math.max(r,g,b) - Math.min(r,g,b)) / 255; };
    const vivid = all.filter(p => sat(p.hex) > .25).sort((a, b) => b.pct - a.pct);
    return { total: good.length, low: low.length, lowNames: low.map(a => `${a.name} (${a.w}×${a.h})`), cuttable: cut.length,
      accent: vivid.length ? vivid[0].hex : "#F86010", avgLong: Math.round(good.reduce((s, a) => s + a.long, 0) / good.length),
      orients: good.reduce((o, a) => (o[a.orient] = (o[a.orient] || 0) + 1, o), {}) };
  }
};

/* ═══ 로컬 서버 (파이썬 런처 또는 EXE 내장) ═══ */
const Local = {
  ok: false, desktop: false, root: "", _projects: null,
  async ping() {
    try { const r = await fetch("/local/ping", { cache: "no-store" }); const ct = r.headers.get("content-type") || "";
      const j = r.ok && ct.includes("application/json") ? await r.json() : null;
      this.ok = !!(j && j.ok); this.desktop = !!(j && j.desktop); this.root = (j && j.root) || ""; this.version = (j && j.version) || ""; } catch (e) { this.ok = false; }
    return this.ok;
  },
  async _j(url, opt) { const r = await fetch(url, Object.assign({ cache: "no-store" }, opt || {})); const j = await r.json().catch(() => ({})); if (!r.ok || j.ok === false) { const err = new Error(j.error || `요청 실패 (${r.status})`); if (j.needLogin) { err.needLogin = true; setTimeout(() => Login.prompt(), 0); } throw err; } return j; },
  _post(url, body) { return this._j(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) }); },
  async projects(force) { if (this._projects && !force) return this._projects; return (this._projects = (await this._j("/local/projects")).projects || []); },
  project(name) { return this._j("/local/project?name=" + encodeURIComponent(name)); },
  save(name, file, text) { return this._j(`/local/save?name=${encodeURIComponent(name)}&file=${encodeURIComponent(file)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: text }); },
  saveImage(name, file, blob) { return this._j(`/local/save-image?name=${encodeURIComponent(name)}&file=${encodeURIComponent(file)}`, { method: "POST", headers: { "Content-Type": "image/png" }, body: blob }); },
  saveJpg(name, file, blob) { return this._j(`/local/save-image?name=${encodeURIComponent(name)}&file=${encodeURIComponent(file)}`, { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: blob }); },
  clearDir(name, sub) { return this._j(`/local/clear-dir?name=${encodeURIComponent(name)}&sub=${encodeURIComponent(sub)}`, { method: "POST" }); },
  exportPreview(name, ver) { return this._j(`/local/export?name=${encodeURIComponent(name)}&ver=${encodeURIComponent(ver || "v1")}`); },
  createProject(name) { return this._j("/local/project-create?name=" + encodeURIComponent(name), { method: "POST" }); },
  addPhoto(name, file, blob) { return this._j(`/local/photo?name=${encodeURIComponent(name)}&file=${encodeURIComponent(file)}`, { method: "POST", headers: { "Content-Type": blob.type || "application/octet-stream" }, body: blob }); },
  addRef(name, file, blob) { return this._j(`/local/photo?name=${encodeURIComponent(name)}&sub=ref&file=${encodeURIComponent(file)}`, { method: "POST", headers: { "Content-Type": blob.type || "application/octet-stream" }, body: blob }); },
  deletePhoto(name, file) { return this.deleteFile(name, file, ""); },
  deleteFile(name, file, sub) { return this._j(`/local/photo-delete?name=${encodeURIComponent(name)}&file=${encodeURIComponent(file)}${sub ? "&sub=" + sub : ""}`, { method: "POST" }); },
  pasteClip(name, sub) { return this._j(`/local/paste?name=${encodeURIComponent(name)}${sub ? "&sub=" + sub : ""}`, { method: "POST" }); },
  suggest(name, hint) { return this._post("/local/suggest", { name, hint }); },
  suggestStatus() { return this._j("/local/suggest"); },
  /* EXE 전용 */
  tools() { return this._j("/local/tools"); },
  toolAct(action, extra) { return this._j("/local/tools?" + new URLSearchParams(Object.assign({ do: action }, extra || {})), { method: "POST" }); },
  run(name, mode, prompt, photoMode, extra) { return this._post("/local/run", Object.assign({ name, mode, prompt: prompt || "", photoMode: photoMode || "" }, extra || {})); },
  runStatus(name, since, rid) { return this._j(`/local/run?name=${encodeURIComponent(name)}&since=${since || 0}&rid=${rid || 0}`); },
  runsAll() { return this._j("/local/run"); },
  runStop(name) { return this._j(`/local/run?do=stop&name=${encodeURIComponent(name)}`, { method: "POST" }); },
  update() { return this._j("/local/update"); },
  updateAct(what) { return this._j("/local/update?do=" + what, { method: "POST" }); },
  queue() { return this._j("/local/queue"); },
  queueAdd(b) { return this._post("/local/queue?do=add", b); },
  queueAct(what, id, b) { return this._post(`/local/queue?do=${encodeURIComponent(what)}&id=${encodeURIComponent(id || "")}`, b || {}); },
  config() { return this._j("/local/config"); },
  configSet(b) { return this._post("/local/config", b); },
  log(name, limit) { return this._j(`/local/log?name=${encodeURIComponent(name || "")}&limit=${limit || 200}`); },
  logAdd(name, kind, text, dir) { return this._post("/local/log", { name: name || "", kind, text, dir: dir || "" }).catch(() => {}); },
  usage(force) { return this._j("/local/usage" + (force ? "?force=1" : "")); },
  job(kind, name) { return this._j(`/local/job?kind=${encodeURIComponent(kind)}&name=${encodeURIComponent(name)}`); },
  ocr(name, tiles) { return this._j(`/local/ocr?name=${encodeURIComponent(name)}${tiles && tiles.length ? "&tiles=" + encodeURIComponent(tiles.join(",")) : ""}`); },
  typo(name) { return this._j("/local/typo?name=" + encodeURIComponent(name), { method: "POST" }); },
  feedback(name, text) { return this._post("/local/feedback?name=" + encodeURIComponent(name), { text }); },
  ref(name, urls, note) { return this._post("/local/ref?name=" + encodeURIComponent(name), { urls, note }); },
  psd(name, tiles) { return this._j(`/local/psd?name=${encodeURIComponent(name)}${tiles && tiles.length ? "&tiles=" + encodeURIComponent(tiles.join(",")) : ""}`, { method: "POST" }); },
  restore(name, tile, file) { return this._j(`/local/tile-restore?name=${encodeURIComponent(name)}&tile=${encodeURIComponent(tile)}&file=${encodeURIComponent(file)}`, { method: "POST" }); }
};

/* ═══ 자동 업데이트 — 조용히. 내려받는 건 백그라운드, 설치는 틈 날 때 알아서 재시작 ═══ */
const Update = {
  shown: "", timer: null,
  async poll(force) {
    if (!Local.desktop) return;
    let u; try { u = await Local.update(); } catch (e) { return; }
    const key = u.state + ":" + u.version;
    if (key !== this.shown || force) {
      if (u.state === "available" || u.state === "downloading") UI.toast(`새 버전 ${u.version} 내려받는 중 — 작업은 계속하셔도 됩니다`);
      else if (u.state === "installing") UI.toast(`업데이트 ${u.version} 적용 — 잠시 후 자동으로 다시 열립니다`, "o");
      else if (u.state === "downloaded-wait") UI.toast(`업데이트 ${u.version} 준비됨 — AI 작업이 끝나면 자동으로 적용됩니다`);
      else if (u.state === "error" && force) UI.toast("업데이트 확인 실패: " + (u.error || ""), "w");
      this.shown = key;
    }
    return u;
  },
  start() { if (!Local.desktop) return; setTimeout(() => this.poll(), 4000); this.timer = setInterval(() => this.poll(), 60 * 1000); }
};

/* ═══ 프로젝트 ═══ */
const FS = {
  name: "", files: [], analysis: [], summary: null, tileMeta: {},
  images: [], history: {}, meta: {}, cuts: [], cutsMeta: null, approved: null, refs: [], ref: null, typo: null, feedback: null, lastRun: null, plan: null,

  async load(name, quiet) {
    let p;
    try { p = await Local.project(name); } catch (e) { if (!quiet) await UI.alert("프로젝트를 읽지 못했습니다", esc(e.message), "w"); return false; }
    const switching = name !== Store.get("lastProject", "");
    const files = [];
    for (const im of p.images) { try { const b = await (await fetch(im.url)).blob(); files.push(new File([b], im.name, { type: b.type || "image/png" })); } catch (e) {} }
    this.name = name;
    this.tileMeta = (p.tileMeta && typeof p.tileMeta === "object") ? p.tileMeta : {};
    const ord = Array.isArray(this.tileMeta._order) ? this.tileMeta._order : [];
    App.tiles = (p.tiles || []).filter(t => !/^_/.test(t.name)).map(t => {
      const n = t.name.replace(/\.[^.]+$/, ""), m = this.tileMeta[n] || {};
      return { n, name: m.name || "", copy: m.copy || "", ratio: m.ratio || "", f: t.url, mtime: t.mtime, file: t.name };
    }).sort((a, b) => { const ia = ord.indexOf(a.n), ib = ord.indexOf(b.n); if (ia === -1 && ib === -1) return a.n.localeCompare(b.n, "en", { numeric: true }); if (ia === -1) return 1; if (ib === -1) return -1; return ia - ib; });
    const saved = (p.brief && p.brief.brief) || (p.order && p.order.brief) || (p.brief && p.brief.product ? p.brief : null);
    if (saved && typeof saved === "object") App.brief = saved; else if (switching) App.brief = {};
    // 검수: review.json(신) → order.json 의 review(구) → 로컬
    const rv = (p.review && p.review.tiles) || (p.order && p.order.review) || null;
    if (rv && typeof rv === "object") App.review = App.migrateReview(rv); else if (switching) App.review = {};
    App.suggest = (p.suggest && typeof p.suggest === "object") ? p.suggest : null;
    this.images = p.images || []; this.history = p.history || {}; this.meta = p.meta || {}; this.cuts = p.cuts || []; this.cutsMeta = p.cutsMeta || null;
    this.approved = p.approved && p.approved.file ? p.approved : null; this.refs = p.refs || []; this.ref = p.ref || null; this.typo = p.typo || null;
    this.feedback = p.feedback || null; this.lastRun = p.lastRun || null; this.plan = p.plan || null;
    App.saveBrief(); App.saveReview();
    this.files = files; this.analysis = [];
    for (const f of files) this.analysis.push(await Analyze.file(f));
    this.summary = Analyze.summarize(this.analysis);
    Store.set("lastProject", name);
    return true;
  },
  /* 사진 추가 (파일 선택·드롭·붙여넣기 공통) */
  async addPhotos(list) {
    if (!this.name || !Local.ok) { UI.toast("먼저 프로젝트를 여세요", "w"); return 0; }
    const files = Array.prototype.slice.call(list || []).filter(f => f && (isImg(f.name || "") || /^image\//.test(f.type || "")));
    if (!files.length) { UI.toast("이미지 파일이 아닙니다", "w"); return 0; }
    let n = 0; UI.toast(`사진 ${files.length}장 올리는 중…`);
    for (const f of files) {
      let name = f.name && isImg(f.name) ? f.name : `붙여넣기_${new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "")}.${(f.type || "image/png").split("/")[1].replace("jpeg", "jpg")}`;
      try { await Local.addPhoto(this.name, name, f); n++; } catch (e) { UI.toast(`${name}: ${e.message}`, "w"); }
    }
    if (n) { await this.load(this.name, true); UI.toast(`사진 ${n}장 추가 — 다 올리셨으면 [분석 후 적용]`, "o"); Local._projects = null; }
    return n;
  },
  async removePhoto(file) {
    if (!(await UI.confirm("이 사진을 뺄까요?", `<b>${esc(file)}</b> 을(를) 프로젝트에서 뺍니다. 파일은 <code>_trash</code> 폴더로 옮겨집니다.`, { ok: "빼기", danger: true }))) return false;
    try { await Local.deletePhoto(this.name, file); await this.load(this.name, true); UI.toast("뺐습니다", "o"); Local._projects = null; return true; }
    catch (e) { UI.alert("삭제 실패", esc(e.message), "d"); return false; }
  },

  async write(filename, text) {
    if (this.name && Local.ok) {
      try { await Local.save(this.name, filename, text); return { ok: true, where: this.name + "\\" + filename }; }
      catch (e) { UI.toast("서버 저장 실패: " + e.message, "w"); }
    }
    const b = new Blob([text], { type: "application/json" }); const a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = filename.split("/").pop(); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    return { ok: false, where: "다운로드 폴더" };
  },
  /* 타일 순서·이름은 tiles/manifest.json 에 */
  async saveManifest() {
    const m = Object.assign({}, this.tileMeta);
    App.tiles.forEach(t => { m[t.n] = Object.assign({}, m[t.n] || {}, { name: t.name, copy: t.copy, ratio: t.ratio || (m[t.n] || {}).ratio || "" }); });
    m._order = App.tiles.map(t => t.n);
    this.tileMeta = m;
    if (!this.name || !Local.ok) return false;
    try { await Local.save(this.name, "tiles/manifest.json", JSON.stringify(m, null, 2)); return true; } catch (e) { UI.toast("순서 저장 실패: " + e.message, "w"); return false; }
  },
  reviewDoc() { return { project: this.name, savedAt: new Date().toISOString(), order: App.tiles.map(t => t.n), tiles: App.review }; },
  async saveReviewFile() { if (!this.name || !Local.ok) return false; try { await Local.save(this.name, "review.json", JSON.stringify(this.reviewDoc(), null, 2)); return true; } catch (e) { return false; } }
};

/* ═══ 브리프 정의 ═══ */
const CATS = ["패션/잡화", "식품", "뷰티/화장품", "디지털/가전", "생활/리빙", "서비스/강의", "기타"];
const CHANNELS = ["스마트스토어", "쿠팡", "자사몰(D2C)", "기타"];
const CERTS = ["HACCP", "KC인증", "특허", "시험성적서", "유기농/친환경", "피부자극테스트", "없음"];
const PHOTO_MODES = [["regen", "AI 고화질 재현 (권장)"], ["keep", "원본 그대로 합성"]];
const photoModeOf = () => { const m = (App.brief.req || {}).photoMode; return m === "keep" ? "keep" : "regen"; };
const EG = {
  "식품": { name: "저온착즙 사과주스 1L", price: "29,900원 · 1L x 6병", who: "초등 자녀 둔 30대 엄마. 하원 후 오후 간식 주는데 시판 주스는 당이 너무 높아서 고민.", specs: "저온 착즙 공법\n사과 함량 100%, 물·설탕·농축액 무첨가\n유리병 1L\n냉장 보관, 개봉 후 3일", usp: "시중 제품은 대부분 농축액 환원인데 우리는 착즙 원액 100%" },
  "디지털/가전": { name: "무선 에어건 청소기", price: "89,000원 · 본체 + 노즐 3종", who: "차량 관리에 진심인 30~40대 남성. 세차장 에어건 쓰려고 매번 나가는 게 번거로움.", specs: "풍속 최대 52m/s\n배터리 6000mAh, 연속 20분\n무게 780g\n노즐 3종 (일자·납작·브러시)", usp: "같은 가격대는 대부분 30m/s대인데 52m/s" },
  "뷰티/화장품": { name: "시카 진정 앰플 30ml", price: "32,000원", who: "마스크 트러블로 고생하는 20~30대. 자극적인 제품은 못 쓴다.", specs: "병풀추출물 82%\n무향료·무색소\n30ml, 스포이드 타입", usp: "정제수 대신 병풀추출물을 베이스로 사용" },
  "패션/잡화": { name: "코튼 와이드 슬랙스", price: "39,000원 · 4color", who: "출퇴근룩 고민하는 20~30대 직장인. 편한데 격식 있어 보이는 바지를 찾는다.", specs: "코튼 97% 스판 3%\n허리 밴딩\nS/M/L, 기장 96cm\n4컬러", usp: "밴딩인데 겉에서 안 보이는 히든 밴드" },
  "생활/리빙": { name: "무소음 탁상 가습기 500ml", price: "24,900원", who: "원룸 사는 20~30대. 겨울에 목이 건조해서 깬다.", specs: "용량 500ml, 연속 8시간\n소음 25dB\nUSB-C 급전\n무드등 3단계", usp: "같은 용량대 대비 소음 절반" },
  "서비스/강의": { name: "상세페이지 실전 제작 강의", price: "149,000원 · 8주 과정", who: "스마트스토어 시작한 1인 셀러. 외주 맡길 돈은 없고 직접 만들어야 한다.", specs: "8주 커리큘럼, 영상 32강\n1:1 피드백 3회\n템플릿 12종 제공\n평생 수강", usp: "이론이 아니라 수강생 본인 상품으로 실제 페이지를 완성시킴" },
  "_": { name: "상품명을 적어주세요", price: "29,900원 · 구성", who: "어떤 사람이, 어떤 상황에서 쓰는지 한 줄이면 충분합니다.", specs: "스펙·기능·성분을 줄바꿈으로 나열해 주세요", usp: "경쟁사 대비 확실히 다른 점 하나" }
};
const SECTIONS = [
  { id: "photos",  n: 0, title: "사진 분석", tag: "자동" },
  { id: "product", n: 1, title: "상품", tag: "필수" },
  { id: "target",  n: 2, title: "누가 사나", tag: "핵심" },
  { id: "fact",    n: 3, title: "상품 팩트", tag: "핵심" },
  { id: "proof",   n: 4, title: "증거", tag: "실제 데이터만" },
  { id: "terms",   n: 5, title: "판매 조건", tag: "선택" },
  { id: "req",     n: 6, title: "요청사항", tag: "선택" },
  { id: "layout",  n: 7, title: "페이지 구성", tag: "선택" }
];
const CATALOG = [
  { id: "intro",     g: "인트로 · 강점 · 소개", label: "인트로 (후킹)",       def: true,  lock: true },
  { id: "brand",     g: "인트로 · 강점 · 소개", label: "브랜드 스토리",       def: false, need: "브랜드 소개 문구" },
  { id: "shipping",  g: "배송",                label: "배송 안내 (최상단 배너)", def: true },
  { id: "box",       g: "상품 구성",           label: "구성품",              def: true },
  { id: "problem",   g: "문제 제기 · 공감",     label: "문제 제기",           def: true },
  { id: "solution",  g: "문제 해결 · 제안",     label: "해결 선언",           def: true },
  { id: "points",    g: "내용 전개",           label: "핵심 포인트 2~3장",    def: true },
  { id: "scenes",    g: "내용 전개",           label: "활용 장면",           def: true },
  { id: "howto",     g: "내용 전개",           label: "사용 방법",           def: false, need: "사용 순서" },
  { id: "compare",   g: "비교 · 가치입증",      label: "비교 (대체재·타사)",    def: true },
  { id: "awards",    g: "인증 · 신뢰자료",      label: "어워드 · 인증",        def: false, need: "인증서·수상 자료 — 없으면 제작하지 않음" },
  { id: "reviews",   g: "후기 · 사회적증거",    label: "고객 후기",           def: false, need: "실제 리뷰 원문 — 없으면 제작하지 않음" },
  { id: "spec",      g: "상품 · 성분 정보",     label: "제품 정보 표",         def: true },
  { id: "qna",       g: "Q&A",                label: "자주 묻는 질문",        def: true },
  { id: "recommend", g: "추천 · 행동유도",      label: "이런 분들께",          def: true },
  { id: "cta",       g: "추천 · 행동유도",      label: "가격 · CTA",          def: true,  lock: true },
  { id: "returns",   g: "교환 / 반품",          label: "교환 · 반품 안내",      def: true }
];
const catOf = id => CATALOG.find(c => c.id === id);
function layoutSel() {
  const saved = App.brief.layout && Array.isArray(App.brief.layout.sections) ? App.brief.layout.sections : null;
  const set = new Set(saved || CATALOG.filter(c => c.def).map(c => c.id));
  CATALOG.forEach(c => { if (c.lock) set.add(c.id); });
  return CATALOG.filter(c => set.has(c.id)).map(c => c.id);
}

/* ═══ 앱 상태 ═══ */
const App = {
  view: "home", brief: Store.get("brief", {}), review: Store.get("review", {}), tiles: [], curTile: null, curSec: null,
  saveBrief() { Store.set("brief", this.brief); renderSide(); },
  saveReview() { Store.set("review", this.review); },
  /* 구형 검수(status/good/request/ext) → 영역 코멘트형으로 */
  migrateReview(rv) {
    const out = {};
    Object.entries(rv || {}).forEach(([n, r]) => { if (!r || typeof r !== "object") return;
      out[n] = { regions: Array.isArray(r.regions) ? r.regions.filter(g => g && typeof g.x === "number").map(g => { const o = { x: g.x, y: g.y, w: g.w, h: g.h, text: g.text || "" }; if (g.kind === "text") { o.kind = "text"; o.from = String(g.from || ""); o.to = String(g.to || ""); if (g.auto) o.auto = g.auto; } return o; }) : [],
        note: typeof r.note === "string" ? r.note : [r.request, r.extNote].filter(x => x && String(x).trim()).join("\n") }; });
    return out;
  },
  hasReq(n) { const r = this.review[n]; return !!(r && ((r.regions && r.regions.length) || (r.note || "").trim())); },
  suggest: null,
  eg() {
    const base = EG[this.brief?.product?.category] || EG._, g = this.suggest;
    if (!g) return base;
    return Object.assign({}, base, { name: g.name || base.name, who: g.who || base.who, specs: g.specs || base.specs, usp: g.usp || base.usp, mood: g.mood || "", avoid: g.avoid || "" , ai: true });
  },
  secDone(id) {
    const b = this.brief[id] || {};
    if (id === "photos") return FS.analysis.length > 0;
    if (id === "product") return !!(b.name || "").trim() && !!b.category;
    if (id === "target") return !!(b.who || "").trim();
    if (id === "fact") return !!(b.specs || "").trim();
    if (id === "layout") return true;
    return Object.keys(b).some(k => Array.isArray(b[k]) ? b[k].length : String(b[k] || "").trim());
  },
  secSummary(id) {
    const b = this.brief[id] || {}, s = FS.summary;
    if (id === "photos") return s ? `${s.total}장 · 평균 ${s.avgLong}px${s.low ? ` · 부족 ${s.low}장` : ""}` : "사진 없음";
    if (id === "product") return [b.name, b.category, (b.channels || []).join("·")].filter(Boolean).join(" · ") || "미작성";
    if (id === "target") return (b.who || "").split("\n")[0].slice(0, 46) || "미작성";
    if (id === "fact") return (b.specs || "").trim() ? (b.specs.split("\n").filter(Boolean).length + "개 항목" + (b.usp ? " · USP 있음" : "")) : "미작성";
    if (id === "proof") return [b.numbers, (b.certs || []).join("·"), (b.reviews || "").trim() ? "리뷰 있음" : ""].filter(Boolean).join(" · ") || "미작성";
    if (id === "terms") return (b.all || "").split("\n")[0].slice(0, 46) || "미작성";
    if (id === "req") return [b.photoMode === "keep" ? "원본 합성" : b.photoMode ? "AI 고화질 재현" : "", b.mood, b.avoid].filter(Boolean).join(" / ").slice(0, 46) || "미작성";
    if (id === "layout") { const sel = layoutSel(), ex = sel.filter(x => !catOf(x).def).map(x => catOf(x).label), off = CATALOG.filter(c => c.def && !sel.includes(c.id)).map(c => c.label);
      return `${sel.length}개 섹션` + (ex.length ? " · +" + ex.join(", ") : "") + (off.length ? " · −" + off.join(", ") : ""); }
    return "미작성";
  },
  progress() { const list = SECTIONS.filter(s => s.id !== "photos"); const d = list.filter(s => this.secDone(s.id)).length; return { done: d, total: list.length, pct: d / list.length * 100 }; },
  tally() { let req = 0, regions = 0; this.tiles.forEach(t => { if (this.hasReq(t.n)) req++; regions += ((this.review[t.n] || {}).regions || []).length; }); return { req, regions, total: this.tiles.length }; }
};

/* ═══ 레일 ═══ */
const NAV = [
  { id: "home",     icon: "home",   label: "홈" },
  { id: "projects", icon: "folder", label: "프로젝트" },
  { id: "brief",    icon: "doc",    label: "브리프" },
  { id: "tiles",    icon: "grid",   label: "타일" },
  { id: "review",   icon: "check",  label: "검수" }
];
function renderRail() {
  const r = $("#rail");
  r.innerHTML = `<img class="mark" src="assets/icon-192.png" alt="re:boot"><div class="sep"></div>` +
    NAV.map(n => `<button class="rbtn" data-go="${n.id}" aria-label="${n.label}">${svg(n.icon)}<span class="tip">${n.label}</span></button>`).join("") +
    `<div class="sp"></div><button class="rbtn" data-go="settings" aria-label="설정">${svg("gear")}<span class="tip">설정</span></button>`;
  r.onclick = e => { const b = e.target.closest("[data-go]"); if (b) go(b.dataset.go); };
}

/* ═══ 사이드바 (타일 목록은 드래그로 순서 변경) ═══ */
let dragIdx = -1;
function renderSide() {
  const s = $("#sideBody");
  const proj = FS.name || Store.get("lastProject", "") || "프로젝트 없음";
  $("#projName").textContent = proj;
  $("#projSub").textContent = FS.name ? `사진 ${FS.files.length}장 · 타일 ${App.tiles.length}장` : "새 프로젝트를 만드세요";
  $("#projAva").textContent = (proj.match(/[가-힣A-Za-z]/) || ["·"])[0];
  let h = "";

  if (App.view === "brief") {
    const p = App.progress();
    h += `<div class="sgroup"><h4>진행 <span class="sp"></span><span class="cnt">${p.done}/${p.total}</span></h4>`;
    SECTIONS.forEach(sec => {
      const done = App.secDone(sec.id), cur = App.curSec === sec.id;
      h += `<button class="sitem step${cur ? " on" : ""}" data-sec="${sec.id}">
        <span class="stn ${done ? "done" : ""}">${done ? svg("check") : sec.n}</span>
        <span class="lb">${esc(sec.title)}</span>${cur ? `<span class="now">작성 중</span>` : ""}</button>`;
    });
    h += `</div>`;
  } else if (App.view === "tiles" || App.view === "review") {
    const t = App.tally();
    h += `<div class="sgroup"><h4>페이지 순서 <span class="sp"></span><span class="cnt">${App.view === "review" ? `요청 ${t.req}/` : ""}${App.tiles.length}</span></h4>`;
    if (!App.tiles.length) h += `<p class="hint" style="padding:0 8px">아직 타일이 없습니다.</p>`;
    else h += `<p class="hint" style="padding:0 8px 4px;font-size:11.5px">잡고 끌면 순서가 바뀝니다 (타일·내보내기에 반영)</p>`;
    App.tiles.forEach((tl, i) => {
      const req = App.hasReq(tl.n), cur = App.curTile === tl.n, rc = ((App.review[tl.n] || {}).regions || []).length, ty = Typo.of(tl), tyn = ty && ty.fresh ? (ty.issues || []).length : 0;
      h += `<button class="sitem tile${cur ? " on" : ""}" data-tile="${i}" draggable="true" title="${esc(tl.copy || "")}">
        <span class="gh">${svg("drag")}</span><span class="st ${req ? "s-edit" : ""}"></span>
        <span class="lb">${esc(tl.n)}${tl.name ? ". " + esc(tl.name) : ""}</span>
        ${tyn ? `<span class="cnt ty" title="오타 의심">!${tyn}</span>` : ""}${rc ? `<span class="cnt rq">${rc}</span>` : ""}${tl.ratio && tl.ratio !== "9:16" ? `<span class="cnt">${esc(tl.ratio)}</span>` : ""}</button>`;
    });
    h += `</div>`;
    if (App.view === "review") h += `<div class="sgroup"><h4>요청 현황</h4><div class="tally side"><span class="t-b">요청 ${t.req}장</span><span class="t-c">영역 ${t.regions}</span><span class="t-d">없음 ${t.total - t.req}</span></div></div>`;
  } else if (App.view === "projects") {
    const list = Local._projects || [];
    if (list.length) {
      h += `<div class="sgroup"><h4>프로젝트 <span class="sp"></span><span class="cnt">${list.length}</span></h4>`;
      list.forEach(p => { h += `<button class="sitem${p.name === FS.name ? " on" : ""}" data-proj="${esc(p.name)}"><span class="ic">${svg("folder")}</span><span class="lb">${esc(p.name)}</span><span class="cnt">${p.tiles || p.images}</span></button>`; });
      h += `</div>`;
    }
  }

  h += `<div class="sgroup"><h4>작업</h4>
    <button class="sitem" data-act="newproj"><span class="ic">${svg("plus")}</span><span class="lb">새 프로젝트</span></button>
    <button class="sitem" data-act="addPhotos"><span class="ic">${svg("photo")}</span><span class="lb">사진 추가</span></button>
    ${App.tiles.length ? `<button class="sitem" data-act="feedback"><span class="ic">${svg("inbox")}</span><span class="lb">피드백 붙여넣기</span></button>` : ""}
    <button class="sitem" data-act="exportMenu"><span class="ic">${svg("down")}</span><span class="lb">내보내기 <small class="sm2">프리뷰·채널·PSD</small></span></button>
    <button class="sitem hi" data-act="make"><span class="ic">${svg("sparkles")}</span><span class="lb">AI로 상세페이지 만들기</span></button>
    ${App.tiles.length ? `<button class="sitem hi" data-act="revise"><span class="ic">${svg("edit")}</span><span class="lb">검수 반영 (AI 수정)</span></button>` : ""}
    ${(() => { const q = (QueueUI.items || []).filter(i => i.status === "waiting" || i.status === "running"); return q.length ? `<button class="sitem" data-act="goprojects"><span class="ic">${svg("clock")}</span><span class="lb">대기열</span><span class="cnt">${q.length}</span></button>` : ""; })()}
  </div>`;
  s.innerHTML = h;
  s.onclick = async e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.sec) { if (App.view !== "brief") go("brief"); setTimeout(() => openCard(b.dataset.sec), 40); return; }
    if (b.dataset.tile != null) {
      const i = +b.dataset.tile;
      if (App.view === "review") Review.go(i);
      else { const t = $(`.strip .tl[data-n="${CSS.escape(App.tiles[i].n)}"]`); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); else { App.curTile = App.tiles[i].n; renderSide(); } }
      return;
    }
    if (b.dataset.proj) { if (await FS.load(b.dataset.proj, false)) { UI.toast(`${FS.name} 열었습니다`, "o"); go("home"); } return; }
    if (b.dataset.act) ACT[b.dataset.act]();
  };
  /* 드래그 정렬 */
  s.ondragstart = e => { const b = e.target.closest(".sitem.tile"); if (!b) return; dragIdx = +b.dataset.tile; b.classList.add("drag"); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", String(dragIdx)); } catch (x) {} };
  s.ondragover = e => { const b = e.target.closest(".sitem.tile"); if (!b || dragIdx < 0) return; e.preventDefault(); const r = b.getBoundingClientRect(); const below = e.clientY > r.top + r.height / 2; $$(".sitem.tile.ov-t,.sitem.tile.ov-b", s).forEach(x => x.classList.remove("ov-t", "ov-b")); b.classList.add(below ? "ov-b" : "ov-t"); };
  s.ondragleave = e => { const b = e.target.closest && e.target.closest(".sitem.tile"); if (b) b.classList.remove("ov-t", "ov-b"); };
  s.ondragend = () => { dragIdx = -1; $$(".sitem.tile", s).forEach(x => x.classList.remove("drag", "ov-t", "ov-b")); };
  s.ondrop = async e => {
    const b = e.target.closest(".sitem.tile"); if (!b || dragIdx < 0) return; e.preventDefault();
    const r = b.getBoundingClientRect(); let to = +b.dataset.tile + (e.clientY > r.top + r.height / 2 ? 1 : 0);
    const from = dragIdx; dragIdx = -1;
    if (to > from) to--; if (to === from) { renderSide(); return; }
    const [it] = App.tiles.splice(from, 1); App.tiles.splice(to, 0, it);
    await FS.saveManifest();
    if (App.view === "tiles") go("tiles"); else { Review.cur = App.tiles.findIndex(t => t.n === App.curTile); renderSide(); }
    UI.toast(`${it.n} → ${to + 1}번째로 옮겼습니다`, "o");
  };
}

/* ═══ 뷰 전환 ═══ */
function go(v) {
  if (v === "photos") v = "brief"; if (v === "connect" || v === "cloud") v = "settings";
  App.view = v;
  $$("#rail .rbtn").forEach(b => b.classList.toggle("on", b.dataset.go === v));
  const R = { home: Home, projects: Projects, brief: Brief, tiles: Tiles, review: Review, settings: Settings }[v] || Home;
  $("#crumb").innerHTML = `<b>${esc(FS.name || "re:boot")}</b><span class="sepc">/</span>${esc(R.title)}`;
  const old = $("#view"), nv = old.cloneNode(false); old.replaceWith(nv);
  nv.classList.add("enter"); setTimeout(() => nv.classList.remove("enter"), 400);
  const ab = $("#actbar"); ab.hidden = true; ab.innerHTML = ""; ab.onclick = null;
  if (v !== "tiles") Tiles.unspy();
  R.render(nv);
  renderSide();
  Store.set("view", v);
}

/* ═══ 브라우저 자체 확대 차단 — 배율은 앱이 다룬다 ═══ */
document.addEventListener("wheel", e => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
document.addEventListener("keydown", e => {
  if (!(e.ctrlKey || e.metaKey)) return;
  if (!["=", "+", "-", "_", "0"].includes(e.key)) return;
  e.preventDefault();
  const dir = e.key === "0" ? 0 : (e.key === "-" || e.key === "_") ? -1 : 1;
  if (App.view === "tiles" && Tiles.mode === "strip") Tiles.zoomAt(dir === 0 ? 100 : dir > 0 ? Tiles.zoom * 1.15 : Tiles.zoom / 1.15);
  else if (App.view === "review") { if (dir === 0) Review.layout(true); else Review.zoomTo(dir > 0 ? Review.s * 1.15 : Review.s / 1.15); }
});

/* ── 홈 대시보드 ── */
const Home = { title: "홈", render(v) {
  const s = FS.summary, p = App.progress(), t = App.tally(), has = !!FS.files.length;
  const steps = [
    { label: "사진", sub: has ? `사진 ${FS.files.length}장${s && s.low ? ` · 해상도 부족 ${s.low}` : ""}` : FS.name ? "사진을 넣어주세요" : "프로젝트 없음", done: has, act: FS.name ? "gophotos" : "newproj" },
    { label: "브리프", sub: `${p.done}/${p.total} 섹션`, done: p.done === p.total, act: "gobrief" },
    { label: "제작", sub: App.tiles.length ? `타일 ${App.tiles.length}장` : Local.desktop ? "여기서 바로 제작" : "지시서 → Claude", done: App.tiles.length > 0, act: App.tiles.length ? "gotiles" : "make" },
    { label: "검수", sub: App.tiles.length ? (t.req ? `요청 ${t.req}장 · 영역 ${t.regions}` : "요청 없음") : "타일 없음", done: App.tiles.length > 0 && t.req === 0, act: "goreview" },
    { label: "전달", sub: "프리뷰 · 채널 이미지 · PSD", done: false, act: "exportMenu" }
  ];
  let curIdx = steps.findIndex(x => !x.done); if (curIdx < 0) curIdx = steps.length - 1;
  v.innerHTML = `<div class="wrap wide home">
    <div class="hhead">
      <div><div class="eyebrow">${has ? "작업 중" : "시작"}</div><h1 class="pg">${esc(FS.name || "프로젝트를 열어주세요")}</h1>
        <p class="pgsub">${has ? `${new Date().toLocaleDateString("ko-KR")} · 브리프 ${p.done}/${p.total} · 타일 ${App.tiles.length}장 · 검수 요청 ${t.req}장` : "새 프로젝트를 만들고 사진을 끌어다 놓으면 분석부터 자동으로 시작합니다."}</p></div>
      <div class="hbtns">
        ${has ? `${App.tiles.length ? `<button class="btn" data-act="feedback">${svg("inbox")} 피드백 붙여넣기</button>` : ""}<button class="btn" data-act="exportMenu">${svg("down")} 내보내기</button><button class="btn pri" data-act="${App.tiles.length ? "goreview" : "gobrief"}">${App.tiles.length ? svg("check") + " 검수 계속" : svg("edit") + " 브리프 계속"}</button>`
              : `<button class="btn" data-act="goprojects">${svg("folder")} 프로젝트 열기</button><button class="btn pri lg" data-act="newproj">${svg("plus")} 새 프로젝트</button>`}
      </div>
    </div>
    <div id="homeResume"></div>
    <div class="stepper">${steps.map((st, i) => `<button class="stp${st.done ? " done" : ""}${i === curIdx ? " cur" : ""}" data-act="${st.act}">
      <span class="sn">${st.done ? svg("check") : i + 1}</span><span class="sl"><b>${st.label}</b><small>${esc(st.sub)}</small></span></button>`).join("")}
      <i class="bar" style="--w:${Math.max(0, curIdx) / (steps.length - 1) * 100}%"></i></div>
    ${has ? `<div class="stats">
      <div class="stat"><small>사진</small><b>${FS.files.length}<span>장</span></b><em>${s ? `평균 ${s.avgLong}px${s.low ? ` · <i class="w">부족 ${s.low}</i>` : " · 양호"}` : ""}</em></div>
      <div class="stat"><small>브리프</small><b>${p.done}<span>/${p.total}</span></b><em>${p.done === p.total ? "완료" : SECTIONS.find(x => x.id !== "photos" && !App.secDone(x.id)).title + " 남음"}</em></div>
      <div class="stat"><small>타일</small><b>${App.tiles.length}<span>장</span></b><em>${App.tiles.length ? layoutSel().length + "섹션 구성" : "미제작"}</em></div>
      <div class="stat"><small>검수 요청</small><b>${t.req}<span>/${t.total}</span></b><em>${t.regions ? `영역 ${t.regions}개` : "영역 없음"}${Typo.count() ? ` · <i class="w">오타 의심 ${Typo.count()}</i>` : ""}</em></div>
    </div>` : ""}
    ${has && App.tiles.length ? `<h3 class="h3">타일 미리보기</h3><div class="mini">${App.tiles.slice(0, 8).map(tl => {
      const req = App.hasReq(tl.n);
      return `<div class="mtile" data-t="${esc(tl.n)}"><img src="${tl.f}" loading="lazy" alt=""><span>${esc(tl.n)}</span>${req ? `<i class="s-edit">수정 요청</i>` : ""}</div>`; }).join("")}
      ${App.tiles.length > 8 ? `<button class="mtile more" data-act="gotiles">+${App.tiles.length - 8}<small>더 보기</small></button>` : ""}</div>` : ""}
    ${Local.ok ? `<div class="hlog"><h3 class="h3">작업 기록 <span class="cntl" style="font-size:13px">${FS.name ? "이 프로젝트" : "전체"}</span><span class="sp"></span><button class="btn sm ghost" data-act="timeline" data-arg="${esc(FS.name || "")}">${svg("history")} 전체 보기</button></h3><div id="homeTl"><p class="hint">불러오는 중…</p></div></div>` : ""}
  </div>`;
  v.onclick = async e => { if (await tlClick(e)) return; const a = e.target.closest("[data-act]"); if (a) return ACT[a.dataset.act](a.dataset.arg); const m = e.target.closest(".mtile[data-t]"); if (m) { App.curTile = m.dataset.t; go("tiles"); } };
  if (Local.ok) Local.log(FS.name || "", 12).then(j => { const b = $("#homeTl", v); if (b) b.innerHTML = tlHtml(j.items, !FS.name); }).catch(() => {});
  // 지난 AI 작업이 끝나지 않았으면 → 이어서 하기 (#13)
  const lr = FS.lastRun;
  if (Local.desktop && FS.name && lr && lr.mode && lr.exit !== 0) {
    Local.runStatus(FS.name, 1e9).then(j => {
      const b = $("#homeResume", v); if (!b || j.running) return;
      b.innerHTML = `<div class="note w">${svg("warn")}<div class="nb"><b>지난 ${esc(MODE_LABEL[lr.mode] || "AI")} 작업이 끝나지 않았습니다</b>${lr.at ? ` (${fmtT(lr.end || lr.at)})` : ""}${lr.err ? ` — ${esc(lr.err).slice(0, 90)}` : ""}<br>이미 만든 타일은 그대로 두고 남은 것만 이어서 합니다. <button class="btn sm pri" data-act="resume" style="margin-left:6px">${svg("refresh")} 이어서 하기</button></div></div>`;
    }).catch(() => {});
  }
}};

/* ── 프로젝트 목록 (카드 · 칸반 보드 · 대기열) ── */
const fmtD = t => { if (!t) return "—"; const d = new Date(t * 1000); return `${d.getFullYear().toString().slice(2)}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
const fmtDur = sec => { if (sec == null || sec < 0) return "—"; if (sec < 60) return "1분 미만"; const m = Math.round(sec / 60); if (m < 60) return m + "분"; const h = Math.floor(m / 60); if (h < 24) return h + "시간 " + (m % 60 ? (m % 60) + "분" : ""); const d = Math.floor(h / 24); return d + "일 " + (h % 24 ? (h % 24) + "시간" : ""); };
const fmtAgo = t => { if (!t) return ""; const s = Date.now() / 1000 - t; if (s < 3600) return Math.max(1, Math.round(s / 60)) + "분 전"; if (s < 86400) return Math.round(s / 3600) + "시간 전"; return Math.round(s / 86400) + "일 전"; };
const STAGE_UI = [["photos", "사진"], ["brief", "브리프"], ["ready", "제작 대기"], ["making", "제작 중"], ["review", "검수"], ["sent", "전달"], ["done", "납품 완료"], ["hold", "보류"]];
const STAGE_CLS = { photos: "s-hold", brief: "s-hold", ready: "s-edit", making: "s-extend", review: "s-extend", sent: "s-approved", done: "s-done", hold: "s-hold" };
const stageLabel = id => (STAGE_UI.find(s => s[0] === id) || ["", id])[1];
const dnum = s => { if (!s) return null; const d = new Date(s + "T00:00:00"), t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((d - t) / 864e5); };
const dday = s => { const n = dnum(s); return n == null || isNaN(n) ? "" : n === 0 ? "D-day" : n > 0 ? "D-" + n : "D+" + (-n); };
const ddCls = s => { const n = dnum(s); return n == null ? "" : n < 0 ? "late" : n <= 2 ? "soon" : ""; };
const Projects = { title: "프로젝트", list: [], async render(v) {
  if (!Local.ok) { v.innerHTML = `<div class="wrap"><h1 class="pg">프로젝트</h1><div class="note w">${svg("warn")}<div class="nb"><b>re-boot 콘솔.exe</b> 로 실행해야 합니다.</div></div></div>`; return; }
  v.innerHTML = `<div class="wrap wide"><div class="empty"><div class="eic">${svg("folder")}</div><b>불러오는 중…</b></div></div>`;
  let list = []; try { list = await Local.projects(true); } catch (e) {}
  await QueueUI.load();
  if (App.view !== "projects") return;
  this.list = list;
  const board = Store.get("projView", "card") === "board";
  v.innerHTML = `<div class="wrap wide${board ? " fullw" : ""}">
    <div class="vhead"><h1 class="pg">프로젝트 <span class="cntl">${list.length}</span></h1>
      <div class="seg" id="pvSeg"><button data-pv="card" class="${!board ? "on" : ""}">${svg("grid")} 카드</button><button data-pv="board" class="${board ? "on" : ""}">${svg("kanban")} 보드</button></div><div class="sp"></div>
      ${Local.desktop ? `<button class="btn" data-act="timeline">${svg("history")} 작업 기록</button><button class="btn" data-act="openRoot">${svg("ext")} 폴더 열기</button>` : ""}<button class="btn" data-act="newproj">${svg("plus")} 새 프로젝트</button></div>
    <div id="qbox">${QueueUI.html()}</div>
    ${!list.length ? `<div class="empty"><div class="eic">${svg("folder")}</div><b>아직 프로젝트가 없습니다</b><p>위의 <b>새 프로젝트</b>로 시작하세요.</p></div>` : board ? this.board(list) : this.cards(list)}
  </div>`;
  v.onclick = async e => {
    if (await QueueUI.click(e)) return;
    const sv = e.target.closest("[data-pv]"); if (sv) { Store.set("projView", sv.dataset.pv); return go("projects"); }
    const a = e.target.closest("[data-act]"); if (a) return ACT[a.dataset.act]();
    const pa = e.target.closest("[data-pact]"); if (pa) { const host = pa.closest("[data-p]"); if (host) this.pact(pa.dataset.pact, host.dataset.p); return; }
    const b = e.target.closest("[data-p]"); if (!b) return;
    if (b.dataset.p === FS.name) return go("home");
    b.classList.add("busy");
    if (await FS.load(b.dataset.p, false)) { UI.toast(`${FS.name} 열었습니다`, "o"); go("home"); } else b.classList.remove("busy");
  };
  v.onkeydown = e => { if (e.key === "Enter" && e.target.matches && e.target.matches(".pcard,.kcard")) e.target.click(); };
  /* 칸반: 끌어서 단계 옮기기 */
  v.ondragstart = e => { const c = e.target.closest(".kcard"); if (!c) return; e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", c.dataset.p); } catch (x) {} this._drag = c.dataset.p; c.classList.add("drag"); };
  v.ondragend = () => { this._drag = null; $$(".kcard.drag,.kcol.ov", v).forEach(x => x.classList.remove("drag", "ov")); };
  v.ondragover = e => { const col = e.target.closest(".kcol"); if (!col || !this._drag) return; e.preventDefault(); $$(".kcol.ov", v).forEach(x => x !== col && x.classList.remove("ov")); col.classList.add("ov"); };
  v.ondrop = e => { const col = e.target.closest(".kcol"); if (!col || !this._drag) return; e.preventDefault(); const nm = this._drag; this._drag = null; col.classList.remove("ov"); this.setStage(nm, col.dataset.col); };
  renderSide();
},
  st(p) { return p.running ? ["AI 제작 중 " + (p.pct || 0) + "%", "s-extend"] : [stageLabel(p.stage), STAGE_CLS[p.stage] || "s-hold"]; },
  cards(list) {
    return `<p class="pgsub">카드를 누르면 열립니다. <b>보드</b>로 바꾸면 단계별로 끌어 옮길 수 있고, <b>정보</b>에서 클라이언트·마감일을 적어두면 D-day 가 표시됩니다.</p><div class="pgrid">${list.map((p, i) => {
      const st = this.st(p), cur = p.name === FS.name, span = p.tileFirst && p.tileLast ? p.tileLast - p.tileFirst : null, m = p.meta || {};
      return `<div class="pcard${cur ? " cur" : ""}" role="button" tabindex="0" data-p="${esc(p.name)}" style="animation-delay:${i * 40}ms">
        <div class="pch"><span class="pic">${p.cover ? `<img src="${p.cover}" alt="" loading="lazy">` : svg("folder")}</span><span class="ptt"><b>${esc(p.name)}</b><small>${m.client ? esc(m.client) + " · " : ""}${fmtAgo(p.mtime)} 작업 · 사진 ${p.images}장</small></span>${m.due ? `<i class="dd ${ddCls(m.due)}" title="마감 ${esc(m.due)}">${dday(m.due)}</i>` : ""}<i class="pst ${st[1]}">${st[0]}</i>${cur ? `<i class="pcur">열림</i>` : ""}</div>
        ${p.running ? `<span class="kprog"><i style="width:${p.pct || 0}%"></i></span>` : ""}
        <div class="pstat"><span><small>사진</small><b>${p.images}</b></span><span><small>타일</small><b>${p.tiles}</b></span><span><small>내보내기</small><b>${p.exports}</b></span><span><small>브리프</small><b>${p.hasBrief || p.hasOrder ? "✓" : "–"}</b></span></div>
        <dl class="pkv"><dt>시작</dt><dd>${fmtD(p.ctime)}</dd><dt>최근 작업</dt><dd>${fmtD(p.mtime)}</dd><dt>타일 제작</dt><dd>${span != null ? `${fmtD(p.tileFirst)} → ${fmtDur(span)} 소요` : "—"}</dd>${m.memo ? `<dt>메모</dt><dd class="memo1">${esc(m.memo)}</dd>` : ""}</dl>
        <div class="pfoot">${p.canResume && Local.desktop ? `<button class="btn sm" data-pact="resume" title="지난 AI 작업이 끝나지 않았습니다">${svg("refresh")} 이어서 하기</button>` : ""}<button class="btn sm ghost" data-pact="info">${svg("edit")} 정보</button>${Local.desktop ? `<button class="btn sm ghost" data-pact="log">${svg("history")} 기록</button>` : ""}<span class="sp"></span><span class="pgo">${cur ? "이어서 작업" : "열기"} ${svg("arrowR")}</span></div></div>`; }).join("")}</div>`;
  },
  board(list) {
    return `<p class="pgsub">카드를 끌어 단계를 옮기세요. <b>제작 중</b>은 AI 작업이 돌 때 자동으로 들어가고, 작업이 진척되면(타일 생성·내보내기) 자동 단계가 다시 따라갑니다.</p>
      <div class="kb">${STAGE_UI.map(([id, lb]) => { const ps = list.filter(p => p.stage === id); return `<div class="kcol k-${id}" data-col="${id}"><div class="kh"><b>${lb}</b><span class="cnt">${ps.length}</span></div><div class="kbody">${ps.map(p => this.kcard(p)).join("") || `<p class="kempty">여기로 끌어 놓기</p>`}</div></div>`; }).join("")}</div>`;
  },
  kcard(p) {
    const m = p.meta || {};
    return `<div class="kcard${p.name === FS.name ? " cur" : ""}" draggable="${p.running ? "false" : "true"}" tabindex="0" data-p="${esc(p.name)}">${p.cover ? `<img src="${p.cover}" alt="" loading="lazy">` : ""}<b>${esc(p.name)}</b><small>${m.client ? esc(m.client) : "클라이언트 미정"}${m.due ? ` · <i class="dd ${ddCls(m.due)}">${dday(m.due)}</i>` : ""}</small>${p.running ? `<span class="kprog"><i style="width:${p.pct || 0}%"></i></span>` : ""}${m.memo ? `<em>${esc(m.memo)}</em>` : ""}<span class="kact"><button class="ib" data-pact="info" title="정보">${svg("edit")}</button>${p.canResume && Local.desktop ? `<button class="ib" data-pact="resume" title="이어서 하기">${svg("refresh")}</button>` : ""}</span></div>`;
  },
  async pact(k, name) {
    if (k === "resume") return ACT.resume(name);
    if (k === "log") return ACT.timeline(name);
    if (k === "info") return this.info(name);
  },
  async saveMeta(p, meta, logText) {
    try { await Local.save(p.name, "project.json", JSON.stringify(meta, null, 2)); if (logText) Local.logAdd(p.name, "stage", logText); Local._projects = null; if (App.view === "projects") go("projects"); if (p.name === FS.name) FS.meta = meta; return true; }
    catch (e) { UI.alert("저장하지 못했습니다", esc(e.message), "d"); return false; }
  },
  applyStage(p, meta, id) { if (!id || id === p.autoStage) { delete meta.stage; delete meta.stageAuto; } else { meta.stage = id; meta.stageAuto = p.autoStage; } meta.stageAt = new Date().toISOString(); },
  async setStage(name, id) {
    const p = this.list.find(x => x.name === name); if (!p || p.stage === id) return;
    if (id === "making") return UI.toast("제작 중은 AI 작업이 돌 때 자동으로 들어갑니다", "w");
    if (p.running) return UI.toast("AI 작업 중인 프로젝트는 옮길 수 없습니다", "w");
    const meta = Object.assign({}, p.meta || {}); this.applyStage(p, meta, id);
    if (await this.saveMeta(p, meta, `단계 → ${stageLabel(id)}`)) UI.toast(`${name} → ${stageLabel(id)}`, "o");
  },
  async info(name) {
    const p = this.list.find(x => x.name === name) || { name, meta: FS.name === name ? FS.meta || {} : {}, stage: "", autoStage: "" }; const m = p.meta || {};
    const v = await UI.dialog({ title: "프로젝트 정보", sub: esc(name), icon: "edit", tone: "b",
      body: `<div class="row2"><div class="fld"><label>클라이언트</label><input type="text" id="piC" value="${esc(m.client || "")}" placeholder="예: 벤딕트 김대표"></div><div class="fld"><label>마감일</label><input type="date" id="piD" value="${esc(m.due || "")}"></div></div>
        <div class="fld"><label>메모</label><textarea id="piM" placeholder="납품 채널, 수정 횟수, 연락 방법 등">${esc(m.memo || "")}</textarea></div>
        ${p.autoStage ? `<div class="fld"><label>단계</label><select id="piS">${STAGE_UI.filter(([id]) => id !== "making").map(([id, lb]) => `<option value="${id}"${p.stage === id ? " selected" : ""}>${lb}${id === p.autoStage ? " (자동)" : ""}</option>`).join("")}</select><p class="hint" style="margin:4px 0 0">작업이 진척되면 자동 단계가 다시 따라갑니다. 납품 완료·보류는 직접 정하세요.</p></div>` : ""}`,
      buttons: [{ label: "취소", value: 0 }, { label: "저장", value: 1, kind: "pri" }], onOpen(d) { setTimeout(() => $("#piC", d).focus(), 60); } });
    if (v !== 1) return;
    const meta = Object.assign({}, m, { client: $("#piC").value.trim(), due: $("#piD").value, memo: $("#piM").value.trim() });
    const sel = $("#piS") ? $("#piS").value : ""; let log = "";
    if (sel && sel !== p.stage && !p.running) { this.applyStage(p, meta, sel); log = `단계 → ${stageLabel(sel)}`; }
    if (await this.saveMeta(p, meta, log)) UI.toast("저장했습니다", "o");
  }
};

/* ── 브리프 (사진 분석 포함) ── */
const REQ = { product: ["name", "category"], target: ["who"], fact: ["specs"] };
const Brief = { title: "브리프", render(v) {
  const eg = App.eg(), s = FS.summary;
  const g = (sec, k, d) => (App.brief[sec] && App.brief[sec][k] != null) ? App.brief[sec][k] : (d == null ? "" : d);
  v.innerHTML = `<div class="wrap bwrap">
    <aside class="memo">
      <div class="m">${s ? `<b>사진 ${s.total}장</b> · ${s.low ? `해상도 부족 ${s.low}장` : "해상도 양호"}<br>포인트 <i style="background:${s.accent}"></i>${s.accent}${App.suggest && App.suggest.photo ? `<br><span style="opacity:.8">AI: ${esc(App.suggest.photo).slice(0, 70)}</span>` : ""}` : `<b>사진이 아직 없습니다</b><br>사진을 넣으면 그 기준으로 예시문이 바뀝니다.<br><button class="btn sm" data-act="addPhotos" style="margin-top:6px">사진 추가</button>`}</div>
      <div class="m"><b>Tab</b> 으로 예시문 채우기<br><span style="opacity:.75">증거·판매조건 칸은 제외</span></div>
      <div class="m">섹션 아래 <b>적용</b>을 누르면<br>접히고 다음으로 넘어갑니다.</div>
      <div class="m warn"><b>수치·인증·후기</b>는 실제 값만.<br>없으면 비워두세요.</div>
    </aside>
    <div><h1 class="pg">브리프</h1><p class="pgsub">사진 분석 결과를 확인하고, 아는 것만 적으세요. 비운 칸은 제가 채웁니다.</p><div id="cards"></div></div>
  </div>`;
  const ab = $("#actbar"); ab.hidden = false;
  ab.innerHTML = `<div class="prog"><i id="pbar"></i></div><span class="pcnt" id="pcnt"></span><div style="flex:1"></div>
    <span class="hint" style="margin:0">자동 저장됩니다</span>
    <button class="btn pri" data-act="make">${svg("sparkles")} AI로 상세페이지 만들기</button>`;
  ab.onclick = e => { const a = e.target.closest("[data-act]"); if (a) ACT[a.dataset.act](); };

  const C = $("#cards", v);
  SECTIONS.forEach((sec, i) => { const c = buildCard(sec, g, eg, s); c.style.animationDelay = (i * 40) + "ms"; C.appendChild(c); });
  bumpProgress();

  v.addEventListener("click", e => {
    const ct = e.target.closest("[data-cut]"); if (ct) { Cut.act(ct.dataset.cut, ct.dataset.f); return; }
    const rf = e.target.closest("[data-ref]"); if (rf) { Ref.act(rf.dataset.ref, rf.dataset.f); return; }
    const lbx = e.target.closest("[data-lb]"); if (lbx) { UI.lightbox(lbx.dataset.lb); return; }
    const ap = e.target.closest("[data-apply]"); if (ap) { applySection(ap.dataset.apply); return; }
    const pv = e.target.closest("[data-prev]"); if (pv) { const i = SECTIONS.findIndex(x => x.id === pv.dataset.prev); if (i > 0) openCard(SECTIONS[i - 1].id); return; }
    const h = e.target.closest(".chead"); if (h) { toggleCard(h.parentElement); return; }
    const sg = e.target.closest("[data-sug]"); if (sg) { Suggest.act(sg.dataset.sug); return; }
    const dp = e.target.closest("[data-del-photo]"); if (dp) { FS.removePhoto(dp.dataset.delPhoto).then(ok => { if (ok) { go("brief"); setTimeout(() => openCard("photos", true), 60); } }); return; }
    const th = e.target.closest(".th[data-src]"); if (th) { UI.lightbox(th.dataset.src); return; }
    const a = e.target.closest("[data-act]"); if (a) { ACT[a.dataset.act](); return; }
    const q = e.target.closest("[data-quick]"); if (q) { const ta = $("#" + q.dataset.for, v); ta.value = (ta.value.trim() ? ta.value.replace(/\s+$/, "") + "\n" : "") + q.dataset.quick; ta.dispatchEvent(new Event("input", { bubbles: true })); ta.focus(); }
  });
  v.addEventListener("input", onFieldInput);
  v.addEventListener("change", onFieldInput);
  v.addEventListener("keydown", e => {
    if (e.key !== "Tab" || e.shiftKey || e.ctrlKey || e.altKey) return;
    const t = e.target; if (!t.matches || !t.matches("input[type=text][data-k], textarea[data-k]")) return;
    if (!SET.tabFill || t.hasAttribute("data-notab") || t.value.trim() || !t.placeholder) return;
    if (App.eg() === EG._ && !App.suggest) { e.preventDefault(); UI.toast("카테고리를 먼저 고르면 그 업종의 예시문이 채워집니다", "w"); return; }   // 안내문은 채우지 않는다
    e.preventDefault(); t.value = t.placeholder; t.dispatchEvent(new Event("input", { bubbles: true }));
    UI.toast("예시문을 채웠습니다 — 내 상품 내용으로 고쳐주세요");
  });
  v.addEventListener("dragover", e => { if (e.dataTransfer && Array.prototype.some.call(e.dataTransfer.types || [], t => t === "Files")) { e.preventDefault(); v.classList.add("dropping"); } });
  v.addEventListener("dragleave", e => { if (!v.contains(e.relatedTarget)) v.classList.remove("dropping"); });
  v.addEventListener("drop", async e => { v.classList.remove("dropping"); if (!e.dataTransfer || !e.dataTransfer.files.length) return; e.preventDefault(); if (await FS.addPhotos(e.dataTransfer.files)) { go("brief"); setTimeout(() => openCard("photos", true), 60); } });
  const first = !FS.analysis.length ? SECTIONS[0] : (App.curSec && SECTIONS.find(x => x.id === App.curSec)) || SECTIONS[1];
  openCard(first.id, true);
}};
/* 클립보드 붙여넣기 → 사진.
   EXE: Ctrl+V 를 keydown 에서 잡아 메인 프로세스가 클립보드를 직접 읽는다(캡처 이미지·탐색기 파일 복사 모두).
   그 외: DOM paste 이벤트(이미지 파일 항목) */
let pasteBusy = false;
async function pasteFromClipboard() {
  if (pasteBusy) return; if (!FS.name) { UI.toast("먼저 프로젝트를 만드세요 — 붙여넣을 곳이 없습니다", "w"); return; }
  pasteBusy = true; UI.toast("클립보드 확인 중…");
  try {
    const j = await Local.pasteClip(FS.name);
    await FS.load(FS.name, true); Local._projects = null;
    UI.toast(`붙여넣기 ${j.files.length}장 추가${j.w ? ` (${j.w}×${j.h})` : ""} — 다 올리셨으면 [분석 후 적용]`, "o");
    if (App.view !== "brief") go("brief"); else go("brief"); setTimeout(() => openCard("photos", true), 60);
  } catch (e) { UI.toast(/이미지가 없습니다/.test(e.message) ? "클립보드에 이미지가 없습니다 — 캡처하거나 파일을 복사한 뒤 Ctrl+V" : "붙여넣기 실패: " + e.message, "w"); }
  finally { pasteBusy = false; }
}
document.addEventListener("keydown", e => {
  if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "v" || e.shiftKey || e.altKey) return;
  if (/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName) || $(".ovl.on")) return;   // 글 입력 중이면 평소 붙여넣기
  if (!Local.desktop) return;                                                               // 웹은 paste 이벤트 경로
  e.preventDefault(); pasteFromClipboard();
});
document.addEventListener("paste", async e => {
  if (Local.desktop || !FS.name || /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
  const items = Array.prototype.slice.call((e.clipboardData || {}).items || []).filter(i => i.kind === "file" && /^image\//.test(i.type));
  if (!items.length) return;
  e.preventDefault();
  if (await FS.addPhotos(items.map(i => i.getAsFile()).filter(Boolean))) { if (App.view !== "brief") go("brief"); setTimeout(() => openCard("photos", true), 60); }
});

function buildCard(sec, g, eg, s) {
  const isLast = sec.id === SECTIONS[SECTIONS.length - 1].id, done = App.secDone(sec.id);
  const c = el("div", "card" + (done ? " done" : "")); c.dataset.sec = sec.id;
  c.innerHTML = `<button class="chead"><span class="num">${done ? svg("check") : sec.n}</span>
      <span class="tt"><b>${esc(sec.title)} <span class="tag2">${esc(sec.tag)}</span></b><small class="sm">${esc(App.secSummary(sec.id))}</small></span>${svg("chev", "chev")}</button>
    <div class="cbody">${BODY[sec.id](g, eg, s)}
      <div class="cfoot">${sec.n > 0 ? `<button class="btn ghost sm" data-prev="${sec.id}">← 이전</button>` : ""}
        <button class="btn ${isLast ? "pri" : ""}" data-apply="${sec.id}">${isLast ? svg("sparkles") + " AI로 상세페이지 만들기" : svg("check") + " 적용하고 다음 →"}</button></div></div>`;
  return c;
}
function shotCard(a, i) {
  if (a.error) return `<div class="shot"><button class="shx" data-del-photo="${esc(a.name)}" title="이 사진 빼기">${svg("x")}</button><div class="mt"><div class="fn">${esc(a.name)}</div><div class="dm" style="color:var(--danger)">${esc(a.error)}</div></div></div>`;
  const grade = a.resGrade === "good" ? ["ok", "고해상도"] : a.resGrade === "ok" ? ["n", "사용 가능"] : ["d", "해상도 부족"];
  const bg = a.bgSimple === "high" ? ["ok", "누끼 쉬움"] : a.bgSimple === "mid" ? ["n", "누끼 보통"] : ["w", "누끼 어려움"];
  const br = a.bright < .28 ? ["w", "어두움"] : a.bright > .82 ? ["w", "밝음"] : ["n", "노출 적정"];
  return `<div class="shot" style="animation-delay:${i * 60}ms"><button class="shx" data-del-photo="${esc(a.name)}" title="이 사진 빼기">${svg("x")}</button><div class="th" data-src="${a.thumb}"><img src="${a.thumb}" alt=""></div>
    <div class="mt"><div class="fn" title="${esc(a.name)}">${esc(a.name)}</div><div class="dm">${a.w} × ${a.h} · ${a.orient} · ${fmtKB(a.size)}</div>
    <div class="pal">${a.pal.map(p => `<i style="background:${p.hex}" title="${p.hex} ${p.pct}%"></i>`).join("")}</div>
    <div class="tags"><span class="tag ${grade[0]}">${grade[1]}</span><span class="tag ${bg[0]}">${bg[1]}</span><span class="tag ${br[0]}">${br[1]}</span></div></div></div>`;
}
const BODY = {
  photos: (g, eg, s) => (FS.name ? `<div class="dropz" data-act="addPhotos"><div class="dzi">${svg("photo")}</div><div><b>사진을 여기에 끌어다 놓거나 클릭해서 고르세요</b><small>Ctrl+V 로 클립보드 이미지도 됩니다 · 각도별 2~4장 · 긴 변 1200px 이상 권장</small></div><span class="btn sm">${svg("plus")} 사진 추가</span>${Local.desktop ? `<span class="btn sm ghost" data-act="pasteClip" title="Ctrl+V">${svg("copy")} 붙여넣기</span>` : ""}</div>` : `<div class="note w">${svg("warn")}<div class="nb">먼저 <b>새 프로젝트</b>를 만드세요.</div></div>`) + (!FS.analysis.length
    ? `<p class="hint" style="margin:10px 0 0">아직 사진이 없습니다. 사진이 들어오면 해상도·색·배경을 바로 분석합니다.</p>`
    : `<div class="note ${s.low ? "w" : "o"}" style="margin-top:12px">${svg(s.low ? "warn" : "check")}<div class="nb">${s.low
        ? `<b>${s.low}장이 권장 해상도(${SET.minLong}px) 미만.</b> ${esc(s.lowNames.join(" · "))}<br>이대로 진행하면 라벨 글씨가 뭉개지거나 AI가 지어낸 글자로 바뀔 수 있습니다. 제품이 나오는 타일은 원본을 업스케일해 합성합니다.`
        : `<b>해상도 양호.</b> 전 사진이 권장 기준을 넘습니다. 제품이 나오는 타일은 원본 픽셀을 그대로 합성합니다.`}</div></div>
      <dl class="kv"><dt>평균 긴 변</dt><dd>${s.avgLong}px ${s.avgLong >= 2400 ? "— 2K 타일에 충분" : s.avgLong >= 1200 ? "— 사용 가능" : "— 부족"}</dd>
        <dt>방향 구성</dt><dd>${Object.entries(s.orients).map(([k, n]) => `${k} ${n}장`).join(" · ")}</dd>
        <dt>누끼 적합</dt><dd>${s.cuttable}장</dd>
        <dt>추출 포인트 컬러</dt><dd><i class="sw" style="background:${s.accent}"></i>${s.accent}</dd></dl>
      <div class="aisug" id="aisug">${Suggest.box()}</div>
      <div id="pcut">${Cut.box()}</div>
      <div class="shots">${FS.analysis.map(shotCard).join("")}</div>`),
  product: (g, eg) => `<p class="hint">이것만 있어도 기획안 초안은 나옵니다.</p>
    <div class="row2"><div class="fld"><label>상품명</label><input type="text" data-k="product.name" value="${esc(g("product", "name"))}" placeholder="${esc(eg.name)}"></div>
      <div class="fld"><label>판매가 / 구성 <span class="opt">선택</span></label><input type="text" data-k="product.price" value="${esc(g("product", "price"))}" placeholder="${esc(eg.price)}"></div></div>
    <div class="fld"><label>카테고리</label><div class="chips" data-radio="product.category">${CATS.map(c => `<label class="chip"><input type="radio" name="cat" value="${c}"${g("product", "category") === c ? " checked" : ""}><span>${c}</span></label>`).join("")}</div></div>
    <div class="fld"><label>판매 채널 <span class="opt">복수 선택</span></label><div class="chips" data-multi="product.channels">${CHANNELS.map(c => `<label class="chip"><input type="checkbox" value="${c}"${(g("product", "channels", []) || []).indexOf(c) !== -1 ? " checked" : ""}><span>${c}</span></label>`).join("")}</div></div>`,
  target: (g, eg) => `<p class="hint">여기서 문제 카피가 나옵니다. 한 줄이어도 좋으니 꼭 적어주세요.</p>
    <div class="fld"><label>어떤 사람이, 어떤 상황에서 쓰나</label><textarea id="ta-who" data-k="target.who" placeholder="${esc(eg.who)}">${esc(g("target", "who"))}</textarea>
      <div class="ghostchips">${["가격 때문에 망설인다", "경쟁 제품을 써봤는데 실패했다", "선물용으로 찾는다", "재구매 주기가 짧다"].map(q => `<button data-quick="${q}" data-for="ta-who">${q}</button>`).join("")}</div></div>`,
  fact: (g, eg) => `<p class="hint">스펙 그대로만 적어주세요. 고객 혜택 문장으로 바꾸는 건 제가 합니다.</p>
    <div class="fld"><label>스펙 · 기능 · 성분 <span class="opt">줄바꿈으로 나열</span></label><textarea data-k="fact.specs" style="min-height:118px" placeholder="${esc(eg.specs)}">${esc(g("fact", "specs"))}</textarea></div>
    <div class="fld"><label>경쟁사 대비 확실히 다른 점 <span class="opt">선택</span></label><input type="text" data-k="fact.usp" value="${esc(g("fact", "usp"))}" placeholder="${esc(eg.usp)}"></div>`,
  proof: (g) => `<p class="hint">없으면 <b>비워두세요.</b> 비우면 "실제 데이터 삽입" 자리로 설계합니다.</p>
    <div class="fld"><label>보유한 숫자 <span class="opt">선택</span></label><input type="text" data-k="proof.numbers" data-notab value="${esc(g("proof", "numbers"))}" placeholder="형식) 누적 판매 N개 · 평점 N.N · 리뷰 N개 — 실제 값만"></div>
    <div class="fld"><label>보유 인증 <span class="opt">선택</span></label><div class="chips" data-multi="proof.certs">${CERTS.map(c => `<label class="chip"><input type="checkbox" value="${c}"${(g("proof", "certs", []) || []).indexOf(c) !== -1 ? " checked" : ""}><span>${c}</span></label>`).join("")}</div></div>
    <div class="fld"><label>실제 고객 리뷰 <span class="opt">원문 그대로</span></label><p class="hint">불만 리뷰도 같이 넣어주세요.</p><textarea data-k="proof.reviews" data-notab style="min-height:110px" placeholder="형식) 리뷰 원문을 한 줄에 하나씩 — 실제 리뷰만">${esc(g("proof", "reviews"))}</textarea></div>`,
  terms: (g) => `<p class="hint">긴박감은 <b>진짜일 때만</b> 씁니다.</p>
    <div class="fld"><label>할인 · 한정 · 환불 · 배송</label><textarea data-k="terms.all" data-notab placeholder="형식) 할인 / 한정 수량·기간 / 환불·교환 / 배송 — 실제 조건만">${esc(g("terms", "all"))}</textarea></div>`,
  req: (g, eg, s) => `<p class="hint">${s ? `사진에서 뽑은 포인트 컬러는 <b>${s.accent}</b> 입니다. 비워두면 이 색으로 제안합니다.` : "비워두면 사진 분석 결과로 톤을 제안드립니다."}</p>
    <div class="fld"><label>제품 사진 처리</label><p class="hint"><b>AI 고화질 재현</b> — 원본을 참고해 로고·글자·형태는 그대로, 화질만 스튜디오급으로 다시 만듭니다(저화질 사진일 때 권장). <b>원본 그대로 합성</b> — 누끼·업스케일만 하고 픽셀을 보존합니다.</p>
      <div class="chips" data-radio="req.photoMode">${PHOTO_MODES.map(([k, l]) => `<label class="chip"><input type="radio" name="pm" value="${k}"${(g("req", "photoMode") === "keep" ? "keep" : "regen") === k ? " checked" : ""}><span>${l}</span></label>`).join("")}</div></div>
    <div class="row2"><div class="fld"><label>원하는 분위기</label><textarea data-k="req.mood" placeholder="${esc(eg.mood || "깨끗하고 자연광 느낌. 프리미엄하게.")}">${esc(g("req", "mood"))}</textarea></div>
      <div class="fld"><label>피하고 싶은 것</label><textarea data-k="req.avoid" placeholder="${esc(eg.avoid || "빨간 폭탄세일 느낌, 촌스러운 그라데이션")}">${esc(g("req", "avoid"))}</textarea></div></div>
    <div class="fld"><label>그 밖에 하고 싶은 말</label><textarea data-k="req.etc" placeholder="법적으로 못 쓰는 표현, 꼭 넣어야 할 고지, 참고 브랜드 등">${esc(g("req", "etc"))}</textarea></div>`,
  layout: () => {
    const sel = layoutSel(), groups = [];
    CATALOG.forEach(c => { let grp = groups.find(x => x.g === c.g); if (!grp) groups.push(grp = { g: c.g, items: [] }); grp.items.push(c); });
    return `<p class="hint">체크된 순서대로 조립됩니다. 인트로와 가격·CTA는 뺄 수 없습니다. <b>⚠</b> 는 실제 자료가 있어야 만들 수 있는 섹션입니다.</p>
      <div data-multi="layout.sections">${groups.map(grp => `<div class="catgrp"><div class="catg">${esc(grp.g)}</div><div class="chips">
        ${grp.items.map(c => `<label class="chip${c.lock ? " lock" : ""}" title="${esc(c.need || "")}"><input type="checkbox" value="${c.id}"${sel.includes(c.id) ? " checked" : ""}${c.lock ? " disabled" : ""}><span>${esc(c.label)}${c.need ? " ⚠" : ""}</span></label>`).join("")}</div></div>`).join("")}</div>
      <div class="refbox" id="refbox">${Ref.box()}</div>`;
  }
};
function onFieldInput(e) {
  const t = e.target;
  if (t.matches && t.matches("[data-k]")) { const [sec, key] = t.dataset.k.split("."); App.brief[sec] = App.brief[sec] || {}; App.brief[sec][key] = t.value; }
  else if (t.closest && t.closest("[data-radio],[data-multi]")) {
    const grp = t.closest("[data-radio],[data-multi]"), path = grp.dataset.radio || grp.dataset.multi, [sec, key] = path.split(".");
    App.brief[sec] = App.brief[sec] || {};
    App.brief[sec][key] = grp.dataset.radio ? (grp.querySelector("input:checked") || {}).value || "" : $$("input:checked", grp).map(x => x.value);
    if (grp.dataset.radio && path === "product.category") rerenderExamples();
  } else return;
  App.saveBrief(); refreshCardMeta(); bumpProgress();
}
function rerenderExamples() {
  const eg = App.eg(), map = { "product.name": eg.name, "product.price": eg.price, "target.who": eg.who, "fact.specs": eg.specs, "fact.usp": eg.usp, "req.mood": eg.mood || "깨끗하고 자연광 느낌. 프리미엄하게.", "req.avoid": eg.avoid || "빨간 폭탄세일 느낌, 촌스러운 그라데이션" };
  Object.entries(map).forEach(([k, v]) => { const f = $(`[data-k="${k}"]`); if (f) f.placeholder = v; });
  if (!eg.ai) UI.toast("카테고리에 맞춰 예시문을 바꿨습니다");
}
function refreshCardMeta() {
  $$(".card[data-sec]").forEach(c => { const id = c.dataset.sec, done = App.secDone(id), was = c.classList.contains("done");
    c.classList.toggle("done", done); $(".num", c).innerHTML = done ? svg("check") : SECTIONS.find(s => s.id === id).n;
    if (done && !was) { $(".num", c).classList.add("pop"); setTimeout(() => $(".num", c).classList.remove("pop"), 500); }
    $(".sm", c).textContent = App.secSummary(id); });
}
function bumpProgress() { const p = App.progress(), b = $("#pbar"), c = $("#pcnt"); if (b) b.style.width = p.pct + "%"; if (c) c.textContent = `${p.done} / ${p.total} 섹션`; }
function openCard(id, noScroll) {
  const c = $(`.card[data-sec="${id}"]`); if (!c) return;
  $$(".card[data-sec]").forEach(x => x.classList.toggle("open", x === c));
  App.curSec = id; renderSide();
  if (!noScroll) c.scrollIntoView({ block: "start", behavior: "smooth" });
  const f = $("input[data-k],textarea[data-k]", c); if (f) setTimeout(() => f.focus({ preventScroll: true }), 220);
}
function toggleCard(card) { const was = card.classList.contains("open"); $$(".card[data-sec]").forEach(x => x.classList.remove("open")); if (!was) { card.classList.add("open"); App.curSec = card.dataset.sec; } else App.curSec = null; renderSide(); }
function applySection(id) {
  const need = REQ[id] || [], b = App.brief[id] || {};
  const miss = need.filter(k => Array.isArray(b[k]) ? !b[k].length : !String(b[k] || "").trim());
  if (miss.length) { const card = $(`.card[data-sec="${id}"]`); const f = card && (card.querySelector(`[data-k="${id}.${miss[0]}"]`) || card.querySelector(`[data-radio="${id}.${miss[0]}"] input`));
    UI.toast("필수 항목을 먼저 채워주세요", "w"); card.classList.add("shake"); setTimeout(() => card.classList.remove("shake"), 500); if (f && f.focus) f.focus(); return; }
  App.saveBrief(); refreshCardMeta(); bumpProgress(); ACT.saveBrief(true);
  const i = SECTIONS.findIndex(x => x.id === id);
  if (i < SECTIONS.length - 1) { openCard(SECTIONS[i + 1].id); return; }
  $$(".card[data-sec]").forEach(x => x.classList.remove("open")); App.curSec = null; ACT.make();
}

/* ── 타일 (배율 · 스크롤 스파이 · 요청/오타/가독성 배지 · 모바일 프레임 · 장별 다시/추가) ── */
const Tiles = { title: "타일", mode: Store.get("tileMode", "strip"), zoom: null, readOn: false, _spyVw: null, _spyFn: null,
  render(v) {
    if (!App.tiles.length) { v.innerHTML = `<div class="wrap"><div class="empty"><div class="eic">${svg("grid")}</div><b>아직 타일이 없습니다</b><p>브리프를 마치고 <b>AI로 상세페이지 만들기</b>를 누르면 여기에 들어옵니다.</p><button class="btn pri" data-act="gobrief">브리프로</button></div></div>`; v.onclick = e => { const a = e.target.closest("[data-act]"); if (a) ACT[a.dataset.act](); }; return; }
    if (!["strip", "grid", "mobile"].includes(this.mode)) this.mode = "strip";
    Store.set("tileMode", this.mode);
    this.zoom = this.zoom || Store.get("tileZoom", 100);
    const strip = this.mode === "strip", t = App.tally(), tyn = Typo.count();
    v.innerHTML = `<div class="wrap wide center">
      <div class="vhead">
        <h1 class="pg">타일 <span class="cntl">${App.tiles.length}</span></h1>
        <div class="tally">${t.req ? `<span class="t-b">수정 요청 ${t.req}장</span><span class="t-c">영역 ${t.regions}</span>` : `<span class="t-d">요청 없음</span>`}${tyn ? `<span class="t-y">오타 의심 ${tyn}</span>` : ""}</div>
        <div class="sp"></div>
        ${strip ? `<div class="zctl" title="Ctrl + 휠 · Ctrl + / − 로도 조절"><button data-z="-" aria-label="축소">−</button><input type="range" id="tz" min="25" max="200" value="${this.zoom}"><button data-z="+" aria-label="확대">+</button><b id="tzv">${this.zoom}%</b><button data-z="fit">맞춤</button><button data-z="100">100%</button></div>` : ""}
        <div class="seg"><button class="${strip ? "on" : ""}" data-m="strip">${svg("layers")} 이어붙이기</button><button class="${this.mode === "grid" ? "on" : ""}" data-m="grid">${svg("grid")} 그리드</button><button class="${this.mode === "mobile" ? "on" : ""}" data-m="mobile" title="M">${svg("mobile")} 모바일</button></div>
        <button class="btn${this.readOn ? " act" : ""}" data-rd="1" title="모바일(390px)에서 글자 크기·배경 대비 검사">${svg("eye")} 가독성</button>
        <button class="btn" data-act="goreview">${svg("check")} 검수</button>
        <button class="btn pri" data-act="exportMenu">${svg("down")} 내보내기</button>
      </div>
      ${this.readOn ? this.readSummary() : ""}
      <div id="tbox"></div></div>`;
    const box = $("#tbox", v);
    const badge = tl => {
      const rc = ((App.review[tl.n] || {}).regions || []).length, b = [];
      if (App.hasReq(tl.n)) b.push(`<i class="rb s-edit">수정 요청${rc ? " · 영역 " + rc : ""}</i>`);
      const ty = Typo.of(tl); if (ty && ty.fresh && (ty.issues || []).length) b.push(`<i class="rb s-ty">오타 의심 ${ty.issues.length}</i>`);
      if (this.readOn) { const ri = Read.issues(tl); if (ri && ri.length) b.push(`<i class="rb s-rd${ri.some(x => x.lv === "d") ? " d" : ""}">가독성 ${ri.length}</i>`); }
      return b.length ? `<div class="rbs">${b.join("")}</div>` : "";
    };
    if (this.mode === "grid") {
      box.className = "tgrid";
      box.innerHTML = App.tiles.map((tl, i) => `<div class="tcard" data-n="${esc(tl.n)}" data-src="${tl.f}" style="animation-delay:${i * 30}ms">${badge(tl)}<img src="${tl.f}" loading="lazy" alt="">
        <div class="tact"><button class="btn sm" data-tact="regen" data-n="${esc(tl.n)}" title="이 장만 다시">${svg("refresh")} 다시</button><button class="btn sm" data-tact="insert" data-n="${esc(tl.n)}" title="이 장 뒤에 1장 추가">${svg("plus")} 뒤에 추가</button></div>
        <div class="cp"><b>${esc(tl.n)}. ${esc(tl.name)}</b><small>${esc(tl.copy || "")}</small></div></div>`).join("");
    } else if (this.mode === "mobile") {
      const pw = Store.get("phoneW", 390);
      box.className = "phonewrap";
      box.innerHTML = `<div class="phone" style="--pw:${pw}px"><div class="pnotch"></div><div class="pscr" id="pscr">${App.tiles.map(tl => `<div class="ptl" data-n="${esc(tl.n)}">${badge(tl)}<img src="${tl.f}" alt="${esc(tl.n)}"></div>`).join("")}</div></div>
        <div class="pside"><h5>폰 화면 폭</h5><div class="seg" id="pwSeg">${[360, 390, 430].map(w => `<button data-pw="${w}" class="${w === pw ? "on" : ""}">${w}px</button>`).join("")}</div>
          <p class="hint" style="margin-top:10px">실제 휴대폰 화면 폭(CSS px)으로 줄여 보여줍니다. 스크롤하며 글자가 읽히는지, 지루하게 긴 곳은 없는지 확인하세요. 장을 더블클릭하면 검수로 갑니다.</p>
          <dl class="kv"><dt>전체 길이</dt><dd id="pLen">계산 중…</dd><dt>장 수</dt><dd>${App.tiles.length}장</dd></dl>
          <button class="btn sm${this.readOn ? " act" : ""}" data-rd="1" style="margin-top:12px">${svg("eye")} 가독성 검사 ${this.readOn ? "끄기" : "켜기"}</button></div>`;
      const calc = () => { const sc = $("#pscr"), L = $("#pLen"); if (!sc || !L) return; const H = sc.scrollHeight, vh = sc.clientHeight || 1; L.textContent = `${fmtNum(Math.round(H))}px · 화면 약 ${Math.max(1, Math.round(H / vh))}번 넘김`; };
      $$("#pscr img", v).forEach(im => im.addEventListener("load", calc)); setTimeout(calc, 300);
    } else {
      box.className = "strip";
      box.innerHTML = `<div class="pg" id="tpg" style="width:${this.px()}px">${App.tiles.map(tl =>
        `<div class="tl" data-n="${esc(tl.n)}"><span class="lb">${esc(tl.n)}${tl.name ? " · " + esc(tl.name) : ""}</span>${badge(tl)}<img src="${tl.f}" loading="lazy" alt="${esc(tl.n)}" onload="this.classList.add('in')"></div>`).join("")}</div>`;
      this.spy(v);
      $("#view").addEventListener("wheel", e => { if (!e.ctrlKey) return; e.preventDefault(); this.zoomAt(this.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1), e.clientY); }, { passive: false });
      const sl = $("#tz", v); if (sl) sl.oninput = () => this.zoomAt(+sl.value);
      if (App.curTile) { const tt = $(`.tl[data-n="${CSS.escape(App.curTile)}"]`, v); if (tt) setTimeout(() => tt.scrollIntoView({ block: "start" }), 60); }
    }
    v.onclick = e => {
      const ta = e.target.closest("[data-tact]"); if (ta) { e.stopPropagation(); return ACT.tileRun(ta.dataset.n, ta.dataset.tact); }
      const rd = e.target.closest("[data-rd]"); if (rd) return this.toggleRead();
      const pw = e.target.closest("[data-pw]"); if (pw) { Store.set("phoneW", +pw.dataset.pw); return go("tiles"); }
      const z = e.target.closest("[data-z]"); if (z) { const k = z.dataset.z; this.zoomAt(k === "+" ? this.zoom * 1.15 : k === "-" ? this.zoom / 1.15 : k === "100" ? 100 : this.fit()); return; }
      const m = e.target.closest("[data-m]"); if (m) { this.mode = m.dataset.m; go("tiles"); return; }
      const a = e.target.closest("[data-act]"); if (a) { ACT[a.dataset.act](); return; }
      const c = e.target.closest(".tcard[data-src]"); if (c) { App.curTile = c.dataset.n; go("review"); return; }
      const tl = e.target.closest(".strip .tl, .ptl"); if (tl && e.detail === 2) { App.curTile = tl.dataset.n; go("review"); }
    };
  },
  readSummary() {
    let d = 0, w = 0, nt = 0; App.tiles.forEach(t => { const ri = Read.issues(t) || []; if (ri.length) nt++; ri.forEach(x => x.lv === "d" ? d++ : w++); });
    return `<div class="note ${nt ? "w" : "o"}">${svg(nt ? "warn" : "check")}<div class="nb"><b>모바일 가독성</b> — ${nt ? `${nt}장에서 읽기 어려운 글자 ${d + w}줄 (심각 ${d})` : "모든 장이 기준을 넘습니다"} · 기준: 390px 폭에서 글자 ${SET.readPx}px · 대비 ${SET.readContrast}:1 (설정에서 변경). ${nt ? "배지가 붙은 장을 누르면 검수에서 위치를 보고 한 번에 요청으로 넣을 수 있습니다." : ""}</div></div>`;
  },
  async toggleRead() { this.readOn = !this.readOn; Review.showRead = this.readOn; if (this.readOn) { UI.toast("글자 위치를 읽는 중… (Windows OCR · 무료)"); await Read.all(); } if (App.view === "tiles") go("tiles"); },
  px() { return Math.round(SET.baseW * this.zoom / 100); },
  fit() { const vw = $("#view"); return vw ? clamp(Math.floor((vw.clientWidth - 64) / SET.baseW * 100), 25, 200) : 100; },
  zoomAt(z, anchorY) {
    z = clamp(Math.round(z), 25, 200);
    const vw = $("#view"), pg = $("#tpg"); if (!pg || z === this.zoom) return;
    const r = vw.getBoundingClientRect(), pr = pg.getBoundingClientRect();
    const ay = anchorY == null ? r.top + r.height / 2 : anchorY;
    const pgTop = pr.top - r.top + vw.scrollTop, frac = (ay - pr.top) / pr.height, H = pr.height, ratio = z / this.zoom;
    this.zoom = z; Store.set("tileZoom", z);
    pg.style.width = this.px() + "px";
    const sl = $("#tz"); if (sl) sl.value = z; const lb = $("#tzv"); if (lb) lb.textContent = z + "%";
    vw.scrollTop = pgTop + frac * H * ratio - (ay - r.top);
  },
  spy(v) {
    this.unspy();
    const vw = $("#view"); if (!vw) return;
    let tmr = 0;
    const tick = () => {
      tmr = 0;
      const r = vw.getBoundingClientRect(), line = r.top + r.height * .3;
      let hit = null;
      for (const t of $$(".strip .tl", v)) { const b = t.getBoundingClientRect(); if (b.top <= line && b.bottom > line) { hit = t; break; } if (b.top > line) { hit = hit || t; break; } }
      if (!hit) return; const n = hit.dataset.n;
      if (n !== App.curTile) { App.curTile = n; renderSide(); const cur = $("#sideBody .sitem.on"); if (cur) cur.scrollIntoView({ block: "nearest" }); }
    };
    this._spyFn = () => { if (!tmr) tmr = setTimeout(tick, 80); };
    vw.addEventListener("scroll", this._spyFn, { passive: true });
    this._spyVw = vw;
    setTimeout(tick, 120);
  },
  unspy() { if (this._spyVw && this._spyFn) this._spyVw.removeEventListener("scroll", this._spyFn); this._spyVw = this._spyFn = null; }
};

/* ── 검수 (영역 코멘트 · 글자 수정 · 오타/가독성 자동 검사 · 버전) ── */
const QUICK = ["문구를 바꿔줘", "폰트를 더 굵게", "글자 크기 키워줘", "색 톤을 낮춰줘", "여백을 더 줘", "숫자 강조를 키워줘", "사진을 바꿔줘", "배지 스타일 바꿔줘", "배경을 밝게"];
const Review = { title: "검수", cur: 0, s: 1, x: 0, y: 0, fitS: 1, _drag: null, _ro: null, drawing: false, drawKind: "area", _rect: null, hi: -1, showTypo: true, showRead: false,
  render(v) {
    if (!App.tiles.length) { v.innerHTML = `<div class="wrap"><div class="empty"><div class="eic">${svg("check")}</div><b>검수할 타일이 없습니다</b><p>타일이 생성되면 여기서 영역을 잡아 수정 요청을 남깁니다.</p></div></div>`; return; }
    if (App.curTile) { const i = App.tiles.findIndex(t => t.n === App.curTile); if (i >= 0) this.cur = i; }
    this.drawing = false; this.hi = -1;
    v.innerHTML = `<div class="rv">
      <div class="rv-stage" id="rvStage">
        <div class="rv-can" id="rvCan"><img id="rvImg" alt="" draggable="false"><div class="rv-ann" id="rvAnn"></div></div>
        <div class="rv-tools"><button class="btn pri" id="rvDraw" title="D">${svg("plus")} 영역 잡기</button><button class="btn" id="rvText" title="T — 바꿀 글자를 끌어 선택">${svg("type")} 글자 수정</button><span class="rv-sep"></span>
          <button class="btn sm" id="rvTypo" title="AI 오타 자동 검사">${svg("spell")} 오타 검사</button><button class="btn sm${this.showRead ? " act" : ""}" id="rvRead" title="모바일 글자 크기·대비">${svg("eye")} 가독성</button></div>
        <p class="rv-hint2" id="rvHint"></p>
        <div class="zctl float"><button data-z="-" aria-label="축소">−</button><b id="rvZ">100%</b><button data-z="+" aria-label="확대">+</button><button data-z="fit">맞춤</button><button data-z="100">100%</button></div>
        <p class="rvhint">휠 확대·축소 · 드래그 이동 · 더블클릭 맞춤 ↔ 100% · <kbd>D</kbd> 영역 · <kbd>T</kbd> 글자 · <kbd>?</kbd> 단축키</p>
      </div>
      <div class="rv-side">
        <div class="rvh"><span class="rvn" id="rvN"></span><h3 id="rvT"></h3></div><p id="rvS" class="rvsub"></p>
        <div id="rvChk"></div>
        <div class="fld"><label>영역 코멘트 · 글자 교체 <span class="opt" id="rvCnt"></span></label><div class="rgl" id="rgl"></div></div>
        <div class="fld"><label>이 장 전체에 대한 요청 <span class="opt">선택</span></label><textarea id="rvNote" placeholder="영역과 무관한 요청. 예: 전체적으로 여백을 더 주고 배경을 조금 밝게"></textarea>
          <div class="ghostchips">${QUICK.map(q => `<button data-q="${q}">${q}</button>`).join("")}</div></div>
        <div class="rvnav"><button class="btn" id="rvPrev">← 이전</button><button class="btn" id="rvNextU" title="다음 요청 없는 장">${svg("flag")} 다음 미검수</button><button class="btn pri" id="rvNext">다음 →</button></div>
        <div class="rvsec"><h5>이 장</h5><div class="rvbtns"><button class="btn sm" data-tact="regen">${svg("refresh")} 이 장만 다시</button><button class="btn sm" data-tact="insert">${svg("plus")} 뒤에 1장 추가</button></div></div>
        <div class="rvsec" id="rvVer"></div>
        <div class="rvfoot"><div class="rvbtns"><button class="btn" data-act="gotiles">${svg("grid")} 타일에서 보기</button><button class="btn" data-act="feedback">${svg("inbox")} 피드백 붙여넣기</button></div><button class="btn pri blk" data-act="revise">${svg("sparkles")} 검수 반영 — AI 수정 실행</button><p class="hint" style="margin:6px 0 0">영역·글자 교체를 그대로 넘겨 <b>해당 부분만</b> 고칩니다. 톤앤매너는 유지되고, 고치기 전 버전은 자동 백업됩니다.</p></div>
      </div></div>`;
    $("#rvNote", v).addEventListener("input", () => { this.rec().note = $("#rvNote", v).value; this.cap(); });
    $$(".ghostchips [data-q]", v).forEach(b => b.onclick = () => { const ta = $("#rvNote", v); ta.value = (ta.value.trim() ? ta.value.replace(/\s+$/, "") + "\n" : "") + b.dataset.q; ta.dispatchEvent(new Event("input", { bubbles: true })); ta.focus(); });
    $("#rvPrev", v).onclick = () => this.go(this.cur - 1);
    $("#rvNext", v).onclick = () => this.go(this.cur + 1);
    $("#rvNextU", v).onclick = () => { const i = App.tiles.findIndex((t, k) => k > this.cur && !App.hasReq(t.n)); if (i < 0) return UI.toast("뒤에 미검수 장이 없습니다", "o"); this.go(i); };
    v.onclick = e => {
      const a = e.target.closest("[data-act]"); if (a) return ACT[a.dataset.act]();
      const ta = e.target.closest("[data-tact]"); if (ta) return ACT.tileRun(App.tiles[this.cur].n, ta.dataset.tact);
      const vr = e.target.closest("[data-ver]"); if (vr) return Versions.compare(App.tiles[this.cur], +vr.dataset.ver);
      const fx = e.target.closest("[data-fix]"); if (fx) return this.addFix(fx.dataset.fix);
      const rt = e.target.closest("[data-retypo]"); if (rt) return Typo.run();
    };
    $("#rvDraw", v).onclick = () => this.setDraw(!(this.drawing && this.drawKind === "area"), "area");
    $("#rvText", v).onclick = () => this.setDraw(!(this.drawing && this.drawKind === "text"), "text");
    $("#rvTypo", v).onclick = () => { const t = App.tiles[this.cur], r = Typo.of(t); if (!r || !r.fresh) return Typo.run(); this.showTypo = !this.showTypo; this.refresh(); UI.toast(this.showTypo ? "오타 표시를 켰습니다" : "오타 표시를 껐습니다"); };
    $("#rvRead", v).onclick = async () => { this.showRead = !this.showRead; $("#rvRead").classList.toggle("act", this.showRead); if (this.showRead) { const t = App.tiles[this.cur]; this.chk(); await Read.doc(t); if (App.tiles[this.cur] !== t) return; } this.refresh(); };
    Typo.paintBtn();

    /* 영역 목록 */
    const L = $("#rgl", v);
    L.addEventListener("input", e => {
      const t = e.target.closest("textarea[data-ri],input[data-ri]"); if (!t) return; const r = this.rec(), g = r.regions[+t.dataset.ri]; if (!g) return;
      if (t.dataset.f) { g[t.dataset.f] = t.value; g.text = `글자 교체: "${g.from || ""}" → "${g.to || ""}"`; } else g.text = t.value;
      this.cap();
    });
    L.addEventListener("click", e => { const d = e.target.closest("[data-del]"); if (d) { this.rec().regions.splice(+d.dataset.del, 1); this.hi = -1; this.cap(); this.paint(); this.list(); return; } const it = e.target.closest(".rgi"); if (it) { this.hi = +it.dataset.ri; this.paint(); } });
    L.addEventListener("mouseover", e => { const it = e.target.closest(".rgi"); if (it) { this.hi = +it.dataset.ri; this.paint(); } });

    /* 뷰어 */
    const st = $("#rvStage", v);
    st.addEventListener("wheel", e => { e.preventDefault(); this.zoomTo(this.s * (e.deltaY < 0 ? 1.1 : 1 / 1.1), e.clientX, e.clientY); }, { passive: false });
    st.onpointerdown = e => {
      if (e.button !== 0 || e.target.closest(".zctl,.rv-tools")) return;
      if (this.drawing) { const p = this.imgPt(e); if (!p) return; this._rect = { x0: p.x, y0: p.y, x1: p.x, y1: p.y }; st.setPointerCapture(e.pointerId); this.paint(); return; }
      this._drag = { x: e.clientX, y: e.clientY, ox: this.x, oy: this.y }; st.setPointerCapture(e.pointerId); st.classList.add("grab");
    };
    st.onpointermove = e => {
      if (this._rect) { const p = this.imgPt(e, true); this._rect.x1 = p.x; this._rect.y1 = p.y; this.paint(); return; }
      if (!this._drag) return; this.x = this._drag.ox + e.clientX - this._drag.x; this.y = this._drag.oy + e.clientY - this._drag.y; this.apply();
    };
    st.onpointerup = st.onpointercancel = () => {
      if (this._rect) { const r = this._rect; this._rect = null; const x = Math.min(r.x0, r.x1), y = Math.min(r.y0, r.y1), w = Math.abs(r.x1 - r.x0), h = Math.abs(r.y1 - r.y0);
        if (w > .01 && h > .005) {
          const rec = this.rec(), box = { x: +x.toFixed(4), y: +y.toFixed(4), w: +w.toFixed(4), h: +h.toFixed(4) };
          if (this.drawKind === "text") { const g = Object.assign(box, { kind: "text", from: "", to: "", text: "" }); rec.regions.push(g); this.hi = rec.regions.length - 1; this.cap(); this.list(); this.guess(g, App.tiles[this.cur]); }
          else { rec.regions.push(Object.assign(box, { text: "" })); this.hi = rec.regions.length - 1; this.cap(); this.list(); const ta = $(`#rgl textarea[data-ri="${this.hi}"]`); if (ta) ta.focus(); }
        }
        this.paint(); return; }
      this._drag = null; st.classList.remove("grab");
    };
    st.ondblclick = e => { if (e.target.closest(".zctl,.rv-tools") || this.drawing) return; if (Math.abs(this.s - this.fitS) < .01) this.zoomTo(1, e.clientX, e.clientY); else this.layout(true); };
    $(".zctl", st).onclick = e => { const b = e.target.closest("[data-z]"); if (!b) return; const k = b.dataset.z; if (k === "fit") return this.layout(true); this.zoomTo(k === "+" ? this.s * 1.15 : k === "-" ? this.s / 1.15 : 1); };
    if (this._ro) this._ro.disconnect();
    this._ro = new ResizeObserver(() => this.layout(false)); this._ro.observe(st);
    this.setDraw(false);
    this.go(this.cur);
  },
  setDraw(on, kind) {
    this.drawing = on; if (kind) this.drawKind = kind;
    const a = $("#rvDraw"), t = $("#rvText"), st = $("#rvStage"), h = $("#rvHint");
    const onA = on && this.drawKind === "area", onT = on && this.drawKind === "text";
    if (a) { a.classList.toggle("pri", !onA); a.classList.toggle("dgr", onA); a.innerHTML = onA ? svg("x") + " 영역 잡기 끝" : svg("plus") + " 영역 잡기"; }
    if (t) { t.classList.toggle("act", onT); t.innerHTML = onT ? svg("x") + " 글자 수정 끝" : svg("type") + " 글자 수정"; }
    if (st) { st.classList.toggle("draw", on); st.classList.toggle("drawtx", onT); }
    if (h) h.textContent = !on ? "영역 잡기(D) — 고칠 곳을 끌어 표시 · 글자 수정(T) — 바꿀 문구를 끌어 선택하면 원래 글자를 자동으로 읽어 채웁니다" : onT ? "바꿀 글자 위를 끌어 선택하세요 — 원래 글자를 자동으로 읽습니다 (Esc 끝)" : "이미지 위를 끌어 영역을 잡고 코멘트를 적으세요. 한 장에 여러 개 가능 (Esc 끝)";
    if (onT) Read.doc(App.tiles[this.cur]);
  },
  /* 글자 수정: 끌어 잡은 영역 안의 글자를 OCR(+오타 검사에서 AI 가 읽은 글자)로 채운다 */
  async guess(g, t) {
    const doc = await Read.doc(t); let txt = "", sure = false;
    if (doc) {
      const ty = Typo.of(t), read = ty && ty.fresh ? (ty.read || {}) : {};
      const X0 = g.x * doc.w, Y0 = g.y * doc.h, X1 = (g.x + g.w) * doc.w, Y1 = (g.y + g.h) * doc.h, inside = (x, y, w, h) => x + w / 2 >= X0 && x + w / 2 <= X1 && y + h / 2 >= Y0 && y + h / 2 <= Y1;
      const lines = doc.lines.filter(l => (l.words || []).some(w => inside(w.x, w.y, w.w, w.h))).sort((a, b) => a.y - b.y);
      const parts = lines.map(l => { const ws = (l.words || []).filter(w => inside(w.x, w.y, w.w, w.h)); const full = ws.length === (l.words || []).length; if (full && read[l.id]) { sure = true; return read[l.id]; } return ws.map(w => w.t).join(" "); });
      txt = parts.filter(Boolean).join("\n");
    }
    const rec = this.rec(); if (!rec.regions.includes(g)) return;
    if (!g.from) g.from = txt;
    g.auto = sure ? "ai" : txt ? "ocr" : "none";
    g.text = `글자 교체: "${g.from}" → "${g.to || ""}"`;
    this.cap(); this.list();
    const i = rec.regions.indexOf(g), inp = $(`#rgl [data-ri="${i}"][data-f="${g.from ? "to" : "from"}"]`); if (inp) inp.focus();
  },
  imgPt(e, clampIt) { const img = $("#rvImg"); if (!img) return null; const r = img.getBoundingClientRect(); let x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; if (clampIt) { x = clamp(x, 0, 1); y = clamp(y, 0, 1); } return { x, y }; },
  rec() { const t = App.tiles[this.cur]; const r = App.review[t.n]; if (!r || !Array.isArray(r.regions)) App.review[t.n] = { regions: (r && r.regions) || [], note: (r && r.note) || "" }; return App.review[t.n]; },
  go(i) {
    this.cur = clamp(i, 0, App.tiles.length - 1);
    const t = App.tiles[this.cur], r = this.rec(); App.curTile = t.n; this.hi = -1; this._rect = null;
    const img = $("#rvImg"); img.classList.remove("in"); img.src = t.f; img.onload = () => { img.classList.add("in"); this.layout(true); this.paint(); };
    $("#rvN").textContent = t.n; $("#rvT").textContent = t.name || "타일"; $("#rvS").textContent = t.copy || "";
    $("#rvNote").value = r.note || "";
    $("#rvPrev").disabled = this.cur === 0; $("#rvNext").disabled = this.cur === App.tiles.length - 1;
    this.list(); this.paint(); this.chk(); this.ver();
    if (this.showRead || (this.drawing && this.drawKind === "text")) Read.doc(t).then(() => { if (App.tiles[this.cur] === t) { this.paint(); this.chk(); } });
    renderSide(); const cur = $("#sideBody .sitem.on"); if (cur) cur.scrollIntoView({ block: "nearest" });
  },
  refresh() { if (!$("#rvAnn")) return; this.paint(); this.chk(); this.ver(); Typo.paintBtn(); renderSide(); },
  list() {
    const L = $("#rgl"); if (!L) return; const r = this.rec();
    const nt = r.regions.filter(g => g.kind === "text").length;
    $("#rvCnt").textContent = r.regions.length ? `${r.regions.length}개${nt ? ` (글자 ${nt})` : ""}` : "없음";
    L.innerHTML = r.regions.length ? r.regions.map((g, i) => g.kind === "text"
      ? `<div class="rgi tx${i === this.hi ? " hi" : ""}" data-ri="${i}"><span class="rgn">T${i + 1}</span><div class="rgt"><label>원래 글자 ${g.auto === "ocr" ? `<small class="w">자동 인식 — 틀릴 수 있어요, 확인해 주세요</small>` : g.auto === "ai" ? `<small>AI 가 읽은 글자</small>` : g.auto === "none" ? `<small class="w">글자를 못 읽었습니다 — 직접 적어주세요</small>` : ""}</label><textarea data-ri="${i}" data-f="from" rows="${clamp(String(g.from || "").split("\n").length, 1, 4)}" placeholder="이미지에 적힌 그대로">${esc(g.from || "")}</textarea><label>바꿀 글자</label><textarea data-ri="${i}" data-f="to" rows="${clamp(String(g.from || "").split("\n").length, 1, 4)}" placeholder="새 문구 — 적은 그대로 들어갑니다 (줄바꿈 가능)">${esc(g.to || "")}</textarea></div><button class="rgx" data-del="${i}" title="삭제">${svg("x")}</button></div>`
      : `<div class="rgi${i === this.hi ? " hi" : ""}" data-ri="${i}"><span class="rgn">${i + 1}</span><textarea data-ri="${i}" placeholder="이 영역을 어떻게 바꿀까요? 예: 숫자를 130%로, 글씨 더 굵게">${esc(g.text)}</textarea><button class="rgx" data-del="${i}" title="삭제">${svg("x")}</button></div>`).join("")
      : `<p class="hint" style="margin:4px 0 0"><b>영역 잡기</b>로 고칠 곳을, <b>글자 수정</b>으로 바꿀 문구를 끌어 선택하세요.</p>`;
  },
  paint() {
    const A = $("#rvAnn"); if (!A) return; const r = this.rec(), t = App.tiles[this.cur];
    const pos = g => `left:${g.x * 100}%;top:${g.y * 100}%;width:${g.w * 100}%;height:${g.h * 100}%`;
    let h = "";
    if (this.showTypo) { const ty = Typo.of(t); if (ty && ty.fresh) (ty.issues || []).forEach(is => { if (is.box) h += `<div class="rg ty" style="${pos(grow(is.box, .2))}" title="${esc(is.found)} → ${esc(is.fix)}"><b>!</b></div>`; }); }
    if (this.showRead) { const ri = Read.issues(t) || []; ri.forEach(x => { h += `<div class="rg rd ${x.lv}" style="${pos(grow(x.box, .15))}"><em>${esc(Read.label(x))}</em></div>`; }); }
    h += r.regions.map((g, i) => `<div class="rg${g.kind === "text" ? " tx" : ""}${i === this.hi ? " hi" : ""}" style="${pos(g)}"><b>${g.kind === "text" ? "T" : ""}${i + 1}</b></div>`).join("");
    if (this._rect) { const q = this._rect; h += `<div class="rg tmp${this.drawKind === "text" ? " tx" : ""}" style="left:${Math.min(q.x0, q.x1) * 100}%;top:${Math.min(q.y0, q.y1) * 100}%;width:${Math.abs(q.x1 - q.x0) * 100}%;height:${Math.abs(q.y1 - q.y0) * 100}%"></div>`; }
    A.innerHTML = h;
    $$(".rgi", $("#rgl")).forEach(x => x.classList.toggle("hi", +x.dataset.ri === this.hi));
  },
  /* 자동 검사 결과(오타 · 가독성) — 한 번에 요청으로 넣기 */
  chk() {
    const B = $("#rvChk"); if (!B) return; const t = App.tiles[this.cur]; let h = "";
    const ty = Typo.of(t);
    if (Typo.running) h += `<div class="note i">${svg("refresh", "spin")}<div class="nb">AI 가 오타를 검사하는 중입니다…</div></div>`;
    else if (ty && !ty.fresh) h += `<div class="note w">${svg("info")}<div class="nb">이 장은 오타 검사 뒤에 바뀌었습니다. <button class="btn sm" data-retypo="1">다시 검사</button></div></div>`;
    else if (ty && this.showTypo) {
      const is = ty.issues || [];
      h += is.length ? `<div class="chk ty"><h5>${svg("spell")} 오타 의심 ${is.length}건 <span class="sp"></span>${is.length > 1 ? `<button class="btn sm ghost" data-fix="ty:all">모두 넣기</button>` : ""}</h5>${is.map((x, i) => `<div class="iss"><span><s>${esc(x.found)}</s> → <b>${esc(x.fix)}</b><small>${esc(x.why)}${x.box ? "" : " · 위치 못 찾음"}</small></span><button class="btn sm" data-fix="ty:${i}">요청에 넣기</button></div>`).join("")}</div>`
        : `<p class="chkok">${svg("check")} 오타 검사: 이상 없음</p>`;
    }
    if (this.showRead) {
      const ri = Read.issues(t);
      h += ri == null ? `<p class="hint">가독성: 글자 위치를 읽는 중…</p>` : ri.length ? `<div class="chk rd"><h5>${svg("eye")} 모바일 가독성 ${ri.length}줄 <span class="sp"></span>${ri.length > 1 ? `<button class="btn sm ghost" data-fix="rd:all">모두 넣기</button>` : ""}</h5>${ri.map((x, i) => `<div class="iss ${x.lv}"><span><b>${esc(String(x.text).slice(0, 26))}</b><small>${esc(Read.label(x))}</small></span><button class="btn sm" data-fix="rd:${i}">요청에 넣기</button></div>`).join("")}</div>`
        : `<p class="chkok">${svg("check")} 가독성: 기준(글자 ${SET.readPx}px · 대비 ${SET.readContrast}:1) 통과</p>`;
    }
    B.innerHTML = h;
  },
  addFix(key) {
    const [k, idx] = key.split(":"), t = App.tiles[this.cur], rec = this.rec(); let n = 0;
    if (k === "ty") {
      const is = (Typo.of(t) || {}).issues || [], list = idx === "all" ? is : [is[+idx]].filter(Boolean);
      list.forEach(x => { if (rec.regions.some(g => g.kind === "text" && g.from === x.found && g.to === x.fix)) return; const text = `글자 교체: "${x.found}" → "${x.fix}"`;
        if (x.box) rec.regions.push(Object.assign(grow(x.box), { kind: "text", from: x.found, to: x.fix, text, auto: "ai" })); else rec.note = (rec.note ? rec.note.replace(/\s+$/, "") + "\n" : "") + text; n++; });
    } else if (k === "rd") {
      const ri = Read.issues(t) || [], list = idx === "all" ? ri : [ri[+idx]].filter(Boolean);
      list.forEach(x => { const text = Read.request(x); if (rec.regions.some(g => g.text === text)) return; rec.regions.push(Object.assign(grow(x.box, .3), { text })); n++; });
    }
    $("#rvNote").value = rec.note || "";
    this.cap(); this.list(); this.paint();
    UI.toast(n ? `요청 ${n}건을 넣었습니다` : "이미 넣은 항목입니다", n ? "o" : "w");
  },
  ver() { const B = $("#rvVer"); if (B) B.innerHTML = Versions.html(App.tiles[this.cur]); },
  layout(fit) {
    const st = $("#rvStage"), img = $("#rvImg"); if (!st || !img || !img.naturalWidth) return;
    const W = st.clientWidth - 48, H = st.clientHeight - 110;
    this.fitS = Math.min(W / img.naturalWidth, H / img.naturalHeight, 1);
    if (fit) { this.s = this.fitS; this.x = 0; this.y = 12; }
    this.apply();
  },
  apply() { const can = $("#rvCan"); if (!can) return; can.style.transform = `translate(${this.x}px,${this.y}px) scale(${this.s})`; can.style.setProperty("--s", this.s); const z = $("#rvZ"); if (z) z.textContent = Math.round(this.s * 100) + "%"; },
  zoomTo(s, cx, cy) {
    s = clamp(s, Math.min(this.fitS, 1) * .5, 4);
    const st = $("#rvStage"); if (!st) return;
    const r = st.getBoundingClientRect();
    const px = cx == null ? 0 : cx - (r.left + r.width / 2), py = cy == null ? 0 : cy - (r.top + r.height / 2);
    const k = s / this.s;
    this.x = px - (px - this.x) * k; this.y = py - (py - this.y) * k; this.s = s; this.apply();
  },
  _svT: 0,
  cap() { App.saveReview(); renderSide(); clearTimeout(this._svT); this._svT = setTimeout(() => FS.saveReviewFile(), 900); },
  /* 영역을 빨간 번호 박스로 그린 PNG → review/NN_marked.png (AI 가 영역을 정확히 알아보게). 글자 교체는 파란 T 번호 */
  async buildMarked(tile) {
    const r = App.review[tile.n]; if (!r || !r.regions || !r.regions.length) return null;
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = tile.f; });
    const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const x = c.getContext("2d"); x.drawImage(img, 0, 0);
    const lw = Math.max(6, Math.round(c.width * .005)), fs = Math.max(28, Math.round(c.width * .035));
    r.regions.forEach((g, i) => {
      const X = g.x * c.width, Y = g.y * c.height, W = g.w * c.width, H = g.h * c.height, col = g.kind === "text" ? "#2F6BFF" : "#FF2D2D", lab = (g.kind === "text" ? "T" : "") + (i + 1);
      x.fillStyle = g.kind === "text" ? "rgba(47,107,255,.12)" : "rgba(255,45,45,.14)"; x.fillRect(X, Y, W, H);
      x.strokeStyle = col; x.lineWidth = lw; x.strokeRect(X, Y, W, H);
      const R = fs * (lab.length > 1 ? .9 : .75); x.beginPath(); x.arc(X + R * .9, Y + R * .9, R, 0, Math.PI * 2); x.fillStyle = col; x.fill();
      x.fillStyle = "#fff"; x.font = `bold ${fs}px Pretendard, Arial, sans-serif`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(lab, X + R * .9, Y + R * .95);
    });
    const blob = await new Promise(res => c.toBlob(res, "image/png"));
    const file = `review/${tile.n}_marked.png`;
    await Local.saveImage(FS.name, file, blob);
    return file;
  }
};
document.addEventListener("keydown", e => {
  if (App.view !== "review" || !App.tiles.length) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || $(".ovl.on") || $(".lbx.on")) return;
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.key === "ArrowLeft") Review.go(Review.cur - 1);
  if (e.key === "ArrowRight" || e.key === "Enter") Review.go(Review.cur + 1);
  if (e.key === "d" || e.key === "D") Review.setDraw(!(Review.drawing && Review.drawKind === "area"), "area");
  if (e.key === "t" || e.key === "T") Review.setDraw(!(Review.drawing && Review.drawKind === "text"), "text");
  if (e.key === "Escape" && Review.drawing) Review.setDraw(false);
  if ((e.key === "Delete" || e.key === "Backspace") && Review.hi >= 0) { Review.rec().regions.splice(Review.hi, 1); Review.hi = -1; Review.cap(); Review.paint(); Review.list(); }
});

/* ── AI 가 사진 보고 예시문 제안 ── */
const Suggest = {
  timer: null, running: false, err: "",
  box() {
    const g = App.suggest;
    if (!Local.desktop) return `<p class="hint" style="margin:10px 0 12px">EXE 에서는 AI 가 사진을 직접 보고 예시문을 씁니다.</p>`;
    if (this.running) return `<div class="note i">${svg("sparkles")}<div class="nb"><b>AI 가 사진을 보는 중…</b> 20~40초. 보고 나면 아래 칸들의 예시문이 이 상품에 맞게 바뀝니다.</div></div>`;
    if (this.err && Login.is(this.err)) return `<div class="note w">${svg("lock")}<div class="nb"><b>Claude 로그인이 만료됐습니다.</b> 다시 로그인하면 바로 분석할 수 있습니다. <button class="btn sm pri" data-sug="login" style="margin-left:6px">다시 로그인</button> <button class="btn sm" data-sug="run">다시 분석</button></div></div>`;
    if (this.err) return `<div class="note w">${svg("warn")}<div class="nb">${esc(this.err)} <button class="btn sm" data-sug="run" style="margin-left:6px">다시</button></div></div>`;
    const stale = g && FS.analysis.length && g.photos && g.photos.length !== FS.analysis.length;
    if (g && !stale) return `<div class="note o">${svg("check")}<div class="nb"><b>AI 가 본 사진:</b> ${esc(g.photo || "")}<br><span class="hint">브리프 빈 칸을 이 상품 기준으로 채웠습니다${g.cost ? ` · $${(+g.cost).toFixed(2)}` : ""}. 사실과 다르면 고쳐주세요.</span>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap"><button class="btn sm" data-sug="fill">${svg("edit")} 빈 칸 다시 채우기</button><button class="btn sm ghost" data-sug="run">${svg("refresh")} 다시 분석</button></div></div></div>`;
    return `<div class="note b">${svg("sparkles")}<div class="nb"><b>사진을 다 올렸으면 → 분석 후 적용</b> — AI 가 사진 ${FS.analysis.length}장을 보고 상품명·누가 사나·스펙·차별점·분위기를 채웁니다 (20~40초).${stale ? " <span class='hint'>사진이 바뀌어 다시 분석이 필요합니다.</span>" : ""}<div style="margin-top:8px"><button class="btn sm pri" data-sug="run">${svg("sparkles")} 분석 후 적용</button></div></div></div>`;
  },
  paint() { const b = $("#aisug"); if (b) b.innerHTML = this.box(); },
  async run() {
    if (!Local.desktop || !FS.name) return; if (this.running) return UI.toast("이미 보는 중입니다");
    const pr = App.brief.product || {};
    try { await Local.suggest(FS.name, { name: pr.name, category: pr.category, price: pr.price }); } catch (e) { this.err = e.message; this.paint(); if (!e.needLogin) UI.toast(e.message, "w"); return; }
    this.running = true; this.err = ""; this.paint(); UI.toast("AI 가 사진을 보는 중…");
    clearInterval(this.timer);
    this.timer = setInterval(async () => {
      let st; try { st = await Local.suggestStatus(); } catch (e) { return; }
      if (st.running) return;
      clearInterval(this.timer); this.running = false;
      if (st.error) { this.err = st.error; this.paint(); if (st.needLogin || Login.is(st.error)) Login.prompt(); else UI.toast("예시문 제안 실패", "w"); return; }
      if (st.data && st.name === FS.name) { App.suggest = st.data; this.paint(); rerenderExamples(); refreshCardMeta(); this.fill(true); }
    }, 2500);
  },
  fill(auto) {
    const g = App.suggest; if (!g) return;
    const put = (sec, k, v) => { if (!v) return 0; App.brief[sec] = App.brief[sec] || {}; if (String(App.brief[sec][k] || "").trim()) return 0; App.brief[sec][k] = v; const f = $(`[data-k="${sec}.${k}"]`); if (f) f.value = v; return 1; };
    let n = put("product", "name", g.name) + put("target", "who", g.who) + put("fact", "specs", g.specs) + put("fact", "usp", g.usp) + put("req", "mood", g.mood) + put("req", "avoid", g.avoid);
    if (Array.isArray(g.sections) && g.sections.length) { const cur = new Set(layoutSel()); g.sections.forEach(id => { if (catOf(id)) cur.add(id); }); App.brief.layout = { sections: CATALOG.filter(c => cur.has(c.id)).map(c => c.id) }; }
    App.saveBrief(); refreshCardMeta(); bumpProgress(); ACT.saveBrief(true);
    UI.toast(n ? `분석 완료 — 빈 칸 ${n}개를 채웠습니다. 사실과 다르면 고쳐주세요` : (auto ? "분석 완료 — 이미 채워진 칸은 그대로 뒀습니다" : "빈 칸이 없습니다"), n ? "o" : "w");
    if (auto) this.askPhotoMode();
    go("brief"); setTimeout(() => openCard("product", true), 60);      // 분석 뒤엔 항상 1단계 상품부터 확인
  },
  async askPhotoMode() {
    const low = FS.summary ? FS.summary.low : 0, total = FS.analysis.length;
    const v = await UI.dialog({ title: "제품 사진을 어떻게 쓸까요?", sub: `${total}장 중 ${low}장이 권장 해상도(${SET.minLong}px) 미만입니다.`, icon: "photo", tone: "b",
      body: `<div class="pmpick">
        <button class="pm" data-pm="regen"><b>AI 고화질 재현</b><small>원본을 참고해 <b>로고·글자·제품 형태는 그대로</b> 두고 화질만 스튜디오급으로 다시 만듭니다. 라벨에 없는 글자·인증은 추가하지 않습니다.</small><em>${low ? "권장 — 저화질 사진" : "고화질에도 사용 가능"}</em></button>
        <button class="pm" data-pm="keep"><b>원본 그대로 합성</b><small>누끼·업스케일만 하고 픽셀을 보존합니다. 실물 사진이 이미 좋을 때.</small><em>${low ? "저화질이라 뭉개질 수 있음" : "권장 — 사진 상태 양호"}</em></button></div>`,
      buttons: [{ label: "나중에 (6단계에서 변경)", value: 0 }], onOpen(d) { $$(".pm", d).forEach(b => b.onclick = () => UI._close(b.dataset.pm)); } });
    if (v === "regen" || v === "keep") { App.brief.req = App.brief.req || {}; App.brief.req.photoMode = v; App.saveBrief(); refreshCardMeta(); UI.toast(v === "regen" ? "AI 고화질 재현으로 설정했습니다" : "원본 그대로 합성으로 설정했습니다", "o"); }
  },
  act(k) { if (k === "run") this.run(); else if (k === "fill") this.fill(); else if (k === "login") Login.prompt().then(ok => { if (ok) { this.err = ""; this.paint(); } }); }
};

/* ── AI 실행 패널: 프로젝트별 실행 · 단계 워드 스와이프 · 눈금 진행바 · 타일 스트립 · 자동/수동 이어하기 ── */
const FUN = { make: ["카피 문장을 고르는 중", "색 조합을 맞추는 중", "제품 사진을 다듬는 중", "여백을 계산하는 중", "글자 하나하나 검수하는 중", "섹션 순서를 정리하는 중", "고객이 멈출 지점을 만드는 중"], revise: ["표시한 영역을 확인하는 중", "톤을 그대로 유지하는 중", "고친 자리만 다시 그리는 중", "글자를 대조하는 중"],
  tile: ["앞뒤 장 톤을 맞추는 중", "이 장만 다시 그리는 중", "글자를 대조하는 중"], productcut: ["라벨 글자를 한 자씩 옮기는 중", "조명을 다듬는 중", "원본과 나란히 대조하는 중"], plan: ["섹션 흐름을 짜는 중", "카피를 다듬는 중"] };
const RunUI = {
  el: null, timer: null, next: 0, rid: 0, open: false, min: false, logOpen: false, lastKey: "", name: "", mode: "make", seen: new Set(), funT: null, funI: 0, tileT: null, last: null,
  ensure() {
    if (this.el) return this.el;
    this.el = el("div", "runp", `
      <div class="rh"><span class="rdot"></span><b id="runT">AI 작업</b><span class="sp"></span><span class="rel" id="runEl"></span><button class="ib" id="runLog" title="로그">${svg("doc")}</button><button class="ib" id="runMin" title="접기">${svg("chev")}</button><button class="ib" id="runX" title="닫기 (작업은 계속)">${svg("x")}</button></div>
      <div class="rbody">
        <div class="rstage"><div class="rsw" id="runSw"><div class="rsword" id="runWord">준비</div></div><div class="rpct"><b id="runPct">0</b><i>%</i></div></div>
        <div class="rticks" id="runTicks"><span class="rshine"></span></div>
        <div class="rchips" id="runChips"></div>
        <div class="rfun" id="runFun"></div>
        <div class="rlast" id="runLast">시작하는 중…</div>
        <div class="rtiles" id="runTiles"></div>
      </div>
      <div class="rl" id="runL" hidden></div>
      <div class="rf"><span id="runS" class="hint"></span><span class="sp"></span><button class="btn sm dgr" id="runStop">${svg("stop")} 중단</button><button class="btn sm" id="runResume" hidden>${svg("refresh")} 이어서 하기</button><button class="btn sm pri" id="runGo" hidden>${svg("check")} 검수로</button></div>`);
    document.body.appendChild(this.el);
    const T = $("#runTicks", this.el); for (let i = 0; i < 44; i++) T.appendChild(el("i"));
    $("#runMin", this.el).onclick = () => { this.min = !this.min; this.el.classList.toggle("min", this.min); };
    $("#runLog", this.el).onclick = () => { this.logOpen = !this.logOpen; $("#runL", this.el).hidden = !this.logOpen; this.el.classList.toggle("logon", this.logOpen); };
    $("#runX", this.el).onclick = () => this.hide();
    $("#runStop", this.el).onclick = async () => { if (!(await UI.confirm("AI 작업을 중단할까요?", "지금까지 만든 파일은 남습니다. 나중에 <b>이어서 하기</b>로 남은 것만 이어서 할 수 있습니다.", { ok: "중단", danger: true }))) return; try { await Local.runStop(this.name); } catch (e) { UI.toast(e.message, "w"); } };
    $("#runResume", this.el).onclick = async () => { const nm = this.name, md = this.mode; try { await Local.run(nm, "resume"); this.show(`이어서 하기 — ${nm}`, nm, md); UI.toast("이어서 진행합니다 — 이미 만든 파일은 그대로 둡니다", "o"); } catch (e) { UI.alert("이어서 하지 못했습니다", esc(e.message), "d"); } };
    $("#runGo", this.el).onclick = async () => { const j = this.last || {}; this.hide(); if (FS.name !== this.name) await FS.load(this.name, true); if (j.mode === "productcut") { go("brief"); setTimeout(() => openCard("photos", true), 80); return; } App.curTile = j.newId || j.tile || null; go("review"); };
    return this.el;
  },
  show(title, name, mode) {
    this.ensure(); this.name = name || FS.name; this.mode = mode || "make"; this.open = true; this.min = false; this.lastKey = ""; this.seen = new Set(); this.funI = 0; this.rid = 0; this.last = null;
    this.el.classList.add("on", "live"); this.el.classList.remove("min", "done", "fail");
    $("#runT", this.el).textContent = title || "AI 작업"; $("#runL", this.el).innerHTML = ""; $("#runTiles", this.el).innerHTML = ""; $("#runGo", this.el).hidden = true; $("#runResume", this.el).hidden = true; $("#runStop", this.el).hidden = false; $("#runLast", this.el).textContent = "시작하는 중…";
    this.next = 0; this.poll(); this.fun(); this.tiles();
  },
  hide() { this.open = false; if (this.el) this.el.classList.remove("on", "live"); clearInterval(this.timer); clearInterval(this.funT); clearInterval(this.tileT); this.timer = this.funT = this.tileT = null; },
  fun() { clearInterval(this.funT); const list = FUN[this.mode] || FUN.make; const F = $("#runFun", this.el); const step = () => { const n = el("span", "in", esc(list[this.funI++ % list.length])); F.innerHTML = ""; F.appendChild(n); }; step(); this.funT = setInterval(step, 4200); },
  /* 완성되는 타일을 8초마다 확인해 미니 스트립에 팝인 (바뀐 파일도 다시 뜬다) */
  tiles() { clearInterval(this.tileT); const tick = async () => { let p; try { p = await Local.project(this.name); } catch (e) { return; } const box = $("#runTiles", this.el); if (!box) return; const list = this.mode === "productcut" ? (p.cuts || []) : (p.tiles || []).filter(t => !/^_/.test(t.name)); list.forEach(t => { const key = t.name + "@" + t.mtime; if (this.seen.has(key)) return; const first = this.seen.size === 0 && !this.primed; this.seen.add(key); if (first && this.mode !== "make" && this.mode !== "productcut") return; const d = el("div", "rt", `<img src="${t.url}" alt=""><span>${esc(t.name.replace(/\.[^.]+$/, ""))}</span>`); box.appendChild(d); box.scrollLeft = box.scrollWidth; }); this.primed = true; box.classList.toggle("has", box.children.length > 0); }; this.primed = false; tick(); this.tileT = setInterval(tick, 8000); },
  paint(j) {
    const st = j.stages || [], idx = j.stageIdx, pct = clamp(j.pct || 0, 0, 100);
    const word = j.pendingResume ? "이어서" : j.done ? (j.exit === 0 ? "완료" : "중단됨") : (idx >= 0 ? st[idx] : "준비");
    const W = $("#runWord", this.el);
    if (word !== W.textContent) { const sw = $("#runSw", this.el); const nw = el("div", "rsword in", esc(word)); W.classList.add("out"); W.removeAttribute("id"); sw.appendChild(nw); nw.id = "runWord"; setTimeout(() => { W.remove(); nw.classList.remove("in"); }, 380); }
    const P = $("#runPct", this.el); if (P.textContent !== String(pct)) { P.textContent = pct; P.classList.remove("bump"); void P.offsetWidth; P.classList.add("bump"); }
    const ticks = $$("#runTicks i", this.el), n = Math.round(ticks.length * pct / 100);
    ticks.forEach((t, k) => { t.classList.toggle("on", k < n); t.classList.toggle("cur", k === n - 1); });
    $("#runChips", this.el).innerHTML = st.map((nm, k) => `<span class="${k < idx || (j.done && j.exit === 0) ? "past" : k === idx ? "cur" : ""}">${k < idx || (j.done && j.exit === 0) ? svg("check") : ""}${esc(nm)}</span>`).join("");
    const gen = j.tileTotal ? `${j.mode === "productcut" ? "컷" : "타일"} ${j.tileDone}/${j.tileTotal}${j.tileName ? " · " + esc(j.tileName) : ""}` : "";
    $("#runLast", this.el).innerHTML = j.pendingResume ? "작업이 끊겨서 같은 세션으로 자동으로 이어서 진행합니다…" : j.done ? (j.exit === 0 ? "다 만들었습니다." : j.canResume ? "끝나지 않았습니다. <b>이어서 하기</b>로 만든 것은 두고 남은 것만 진행할 수 있습니다." : "작업이 끝나지 않았습니다. 로그를 확인하세요.") : (gen ? `<b>${gen}</b>` + (j.last ? ` — ${esc(j.last)}` : "") : esc(j.last || "…"));
    const m = Math.round((Date.now() - j.startedAt) / 60000); $("#runEl", this.el).textContent = j.running ? `${m}분${j.resumes ? ` · 이어하기 ${j.resumes}회` : ""}` : "";
  },
  async poll() {
    clearInterval(this.timer);
    const tick = async () => {
      let j; try { j = await Local.runStatus(this.name, this.next, this.rid); } catch (e) { return; }
      const L = $("#runL", this.el);
      if (j.reset || (this.rid && j.runId && j.runId !== this.rid)) { L.innerHTML = ""; this.seen = new Set(); this.primed = false; }
      if (j.runId) this.rid = j.runId;
      if (j.mode && j.mode !== this.mode) { this.mode = j.mode; this.fun(); }
      (j.lines || []).forEach(ln => { const d = el("div", "ln " + ln.kind, `<i>${new Date(ln.t).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</i><span>${esc(ln.text)}</span>`); L.appendChild(d); });
      if ((j.lines || []).length && this.logOpen) L.scrollTop = L.scrollHeight;
      this.next = j.next != null ? j.next : this.next;
      this.last = j; this.paint(j);
      const el2 = $("#runS", this.el);
      if (j.running) el2.textContent = j.pendingResume ? "자동 이어하기 대기 중" : "실행 중 — 창을 닫거나 다른 프로젝트를 열어도 계속 돕니다";
      else if (j.done) {
        clearInterval(this.timer); clearInterval(this.funT); clearInterval(this.tileT); this.timer = this.funT = this.tileT = null;
        this.el.classList.remove("live"); el2.textContent = j.exit === 0 ? "완료" : "종료됨"; this.el.classList.add(j.exit === 0 ? "done" : "fail");
        $("#runStop", this.el).hidden = true; $("#runFun", this.el).innerHTML = "";
        const go1 = $("#runGo", this.el); go1.hidden = j.exit !== 0; go1.innerHTML = j.mode === "productcut" ? `${svg("eye")} 제품 컷 보기` : `${svg("check")} 검수로`;
        $("#runResume", this.el).hidden = !(j.exit !== 0 && j.canResume);
        Local._projects = null; Usage.load(true); QueueUI.load().then(() => renderSide());
        const same = FS.name === this.name;
        if (j.exit === 0) {
          if (same) {
            await FS.load(FS.name, true); renderSide();
            if (j.mode === "productcut") { UI.toast("제품 컷이 나왔습니다 — 원본과 나란히 비교하고 승인하세요", "o"); setTimeout(() => { this.hide(); go("brief"); setTimeout(() => openCard("photos", true), 80); }, 900); }
            else if (j.mode === "plan") UI.toast("기획안을 만들었습니다", "o");
            else { UI.toast(`${MODE_LABEL[j.mode] || "AI 작업"} 완료 — 검수 화면으로 이동합니다`, "o"); setTimeout(() => { this.hide(); App.curTile = j.newId || j.tile || null; go("review"); }, 900); }
          } else UI.toast(`${this.name} ${MODE_LABEL[j.mode] || ""} 완료 — [${j.mode === "productcut" ? "제품 컷 보기" : "검수로"}] 를 누르면 그 프로젝트로 이동합니다`, "o");
        } else { if (j.needLogin) Login.prompt(); UI.toast(j.canResume ? "AI 작업이 끝나지 않았습니다 — [이어서 하기] 로 남은 것만 진행할 수 있습니다" : "AI 작업이 종료됐습니다 — 로그를 확인하세요", "w"); this.logOpen = true; L.hidden = false; this.el.classList.add("logon"); if (same) FS.load(FS.name, true).then(() => { if (App.view === "home") go("home"); }); }
      } else el2.textContent = "";
    };
    await tick(); this.timer = setInterval(tick, 1500);
  }
};

/* ── 연결 섹션 (설정 안) ── */
let connPoll = null;
async function renderConnect(box, silent) {
  if (!Local.desktop) {
    box.innerHTML = `<div class="note i">${svg("info")}<div class="nb"><b>EXE(re-boot 콘솔.exe)에서만 됩니다.</b></div></div>
      <ol class="ul"><li>Claude Code: <code>npm i -g @anthropic-ai/claude-code</code> → <code>claude auth login</code></li>
      <li>Higgsfield MCP: <code>claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp</code> → <code>claude mcp login higgsfield</code></li>
      <li>GPT Codex CLI(선택): <code>npm i -g @openai/codex</code> → <code>codex login</code></li></ol>`;
    return;
  }
  if (!silent) box.innerHTML = `<p class="hint">확인 중…</p>`;
  let t; try { t = await Local.tools(); } catch (e) { box.innerHTML = `<div class="note w">${svg("warn")}<div class="nb">${esc(e.message)}</div></div>`; return; }
  if (!box.isConnected) return;
  const pill = (state, txt) => `<span class="pill ${state}">${txt}</span>`;
  const row = (title, desc, status, btns) => `<div class="tool"><div class="tico">${svg("term")}</div><div class="ttx"><b>${title}</b> ${status}<small>${desc}</small></div><div class="tbtns">${btns}</div></div>`;
  const c = t.claude, h = t.higgsfield, x = t.codex;
  const ready = c.installed && c.loggedIn && h.connected && h.authed;
  box.innerHTML = `<div class="note ${ready ? "o" : "w"}">${svg(ready ? "check" : "warn")}<div class="nb">${ready ? `<b>제작 준비 완료.</b> 브리프 마지막의 <b>AI로 상세페이지 만들기</b>와 검수의 <b>AI 수정 실행</b>이 이 창 안에서 바로 돌아갑니다.` : `<b>아직 준비가 안 됐습니다.</b> 아래 항목을 눌러 브라우저에서 로그인만 하면 됩니다. 검은 창은 뜨지 않습니다.`}</div></div>
    <div class="tools">
      ${row("Claude Code", c.installed ? (c.loggedIn ? `로그인됨 · ${esc(c.email || "")}` : "설치는 됐고 로그인만 남았습니다.") : "상세페이지를 실제로 만드는 쪽. Node.js " + (t.node ? esc(t.node) : "<b>없음</b>"),
        c.installed ? (c.loggedIn ? pill("ok", "연결됨 " + esc(c.version)) : pill("no", "로그인 필요")) : pill("no", "미설치"),
        c.installed ? (c.loggedIn ? `<button class="btn ghost sm" data-do="logout-claude">로그아웃</button>` : `<button class="btn pri" data-do="login-claude">${svg("lock")} 로그인</button>`) : `<button class="btn pri" data-do="install-claude">${svg("down")} 설치</button>`)}
      ${row("Higgsfield MCP", "이미지 생성(gpt_image_2_5). Claude Code 에 붙여 쓰고, 인증도 브라우저에서 끝납니다.",
        !c.installed ? pill("no", "Claude Code 먼저") : !h.connected ? pill("no", "미등록") : h.authed ? pill("ok", "연결됨") : pill("no", "인증 필요"),
        !c.installed ? "" : !h.connected ? `<button class="btn pri" data-do="add-mcp">${svg("plus")} 등록 + 인증</button>` : h.authed ? `<button class="btn ghost sm" data-do="auth-mcp">재인증</button>` : `<button class="btn pri" data-do="auth-mcp">${svg("lock")} 인증</button>`)}
      ${row("GPT Codex CLI", "선택. 카피 교정·보조용. 없어도 제작은 됩니다.",
        x.installed ? (x.loggedIn ? pill("ok", "연결됨 " + esc(x.version)) : pill("no", "로그인 필요")) : pill("no", "미설치"),
        x.installed ? (x.loggedIn ? "" : `<button class="btn" data-do="login-codex">${svg("lock")} 로그인</button>`) : `<button class="btn" data-do="install-codex">${svg("down")} 설치</button>`)}
    </div>
    <div class="fld" style="margin-top:16px"><label>프로젝트 루트</label><p class="hint"><code>${esc(t.root)}</code> — 이 안의 폴더가 프로젝트로 잡힙니다.</p>
      <div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn" data-act="openRoot">${svg("ext")} 폴더 열기</button><button class="btn" data-do="pick-root">${svg("folder")} 루트 변경</button><button class="btn ghost" data-re="1">${svg("refresh")} 다시 확인</button>${FS.name && c.installed ? `<button class="btn ghost" data-act="runClaudeTerm">${svg("term")} 터미널로 열기</button>` : ""}</div></div>`;
  box.onclick = async e => {
    if (e.target.closest("[data-re]")) return renderConnect(box);
    const a = e.target.closest("[data-act]"); if (a) return ACT[a.dataset.act]();
    const d = e.target.closest("[data-do]"); if (!d) return;
    d.disabled = true; d.innerHTML = "확인 중…";
    try { const j = await Local.toolAct(d.dataset.do); UI.toast(j.message || "실행했습니다", "o");
      if (d.dataset.do === "pick-root") { await Local.ping(); Local._projects = null; go("projects"); return; }
      if (j.poll) { let n = 0; clearInterval(connPoll); connPoll = setInterval(async () => { n++; if (!box.isConnected || n > 60) return clearInterval(connPoll); await renderConnect(box, true); }, 3000); }
      else renderConnect(box, true);
    } catch (err) { UI.alert("실행 실패", esc(err.message), "d"); renderConnect(box, true); }
  };
}

/* ── 설정 ── */
const Settings = { title: "설정", render(v) {
  const seg = (k, opts) => `<div class="seg" data-set="${k}">${opts.map(o => `<button class="${SET[k] === o[0] ? "on" : ""}" data-v="${o[0]}">${o[1]}</button>`).join("")}</div>`;
  const tog = (k, label, desc) => `<label class="srow"><span><b>${label}</b><small>${desc}</small></span><input type="checkbox" class="sw" data-set="${k}"${SET[k] ? " checked" : ""}></label>`;
  const num = (k, label, desc, min, max, step, unit) => `<label class="srow"><span><b>${label}</b><small>${desc}</small></span><span class="numin"><input type="number" data-set="${k}" value="${SET[k]}" min="${min}" max="${max}" step="${step || 1}"><em>${unit || ""}</em></span></label>`;
  v.innerHTML = `<div class="wrap"><h1 class="pg">설정</h1><p class="pgsub">${Local.desktop ? `EXE 모드 · 내장 서버` : Local.ok ? `서버 모드` : `<span style="color:var(--warn)">서버 없음</span> — 폴더 기능이 꺼져 있습니다`}${FS.name ? ` · 열린 프로젝트 <b>${esc(FS.name)}</b>` : ""}</p>

    <h3 class="h3">연결 — AI 도구</h3>
    <div class="card open"><div class="cbody" style="border-top:0"><div id="connBox" style="margin-top:14px"></div></div></div>

    <h3 class="h3">테마</h3>
    <div class="card open"><div class="cbody" style="border-top:0"><div class="srow" style="margin-top:14px"><span><b>화면 색</b><small>시스템을 고르면 Windows 설정을 따릅니다.</small></span>${seg("theme", [["light", "☀ 라이트"], ["dark", "☾ 다크"], ["system", "시스템"]])}</div></div></div>

    <h3 class="h3">작업 설정</h3>
    <div class="card open"><div class="cbody" style="border-top:0"><div style="margin-top:6px">
      ${num("baseW", "타일 기준 폭", "이어붙이기 100% 일 때 폭. 스마트스토어 860 · 쿠팡 780", 600, 1200, 10, "px")}
      ${num("minLong", "사진 권장 해상도", "긴 변이 이보다 작으면 '해상도 부족'으로 표시", 600, 4000, 100, "px")}
      ${tog("tabFill", "브리프: Tab 으로 예시문 채우기", "증거·판매조건 칸은 항상 제외")}
      ${num("toastSec", "알림 표시 시간", "왼쪽 아래 알림이 사라지기까지", 1, 8, 0.5, "초")}
    </div></div></div>

    ${Local.desktop ? `<h3 class="h3">AI 작업</h3>
    <div class="card open"><div class="cbody" style="border-top:0"><div style="margin-top:6px">
      <label class="srow"><span><b>끊기면 자동으로 이어서 하기</b><small>턴 한도·네트워크 끊김으로 멈추면 같은 세션으로 최대 2번 이어서 진행합니다. 만든 타일은 그대로 둡니다.</small></span><input type="checkbox" class="sw" data-cfg="autoResume" checked></label>
      <label class="srow"><span><b>대기열 동시 실행</b><small>대기열에서 한 번에 돌릴 작업 수. Max 사용량을 아끼려면 1</small></span><span class="numin"><input type="number" data-cfg="queueConc" value="1" min="1" max="3" step="1"><em>개</em></span></label>
      ${num("readPx", "가독성 기준 글자 크기", "모바일 390px 폭에서 이보다 작으면 경고 (2px 더 작으면 심각)", 8, 20, 1, "px")}
      ${num("readContrast", "가독성 기준 대비", "배경·글자 대비(WCAG). 일반 글자 4.5 권장, 큰 글자는 자동으로 3", 2, 7, 0.5, ":1")}
    </div></div></div>` : ""}

    <h3 class="h3">도움말</h3>
    <div class="card open"><div class="cbody" style="border-top:0"><div class="srow" style="margin-top:14px"><span><b>단축키</b><small>어디서나 <kbd>?</kbd> 를 누르면 표가 뜹니다</small></span><button class="btn" data-act="keys">${svg("keyboard")} 단축키 보기</button></div></div></div>

    ${Local.desktop ? `<h3 class="h3">업데이트</h3>
    <div class="card open"><div class="cbody" style="border-top:0"><div class="srow" style="margin-top:14px"><span><b>버전 <span id="updV">확인 중…</span></b><small id="updS">새 버전은 알아서 받아 두었다가 AI 작업이 없을 때 조용히 적용합니다 (6시간마다 · 켤 때 확인).</small></span><button class="btn" id="updChk">${svg("refresh")} 지금 확인</button></div></div></div>` : ""}

    <h3 class="h3">데이터</h3>
    <div class="card open"><div class="cbody" style="border-top:0"><div class="srow" style="margin-top:14px"><span><b>브리프·검수 초기화</b><small>이 콘솔에 저장된 입력을 지웁니다. 폴더의 파일은 그대로입니다.</small></span><button class="btn dgr" data-act="reset">${svg("x")} 초기화</button></div>
      <div class="srow"><span><b>설정 기본값으로</b><small>테마·작업 설정을 처음 값으로 되돌립니다.</small></span><button class="btn" data-act="resetSet">${svg("refresh")} 되돌리기</button></div></div></div>

    <p class="hint" style="margin-top:18px">re:boot · <code>#F86010</code> · 기준 문서는 상위 폴더 <code>README.md</code>${Local.desktop ? ` · 로그 <code>%APPDATA%\\re-boot 콘솔\\main-error.log</code>` : ""}</p>
  </div>`;
  renderConnect($("#connBox", v));
  if (Local.desktop) Local.config().then(c => { const a = $('[data-cfg="autoResume"]', v), q = $('[data-cfg="queueConc"]', v); if (a) a.checked = c.autoResume !== false; if (q) q.value = c.queueConc || 1; }).catch(() => {});
  if (Local.desktop) {
    const showU = u => { const V = $("#updV", v), S = $("#updS", v); if (!V) return; V.textContent = "v" + (u.current || "?"); S.textContent = u.state === "available" || u.state === "downloading" ? `새 버전 ${u.version} 내려받는 중` : u.state === "downloaded" || u.state === "downloaded-wait" ? `${u.version} 준비됨 — 한가할 때 자동 적용` : u.state === "installing" ? `${u.version} 적용 중 — 곧 다시 열립니다` : u.state === "latest" ? "최신 버전입니다" : u.state === "checking" ? "확인 중…" : u.state === "error" ? "확인 실패: " + (u.error || "") : u.state === "unsupported" ? "개발 실행에서는 꺼져 있습니다" : "새 버전은 알아서 내려받고 자동으로 적용됩니다."; };
    Local.update().then(showU).catch(() => {});
    $("#updChk", v).onclick = async () => { try { await Local.updateAct("check"); } catch (e) {} UI.toast("확인 중…"); setTimeout(async () => { const u = await Update.poll(true); if (u) showU(u); }, 4000); };
  }
  v.addEventListener("click", e => {
    if (e.target.closest("#connBox")) return;
    const sb = e.target.closest(".seg[data-set] button"); if (sb) { const k = sb.parentElement.dataset.set; SET[k] = sb.dataset.v; saveSet(); $$("button", sb.parentElement).forEach(b => b.classList.toggle("on", b === sb)); UI.toast("적용했습니다", "o"); return; }
    const a = e.target.closest("[data-act]"); if (a) ACT[a.dataset.act]();
  });
  v.addEventListener("change", e => {
    const t = e.target;
    if (t.dataset && t.dataset.cfg) { const k = t.dataset.cfg, val = t.type === "checkbox" ? t.checked : clamp(parseInt(t.value, 10) || 1, 1, 3); if (t.type !== "checkbox") t.value = val; Local.configSet({ [k]: val }).then(() => UI.toast("저장했습니다", "o")).catch(err => UI.toast(err.message, "w")); return; }
    if (!t.dataset || !t.dataset.set) return;
    const k = t.dataset.set;
    if (t.type === "checkbox") SET[k] = t.checked;
    else { let n = parseFloat(t.value); if (isNaN(n)) n = SET_DEF[k]; n = clamp(n, +t.min, +t.max); t.value = n; SET[k] = n; }
    saveSet(); UI.toast("저장했습니다", "o");
  });
}};

/* ═══ v4.8 공용 ═══ */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pad2 = n => String(n).padStart(2, "0");
const fmtT = ms => { const d = new Date(ms); return `${d.getMonth() + 1}/${d.getDate()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const fmtNum = n => n == null || isNaN(n) ? "—" : Number(n).toLocaleString("ko-KR");
const MODE_LABEL = { make: "제작", revise: "검수 반영", tile: "한 장 제작", productcut: "제품 컷", plan: "기획안", resume: "이어서 하기", custom: "AI 작업" };
const runTitle = (mode, name, s) => `${MODE_LABEL[mode] || "AI 작업"}${s && s.tile ? " " + s.tile + (s.op === "insert" ? " 뒤에 추가" : " 다시") : ""} — ${name}`;
const tileByN = n => App.tiles.find(t => t.n === n) || null;
/* 가벼운 AI 작업(오타·피드백·경쟁사·PSD) 끝날 때까지 기다린다 */
async function waitJob(kind, name, onTick) {
  const t0 = Date.now();
  for (;;) {
    await sleep(1800);
    let j; try { j = await Local.job(kind, name); } catch (e) { if (Date.now() - t0 > 20 * 60000) return { error: "응답이 없습니다" }; continue; }
    if (onTick) onTick(j);
    if (!j.running) { if (j.error && (j.needLogin || Login.is(j.error))) { j.loginHandled = true; Login.prompt(); } return j; }
  }
}
const jobFail = (title, j) => j.loginHandled ? null : UI.alert(title, esc(j.error), "d");
/* 검수 내용을 먼저 저장하고 프로젝트를 다시 읽는다 (서버 파일이 바뀐 뒤) */
async function reloadProject() { if (!FS.name) return false; clearTimeout(Review._svT); await FS.saveReviewFile(); return FS.load(FS.name, true); }
const grow = (b, k) => { const px = b.h * (k == null ? .35 : k); const x = clamp(b.x - px * .6, 0, 1), y = clamp(b.y - px, 0, 1); return { x: +x.toFixed(4), y: +y.toFixed(4), w: +clamp(b.w + px * 1.2, .01, 1 - x).toFixed(4), h: +clamp(b.h + px * 2, .01, 1 - y).toFixed(4) }; };

/* ═══ Claude 로그인 만료 → 안내창 → 브라우저 로그인 → 자동 확인 (+ Higgsfield 인증까지) ═══ */
const Login = {
  busy: false,
  is(msg) { return /로그인이 만료|로그인이 풀렸|로그인이 필요|failed to authenticate|session expired|could not be refreshed/i.test(String(msg || "")); },
  async prompt() {
    if (this.busy || !Local.desktop) return false; this.busy = true;
    try {
      const v = await UI.dialog({ title: "Claude 로그인이 만료됐습니다", sub: "사진 분석·제작·오타 검사 같은 AI 기능은 Claude 로그인이 있어야 돌아갑니다. [다시 로그인] 을 누르면 브라우저가 열리고, 로그인만 끝내면 콘솔이 알아서 확인합니다.", icon: "lock", tone: "w",
        buttons: [{ label: "나중에", value: 0 }, { label: "다시 로그인", value: 1, kind: "pri" }] });
      if (v !== 1) return false;
      try { await Local.toolAct("login-claude"); } catch (e) { UI.alert("로그인을 시작하지 못했습니다", esc(e.message), "d"); return false; }
      UI.toast("브라우저에서 로그인을 마치세요 — 끝나면 자동으로 확인합니다");
      for (let i = 0; i < 80; i++) {
        await sleep(3000); let t; try { t = await Local.tools(); } catch (e) { continue; }
        if (!(t.claude && t.claude.loggedIn)) continue;
        UI.toast(`Claude 로그인 완료${t.claude.email ? " — " + t.claude.email : ""}`, "o"); Usage.load(true);
        if (!(t.higgsfield.connected && t.higgsfield.authed)) {
          const h = await UI.confirm("Higgsfield 인증도 해주세요", "이미지 생성(제작·수정·제품 컷)에 필요합니다. 버튼을 누르면 브라우저에서 인증만 하면 됩니다.", { ok: "Higgsfield 인증", tone: "w", cancel: "나중에" });
          if (h) { try { await Local.toolAct(t.higgsfield.connected ? "auth-mcp" : "add-mcp"); UI.toast("브라우저에서 Higgsfield 인증을 마치세요"); } catch (e) { UI.toast(e.message, "w"); } }
        }
        return true;
      }
      UI.toast("로그인 확인이 안 됩니다 — 설정 → 연결에서 다시 확인하세요", "w"); return false;
    } finally { this.busy = false; }
  }
};

/* ═══ 가독성 (#25): Windows OCR 줄 박스 → 모바일(390px) 글자 크기 · 배경 대비 ═══ */
const Read = {
  cache: {},
  async doc(t) {
    if (!t || !Local.ok) return null; if (this.cache[t.f]) return this.cache[t.f];
    try { const j = await Local.ocr(FS.name, [t.n]); const d = j.tiles && j.tiles[t.n]; if (d && d.ok) { this.cache[t.f] = d; return d; } } catch (e) {}
    return null;
  },
  async all() {
    try { const j = await Local.ocr(FS.name); App.tiles.forEach(t => { const d = j.tiles && j.tiles[t.n]; if (d && d.ok) this.cache[t.f] = d; }); return true; }
    catch (e) { UI.toast("글자 위치를 읽지 못했습니다: " + e.message, "w"); return false; }
  },
  valid(l) { return String(l.text || "").replace(/[^0-9A-Za-z가-힣]/g, "").length >= 2 && l.h >= 6; },
  issues(t) {
    const doc = this.cache[t.f]; if (!doc) return null;
    const out = [], k = 390 / doc.w;
    doc.lines.forEach(l => {
      if (!this.valid(l)) return;
      const fpx = Math.round(l.h * 1.1 * k * 10) / 10, large = fpx >= 18, need = large ? 3 : SET.readContrast;
      const sz = fpx < SET.readPx - 2 ? "d" : fpx < SET.readPx ? "w" : "";
      const c = l.contrast, lo = c == null ? "" : c < need * .67 ? "d" : c < need ? "w" : "";
      if (!sz && !lo) return;
      out.push({ id: l.id, text: l.text, fpx, c, sz, lo, lv: sz === "d" || lo === "d" ? "d" : "w", box: { x: l.x / doc.w, y: l.y / doc.h, w: l.w / doc.w, h: l.h / doc.h } });
    });
    return out;
  },
  label(i) { return [i.sz ? `모바일 글자 약 ${i.fpx}px` : "", i.lo ? `대비 ${i.c}:1` : ""].filter(Boolean).join(" · "); },
  request(i) { return [i.sz ? `모바일(390px 폭)에서 이 글자가 약 ${i.fpx}px 로 작습니다 — 글자 크기를 키워주세요` : "", i.lo ? `배경과 글자 대비가 ${i.c}:1 로 낮습니다 — 톤은 유지하고 글자색이나 배경을 조정해 대비를 높여주세요` : ""].filter(Boolean).join(". "); }
};

/* ═══ 오타 검사 (#4) ═══ */
const Typo = {
  running: false,
  of(t) { const ty = FS.typo, r = ty && ty.tiles && ty.tiles[t.n]; return r ? Object.assign({ fresh: r.mtime === t.mtime }, r) : null; },
  count() { let n = 0; App.tiles.forEach(t => { const r = this.of(t); if (r && r.fresh) n += (r.issues || []).length; }); return n; },
  needed() { return App.tiles.some(t => { const r = this.of(t); return !r || !r.fresh; }); },
  async run() {
    if (!Local.desktop) return UI.toast("EXE 에서만 됩니다", "w");
    if (this.running) return UI.toast("이미 검사 중입니다 — 끝나면 알려드립니다");
    if (!App.tiles.length) return UI.toast("타일이 없습니다", "w");
    const ok = await UI.confirm("오타 자동 검사", `타일 ${App.tiles.length}장의 글자 위치를 읽고(Windows OCR, 무료) AI 가 이미지를 직접 보고 오타·맞춤법·깨진 글자·기획 카피와 다른 곳을 찾습니다. 1~3분 · Max 사용량을 조금 씁니다.`, { ok: "검사 시작", tone: "b" });
    if (!ok) return;
    try { await Local.typo(FS.name); } catch (e) { return UI.alert("오타 검사를 시작하지 못했습니다", esc(e.message), "d"); }
    const name = FS.name; this.running = true; this.paintBtn(); UI.toast(`AI 가 타일 ${App.tiles.length}장을 한 글자씩 읽는 중… 다른 작업을 하셔도 됩니다`);
    const j = await waitJob("typo", name);
    this.running = false;
    if (j.error) { this.paintBtn(); return jobFail("오타 검사 실패", j); }
    if (FS.name === name) await reloadProject();
    const n = (j.data && j.data.count) || 0;
    UI.toast(n ? `${name}: 오타 의심 ${n}건 — 검수 화면에 주황 점선으로 표시했습니다` : `${name}: 오타 검사 완료 — 이상 없음`, n ? "w" : "o");
    if (FS.name === name) { Review.showTypo = true; if (App.view === "review") Review.refresh(); else if (App.view === "tiles") go("tiles"); else renderSide(); }
  },
  paintBtn() { const b = $("#rvTypo"); if (b) { b.disabled = this.running; b.innerHTML = this.running ? `${svg("refresh", "spin")} 검사 중…` : `${svg("spell")} 오타 검사`; } }
};

/* ═══ 사용량 계기판 (#11) ═══ */
const Usage = {
  data: null, timer: null,
  async load(force) { if (!Local.desktop) return null; try { this.data = await Local.usage(force); } catch (e) {} this.paint(); return this.data; },
  cls(p) { return p >= 85 ? "d" : p >= 60 ? "w" : ""; },
  line() {
    const d = this.data; if (!d) return "";
    const c = d.claude || {}, h = d.hf || {};
    return [c.ok && c.five ? `Max 5시간 창 ${c.five.pct}%` : "", c.ok && c.week ? `주간 ${c.week.pct}%` : "", h.ok ? `Higgsfield ${fmtNum(h.credits)} 크레딧` : ""].filter(Boolean).join(" · ");
  },
  warn() { const c = (this.data || {}).claude || {}; return c.ok && ((c.five && c.five.pct >= 85) || (c.week && c.week.pct >= 90)); },
  resetAt(s) { if (!s) return ""; const d = new Date(s); if (isNaN(d)) return ""; const same = d.toDateString() === new Date().toDateString(); return (same ? "" : `${d.getMonth() + 1}/${d.getDate()} `) + `${pad2(d.getHours())}:${pad2(d.getMinutes())} 리셋`; },
  paint() {
    const f = $("#sideFoot"); if (!f || !Local.desktop) return; const d = this.data;
    f.onclick = () => this.open();
    if (!d) { f.innerHTML = `<button class="umeter">${svg("gauge")}<span class="hint" style="margin:0">사용량 확인 중…</span></button>`; return; }
    const c = d.claude || {}, h = d.hf || {}, q = d.queue || {};
    const bar = (lbl, w) => w ? `<span class="umr"><small>${lbl}</small><i class="ubar ${this.cls(w.pct)}"><b style="width:${clamp(w.pct, 0, 100)}%"></b></i><em>${w.pct}%</em></span>` : "";
    f.innerHTML = `<button class="umeter" title="사용량 자세히 (클릭)">${c.ok ? bar("Max 5시간", c.five) + bar("Max 주간", c.week) : `<span class="umr"><small>Claude</small><em class="w">${esc(c.reason || "확인 불가")}</em></span>`}
      <span class="umr"><small>Higgsfield</small><em class="${h.ok ? "" : "w"}">${h.ok ? fmtNum(h.credits) + " 크레딧" : esc(h.reason || "확인 불가")}</em></span>
      ${q.waiting || q.running ? `<span class="umr"><small>대기열</small><em>${q.running ? "실행 " + q.running + " · " : ""}대기 ${q.waiting}</em></span>` : ""}</button>`;
  },
  start() { if (!Local.desktop) return; this.paint(); this.load(); clearInterval(this.timer); this.timer = setInterval(() => this.load(), 120000); },
  async open() {
    const d = await this.load(true); if (!d) return UI.toast("사용량을 읽지 못했습니다", "w");
    const c = d.claude || {}, h = d.hf || {}, L = d.local || {}, m = L.month || {}, td = L.today || {};
    const card = (t, b, e, p) => `<div class="ucard"><small>${t}</small><b>${b}</b>${p != null ? `<i class="ubar ${this.cls(p)}"><b style="width:${clamp(p, 0, 100)}%"></b></i>` : ""}<em>${e || ""}</em></div>`;
    UI.dialog({ title: "사용량", sub: "Claude Max 창 · Higgsfield 크레딧 · 이 PC 의 이번 달 기록", icon: "gauge", tone: "b", wide: true,
      body: `<div class="ugrid">
        ${c.ok ? card("Claude Max · 5시간 창", (c.five ? c.five.pct : "—") + "%", c.five ? this.resetAt(c.five.resetsAt) : "", c.five && c.five.pct) + card("Claude Max · 주간", (c.week ? c.week.pct : "—") + "%", c.week ? this.resetAt(c.week.resetsAt) : "", c.week && c.week.pct) : card("Claude", "—", esc(c.reason || "확인 불가"))}
        ${c.ok && c.extra ? card("추가 사용량", c.extra.on ? "켜짐" : "꺼짐", c.extra.on ? `사용 ${fmtNum(c.extra.used)} / 한도 ${fmtNum(c.extra.limit)}` : "한도에 닿으면 다음 창까지 멈춤") : ""}
        ${card("Higgsfield 잔여", h.ok ? fmtNum(h.credits) : "—", h.ok ? "크레딧" : esc(h.reason || "확인 불가"))}
      </div>
      <h4 class="h4">이번 달 · 이 PC 기록</h4>
      <dl class="kv"><dt>AI 작업</dt><dd>${fmtNum(m.runs)}회 (완료 ${fmtNum(m.ok)}) · 오늘 ${fmtNum(td.runs)}회</dd><dt>이미지 생성·편집 호출</dt><dd>${fmtNum(m.gen)}회 · 오늘 ${fmtNum(td.gen)}회</dd><dt>AI 작업 시간</dt><dd>${fmtDur((m.min || 0) * 60)}</dd></dl>
      ${(L.byProject || []).length ? `<table class="utab"><tr><th>프로젝트</th><th>작업</th><th>이미지 호출</th></tr>${L.byProject.map(p => `<tr><td>${esc(p.name)}</td><td>${p.runs}</td><td>${p.gen}</td></tr>`).join("")}</table>` : ""}
      <p class="hint" style="margin-top:10px">Max 창 % 는 claude.ai 설정 → 사용량과 같은 값입니다. 5시간 창이 85% 를 넘으면 작업이 중간에 멈출 수 있으니 대기열·야간 예약을 쓰세요. 멈춰도 <b>이어서 하기</b>로 만든 타일은 그대로 두고 이어집니다.</p>`,
      buttons: [{ label: "닫기", value: 0, kind: "pri" }] });
  }
};

/* ═══ 작업 기록 타임라인 (#28) ═══ */
const TL_IC = { run: "sparkles", done: "check", fail: "warn", export: "down", restore: "history", photo: "photo", project: "folder", queue: "clock", check: "spell", feedback: "inbox", ai: "sparkles", stage: "kanban", note: "doc" };
function tlHtml(items, withProj) {
  if (!items || !items.length) return `<p class="hint">아직 기록이 없습니다. 제작·수정·내보내기를 하면 자동으로 쌓입니다.</p>`;
  let day = "";
  return `<div class="tl">` + items.map(x => {
    const d = new Date(x.t), ds = d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
    const hd = ds !== day ? (day = ds, `<div class="tld">${esc(ds)}</div>`) : "";
    return hd + `<div class="tli k-${esc(x.k)}"><span class="tic">${svg(TL_IC[x.k] || "doc")}</span><span class="ttm">${pad2(d.getHours())}:${pad2(d.getMinutes())}</span><span class="ttx">${withProj && x.p ? `<b>${esc(x.p)}</b> · ` : ""}${esc(x.x)}</span>${(x.file || x.dir) && x.p ? `<button class="btn sm ghost" data-tfile="${esc(x.file || "")}" data-tdir="${esc(x.dir || "")}" data-tp="${esc(x.p)}">${svg("ext")} 열기</button>` : ""}</div>`;
  }).join("") + `</div>`;
}
async function tlClick(e) {
  const b = e.target.closest("[data-tp]"); if (!b) return false;
  try { if (b.dataset.tfile) await Local.toolAct("open-file", { name: b.dataset.tp, file: b.dataset.tfile }); else await Local.toolAct("open-folder", { name: b.dataset.tp, sub: b.dataset.tdir }); } catch (err) { UI.toast(err.message, "w"); }
  return true;
}

/* ═══ 대기열 + 야간 배치 (#14) ═══ */
const Q_ST = { waiting: "대기", running: "실행 중", done: "완료", failed: "실패" };
const QueueUI = {
  items: [], conc: 1,
  async load() { if (!Local.desktop) return []; try { const j = await Local.queue(); this.items = j.items || []; this.conc = j.conc || 1; } catch (e) { this.items = []; } return this.items; },
  html() {
    if (!this.items.length) return "";
    const act = (it, k, lbl, ic) => `<button class="btn sm ghost" data-q="${k}" data-qid="${it.id}" title="${lbl}">${ic ? svg(ic) : ""}${ic ? "" : lbl}</button>`;
    return `<div class="qpanel"><div class="qh">${svg("clock")}<b>대기열</b><span class="hint" style="margin:0">순서대로 한 번에 ${this.conc}개씩 · 창을 닫아도 트레이에서 돕니다</span><span class="sp"></span>${this.items.some(i => i.status === "done" || i.status === "failed") ? `<button class="btn sm ghost" data-q="clear">끝난 항목 지우기</button>` : ""}</div>
      ${this.items.map(it => `<div class="qrow s-${it.status}"><span class="qst">${Q_ST[it.status] || it.status}</span><span class="qtx"><b>${esc(it.name)}</b><small>${esc(MODE_LABEL[it.mode] || it.mode)}${it.tile ? " · " + esc(it.tile) + (it.op === "insert" ? " 뒤에 추가" : "") : ""}${it.status === "waiting" && it.startAt ? " · " + fmtT(it.startAt) + " 예약" : ""}${it.info ? " · " + esc(it.info) : ""}${it.error ? " · " + esc(it.error).slice(0, 80) : ""}</small></span>
        ${it.status === "waiting" ? act(it, "now", "지금 시작") + act(it, "up", "위로", "chevU") + act(it, "down", "아래로", "chev") + act(it, "remove", "빼기", "x") : ""}
        ${it.status === "failed" ? act(it, "retry", "이어서 재시도") + act(it, "remove", "빼기", "x") : ""}
        ${it.status === "running" ? act(it, "watch", "보기") : ""}${it.status === "done" ? act(it, "open", "열기") + act(it, "remove", "빼기", "x") : ""}</div>`).join("")}</div>`;
  },
  async click(e) {
    const b = e.target.closest("[data-q]"); if (!b) return false;
    const k = b.dataset.q, id = b.dataset.qid, it = this.items.find(x => x.id === id);
    try {
      if (k === "watch" && it) { RunUI.show(runTitle(it.mode, it.name, it), it.name, it.mode); return true; }
      if (k === "open" && it) { if (await FS.load(it.name, false)) go("review"); return true; }
      await Local.queueAct(k, id); UI.toast(k === "now" ? "곧 시작합니다" : k === "retry" ? "이어서 하기로 다시 대기합니다" : "반영했습니다", "o");
    } catch (err) { UI.toast(err.message, "w"); }
    await this.load(); if (App.view === "projects") go("projects"); Usage.load(); return true;
  }
};
/* 대기열에 넣을 때: 지금 순서대로 / 오늘 밤 / 직접 */
async function askWhen(what) {
  const now = new Date(), night = new Date(now); night.setHours(2, 0, 0, 0); if (night <= now) night.setDate(night.getDate() + 1);
  const local = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  const v = await UI.dialog({ title: "대기열에 넣기", sub: `${esc(what)} — 앞 작업이 끝나면 차례로 돌고, 끝나면 알림이 옵니다. 창을 닫아도 트레이에서 계속합니다.`, icon: "clock", tone: "b",
    body: `<div class="pmpick"><button class="pm" data-w="0"><b>지금 순서대로</b><small>앞 작업이 없으면 바로 시작합니다.</small></button><button class="pm" data-w="${night.getTime()}"><b>오늘 밤 ${night.getDate() !== now.getDate() ? "(내일) " : ""}2시</b><small>퇴근 전에 걸어두고 아침에 검수. Max 사용량 창을 낮 작업과 나눕니다.</small></button></div>
      <div class="fld" style="margin-top:12px"><label>직접 정하기</label><div style="display:flex;gap:6px"><input type="datetime-local" id="qWhen" value="${local(new Date(now.getTime() + 3600e3))}" style="flex:1"><button class="btn" data-w="pick">이 시각에</button></div></div>`,
    buttons: [{ label: "취소", value: null }], onOpen(d) { $$("[data-w]", d).forEach(b => b.onclick = () => { if (b.dataset.w === "pick") { const t = new Date($("#qWhen", d).value).getTime(); UI._close(isNaN(t) ? 0 : t); } else UI._close(+b.dataset.w); }); } });
  return v == null ? null : +v;
}
async function enqueue(b, what) {
  const when = await askWhen(what); if (when == null) return false;
  try { const j = await Local.queueAdd(Object.assign({ name: FS.name, photoMode: photoModeOf() }, b, { startAt: when })); UI.toast(j.message || "대기열에 넣었습니다", "o"); Usage.load(); await QueueUI.load(); return true; }
  catch (e) { UI.alert("대기열에 넣지 못했습니다", esc(e.message), "d"); return false; }
}

/* ═══ 제품 컷 A/B 비교 승인 (#1) ═══ */
const Cut = {
  meta(c) { return ((FS.cutsMeta || {}).cuts || []).find(x => x.file === c.name) || {}; },
  orig(c) { const m = this.meta(c); return (FS.images || []).find(i => i.name === m.from) || (FS.images || [])[0] || null; },
  box() {
    if (!Local.desktop || !(FS.images || []).length) return "";
    const cuts = FS.cuts || [], ap = FS.approved;
    const head = `<div class="pcut-h">${svg("layers")}<b>제품 컷 먼저 확인</b><span class="tag ${ap ? "ok" : "n"}">${ap ? "승인됨 · 본 제작에 사용" : "권장"}</span><span class="sp"></span>${cuts.length ? `<button class="btn sm ghost" data-cut="more">${svg("refresh")} 다시 만들기</button>` : ""}</div>`;
    if (!cuts.length) return `<div class="pcut">${head}<p class="hint" style="margin:6px 0 10px">AI 고화질 재현 제품 컷(누끼·연출 2장)을 먼저 만들어 <b>원본과 나란히</b> 보고 승인합니다. 승인한 컷은 본 제작에서 그대로 합성해 라벨·로고가 틀리는 사고를 제작 <b>전에</b> 막습니다. (이미지 약 2장 분량)</p><button class="btn sm pri" data-cut="make">${svg("sparkles")} 제품 컷 만들기</button></div>`;
    return `<div class="pcut">${head}<div class="cutgrid">${cuts.map(c => { const m = this.meta(c), o = this.orig(c), on = ap && ap.file === c.name;
      return `<div class="cutc${on ? " ok" : ""}"><div class="cutab" data-cut="cmp" data-f="${esc(c.name)}" title="크게 비교"><figure>${o ? `<img src="${o.url}" alt="">` : ""}<figcaption>원본</figcaption></figure><figure><img src="${c.url}" alt=""><figcaption>${esc(m.kind || c.name.replace(/\.[^.]+$/, ""))}</figcaption></figure></div>
        ${m.check ? `<p class="cutchk">${esc(m.check)}</p>` : ""}
        <div class="cutb"><button class="btn sm" data-cut="cmp" data-f="${esc(c.name)}">${svg("eye")} 크게 비교</button>${on ? `<button class="btn sm" data-cut="unok">승인 취소</button>` : `<button class="btn sm pri" data-cut="ok" data-f="${esc(c.name)}">${svg("check")} 승인</button>`}<button class="btn sm ghost" data-cut="del" data-f="${esc(c.name)}" title="빼기">${svg("trash")}</button></div></div>`; }).join("")}</div>
      <p class="hint" style="margin:8px 0 0">${ap ? `<b>${esc(ap.file)}</b> 를 본 제작에 씁니다. 로고·라벨 글자·형태가 원본과 같은지 확인하셨죠?` : "로고·라벨 글자·형태가 원본과 같은 컷을 <b>승인</b>하세요. 다르면 다시 만들기."}</p></div>`;
  },
  paint() { const b = $("#pcut"); if (b) b.innerHTML = this.box(); },
  async act(k, f) {
    const c = (FS.cuts || []).find(x => x.name === f);
    if (k === "make" || k === "more") return ACT.productCut(k === "more");
    if (k === "cmp" && c) return this.compare(c);
    if (k === "ok" && c) return this.approve(c);
    if (k === "unok") { try { await Local.save(FS.name, "product/approved.json", JSON.stringify({ file: "", at: new Date().toISOString() })); } catch (e) {} FS.approved = null; this.paint(); return UI.toast("승인을 취소했습니다"); }
    if (k === "del" && c) { if (!(await UI.confirm("이 컷을 뺄까요?", `${esc(c.name)} 은 _trash 로 옮겨집니다.`, { ok: "빼기", danger: true }))) return; try { await Local.deleteFile(FS.name, c.name, "product"); if (FS.approved && FS.approved.file === c.name) await Local.save(FS.name, "product/approved.json", JSON.stringify({ file: "" })); await reloadProject(); this.paint(); } catch (e) { UI.toast(e.message, "w"); } }
  },
  async approve(c) {
    const m = this.meta(c);
    try { await Local.save(FS.name, "product/approved.json", JSON.stringify({ file: c.name, from: m.from || "", at: new Date().toISOString() }, null, 2)); FS.approved = { file: c.name, from: m.from || "" }; Local.logAdd(FS.name, "check", `제품 컷 승인 — ${c.name}`); this.paint(); UI.toast("승인했습니다 — 본 제작에서 이 컷을 그대로 씁니다", "o"); }
    catch (e) { UI.alert("저장 실패", esc(e.message), "d"); }
  },
  async compare(c) {
    const o = this.orig(c), m = this.meta(c), origs = FS.images || [];
    const v = await UI.dialog({ title: "원본 ↔ AI 제품 컷", sub: "로고·라벨 글자(한 글자씩)·형태·색이 같은지 보세요. 겹쳐 보기에서 막대를 끌면 경계가 움직입니다.", icon: "eye", tone: "b", wide: true,
      body: `<div class="abhead"><div class="seg" id="abMode"><button class="on" data-m="side">나란히</button><button data-m="over">겹쳐 보기</button></div><label class="hint" style="margin:0">원본 <select id="abOrig">${origs.map(i => `<option value="${esc(i.url)}"${o && i.url === o.url ? " selected" : ""}>${esc(i.name)}</option>`).join("")}</select></label></div>
        <div class="abw side" id="abw"><figure class="aa"><img id="abA" src="${o ? o.url : ""}" alt=""><figcaption>원본</figcaption></figure><figure class="bb"><img id="abB" src="${c.url}" alt=""><figcaption>${esc(m.kind || c.name)}</figcaption></figure><i class="abar" id="abBar"></i></div>
        <input type="range" id="abR" min="0" max="100" value="50" hidden>${m.check ? `<p class="hint" style="margin-top:8px">AI 대조 메모: ${esc(m.check)}</p>` : ""}`,
      buttons: [{ label: "닫기", value: 0 }, { label: "다시 만들기", value: 2 }, { label: "승인", value: 1, kind: "pri" }],
      onOpen(d) {
        const w = $("#abw", d), r = $("#abR", d), set = () => { w.style.setProperty("--ab", r.value + "%"); };
        $("#abMode", d).onclick = e => { const b = e.target.closest("[data-m]"); if (!b) return; $$("#abMode button", d).forEach(x => x.classList.toggle("on", x === b)); w.className = "abw " + b.dataset.m; r.hidden = b.dataset.m !== "over"; set(); };
        r.oninput = set; set();
        w.addEventListener("pointermove", e => { if (!w.classList.contains("over") || !(e.buttons & 1)) return; const bx = w.getBoundingClientRect(); r.value = clamp(Math.round((e.clientX - bx.left) / bx.width * 100), 0, 100); set(); });
        $("#abOrig", d).onchange = e => { $("#abA", d).src = e.target.value; };
        $$("img", w).forEach(im => im.ondblclick = () => UI.lightbox(im.src));
      } });
    if (v === 1) return this.approve(c);
    if (v === 2) return ACT.productCut(true);
  }
};

/* ═══ 경쟁사 상세페이지 분석 (#19) ═══ */
const Ref = {
  running: false,
  box() {
    const r = FS.ref, b = App.brief.ref || {}, refs = (FS.refs || []).filter(i => !/^web\d+_/.test(i.name));
    if (!Local.desktop) return "";
    const list = (t, a) => a && a.length ? `<div class="rfl"><b>${t}</b><ul>${a.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : "";
    return `<div class="refc"><div class="pcut-h">${svg("globe")}<b>경쟁사 상세페이지 참고</b><span class="tag n">선택</span></div>
      <p class="hint" style="margin:4px 0 8px">같은 카테고리 상위 상품 페이지 URL 을 넣거나(최대 3개) 캡처를 올리면, 구성·설득 흐름·빈틈을 분석해 우리 페이지 구성에 반영합니다. 문구·이미지는 베끼지 않습니다.</p>
      <div class="rfu">${[1, 2, 3].map(i => `<input type="text" data-k="ref.u${i}" data-notab value="${esc(b["u" + i] || "")}" placeholder="https:// 경쟁사 상품 페이지 ${i}">`).join("")}</div>
      <div class="rfs">${refs.map(i => `<div class="rfsh"><img src="${i.url}" alt="" data-lb="${i.url}"><button class="shx" data-ref="del" data-f="${esc(i.name)}" title="빼기">${svg("x")}</button></div>`).join("")}
        <button class="btn sm" data-ref="add">${svg("plus")} 캡처 올리기</button><button class="btn sm ghost" data-ref="paste">${svg("copy")} 붙여넣기</button></div>
      <div style="display:flex;gap:6px;align-items:center;margin-top:8px"><button class="btn sm pri" data-ref="run"${this.running ? " disabled" : ""}>${this.running ? svg("refresh", "spin") + " 분석 중…" : svg("sparkles") + " 분석하기"}</button><span class="hint" style="margin:0">${this.running ? "페이지를 열어 캡처하고 AI 가 읽는 중입니다 (1~2분)" : "로그인이 필요한 페이지는 캡처를 올려주세요"}</span></div>
      ${r && r.summary ? `<div class="rfr"><p><b>요약</b> ${esc(r.summary)}</p>${list("경쟁사 흐름", r.flow)}${list("잘한 점", r.strengths)}${list("빈틈 — 우리가 파고들 곳", r.gaps)}${list("우리 페이지에 적용할 아이디어", r.ideas)}${list("차별화 메시지", r.differ)}${list("피할 것", r.avoid)}
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${(r.sections || []).length ? `<button class="btn sm" data-ref="sec">${svg("check")} 추천 섹션 구성에 반영 (${r.sections.map(id => (catOf(id) || {}).label || id).join(", ")})</button>` : ""}<button class="btn sm" data-ref="idea">${svg("edit")} 아이디어를 요청사항에 넣기</button></div>
        <p class="hint" style="margin:6px 0 0">${fmtT(Date.parse(r.at))} 분석 · 제작 시 지시서에 함께 들어갑니다.</p></div>` : ""}</div>`;
  },
  paint() { const b = $("#refbox"); if (b) b.innerHTML = this.box(); },
  async act(k, f) {
    if (k === "add") { let inp = $("#refPick"); if (!inp) { inp = el("input"); inp.type = "file"; inp.id = "refPick"; inp.multiple = true; inp.accept = "image/*"; inp.hidden = true; document.body.appendChild(inp); } inp.value = ""; inp.onchange = async () => { let n = 0; for (const fl of inp.files) { try { await Local.addRef(FS.name, fl.name, fl); n++; } catch (e) { UI.toast(e.message, "w"); } } if (n) { await reloadProject(); this.paint(); UI.toast(`캡처 ${n}장 올렸습니다`, "o"); } }; inp.click(); return; }
    if (k === "paste") { try { const j = await Local.pasteClip(FS.name, "ref"); await reloadProject(); this.paint(); UI.toast(`캡처 ${j.files.length}장 붙여넣었습니다`, "o"); } catch (e) { UI.toast(/이미지가 없습니다/.test(e.message) ? "클립보드에 이미지가 없습니다" : e.message, "w"); } return; }
    if (k === "del") { try { await Local.deleteFile(FS.name, f, "ref"); await reloadProject(); this.paint(); } catch (e) { UI.toast(e.message, "w"); } return; }
    if (k === "sec") { const r = FS.ref || {}; const cur = new Set(layoutSel()); (r.sections || []).forEach(id => { if (catOf(id)) cur.add(id); }); App.brief.layout = { sections: CATALOG.filter(c => cur.has(c.id)).map(c => c.id) }; App.saveBrief(); ACT.saveBrief(true); go("brief"); setTimeout(() => openCard("layout", true), 60); return UI.toast("추천 섹션을 구성에 넣었습니다", "o"); }
    if (k === "idea") { const r = FS.ref || {}; const add = [...(r.ideas || []).map(x => "· " + x), ...(r.differ || []).map(x => "· 차별화: " + x)].join("\n"); if (!add) return; App.brief.req = App.brief.req || {}; const cur = String(App.brief.req.etc || ""); if (cur.includes(add.slice(0, 30))) return UI.toast("이미 넣었습니다"); App.brief.req.etc = (cur.trim() ? cur.trim() + "\n" : "") + "[경쟁사 분석에서]\n" + add; App.saveBrief(); ACT.saveBrief(true); go("brief"); setTimeout(() => openCard("req", true), 60); return UI.toast("요청사항에 넣었습니다 — 필요 없는 줄은 지우세요", "o"); }
    if (k === "run") return this.run();
  },
  async run() {
    if (this.running) return;
    const b = App.brief.ref || {}, urls = [b.u1, b.u2, b.u3].map(x => String(x || "").trim()).filter(Boolean);
    const bad = urls.filter(u => !/^https?:\/\//i.test(u)); if (bad.length) return UI.toast("URL 은 https:// 로 시작해야 합니다", "w");
    try { await Local.ref(FS.name, urls, ""); } catch (e) { return UI.alert("분석을 시작하지 못했습니다", esc(e.message), "d"); }
    const name = FS.name; this.running = true; this.paint();
    const j = await waitJob("ref", name);
    this.running = false;
    if (j.error) { this.paint(); return jobFail("경쟁사 분석 실패", j); }
    if (FS.name === name) { await reloadProject(); this.paint(); }
    UI.toast("경쟁사 분석 완료 — 페이지 구성 카드 아래를 확인하세요", "o");
  }
};

/* ═══ 클라이언트 피드백 수신함 (#15): 붙여넣기 → AI 가 장별로 나눔 → 검수 영역·글자 교체로 ═══ */
const Feedback = {
  running: false,
  async open() {
    if (!App.tiles.length) return UI.toast("타일이 없습니다", "w");
    if (!Local.desktop) return UI.toast("EXE 에서만 됩니다", "w");
    if (this.running) return UI.toast("이전 피드백을 정리하는 중입니다");
    const v = await UI.dialog({ title: "클라이언트 피드백 붙여넣기", sub: "카톡·메일로 받은 글을 그대로 붙여넣으세요. 프리뷰의 [피드백 복사] 형식이든 자유 문장이든 됩니다.", icon: "inbox", tone: "b", wide: true,
      body: `<textarea id="fbText" style="min-height:220px" placeholder="예)\n3번째 장 '세차장 에어건' 문구를 '세차장 에어건을 집으로'로 바꿔주세요\n가격 48,900원 → 45,900원\n전체적으로 글씨가 작아요"></textarea><p class="hint" style="margin-top:8px">AI 가 몇 번째 장·어떤 문구인지 찾아 <b>글자 교체</b>(원래 글자 → 새 글자)와 <b>수정 요청</b>으로 나눕니다. 확인 후 검수에 넣고 바로 AI 수정까지 돌릴 수 있습니다.</p>`,
      buttons: [{ label: "취소", value: 0 }, { label: "장별로 정리하기", value: 1, kind: "pri" }], onOpen(d) { setTimeout(() => $("#fbText", d).focus(), 60); } });
    const text = ($("#fbText") && $("#fbText").value.trim()) || ""; if (v !== 1) return; if (!text) return UI.toast("붙여넣은 내용이 없습니다", "w");
    try { await Local.feedback(FS.name, text); } catch (e) { return UI.alert("정리하지 못했습니다", esc(e.message), "d"); }
    const name = FS.name; this.running = true; UI.toast("AI 가 피드백을 장별로 나누는 중… (30초~1분)");
    const j = await waitJob("feedback", name); this.running = false;
    if (j.error) return jobFail("피드백 정리 실패", j);
    if (FS.name !== name) { UI.toast(`${name} 피드백 정리 완료 — 그 프로젝트를 열면 확인할 수 있습니다`, "o"); return; }
    await reloadProject(); this.show(j.data);
  },
  async show(data) {
    data = data || FS.feedback; if (!data || !(data.items || []).length) { if (data && (data.general || []).length) return UI.alert("장별로 나눌 요청이 없습니다", esc(data.general.join(" / "))); return UI.toast("정리된 피드백이 없습니다", "w"); }
    const items = data.items.filter(it => tileByN(it.tile)).map(it => Object.assign({}, it));
    // 자동 인식(OCR) 글자가 틀렸으면 오타 검사에서 AI 가 읽은 그 줄의 글자로 바로잡는다
    items.forEach(it => { if (it.kind !== "text" || !it.line) return; const ty = Typo.of(tileByN(it.tile)), rl = ty && ty.fresh && ty.read ? ty.read[it.line] : ""; if (rl && !rl.includes(it.from)) it.from = rl; });
    const byTile = {}; items.forEach((it, i) => { (byTile[it.tile] = byTile[it.tile] || []).push(Object.assign({ i }, it)); });
    const copyTxt = [...(data.general || []).map(x => "· " + x), ...(data.questions || []).map(x => "? " + x)].join("\n");
    const v = await UI.dialog({ title: `피드백 ${items.length}건`, sub: "넣을 항목만 체크하세요. 글자 교체는 원래 글자와 새 글자를 고칠 수 있습니다.", icon: "inbox", tone: "o", wide: true,
      body: `<div class="fbwrap"><div class="fbl">${Object.keys(byTile).map(n => { const t = tileByN(n); return `<div class="fbt"><img src="${t.f}" alt=""><div class="fbi"><b>${esc(n)}${t.name ? ". " + esc(t.name) : ""}</b>${byTile[n].map(it => `<label class="fbrow"><input type="checkbox" data-fi="${it.i}" checked><span class="fbk ${it.kind}">${it.kind === "text" ? "글자 교체" : "수정"}</span>${it.kind === "text" ? `<span class="fbtx"><input type="text" data-ff="${it.i}" value="${esc(it.from)}"> → <input type="text" data-ft="${it.i}" value="${esc(it.to)}"></span>` : `<span class="fbtx">${esc(it.comment)}${it.box ? "" : " <small>(장 전체)</small>"}</span>`}</label>`).join("")}</div></div>`; }).join("")}</div>
        ${(data.general || []).length ? `<div class="note i" style="margin-top:10px">${svg("info")}<div class="nb"><b>장을 특정하지 않은 의견</b><br>${data.general.map(esc).join("<br>")}</div></div>` : ""}
        ${(data.questions || []).length ? `<div class="note w">${svg("warn")}<div class="nb"><b>고객에게 되물을 것</b><br>${data.questions.map(esc).join("<br>")}</div></div>` : ""}</div>`,
      buttons: [{ label: "닫기", value: 0 }].concat(copyTxt ? [{ label: "의견 복사", value: 3 }] : []).concat([{ label: "검수에 넣기", value: 1 }, { label: "넣고 바로 AI 수정", value: 2, kind: "pri" }]),
      onOpen(d) { const w = $(".fbwrap", d); if (!w) return; w.oninput = e => { const t = e.target; if (t.dataset.ff != null) items[+t.dataset.ff].from = t.value; if (t.dataset.ft != null) items[+t.dataset.ft].to = t.value; }; w.onchange = e => { const t = e.target; if (t.dataset.fi != null) items[+t.dataset.fi].off = !t.checked; }; } });
    if (v === 3) { try { await navigator.clipboard.writeText(copyTxt); UI.toast("복사했습니다", "o"); } catch (e) {} return; }
    if (v !== 1 && v !== 2) return;
    const n = this.apply(items.filter(it => !it.off));
    Local.logAdd(FS.name, "feedback", `클라이언트 피드백 ${n}건 검수에 반영`);
    UI.toast(`피드백 ${n}건을 검수에 넣었습니다`, "o");
    const first = items.find(it => !it.off); App.curTile = first ? first.tile : null; go("review");
    if (v === 2) setTimeout(() => ACT.revise(), 300);
  },
  apply(list) {
    let n = 0;
    list.forEach(it => {
      const r = App.review[it.tile] && Array.isArray(App.review[it.tile].regions) ? App.review[it.tile] : (App.review[it.tile] = { regions: (App.review[it.tile] || {}).regions || [], note: (App.review[it.tile] || {}).note || "" });
      if (it.kind === "text" && (it.to || "").trim()) {
        if (r.regions.some(g => g.kind === "text" && g.from === it.from && g.to === it.to)) return;
        const text = `글자 교체: "${it.from}" → "${it.to}"`;
        if (it.box && it.line) r.regions.push(Object.assign(grow(it.box), { kind: "text", from: it.from, to: it.to, text })); else r.note = (r.note ? r.note.replace(/\s+$/, "") + "\n" : "") + text;
      } else if ((it.comment || "").trim()) {
        if (it.box) r.regions.push(Object.assign({ x: it.box.x, y: it.box.y, w: it.box.w, h: it.box.h }, { text: it.comment })); else r.note = (r.note ? r.note.replace(/\s+$/, "") + "\n" : "") + it.comment;
      } else return;
      n++;
    });
    App.saveReview(); FS.saveReviewFile(); renderSide();
    return n;
  }
};

/* ═══ 내보내기: 클라이언트 프리뷰 · 채널별 이미지 (#5) · PSD (#6) ═══ */
const CH_DEF = [
  { id: "smartstore", label: "스마트스토어", dir: "스마트스토어", w: 860 },
  { id: "coupang", label: "쿠팡", dir: "쿠팡", w: 780 },
  { id: "11st", label: "11번가", dir: "11번가", w: 800 },
  { id: "gmarket", label: "G마켓·옥션", dir: "G마켓옥션", w: 860 },
  { id: "own", label: "자사몰", dir: "자사몰", w: 1000 },
  { id: "orig", label: "원본 크기", dir: "원본", w: 0 }
];
const Export = {
  async open() {
    if (!App.tiles.length) return UI.toast("내보낼 타일이 없습니다", "w");
    if (!Local.ok || !FS.name) return UI.alert("서버가 필요합니다", "EXE 로 실행한 상태에서만 내보낼 수 있습니다.", "w");
    const v = await UI.dialog({ title: "내보내기", sub: `타일 ${App.tiles.length}장 · 지금 왼쪽 메뉴 순서대로`, icon: "down", tone: "b", wide: true,
      body: `<div class="pmpick three"><button class="pm" data-x="html"><b>${svg("eye")} 클라이언트 프리뷰</b><small>HTML 한 파일. 받는 분이 모바일 폭으로 보고 장별 피드백을 적어 복사해 보냅니다.</small></button>
        <button class="pm" data-x="ch"><b>${svg("down")} 채널별 이미지</b><small>스마트스토어 860 · 쿠팡 780 등 폭에 맞춘 JPG 를 채널 폴더에 한 번에.</small></button>
        <button class="pm" data-x="psd"><b>${svg("layers")} PSD (글자 레이어)</b><small>타일 이미지 + 숨긴 편집용 텍스트 레이어. 글자만 바꿔달라는 요청을 포토샵으로.</small></button></div>`,
      buttons: [{ label: "닫기", value: 0 }], onOpen(d) { $$("[data-x]", d).forEach(b => b.onclick = () => UI._close(b.dataset.x)); } });
    if (v === "html") return ACT.exportPreview();
    if (v === "ch") return this.channels();
    if (v === "psd") return this.psd();
  },
  async channels() {
    const saved = Store.get("chanSel", ["smartstore"]), ws = Store.get("chanW", {}), mode0 = Store.get("chanMode", "each"), split0 = Store.get("chanSplit", 3000);
    const v = await UI.dialog({ title: "채널별 이미지 내보내기", sub: "채널 폴더(export/채널이름)에 JPG 로 저장합니다. 원본 타일은 손대지 않습니다.", icon: "down", tone: "b", wide: true,
      body: `<div class="chl">${CH_DEF.map(c => `<label class="chr"><input type="checkbox" data-ch="${c.id}"${saved.includes(c.id) ? " checked" : ""}><b>${esc(c.label)}</b>${c.w ? `<span class="numin"><input type="number" data-cw="${c.id}" value="${ws[c.id] || c.w}" min="300" max="3000" step="10"><em>px 폭</em></span>` : `<span class="hint" style="margin:0">타일 원래 크기</span>`}</label>`).join("")}</div>
        <div class="fld" style="margin-top:12px"><label>나누는 방식</label><div class="seg" id="chMode"><button data-m="each" class="${mode0 === "each" ? "on" : ""}">장별 (타일 1장 = 파일 1개)</button><button data-m="split" class="${mode0 === "split" ? "on" : ""}">이어붙인 뒤 높이로 자르기</button></div></div>
        <div class="row2"><label class="srow" style="border:0"><span><b>자를 높이</b><small>이어붙여 자르기일 때 파일 한 장 높이</small></span><span class="numin"><input type="number" id="chSplit" value="${split0}" min="800" max="20000" step="100"><em>px</em></span></label>
          <label class="srow" style="border:0"><span><b>JPG 품질</b><small>80~90 권장</small></span><span class="numin"><input type="number" id="chQ" value="${SET.jpegQ}" min="50" max="100" step="1"><em></em></span></label></div>
        <p class="hint">채널 권장 폭은 운영 정책에 따라 바뀔 수 있으니 필요하면 숫자를 고치세요(기억됩니다). 폭보다 작은 타일은 키우지 않고 원래 크기로 둡니다.</p>`,
      buttons: [{ label: "취소", value: 0 }, { label: "내보내기", value: 1, kind: "pri" }],
      onOpen(d) { $("#chMode", d).onclick = e => { const b = e.target.closest("[data-m]"); if (b) $$("#chMode button", d).forEach(x => x.classList.toggle("on", x === b)); }; } });
    if (v !== 1) return;
    const sel = $$("[data-ch]").filter(x => x.checked).map(x => x.dataset.ch); if (!sel.length) return UI.toast("채널을 하나 이상 고르세요", "w");
    const wmap = {}; $$("[data-cw]").forEach(x => { const n = clamp(parseInt(x.value, 10) || 860, 300, 3000); wmap[x.dataset.cw] = n; });
    const mode = ($("#chMode button.on") || {}).dataset ? $("#chMode button.on").dataset.m : "each", split = clamp(parseInt($("#chSplit").value, 10) || 3000, 800, 20000), q = clamp(parseInt($("#chQ").value, 10) || 82, 50, 100);
    Store.set("chanSel", sel); Store.set("chanW", wmap); Store.set("chanMode", mode); Store.set("chanSplit", split);
    await FS.saveManifest();
    UI.toast("이미지 만드는 중…");
    const done = [];
    try {
      for (const id of sel) { const c = CH_DEF.find(x => x.id === id); const n = await this.render(c, c.w ? wmap[id] || c.w : 0, mode, split, q / 100); done.push(`${c.label} ${n}장`); }
    } catch (e) { return UI.alert("내보내기 실패", esc(e.message), "d"); }
    Local.logAdd(FS.name, "export", `채널 이미지 — ${done.join(" · ")}`, "export");
    const r = await UI.dialog({ title: "채널 이미지를 만들었습니다", sub: done.join(" · "), icon: "check", tone: "o", body: `<p class="hint" style="margin:0">프로젝트 폴더의 <code>export\\채널이름</code> 에 있습니다.</p>`, buttons: [{ label: "닫기", value: 0 }, { label: "폴더 열기", value: 1, kind: "pri" }] });
    if (r === 1) { try { await Local.toolAct("open-folder", { name: FS.name, sub: sel.length === 1 ? "export/" + CH_DEF.find(x => x.id === sel[0]).dir : "export" }); } catch (e) {} }
  },
  async bitmap(t, W) {
    const b = await (await fetch(t.f, { cache: "no-store" })).blob();
    const full = await createImageBitmap(b);
    if (!W || full.width <= W) return full;
    const H = Math.round(full.height * W / full.width);
    const r = await createImageBitmap(full, { resizeWidth: W, resizeHeight: H, resizeQuality: "high" }); full.close && full.close(); return r;
  },
  async render(c, W, mode, split, q) {
    const dir = "export/" + c.dir; await Local.clearDir(FS.name, dir);
    const toJpg = cv => new Promise(res => cv.toBlob(res, "image/jpeg", q));
    const bms = []; for (const t of App.tiles) bms.push(await this.bitmap(t, W));
    let n = 0;
    try {
      if (mode === "each") {
        for (let i = 0; i < bms.length; i++) { const b = bms[i], cv = document.createElement("canvas"); cv.width = b.width; cv.height = b.height; const x = cv.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, cv.width, cv.height); x.drawImage(b, 0, 0); await Local.saveJpg(FS.name, `${dir}/${pad2(i + 1)}_${App.tiles[i].n}.jpg`, await toJpg(cv)); n++; }
      } else {
        const PW = W || Math.max(...bms.map(b => b.width)), hs = bms.map(b => Math.round(b.height * PW / b.width)), total = hs.reduce((a, b) => a + b, 0);
        for (let y0 = 0, k = 1; y0 < total; y0 += split, k++) {
          const h = Math.min(split, total - y0), cv = document.createElement("canvas"); cv.width = PW; cv.height = h; const x = cv.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, PW, h); x.imageSmoothingQuality = "high";
          let top = 0; bms.forEach((b, i) => { const bh = hs[i]; if (top + bh > y0 && top < y0 + h) x.drawImage(b, 0, top - y0, PW, bh); top += bh; });
          await Local.saveJpg(FS.name, `${dir}/상세_${pad2(k)}.jpg`, await toJpg(cv)); n++;
        }
      }
    } finally { bms.forEach(b => b.close && b.close()); }
    return n;
  },
  async psd() {
    if (!Local.desktop) return UI.toast("EXE 에서만 됩니다", "w");
    const hasTypo = !!FS.typo && !Typo.needed();
    const v = await UI.dialog({ title: "PSD 내보내기", sub: `타일 ${App.tiles.length}장 → export\\psd 에 장별 PSD`, icon: "layers", tone: "b",
      body: `<p style="margin:0 0 8px">레이어: <b>원본 타일</b>(픽셀 그대로) + <b>편집용 텍스트</b> 그룹(숨김). 글자 위치·크기·색을 자동으로 맞춰 둬서, 눈을 켜고 글자만 고친 뒤 원본 글자 부분을 지우면 됩니다.</p>
        <div class="note ${hasTypo ? "o" : "w"}">${svg(hasTypo ? "check" : "info")}<div class="nb">${hasTypo ? "오타 검사 결과가 있어 AI 가 읽은 정확한 글자로 텍스트 레이어를 만듭니다." : "오타 검사를 먼저 돌리면 텍스트 레이어에 AI 가 읽은 정확한 글자가 들어갑니다. 지금은 자동 인식 글자라 <b>(자동인식·확인)</b> 표시가 붙습니다."}</div></div>`,
      buttons: [{ label: "취소", value: 0 }].concat(hasTypo ? [] : [{ label: "오타 검사 먼저", value: 2 }]).concat([{ label: "PSD 만들기", value: 1, kind: "pri" }]) });
    if (v === 2) return Typo.run();
    if (v !== 1) return;
    try { await Local.psd(FS.name); } catch (e) { return UI.alert("PSD 를 시작하지 못했습니다", esc(e.message), "d"); }
    const name = FS.name; UI.toast("PSD 만드는 중… 장당 1~2초");
    const j = await waitJob("psd", name, s => { if (s.total) UI.toast(`PSD ${s.done}/${s.total}`); });
    if (j.error) return jobFail("PSD 실패", j);
    const r = await UI.dialog({ title: "PSD 를 만들었습니다", sub: `${(j.data || {}).count || 0}장`, icon: "check", tone: "o", body: `<p class="hint" style="margin:0"><code>export\\psd</code> 에 있습니다. 포토샵에서 열 때 '텍스트 레이어 업데이트' 를 누르세요.</p>`, buttons: [{ label: "닫기", value: 0 }, { label: "폴더 열기", value: 1, kind: "pri" }] });
    if (r === 1) { try { await Local.toolAct("open-folder", { name, sub: "export/psd" }); } catch (e) {} }
  }
};

/* ═══ 타일 버전 (#2) ═══ */
const VSRC = { history: "자동 백업", v_prev: "이전본", edits: "수정 시도" };
const Versions = {
  list(t) { return (FS.history || {})[t.n] || []; },
  html(t) {
    const vs = this.list(t);
    return `<h5>버전 <span class="cnt">${vs.length ? vs.length + "개" : ""}</span></h5>` + (!vs.length ? `<p class="hint" style="margin:0">아직 이전 버전이 없습니다. AI 로 다시 만들거나 수정하면 자동으로 쌓이고, 여기서 되돌릴 수 있습니다.</p>`
      : `<div class="vstrip"><div class="vth cur" title="지금 버전"><img src="${t.f}" alt=""><span>지금</span></div>${vs.map((v, i) => `<button class="vth" data-ver="${i}" title="${fmtT(v.at)} · ${esc(VSRC[v.src] || v.src)} — 눌러서 비교"><img src="${v.url}" alt="" loading="lazy"><span>${fmtT(v.at)}</span></button>`).join("")}</div>`);
  },
  async compare(t, i) {
    const v = this.list(t)[i]; if (!v) return;
    const r = await UI.dialog({ title: `${t.n} 버전 비교`, sub: `왼쪽 지금 · 오른쪽 ${fmtT(v.at)} (${esc(VSRC[v.src] || v.src)})`, icon: "history", tone: "b", wide: true,
      body: `<div class="vcmp"><figure><img src="${t.f}" alt=""><figcaption>지금</figcaption></figure><figure><img src="${v.url}" alt=""><figcaption>${fmtT(v.at)} · ${esc(VSRC[v.src] || v.src)}</figcaption></figure></div><p class="hint" style="margin-top:8px">이미지를 누르면 크게 봅니다. 되돌려도 지금 버전은 기록에 남아 다시 돌아올 수 있습니다.</p>`,
      buttons: [{ label: "닫기", value: 0 }, { label: "이 버전으로 되돌리기", value: 1, kind: "pri" }], onOpen(d) { $$(".vcmp img", d).forEach(im => im.onclick = () => UI.lightbox(im.src)); } });
    if (r !== 1) return;
    try { await Local.restore(FS.name, t.n, v.file); delete Read.cache[t.f]; await reloadProject(); UI.toast(`${t.n} 을(를) ${fmtT(v.at)} 버전으로 되돌렸습니다`, "o"); if (App.view === "review") Review.go(Review.cur); else go(App.view); }
    catch (e) { UI.alert("되돌리지 못했습니다", esc(e.message), "d"); }
  }
};

/* ═══ 튜토리얼 + 단축키 (#30) ═══ */
const KEYS = [["어디서나", [["?", "단축키 표"], ["Alt + 1~5", "홈 · 프로젝트 · 브리프 · 타일 · 검수"], ["Ctrl + V", "사진 붙여넣기 (글 입력 중이 아닐 때)"], ["F5", "새로 고침"], ["Esc", "창·확대 닫기"]]],
  ["타일", [["Ctrl + 휠 / + / −", "배율"], ["Ctrl + 0", "100%"], ["M", "모바일 프레임 켜기/끄기"], ["더블클릭", "그 장 검수로"]]],
  ["검수", [["← →  Enter", "이전 · 다음 장"], ["D", "영역 잡기"], ["T", "글자 수정 (원래 글자 자동 인식)"], ["Del", "선택한 영역 삭제"], ["휠 · 드래그 · 더블클릭", "확대 · 이동 · 맞춤↔100%"]]]];
function showKeys() {
  if ($(".ovl.on")) return;
  UI.dialog({ title: "단축키", icon: "keyboard", tone: "b", wide: true, body: `<div class="keys">${KEYS.map(([g, ks]) => `<div><h5>${g}</h5>${ks.map(([k, d]) => `<div class="krow"><span>${k.split(" ").map(x => /^[+/~·]$/.test(x) || x === "" ? esc(x) : `<kbd>${esc(x)}</kbd>`).join(" ")}</span><em>${esc(d)}</em></div>`).join("")}</div>`).join("")}</div>`,
    buttons: [{ label: "닫기", value: 0, kind: "pri" }] });
}
document.addEventListener("keydown", e => {
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || $(".ovl.on") || $(".lbx.on")) return;
  if (e.key === "?" && !e.ctrlKey && !e.altKey) { e.preventDefault(); showKeys(); return; }
  if (e.altKey && !e.ctrlKey && /^[1-5]$/.test(e.key)) { e.preventDefault(); go(["home", "projects", "brief", "tiles", "review"][+e.key - 1]); return; }
  if (App.view === "tiles" && (e.key === "m" || e.key === "M") && !e.ctrlKey && !e.altKey) { Tiles.mode = Tiles.mode === "mobile" ? "strip" : "mobile"; go("tiles"); }
});

/* ═══ 액션 ═══ */
const photoRows = () => FS.analysis.map(a => ({ name: a.name, w: a.w, h: a.h, size: a.size, orient: a.orient, resGrade: a.resGrade, bgSimple: a.bgSimple, palette: (a.pal || []).map(x => x.hex) }));
async function aiReady() {
  if (!Local.desktop) return { ok: false, why: "EXE 에서만 바로 실행됩니다" };
  let t; try { t = await Local.tools(); } catch (e) { return { ok: false, why: e.message }; }
  const mine = (t.runs || []).find(r => r.name === FS.name && r.running); if (mine) return { ok: false, why: "이 프로젝트는 이미 AI 작업 중입니다", running: true };
  if (!t.claude.installed) return { ok: false, why: "Claude Code 가 설치되지 않았습니다", fix: true };
  if (!t.claude.loggedIn) return { ok: false, why: "Claude 로그인이 만료됐습니다", fix: true, login: true };
  if (!t.higgsfield.connected || !t.higgsfield.authed) return { ok: false, why: "Higgsfield MCP 인증이 필요합니다", fix: true };
  return { ok: true };
}
const ACT = {
  gobrief() { go("brief"); }, gotiles() { go("tiles"); }, goreview() { go("review"); }, goprojects() { go("projects"); }, reconnect() { go("settings"); },
  async newproj() {
    if (!Local.ok) return UI.alert("서버가 없습니다", "<b>re-boot 콘솔.exe</b> 로 실행해야 합니다.", "w");
    const today = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const v = await UI.dialog({ title: "새 프로젝트", sub: "상품 이름만 정하면 됩니다. 사진은 다음 화면에서 끌어다 넣으세요.", icon: "plus", tone: "b",
      body: `<div class="fld"><label>상품 이름</label><input type="text" id="npName" placeholder="예: 벤딕트 에어건" maxlength="40"></div><p class="hint">폴더 이름은 <code>${today}_상품이름</code> 으로 만들어집니다. (날짜는 자동으로 붙으니 이름만)</p>`,
      buttons: [{ label: "취소", value: 0 }, { label: "만들기", value: 1, kind: "pri" }], onOpen(d) { const i = $("#npName", d); setTimeout(() => i.focus(), 60); i.onkeydown = e => { if (e.key === "Enter") UI._close(1); }; } });
    const nm = ($("#npName") && $("#npName").value.trim()) || ""; if (v !== 1) return; if (!nm) return UI.toast("상품 이름을 적어주세요", "w");
    const folder = /^\d{6}_/.test(nm) ? nm : `${today}_${nm}`;   // 이미 날짜가 붙어 있으면 다시 붙이지 않는다
    try { const j = await Local.createProject(folder); Local._projects = null; App.brief = {}; App.review = {}; await FS.load(j.name, true); Store.set("lastProject", j.name); UI.toast(j.existed ? "이미 있는 프로젝트를 열었습니다" : `${j.name} 만들었습니다 — 사진을 넣어주세요`, "o"); go("brief"); setTimeout(() => openCard("photos", true), 60); }
    catch (e) { UI.alert("만들지 못했습니다", esc(e.message), "d"); }
  },
  gophotos() { go("brief"); setTimeout(() => openCard("photos", true), 60); },
  pasteClip() { pasteFromClipboard(); },
  addPhotos() {
    if (!FS.name) return ACT.newproj();
    let inp = $("#photoPick"); if (!inp) { inp = el("input"); inp.type = "file"; inp.id = "photoPick"; inp.multiple = true; inp.accept = "image/*"; inp.hidden = true; document.body.appendChild(inp); }
    inp.value = ""; inp.onchange = async () => { if (await FS.addPhotos(inp.files)) { go("brief"); setTimeout(() => openCard("photos", true), 60); } }; inp.click();
  },
  async openRoot() { try { await Local.toolAct("open-root"); } catch (e) { UI.toast(e.message, "w"); } },
  async runClaudeTerm() { if (!FS.name) return UI.toast("먼저 프로젝트를 여세요", "w"); try { const j = await Local.toolAct("run-claude", { name: FS.name }); UI.toast(j.message, "o"); } catch (e) { UI.alert("실행 실패", esc(e.message), "d"); } },
  async saveBrief(quiet) {
    if (!FS.name || !Local.ok) return;
    try { await Local.save(FS.name, "brief.json", JSON.stringify({ project: FS.name, savedAt: new Date().toISOString(), brief: App.brief, photos: photoRows(), photoSummary: FS.summary }, null, 2)); if (!quiet) UI.toast("저장했습니다", "o"); }
    catch (e) { if (!quiet) UI.toast("저장 실패: " + e.message, "w"); }
  },
  async order() {
    const txt = buildOrder();
    const v = await UI.dialog({ title: "작업 지시서", sub: "복사해서 대화창에 붙여넣으면 그대로 작업합니다.", icon: "copy", tone: "b", wide: true, body: `<pre>${esc(txt)}</pre>`,
      buttons: [{ label: "닫기", value: 0 }, { label: "JSON 저장", value: 2 }, { label: "복사", value: 1, kind: "pri" }] });
    if (v === 1) { try { await navigator.clipboard.writeText(txt); UI.toast("복사했습니다", "o"); } catch (e) { UI.toast("복사 실패", "d"); } }
    if (v === 2) { const r = await FS.write("order.json", JSON.stringify({ brief: App.brief, review: App.review, order: txt }, null, 2)); UI.toast(r.ok ? `저장 완료 — ${r.where}` : "order.json 다운로드됨", r.ok ? "o" : "w"); }
  },
  /* 브리프 → order.json → (EXE) 이 창에서 바로 제작 · 대기열 · 야간 예약 */
  async make() {
    if (!App.secDone("product")) { if (App.view !== "brief") go("brief"); setTimeout(() => openCard("product"), 80); return UI.toast("상품 섹션(상품명·카테고리)부터 채워주세요", "w"); }
    const p = App.progress();
    await writeOrder();
    const cmd = `${FS.name || "프로젝트"} 만들어줘`;
    const rd = Local.desktop ? await aiReady() : { ok: false };
    if (!FS.analysis.length) return UI.alert("사진이 없습니다", "제품 사진을 먼저 넣어주세요. 사진 없이는 제품이 들어간 타일을 만들 수 없습니다.", "w");
    if (Local.desktop && !Usage.data) await Promise.race([Usage.load(), sleep(2500)]);
    const cutHint = Local.desktop && photoModeOf() === "regen" && !FS.approved;
    const btns = [{ label: "닫기", value: 0 }];
    if (Local.desktop) { if (rd.ok) { btns.push({ label: "대기열·예약", value: 6 }); btns.push({ label: "여기서 바로 제작", value: 3, kind: "pri" }); } else btns.push(rd.login ? { label: "다시 로그인", value: 8, kind: "pri" } : rd.fix ? { label: "연결 설정으로", value: 4, kind: "pri" } : { label: "터미널로 열기", value: 5, kind: "pri" }); }
    else btns.push({ label: "명령 복사", value: 1, kind: "pri" });
    const v = await UI.dialog({ title: "제작 준비가 됐습니다", sub: `브리프와 사진 분석을 정리했습니다.`, icon: "sparkles", tone: rd.ok ? "o" : "b",
      body: `<p style="margin:0 0 10px">${rd.ok ? "<b>여기서 바로 제작</b>을 누르면 Claude Code 가 이 창 안에서 기획안 → 타일 생성까지 돌립니다. 진행은 오른쪽 아래 패널에 뜨고, 끊기면 자동으로 이어서 합니다. 보통 15~30분, 크레딧 약 " + (layoutSel().length * 3) + ". <b>대기열·예약</b>으로 밤에 돌려도 됩니다." : Local.desktop ? `<b>${esc(rd.why || "")}</b>` : "Claude 대화창에 아래 한 줄을 붙여넣으면 <code>order.json</code>을 읽어 <b>기획안 → 타일 생성</b>으로 이어집니다."}</p>${Local.desktop && rd.ok ? "" : `<pre class="cmd">${esc(cmd)}</pre>`}
        ${Local.desktop && Usage.line() ? `<div class="note ${Usage.warn() ? "w" : "i"}">${svg(Usage.warn() ? "warn" : "gauge")}<div class="nb">${esc(Usage.line())}${Usage.warn() ? "<br><b>한도에 가깝습니다</b> — 중간에 멈출 수 있어요. 리셋 뒤로 예약하는 것을 권장합니다." : ""}</div></div>` : ""}
        ${cutHint ? `<div class="note b">${svg("layers")}<div class="nb"><b>제품 컷을 먼저 승인하면</b> 라벨·로고가 틀린 채 15장을 다시 만드는 일을 막습니다. <button class="btn sm" data-mk="cut" style="margin-left:4px">제품 컷 먼저 만들기</button></div></div>` : ""}
        <p class="hint" style="margin:10px 0 0">브리프 ${p.done}/${p.total} · 사진 ${FS.analysis.length}장 · 구성 ${layoutSel().length}섹션 · 제품 사진 ${photoModeOf() === "keep" ? "원본 합성" : "AI 고화질 재현"}${FS.approved ? " · 승인 컷 " + esc(FS.approved.file) : ""}${FS.ref && FS.ref.summary ? " · 경쟁사 분석 반영" : ""}</p>`,
      buttons: btns, onOpen(d) { const b = $("[data-mk]", d); if (b) b.onclick = () => UI._close(7); } });
    if (v === 3) return ACT.runAI("make");
    if (v === 6) return enqueue({ mode: "make" }, `제작 — ${FS.name}`);
    if (v === 7) return ACT.productCut();
    if (v === 8) return Login.prompt();
    if (v === 4) return go("settings");
    if (v === 5) return ACT.runClaudeTerm();
    const txt = v === 1 ? cmd : null; if (!txt) return;
    try { await navigator.clipboard.writeText(txt); UI.toast("복사했습니다 — 대화창에 붙여넣으세요", "o"); } catch (e) { UI.toast("복사 실패", "d"); }
  },
  async runAI(mode, extra) {
    try { await Local.run(FS.name, mode, "", photoModeOf(), extra); RunUI.show(runTitle(mode, FS.name, extra), FS.name, mode); UI.toast("AI 작업을 시작했습니다", "o"); Usage.load(); }
    catch (e) { if (!e.needLogin) UI.alert("시작 실패", esc(e.message), "d"); }
  },
  /* 검수 영역·코멘트 → review.json + review/NN_marked.png → (EXE) AI 수정 */
  async revise() {
    const targets = App.tiles.filter(t => App.hasReq(t.n));
    if (!targets.length) return UI.toast("영역이나 요청을 먼저 남겨주세요", "w");
    if (!Local.ok || !FS.name) return UI.alert("서버가 필요합니다", "EXE 로 실행한 상태에서만 됩니다.", "w");
    const ok = await UI.dialog({ title: "검수 반영 — AI 수정", sub: `${targets.length}장 · 영역 ${App.tally().regions}개. 표시된 영역과 코멘트만 반영하고 나머지는 그대로 둡니다.`, icon: "sparkles", tone: "o",
      body: `<ul class="ul">${targets.map(t => { const r = App.review[t.n], nt = (r.regions || []).filter(g => g.kind === "text").length; return `<li><b>${esc(t.n)}${t.name ? ". " + esc(t.name) : ""}</b> — 영역 ${(r.regions || []).length}개${nt ? ` (글자 교체 ${nt})` : ""}${(r.note || "").trim() ? " · 전체 요청" : ""}</li>`; }).join("")}</ul>${Local.desktop && Usage.line() ? `<p class="hint" style="margin-top:8px">${esc(Usage.line())}</p>` : ""}<p class="hint" style="margin-top:10px">영역 표시본이 <code>review/</code> 에 저장되고 AI 가 그 번호를 보고 고칩니다. 고치기 전 버전은 자동 백업되어 검수의 <b>버전</b>에서 되돌릴 수 있습니다.</p>`,
      buttons: [{ label: "취소", value: 0 }].concat(Local.desktop ? [{ label: "대기열·예약", value: 3 }] : []).concat([{ label: Local.desktop ? "AI 수정 시작" : "파일 저장 + 명령 복사", value: 1, kind: "pri" }]) });
    if (!ok) return;
    UI.toast("영역 표시본 만드는 중…");
    try { for (const t of targets) await Review.buildMarked(t); await FS.saveReviewFile(); }
    catch (e) { return UI.alert("저장 실패", esc(e.message), "d"); }
    const cmd = `${FS.name} 검수 반영해줘`;
    if (ok === 3) return enqueue({ mode: "revise" }, `검수 반영 — ${FS.name}`);
    if (Local.desktop) {
      const rd = await aiReady();
      if (rd.ok) return ACT.runAI("revise");
      if (rd.login) return Login.prompt();
      const v = await UI.dialog({ title: "바로 실행할 수 없습니다", sub: esc(rd.why), icon: "warn", tone: "w", body: `<pre class="cmd">${esc(cmd)}</pre>`, buttons: [{ label: "닫기", value: 0 }, { label: "명령 복사", value: 1 }].concat(rd.fix ? [{ label: "연결 설정으로", value: 2, kind: "pri" }] : []) });
      if (v === 2) return go("settings"); if (v !== 1) return;
    }
    try { await navigator.clipboard.writeText(cmd); UI.toast("복사했습니다 — Claude 대화창에 붙여넣으세요", "o"); } catch (e) { UI.toast("복사 실패", "d"); }
  },
  async exportPreview() {
    if (!App.tiles.length) return UI.toast("내보낼 타일이 없습니다", "w");
    if (!Local.ok || !FS.name) return UI.alert("서버가 필요합니다", "EXE 로 실행한 상태에서만 내보낼 수 있습니다.", "w");
    const ok = await UI.dialog({ title: "클라이언트 프리뷰 내보내기", sub: `타일 ${App.tiles.length}장을 한 파일(HTML)로 묶습니다. 원본 픽셀은 손대지 않습니다.`, icon: "eye", tone: "b",
      body: `<div class="fld"><label>버전 표기</label><input type="text" id="exVer" value="v1" maxlength="12"></div><p class="hint">지금 왼쪽 메뉴의 순서대로 들어갑니다. 받는 분은 더블클릭으로 열어 모바일·태블릿 폭 전환, 배율, 장별 피드백 작성·복사가 됩니다.</p>`,
      buttons: [{ label: "취소", value: null }, { label: "내보내기", value: "go", kind: "pri" }], onOpen(d) { setTimeout(() => $("#exVer", d) && $("#exVer", d).select(), 60); } });
    if (!ok) return;
    const ver = ($("#exVer") && $("#exVer").value.trim()) || "v1";
    UI.toast("시안 파일 만드는 중…");
    try { await FS.saveManifest(); const j = await Local.exportPreview(FS.name, ver);
      const r = await UI.dialog({ title: "내보냈습니다", sub: `${j.count}장 · ${fmtKB(j.size)}`, icon: "check", tone: "o", body: `<p style="margin:0 0 8px">저장 위치</p><pre style="max-height:none">${esc(j.path)}</pre><p class="hint" style="margin-top:10px">이 파일 하나만 보내면 됩니다.</p>`, buttons: [{ label: "닫기", value: 0 }].concat(Local.desktop ? [{ label: "폴더 열기", value: 2 }] : []).concat([{ label: "경로 복사", value: 1, kind: "pri" }]) });
      if (r === 1) { try { await navigator.clipboard.writeText(j.path); UI.toast("경로를 복사했습니다", "o"); } catch (e) {} }
      if (r === 2) { try { await Local.toolAct("open-folder", { name: FS.name, sub: "export" }); } catch (e) {} }
    } catch (e) { UI.alert("내보내기 실패", esc(e.message), "d"); }
  },
  async resetSet() { Object.keys(SET).forEach(k => delete SET[k]); Object.assign(SET, SET_DEF); saveSet(); UI.toast("설정을 되돌렸습니다", "o"); go("settings"); },
  async reset() { const ok = await UI.confirm("전체 초기화", "브리프와 검수 내용을 모두 지웁니다. 되돌릴 수 없습니다.", { ok: "지우기", danger: true }); if (!ok) return; Store.del("brief"); Store.del("review"); UI.toast("초기화했습니다"); setTimeout(() => location.reload(), 500); }
};

/* v4.8 액션 */
async function writeOrder() {
  return FS.write("order.json", JSON.stringify({ project: FS.name || Store.get("lastProject", ""), savedAt: new Date().toISOString(), brief: App.brief, review: App.review, order: buildOrder(), photos: photoRows(), photoSummary: FS.summary, layout: layoutSel(), photoMode: photoModeOf(), approvedCut: FS.approved ? FS.approved.file : "", ref: FS.ref && FS.ref.summary ? { summary: FS.ref.summary, ideas: FS.ref.ideas || [], differ: FS.ref.differ || [], avoid: FS.ref.avoid || [] } : null }, null, 2));
}
Object.assign(ACT, {
  exportMenu() { return Export.open(); },
  feedback() { return Feedback.open(); },
  usage() { return Usage.open(); },
  keys() { showKeys(); },
  async timeline(name) {
    name = typeof name === "string" ? name : "";
    let j; try { j = await Local.log(name, 400); } catch (e) { return UI.toast(e.message, "w"); }
    UI.dialog({ title: name ? `작업 기록 — ${esc(name)}` : "작업 기록 — 전체", sub: "언제 무엇을 만들고·고치고·내보냈는지 자동으로 남습니다.", icon: "history", tone: "b", wide: true,
      body: `<div class="tlwrap">${tlHtml(j.items, !name)}</div>`, buttons: [{ label: "닫기", value: 0, kind: "pri" }], onOpen(d) { const w = $(".tlwrap", d); if (w) w.onclick = e => tlClick(e); } });
  },
  /* 실패·중단된 작업 이어서 하기 (#13) */
  async resume(name) {
    name = typeof name === "string" && name ? name : FS.name; if (!name) return;
    if (!Local.desktop) return UI.toast("EXE 에서만 됩니다", "w");
    try { await Local.run(name, "resume"); RunUI.show(`이어서 하기 — ${name}`, name, "make"); UI.toast("이어서 진행합니다 — 이미 만든 파일은 그대로 둡니다", "o"); Local._projects = null; if (App.view === "home") go("home"); }
    catch (e) { UI.alert("이어서 하지 못했습니다", esc(e.message), "d"); }
  },
  /* 섹션별 부분 재생성 (#10): 이 장만 다시 / 뒤에 1장 추가 */
  async tileRun(n, op) {
    const t = tileByN(n); if (!t) return;
    if (!Local.desktop) return UI.toast("EXE 에서만 됩니다", "w");
    const ins = op === "insert";
    const v = await UI.dialog({ title: ins ? `${n} 뒤에 1장 추가` : `${n} 이 장만 다시 만들기`, sub: ins ? "앞뒤 장의 폭·톤·서체에 맞춰 새 장을 한 장 끼워 넣습니다." : "이 장만 새로 만듭니다. 지금 버전은 자동 백업되어 검수의 버전에서 되돌릴 수 있습니다.", icon: ins ? "plus" : "refresh", tone: "b",
      body: `<div class="vpair"><img src="${t.f}" alt=""><div><b>${esc(n)}${t.name ? ". " + esc(t.name) : ""}</b><p class="hint" style="margin:4px 0 0">${esc(t.copy || "")}</p></div></div>
        <div class="fld" style="margin-top:12px"><label>${ins ? "어떤 내용의 장인가요?" : "무엇을 바꿀까요?"} <span class="opt">${ins ? "필수" : "선택"}</span></label><textarea id="trNote" placeholder="${ins ? "예: 사용 방법 3단계 (충전 → 노즐 끼우기 → 버튼)" : "예: 배경을 차 실내로, 헤드카피 더 크게 — 비우면 같은 기획으로 완성도만 높입니다"}"></textarea></div>
        <p class="hint">${Usage.line() ? esc(Usage.line()) + " · " : ""}이미지 약 1~2장 분량 · 2~5분</p>`,
      buttons: [{ label: "취소", value: 0 }, { label: "대기열·예약", value: 2 }, { label: "지금 만들기", value: 1, kind: "pri" }], onOpen(d) { setTimeout(() => $("#trNote", d).focus(), 60); } });
    const note = ($("#trNote") && $("#trNote").value.trim()) || "";
    if (v !== 1 && v !== 2) return;
    if (ins && !note) return UI.toast("추가할 장의 내용을 적어주세요", "w");
    const extra = { tile: n, op: ins ? "insert" : "regen", note };
    if (v === 2) return enqueue(Object.assign({ mode: "tile" }, extra), `${n} ${ins ? "뒤에 추가" : "다시"} — ${FS.name}`);
    const rd = await aiReady(); if (!rd.ok) return rd.login ? Login.prompt() : rd.fix ? (await UI.confirm("바로 실행할 수 없습니다", esc(rd.why), { ok: "연결 설정으로" })) && go("settings") : UI.alert("바로 실행할 수 없습니다", esc(rd.why), "w");
    return ACT.runAI("tile", extra);
  },
  /* 제품 컷 먼저 (#1) */
  async productCut(again) {
    if (!Local.desktop) return UI.toast("EXE 에서만 됩니다", "w");
    if (!(FS.images || []).length) return UI.toast("원본 사진을 먼저 넣어주세요", "w");
    const v = await UI.dialog({ title: again ? "제품 컷 다시 만들기" : "제품 컷 먼저 만들기", sub: "원본 사진을 참고해 로고·라벨 글자·형태·색은 그대로, 화질만 스튜디오급으로 2장(누끼·연출)을 만듭니다. 2K, 라벨 글자 한 자씩 대조.", icon: "sparkles", tone: "b",
      body: `<div class="fld"><label>연출 컷 요청 <span class="opt">선택</span></label><textarea id="pcNote" placeholder="예: 대리석 위, 자연광, 따뜻한 톤 — 비우면 브리프 분위기대로${again ? "\n이전 컷에서 틀린 점(예: 라벨 두 번째 줄 글자)을 적으면 더 정확해집니다" : ""}"></textarea></div><p class="hint">${Usage.line() ? esc(Usage.line()) + " · " : ""}이미지 약 2~4장 분량 · 3~6분</p>`,
      buttons: [{ label: "취소", value: 0 }, { label: "만들기", value: 1, kind: "pri" }], onOpen(d) { setTimeout(() => $("#pcNote", d).focus(), 60); } });
    const note = ($("#pcNote") && $("#pcNote").value.trim()) || ""; if (v !== 1) return;
    await ACT.saveBrief(true); await writeOrder();
    const rd = await aiReady(); if (!rd.ok) return rd.login ? Login.prompt() : UI.alert("바로 실행할 수 없습니다", esc(rd.why), "w");
    return ACT.runAI("productcut", { note });
  }
});

function buildOrder() {
  const L = [], b = App.brief, s = FS.summary, p = App.progress();
  L.push(`[${FS.name || Store.get("lastProject", "프로젝트")}] 작업 요청`, `작성: ${new Date().toLocaleString("ko-KR")}`, "");
  L.push(`■ 브리프 (${p.done}/${p.total} 섹션)`);
  SECTIONS.filter(x => x.id !== "photos").forEach(sec => { if (App.secDone(sec.id)) L.push(`  ${sec.n}. ${sec.title} — ${App.secSummary(sec.id)}`); });
  const miss = SECTIONS.filter(x => x.id !== "photos" && !App.secDone(x.id)); if (miss.length) L.push(`  미작성: ${miss.map(m => m.title).join(", ")}`);
  L.push(`  제품 사진 처리: ${photoModeOf() === "keep" ? "원본 그대로 합성 (TRACK A — 누끼·업스케일만, 재생성 금지)" : "AI 고화질 재현 (원본 참고, 로고·글자·형태 유지, 없는 글자 추가 금지)"}`, "");
  const sel = layoutSel();
  L.push(`■ 페이지 구성 (${sel.length}개 섹션)`, "  " + sel.map(id => catOf(id).label).join(" → "));
  const hasReviews = !!(b.proof && (b.proof.reviews || "").trim()), hasAwards = !!(b.proof && (b.proof.certs || []).filter(x => x !== "없음").length);
  const blocked = sel.filter(id => (id === "reviews" && !hasReviews) || (id === "awards" && !hasAwards));
  if (blocked.length) L.push("  ⚠ 자료 없음 → 제작 보류: " + blocked.map(id => catOf(id).label).join(", "));
  L.push("");
  if (FS.approved) L.push("■ 승인된 제품 컷", `  product/${FS.approved.file} — 원본과 대조해 승인. 제품이 나오는 타일은 이 컷을 그대로 합성`, "");
  if (FS.ref && FS.ref.summary) { L.push("■ 경쟁사 참고 (구성·흐름만 참고, 문구·이미지 복제 금지)", "  " + FS.ref.summary); (FS.ref.ideas || []).forEach(x => L.push("  · 적용: " + x)); (FS.ref.differ || []).forEach(x => L.push("  · 차별화: " + x)); (FS.ref.avoid || []).forEach(x => L.push("  · 피할 것: " + x)); L.push(""); }
  if (s) { L.push("■ 사진 분석", `  ${s.total}장 · 평균 긴 변 ${s.avgLong}px · 누끼 적합 ${s.cuttable}장 · 포인트 컬러 ${s.accent}`); if (s.low) L.push(`  ⚠ 해상도 부족 ${s.low}장 — ${s.lowNames.join(", ")} → 업스케일 후 합성`); L.push(""); }
  if (App.tiles.length) {
    const todo = []; let regions = 0;
    L.push(`■ 페이지 순서 (${App.tiles.length}장)`, "   " + App.tiles.map(t => t.n).join(" → "), "");
    App.tiles.forEach(t => { const r = App.review[t.n]; if (!App.hasReq(t.n)) return;
      const x = [`▸ ${t.n}. ${t.name || ""}  — review/${t.n}_marked.png`];
      (r.regions || []).forEach((g, i) => { regions++; const at = `x${Math.round(g.x * 100)}% y${Math.round(g.y * 100)}% w${Math.round(g.w * 100)}% h${Math.round(g.h * 100)}%`; x.push(g.kind === "text" ? `   T${i + 1}) [글자 교체] "${g.from || ""}" → "${g.to || ""}" (영역 ${at})` : `   ${i + 1}) 영역 ${at}: ${(g.text || "").trim() || "(코멘트 없음)"}`); });
      if ((r.note || "").trim()) r.note.trim().split("\n").forEach(ln => ln.trim() && x.push("   전체: " + ln.trim()));
      todo.push(x.join("\n")); });
    if (todo.length) L.push(`■ 검수 수정 요청 (${todo.length}장 · 영역 ${regions}개)`, "   규칙: 표시된 영역만 바꾸고 나머지·톤앤매너·서체·팔레트는 그대로. 원본은 tiles/v_prev/ 백업.", "", todo.join("\n\n"), "");
    else L.push("■ 검수", "   수정 요청 없음", "");
    L.push("■ 예상 작업량", `   수정 ${todo.length}장 = 약 ${todo.length * 3} 크레딧`);
  } else L.push("■ 다음 단계", "   기획안 작성 → 타일 생성");
  return L.join("\n");
}

/* ═══ 부팅 ═══ */
async function boot() {
  await Local.ping();
  renderRail();
  $("#sideToggle").onclick = () => { $("#shell").classList.toggle("side-off"); Store.set("sideOff", $("#shell").classList.contains("side-off")); };
  if (Store.get("sideOff", false)) $("#shell").classList.add("side-off");
  $("#projBtn").onclick = () => go("projects");
  let restored = false;
  if (Local.ok) { const lp = Store.get("lastProject", ""); if (lp) restored = await FS.load(lp, true); }
  let fresh = true; try { fresh = !sessionStorage.getItem("reboot:booted"); sessionStorage.setItem("reboot:booted", "1"); } catch (e) {}
  go(!fresh && restored ? Store.get("view", "home") : "home");
  if (restored) UI.toast(`${FS.name} — 이어서 작업합니다`, "o");
  else if (!Local.ok) UI.toast("EXE 로 실행해 주세요 — 지금은 화면만 보입니다", "w");
  if (Local.desktop) { Usage.start(); QueueUI.load().then(() => renderSide()); try { const all = (await Local.runsAll()).runs || []; const st = all.find(r => r.running && r.name === FS.name) || all.find(r => r.running); if (st) RunUI.show(runTitle(st.mode, st.name, st), st.name, st.mode); } catch (e) {} try { const sg = await Local.suggestStatus(); if (sg.running && sg.name === FS.name) { Suggest.running = true; Suggest.run(); } } catch (e) {} Update.start(); }
}
document.addEventListener("DOMContentLoaded", boot);
window.rebootApp = { Login, App, FS, UI, go, Store, Local, Tiles, Review, RunUI, ACT, Update, Suggest, Read, Typo, Usage, QueueUI, Cut, Ref, Feedback, Export, Versions, Projects, Home };
})();

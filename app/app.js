/* ═══════════════════════════════════════════
   re:boot — 상세페이지 제작 콘솔  (v4.1)
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
  stop:     'M6 6h12v12H6z'
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
const SET_DEF = { theme: "system", baseW: 860, autoNext: true, minLong: 1200, tabFill: true, toastSec: 2.6, jpegQ: 82 };
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
      this.ok = !!(j && j.ok); this.desktop = !!(j && j.desktop); this.root = (j && j.root) || ""; } catch (e) { this.ok = false; }
    return this.ok;
  },
  async _j(url, opt) { const r = await fetch(url, Object.assign({ cache: "no-store" }, opt || {})); const j = await r.json().catch(() => ({})); if (!r.ok || j.ok === false) throw new Error(j.error || `요청 실패 (${r.status})`); return j; },
  async projects(force) { if (this._projects && !force) return this._projects; return (this._projects = (await this._j("/local/projects")).projects || []); },
  project(name) { return this._j("/local/project?name=" + encodeURIComponent(name)); },
  save(name, file, text) { return this._j(`/local/save?name=${encodeURIComponent(name)}&file=${encodeURIComponent(file)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: text }); },
  saveImage(name, file, blob) { return this._j(`/local/save-image?name=${encodeURIComponent(name)}&file=${encodeURIComponent(file)}`, { method: "POST", headers: { "Content-Type": "image/png" }, body: blob }); },
  exportPreview(name, ver) { return this._j(`/local/export?name=${encodeURIComponent(name)}&ver=${encodeURIComponent(ver || "v1")}`); },
  createProject(name) { return this._j("/local/project-create?name=" + encodeURIComponent(name), { method: "POST" }); },
  addPhoto(name, file, blob) { return this._j(`/local/photo?name=${encodeURIComponent(name)}&file=${encodeURIComponent(file)}`, { method: "POST", headers: { "Content-Type": blob.type || "application/octet-stream" }, body: blob }); },
  deletePhoto(name, file) { return this._j(`/local/photo-delete?name=${encodeURIComponent(name)}&file=${encodeURIComponent(file)}`, { method: "POST" }); },
  /* EXE 전용 */
  tools() { return this._j("/local/tools"); },
  toolAct(action, extra) { return this._j("/local/tools?" + new URLSearchParams(Object.assign({ do: action }, extra || {})), { method: "POST" }); },
  run(name, mode, prompt) { return this._j("/local/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, mode, prompt: prompt || "" }) }); },
  runStatus(since) { return this._j("/local/run?since=" + (since || 0)); },
  runStop() { return this._j("/local/run?do=stop", { method: "POST" }); },
  update() { return this._j("/local/update"); },
  updateAct(what) { return this._j("/local/update?do=" + what, { method: "POST" }); }
};

/* ═══ 자동 업데이트 — GitHub 릴리스가 새로 올라오면 정중앙 팝업 ═══ */
const Update = {
  shown: "", timer: null,
  async poll(force) {
    if (!Local.desktop) return;
    let u; try { u = await Local.update(); } catch (e) { return; }
    if (u.state === "available" && (force || this.shown !== u.version)) { this.shown = u.version; this.offer(u); }
    else if (u.state === "downloaded" && this.shown !== "dl" + u.version) { this.shown = "dl" + u.version; this.ready(u); }
    return u;
  },
  start() { if (!Local.desktop) return; setTimeout(() => this.poll(), 4000); this.timer = setInterval(() => this.poll(), 10 * 60 * 1000); },
  async offer(u) {
    const v = await UI.dialog({ title: `새 버전 ${u.version} 이 나왔습니다`, sub: `지금 ${u.current} 을 쓰고 있습니다. 내려받고 다시 시작하면 바로 적용됩니다.`, icon: "sparkles", tone: "o", dismissable: false,
      body: u.notes ? `<div class="note i" style="max-height:200px;overflow:auto">${svg("info")}<div class="nb">${esc(u.notes).replace(/\n/g, "<br>")}</div></div>` : `<p class="hint" style="margin:0">작업 중인 내용은 그대로 남습니다. 설치는 30초쯤 걸립니다.</p>`,
      buttons: [{ label: "나중에", value: 0 }, { label: "지금 업데이트", value: 1, kind: "pri" }] });
    if (v !== 1) return;
    try { await Local.updateAct("download"); } catch (e) { return UI.alert("내려받기 실패", esc(e.message), "d"); }
    UI.toast("업데이트 내려받는 중…", "o");
    const tick = async () => { let s; try { s = await Local.update(); } catch (e) { return; } if (s.state === "downloading") { UI.toast(`내려받는 중 ${s.progress}%`); setTimeout(tick, 2500); } else if (s.state === "downloaded") this.ready(s); else if (s.state === "error") UI.alert("업데이트 실패", esc(s.error), "d"); };
    setTimeout(tick, 2500);
  },
  async ready(u) {
    if (RunUI.open && RunUI.timer) { UI.toast("AI 작업이 끝나면 다시 알려드립니다", "w"); this.shown = ""; return; }
    const v = await UI.dialog({ title: `업데이트 ${u.version} 준비 완료`, sub: "지금 다시 시작하면 설치됩니다. 나중에 닫을 때 자동으로 설치돼요.", icon: "check", tone: "o", buttons: [{ label: "나중에", value: 0 }, { label: "다시 시작하여 설치", value: 1, kind: "pri" }] });
    if (v === 1) { try { await Local.updateAct("install"); } catch (e) { UI.alert("설치 실패", esc(e.message), "d"); } }
  }
};

/* ═══ 프로젝트 ═══ */
const FS = {
  name: "", files: [], analysis: [], summary: null, tileMeta: {},

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
      return { n, name: m.name || "", copy: m.copy || "", ratio: m.ratio || "", f: t.url };
    }).sort((a, b) => { const ia = ord.indexOf(a.n), ib = ord.indexOf(b.n); if (ia === -1 && ib === -1) return a.n.localeCompare(b.n, "en", { numeric: true }); if (ia === -1) return 1; if (ib === -1) return -1; return ia - ib; });
    const saved = (p.brief && p.brief.brief) || (p.order && p.order.brief) || (p.brief && p.brief.product ? p.brief : null);
    if (saved && typeof saved === "object") App.brief = saved; else if (switching) App.brief = {};
    // 검수: review.json(신) → order.json 의 review(구) → 로컬
    const rv = (p.review && p.review.tiles) || (p.order && p.order.review) || null;
    if (rv && typeof rv === "object") App.review = App.migrateReview(rv); else if (switching) App.review = {};
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
    let n = 0;
    for (const f of files) {
      let name = f.name && isImg(f.name) ? f.name : `붙여넣기_${new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "")}.${(f.type || "image/png").split("/")[1].replace("jpeg", "jpg")}`;
      try { await Local.addPhoto(this.name, name, f); n++; } catch (e) { UI.toast(`${name}: ${e.message}`, "w"); }
    }
    if (n) { await this.load(this.name, true); UI.toast(`사진 ${n}장 추가 · 분석 완료`, "o"); Local._projects = null; }
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
const PHOTO_MODES = [["keep", "원본 그대로 합성 (권장)"], ["reinterpret", "AI 재해석 허용"]];
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
      out[n] = { regions: Array.isArray(r.regions) ? r.regions.filter(g => g && typeof g.x === "number").map(g => ({ x: g.x, y: g.y, w: g.w, h: g.h, text: g.text || "" })) : [],
        note: typeof r.note === "string" ? r.note : [r.request, r.extNote].filter(x => x && String(x).trim()).join("\n") }; });
    return out;
  },
  hasReq(n) { const r = this.review[n]; return !!(r && ((r.regions && r.regions.length) || (r.note || "").trim())); },
  eg() { return EG[this.brief?.product?.category] || EG._; },
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
    if (id === "req") return [b.photoMode === "reinterpret" ? "AI 재해석" : b.photoMode ? "원본 합성" : "", b.mood, b.avoid].filter(Boolean).join(" / ").slice(0, 46) || "미작성";
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
      const req = App.hasReq(tl.n), cur = App.curTile === tl.n, rc = ((App.review[tl.n] || {}).regions || []).length;
      h += `<button class="sitem tile${cur ? " on" : ""}" data-tile="${i}" draggable="true" title="${esc(tl.copy || "")}">
        <span class="gh">${svg("drag")}</span><span class="st ${req ? "s-edit" : ""}"></span>
        <span class="lb">${esc(tl.n)}${tl.name ? ". " + esc(tl.name) : ""}</span>
        ${rc ? `<span class="cnt rq">${rc}</span>` : ""}${tl.ratio && tl.ratio !== "9:16" ? `<span class="cnt">${esc(tl.ratio)}</span>` : ""}</button>`;
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
    <button class="sitem" data-act="exportPreview"><span class="ic">${svg("eye")}</span><span class="lb">클라이언트 프리뷰</span></button>
    <button class="sitem hi" data-act="make"><span class="ic">${svg("sparkles")}</span><span class="lb">AI로 상세페이지 만들기</span></button>
    ${App.tiles.length ? `<button class="sitem hi" data-act="revise"><span class="ic">${svg("edit")}</span><span class="lb">검수 반영 (AI 수정)</span></button>` : ""}
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
    { label: "전달", sub: "클라이언트 프리뷰", done: false, act: "exportPreview" }
  ];
  let curIdx = steps.findIndex(x => !x.done); if (curIdx < 0) curIdx = steps.length - 1;
  v.innerHTML = `<div class="wrap wide home">
    <div class="hhead">
      <div><div class="eyebrow">${has ? "작업 중" : "시작"}</div><h1 class="pg">${esc(FS.name || "프로젝트를 열어주세요")}</h1>
        <p class="pgsub">${has ? `${new Date().toLocaleDateString("ko-KR")} · 브리프 ${p.done}/${p.total} · 타일 ${App.tiles.length}장 · 검수 요청 ${t.req}장` : "새 프로젝트를 만들고 사진을 끌어다 놓으면 분석부터 자동으로 시작합니다."}</p></div>
      <div class="hbtns">
        ${has ? `<button class="btn" data-act="exportPreview">${svg("eye")} 프리뷰</button><button class="btn pri" data-act="${App.tiles.length ? "goreview" : "gobrief"}">${App.tiles.length ? svg("check") + " 검수 계속" : svg("edit") + " 브리프 계속"}</button>`
              : `<button class="btn" data-act="goprojects">${svg("folder")} 프로젝트 열기</button><button class="btn pri lg" data-act="newproj">${svg("plus")} 새 프로젝트</button>`}
      </div>
    </div>
    <div class="stepper">${steps.map((st, i) => `<button class="stp${st.done ? " done" : ""}${i === curIdx ? " cur" : ""}" data-act="${st.act}">
      <span class="sn">${st.done ? svg("check") : i + 1}</span><span class="sl"><b>${st.label}</b><small>${esc(st.sub)}</small></span></button>`).join("")}
      <i class="bar" style="--w:${Math.max(0, curIdx) / (steps.length - 1) * 100}%"></i></div>
    ${has ? `<div class="stats">
      <div class="stat"><small>사진</small><b>${FS.files.length}<span>장</span></b><em>${s ? `평균 ${s.avgLong}px${s.low ? ` · <i class="w">부족 ${s.low}</i>` : " · 양호"}` : ""}</em></div>
      <div class="stat"><small>브리프</small><b>${p.done}<span>/${p.total}</span></b><em>${p.done === p.total ? "완료" : SECTIONS.find(x => x.id !== "photos" && !App.secDone(x.id)).title + " 남음"}</em></div>
      <div class="stat"><small>타일</small><b>${App.tiles.length}<span>장</span></b><em>${App.tiles.length ? layoutSel().length + "섹션 구성" : "미제작"}</em></div>
      <div class="stat"><small>검수 요청</small><b>${t.req}<span>/${t.total}</span></b><em>${t.regions ? `영역 ${t.regions}개` : "영역 없음"}</em></div>
    </div>` : ""}
    ${has && App.tiles.length ? `<h3 class="h3">타일 미리보기</h3><div class="mini">${App.tiles.slice(0, 8).map(tl => {
      const req = App.hasReq(tl.n);
      return `<div class="mtile" data-t="${esc(tl.n)}"><img src="${tl.f}" loading="lazy" alt=""><span>${esc(tl.n)}</span>${req ? `<i class="s-edit">수정 요청</i>` : ""}</div>`; }).join("")}
      ${App.tiles.length > 8 ? `<button class="mtile more" data-act="gotiles">+${App.tiles.length - 8}<small>더 보기</small></button>` : ""}</div>` : ""}
  </div>`;
  v.onclick = e => { const a = e.target.closest("[data-act]"); if (a) return ACT[a.dataset.act](); const m = e.target.closest(".mtile[data-t]"); if (m) { App.curTile = m.dataset.t; go("tiles"); } };
}};

/* ── 프로젝트 목록 ── */
const fmtD = t => { if (!t) return "—"; const d = new Date(t * 1000); return `${d.getFullYear().toString().slice(2)}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
const fmtDur = sec => { if (sec == null || sec < 0) return "—"; if (sec < 60) return "1분 미만"; const m = Math.round(sec / 60); if (m < 60) return m + "분"; const h = Math.floor(m / 60); if (h < 24) return h + "시간 " + (m % 60 ? (m % 60) + "분" : ""); const d = Math.floor(h / 24); return d + "일 " + (h % 24 ? (h % 24) + "시간" : ""); };
const fmtAgo = t => { if (!t) return ""; const s = Date.now() / 1000 - t; if (s < 3600) return Math.max(1, Math.round(s / 60)) + "분 전"; if (s < 86400) return Math.round(s / 3600) + "시간 전"; return Math.round(s / 86400) + "일 전"; };
const Projects = { title: "프로젝트", async render(v) {
  if (!Local.ok) { v.innerHTML = `<div class="wrap"><h1 class="pg">프로젝트</h1><div class="note w">${svg("warn")}<div class="nb"><b>re-boot 콘솔.exe</b> 로 실행해야 합니다.</div></div></div>`; return; }
  v.innerHTML = `<div class="wrap wide"><div class="empty"><div class="eic">${svg("folder")}</div><b>불러오는 중…</b></div></div>`;
  let list = []; try { list = await Local.projects(true); } catch (e) {}
  if (App.view !== "projects") return;
  const stage = p => p.tiles ? (p.exports ? ["전달", "s-approved"] : ["검수", "s-extend"]) : p.hasOrder ? ["제작 대기", "s-edit"] : p.hasBrief ? ["브리프", "s-hold"] : ["사진", "s-hold"];
  v.innerHTML = `<div class="wrap wide">
    <div class="vhead"><h1 class="pg">프로젝트 <span class="cntl">${list.length}</span></h1><div class="sp"></div>
      ${Local.desktop ? `<button class="btn" data-act="openRoot">${svg("ext")} 폴더 열기</button>` : ""}<button class="btn" data-act="newproj">${svg("plus")} 새 프로젝트</button></div>
    <p class="pgsub">카드를 누르면 열립니다. 새 프로젝트는 이름만 정하면 만들어지고, 사진은 안에서 넣습니다.</p>
    ${!list.length ? `<div class="empty"><div class="eic">${svg("folder")}</div><b>아직 프로젝트가 없습니다</b><p>위의 <b>새 프로젝트</b>로 시작하세요.</p></div>` : `<div class="pgrid">${list.map((p, i) => {
      const st = stage(p), cur = p.name === FS.name, span = p.tileFirst && p.tileLast ? p.tileLast - p.tileFirst : null;
      return `<button class="pcard${cur ? " cur" : ""}" data-p="${esc(p.name)}" style="animation-delay:${i * 40}ms">
        <div class="pch"><span class="pic">${svg("folder")}</span><span class="ptt"><b>${esc(p.name)}</b><small>${fmtAgo(p.mtime)} 작업 · 사진 ${p.images}장</small></span><i class="pst ${st[1]}">${st[0]}</i>${cur ? `<i class="pcur">열림</i>` : ""}</div>
        <div class="pstat"><span><small>사진</small><b>${p.images}</b></span><span><small>타일</small><b>${p.tiles}</b></span><span><small>내보내기</small><b>${p.exports}</b></span><span><small>브리프</small><b>${p.hasBrief || p.hasOrder ? "✓" : "–"}</b></span></div>
        <dl class="pkv"><dt>시작</dt><dd>${fmtD(p.ctime)}</dd><dt>최근 작업</dt><dd>${fmtD(p.mtime)}</dd><dt>타일 제작</dt><dd>${span != null ? `${fmtD(p.tileFirst)} → ${fmtDur(span)} 소요` : "—"}</dd></dl>
        <div class="pgo">${cur ? "이어서 작업" : "열기"} ${svg("arrowR")}</div></button>`; }).join("")}</div>`}
  </div>`;
  v.onclick = async e => {
    const a = e.target.closest("[data-act]"); if (a) return ACT[a.dataset.act]();
    const b = e.target.closest("[data-p]"); if (!b) return;
    if (b.dataset.p === FS.name) return go("home");
    b.classList.add("busy");
    if (await FS.load(b.dataset.p, false)) { UI.toast(`${FS.name} 열었습니다`, "o"); go("home"); } else b.classList.remove("busy");
  };
  renderSide();
}};

/* ── 브리프 (사진 분석 포함) ── */
const REQ = { product: ["name", "category"], target: ["who"], fact: ["specs"] };
const Brief = { title: "브리프", render(v) {
  const eg = App.eg(), s = FS.summary;
  const g = (sec, k, d) => (App.brief[sec] && App.brief[sec][k] != null) ? App.brief[sec][k] : (d == null ? "" : d);
  v.innerHTML = `<div class="wrap bwrap">
    <aside class="memo">
      <div class="m">${s ? `<b>사진 ${s.total}장</b> · ${s.low ? `해상도 부족 ${s.low}장` : "해상도 양호"}<br>포인트 <i style="background:${s.accent}"></i>${s.accent}` : `<b>사진이 아직 없습니다</b><br>사진을 넣으면 그 기준으로 예시문이 바뀝니다.<br><button class="btn sm" data-act="addPhotos" style="margin-top:6px">사진 추가</button>`}</div>
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
    const ap = e.target.closest("[data-apply]"); if (ap) { applySection(ap.dataset.apply); return; }
    const pv = e.target.closest("[data-prev]"); if (pv) { const i = SECTIONS.findIndex(x => x.id === pv.dataset.prev); if (i > 0) openCard(SECTIONS[i - 1].id); return; }
    const h = e.target.closest(".chead"); if (h) { toggleCard(h.parentElement); return; }
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
    e.preventDefault(); t.value = t.placeholder; t.dispatchEvent(new Event("input", { bubbles: true }));
    UI.toast("예시문을 채웠습니다 — 내 상품 내용으로 고쳐주세요");
  });
  v.addEventListener("dragover", e => { if (e.dataTransfer && Array.prototype.some.call(e.dataTransfer.types || [], t => t === "Files")) { e.preventDefault(); v.classList.add("dropping"); } });
  v.addEventListener("dragleave", e => { if (!v.contains(e.relatedTarget)) v.classList.remove("dropping"); });
  v.addEventListener("drop", async e => { v.classList.remove("dropping"); if (!e.dataTransfer || !e.dataTransfer.files.length) return; e.preventDefault(); if (await FS.addPhotos(e.dataTransfer.files)) { go("brief"); setTimeout(() => openCard("photos", true), 60); } });
  const first = FS.analysis.length ? (SECTIONS.find(x => x.id !== "photos" && !App.secDone(x.id)) || SECTIONS[1]) : SECTIONS[0];
  openCard(first.id, true);
}};
/* 클립보드 붙여넣기 → 사진 (입력칸 밖에서) */
document.addEventListener("paste", async e => {
  if (!FS.name || /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
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
  photos: (g, eg, s) => (FS.name ? `<div class="dropz" data-act="addPhotos"><div class="dzi">${svg("photo")}</div><div><b>사진을 여기에 끌어다 놓거나 클릭해서 고르세요</b><small>Ctrl+V 로 클립보드 이미지도 됩니다 · 각도별 2~4장 · 긴 변 1200px 이상 권장</small></div><span class="btn sm">${svg("plus")} 사진 추가</span></div>` : `<div class="note w">${svg("warn")}<div class="nb">먼저 <b>새 프로젝트</b>를 만드세요.</div></div>`) + (!FS.analysis.length
    ? `<p class="hint" style="margin:10px 0 0">아직 사진이 없습니다. 사진이 들어오면 해상도·색·배경을 바로 분석합니다.</p>`
    : `<div class="note ${s.low ? "w" : "o"}" style="margin-top:12px">${svg(s.low ? "warn" : "check")}<div class="nb">${s.low
        ? `<b>${s.low}장이 권장 해상도(${SET.minLong}px) 미만.</b> ${esc(s.lowNames.join(" · "))}<br>이대로 진행하면 라벨 글씨가 뭉개지거나 AI가 지어낸 글자로 바뀔 수 있습니다. 제품이 나오는 타일은 원본을 업스케일해 합성합니다.`
        : `<b>해상도 양호.</b> 전 사진이 권장 기준을 넘습니다. 제품이 나오는 타일은 원본 픽셀을 그대로 합성합니다.`}</div></div>
      <dl class="kv"><dt>평균 긴 변</dt><dd>${s.avgLong}px ${s.avgLong >= 2400 ? "— 2K 타일에 충분" : s.avgLong >= 1200 ? "— 사용 가능" : "— 부족"}</dd>
        <dt>방향 구성</dt><dd>${Object.entries(s.orients).map(([k, n]) => `${k} ${n}장`).join(" · ")}</dd>
        <dt>누끼 적합</dt><dd>${s.cuttable}장</dd>
        <dt>추출 포인트 컬러</dt><dd><i class="sw" style="background:${s.accent}"></i>${s.accent}</dd></dl>
      <p class="hint" style="margin:10px 0 12px">여기서 하는 건 <b>기술 분석</b>입니다. 사진에 무엇이 찍혔는지는 AI가 제작할 때 직접 보고 판단합니다.</p>
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
    <div class="fld"><label>제품 사진 처리</label><p class="hint">권장은 <b>원본 그대로 합성</b> — 누끼·업스케일만 하고 AI가 제품을 다시 그리지 않습니다. 라벨·형태가 바뀌지 않습니다.</p>
      <div class="chips" data-radio="req.photoMode">${PHOTO_MODES.map(([k, l]) => `<label class="chip"><input type="radio" name="pm" value="${k}"${(g("req", "photoMode") || "keep") === k ? " checked" : ""}><span>${l}</span></label>`).join("")}</div></div>
    <div class="row2"><div class="fld"><label>원하는 분위기</label><textarea data-k="req.mood" placeholder="깨끗하고 자연광 느낌. 프리미엄하게.">${esc(g("req", "mood"))}</textarea></div>
      <div class="fld"><label>피하고 싶은 것</label><textarea data-k="req.avoid" placeholder="빨간 폭탄세일 느낌, 촌스러운 그라데이션">${esc(g("req", "avoid"))}</textarea></div></div>
    <div class="fld"><label>그 밖에 하고 싶은 말</label><textarea data-k="req.etc" placeholder="법적으로 못 쓰는 표현, 꼭 넣어야 할 고지, 참고 브랜드 등">${esc(g("req", "etc"))}</textarea></div>`,
  layout: () => {
    const sel = layoutSel(), groups = [];
    CATALOG.forEach(c => { let grp = groups.find(x => x.g === c.g); if (!grp) groups.push(grp = { g: c.g, items: [] }); grp.items.push(c); });
    return `<p class="hint">체크된 순서대로 조립됩니다. 인트로와 가격·CTA는 뺄 수 없습니다. <b>⚠</b> 는 실제 자료가 있어야 만들 수 있는 섹션입니다.</p>
      <div data-multi="layout.sections">${groups.map(grp => `<div class="catgrp"><div class="catg">${esc(grp.g)}</div><div class="chips">
        ${grp.items.map(c => `<label class="chip${c.lock ? " lock" : ""}" title="${esc(c.need || "")}"><input type="checkbox" value="${c.id}"${sel.includes(c.id) ? " checked" : ""}${c.lock ? " disabled" : ""}><span>${esc(c.label)}${c.need ? " ⚠" : ""}</span></label>`).join("")}</div></div>`).join("")}</div>`;
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
  const eg = App.eg(), map = { "product.name": eg.name, "product.price": eg.price, "target.who": eg.who, "fact.specs": eg.specs, "fact.usp": eg.usp };
  Object.entries(map).forEach(([k, v]) => { const f = $(`[data-k="${k}"]`); if (f) f.placeholder = v; });
  UI.toast("카테고리에 맞춰 예시문을 바꿨습니다");
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

/* ── 타일 (배율 · 스크롤 스파이 · 요청 배지) ── */
const Tiles = { title: "타일", mode: "strip", zoom: null, _spyVw: null, _spyFn: null,
  render(v) {
    if (!App.tiles.length) { v.innerHTML = `<div class="wrap"><div class="empty"><div class="eic">${svg("grid")}</div><b>아직 타일이 없습니다</b><p>브리프를 마치고 <b>AI로 상세페이지 만들기</b>를 누르면 여기에 들어옵니다.</p><button class="btn pri" data-act="gobrief">브리프로</button></div></div>`; v.onclick = e => { const a = e.target.closest("[data-act]"); if (a) ACT[a.dataset.act](); }; return; }
    this.zoom = this.zoom || Store.get("tileZoom", 100);
    const strip = this.mode === "strip", t = App.tally();
    v.innerHTML = `<div class="wrap wide center">
      <div class="vhead">
        <h1 class="pg">타일 <span class="cntl">${App.tiles.length}</span></h1>
        <div class="tally">${t.req ? `<span class="t-b">수정 요청 ${t.req}장</span><span class="t-c">영역 ${t.regions}</span>` : `<span class="t-d">요청 없음</span>`}</div>
        <div class="sp"></div>
        ${strip ? `<div class="zctl" title="Ctrl + 휠 · Ctrl + / − 로도 조절"><button data-z="-" aria-label="축소">−</button><input type="range" id="tz" min="25" max="200" value="${this.zoom}"><button data-z="+" aria-label="확대">+</button><b id="tzv">${this.zoom}%</b><button data-z="fit">맞춤</button><button data-z="100">100%</button></div>` : ""}
        <div class="seg"><button class="${strip ? "on" : ""}" data-m="strip">${svg("layers")} 이어붙이기</button><button class="${!strip ? "on" : ""}" data-m="grid">${svg("grid")} 그리드</button></div>
        <button class="btn" data-act="goreview">${svg("check")} 검수</button>
        <button class="btn pri" data-act="exportPreview">${svg("eye")} 클라이언트 프리뷰</button>
      </div>
      <div id="tbox"></div></div>`;
    const box = $("#tbox", v), badge = tl => { const rc = ((App.review[tl.n] || {}).regions || []).length; return App.hasReq(tl.n) ? `<i class="rb s-edit">수정 요청${rc ? " · 영역 " + rc : ""}</i>` : ""; };
    if (!strip) {
      box.className = "tgrid";
      box.innerHTML = App.tiles.map((tl, i) => `<div class="tcard" data-n="${esc(tl.n)}" data-src="${tl.f}" style="animation-delay:${i * 30}ms">${badge(tl)}<img src="${tl.f}" loading="lazy" alt=""><div class="cp"><b>${esc(tl.n)}. ${esc(tl.name)}</b><small>${esc(tl.copy || "")}</small></div></div>`).join("");
    } else {
      box.className = "strip";
      box.innerHTML = `<div class="pg" id="tpg" style="width:${this.px()}px">${App.tiles.map(tl =>
        `<div class="tl" data-n="${esc(tl.n)}"><span class="lb">${esc(tl.n)}${tl.name ? " · " + esc(tl.name) : ""}</span>${badge(tl)}<img src="${tl.f}" loading="lazy" alt="${esc(tl.n)}" onload="this.classList.add('in')"></div>`).join("")}</div>`;
      this.spy(v);
      $("#view").addEventListener("wheel", e => { if (!e.ctrlKey) return; e.preventDefault(); this.zoomAt(this.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1), e.clientY); }, { passive: false });
      const sl = $("#tz", v); if (sl) sl.oninput = () => this.zoomAt(+sl.value);
      if (App.curTile) { const t = $(`.tl[data-n="${CSS.escape(App.curTile)}"]`, v); if (t) setTimeout(() => t.scrollIntoView({ block: "start" }), 60); }
    }
    v.onclick = e => {
      const z = e.target.closest("[data-z]"); if (z) { const k = z.dataset.z; this.zoomAt(k === "+" ? this.zoom * 1.15 : k === "-" ? this.zoom / 1.15 : k === "100" ? 100 : this.fit()); return; }
      const m = e.target.closest("[data-m]"); if (m) { this.mode = m.dataset.m; go("tiles"); return; }
      const a = e.target.closest("[data-act]"); if (a) { ACT[a.dataset.act](); return; }
      const c = e.target.closest(".tcard[data-src]"); if (c) { App.curTile = c.dataset.n; go("review"); return; }
      const tl = e.target.closest(".strip .tl"); if (tl && e.detail === 2) { App.curTile = tl.dataset.n; go("review"); }
    };
  },
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

/* ── 검수 (영역 코멘트 뷰어) ── */
const QUICK = ["문구를 바꿔줘", "폰트를 더 굵게", "글자 크기 키워줘", "색 톤을 낮춰줘", "여백을 더 줘", "숫자 강조를 키워줘", "사진을 바꿔줘", "배지 스타일 바꿔줘", "배경을 밝게"];
const Review = { title: "검수", cur: 0, s: 1, x: 0, y: 0, fitS: 1, _drag: null, _ro: null, drawing: false, _rect: null, hi: -1,
  render(v) {
    if (!App.tiles.length) { v.innerHTML = `<div class="wrap"><div class="empty"><div class="eic">${svg("check")}</div><b>검수할 타일이 없습니다</b><p>타일이 생성되면 여기서 영역을 잡아 수정 요청을 남깁니다.</p></div></div>`; return; }
    if (App.curTile) { const i = App.tiles.findIndex(t => t.n === App.curTile); if (i >= 0) this.cur = i; }
    this.drawing = false; this.hi = -1;
    v.innerHTML = `<div class="rv">
      <div class="rv-stage" id="rvStage">
        <div class="rv-can" id="rvCan"><img id="rvImg" alt="" draggable="false"><div class="rv-ann" id="rvAnn"></div></div>
        <div class="rv-tools"><button class="btn pri" id="rvDraw" title="D">${svg("plus")} 영역 잡기</button><span class="hint" id="rvHint">이미지 위를 끌어 영역을 잡고 코멘트를 적으세요. 한 장에 여러 개 가능.</span></div>
        <div class="zctl float"><button data-z="-" aria-label="축소">−</button><b id="rvZ">100%</b><button data-z="+" aria-label="확대">+</button><button data-z="fit">맞춤</button><button data-z="100">100%</button></div>
        <p class="rvhint">휠 확대·축소 · 드래그 이동 · 더블클릭 맞춤 ↔ 100% · <kbd>D</kbd> 영역 잡기</p>
      </div>
      <div class="rv-side">
        <div class="rvh"><span class="rvn" id="rvN"></span><h3 id="rvT"></h3></div><p id="rvS" class="rvsub"></p>
        <div class="fld"><label>영역 코멘트 <span class="opt" id="rvCnt"></span></label><div class="rgl" id="rgl"></div></div>
        <div class="fld"><label>이 장 전체에 대한 요청 <span class="opt">선택</span></label><textarea id="rvNote" placeholder="영역과 무관한 요청. 예: 전체적으로 여백을 더 주고 배경을 조금 밝게"></textarea>
          <div class="ghostchips">${QUICK.map(q => `<button data-q="${q}">${q}</button>`).join("")}</div></div>
        <div class="rvnav"><button class="btn" id="rvPrev">← 이전</button><button class="btn" id="rvNextU" title="다음 요청 없는 장">${svg("flag")} 다음 미검수</button><button class="btn pri" id="rvNext">다음 →</button></div>
        <p class="hint"><kbd>←</kbd> <kbd>→</kbd> 이동 · <kbd>D</kbd> 영역 · <kbd>Del</kbd> 선택 영역 삭제</p>
        <div class="rvfoot"><button class="btn" data-act="gotiles">${svg("grid")} 타일에서 보기</button><button class="btn pri blk" data-act="revise">${svg("sparkles")} 검수 반영 — AI 수정 실행</button><p class="hint" style="margin:6px 0 0">영역과 코멘트를 그대로 넘겨 <b>해당 부분만</b> 고칩니다. 톤앤매너는 유지됩니다.</p></div>
      </div></div>`;
    $("#rvNote", v).addEventListener("input", () => { this.rec().note = $("#rvNote", v).value; this.cap(); });
    $$(".ghostchips [data-q]", v).forEach(b => b.onclick = () => { const ta = $("#rvNote", v); ta.value = (ta.value.trim() ? ta.value.replace(/\s+$/, "") + "\n" : "") + b.dataset.q; ta.dispatchEvent(new Event("input", { bubbles: true })); ta.focus(); });
    $("#rvPrev", v).onclick = () => this.go(this.cur - 1);
    $("#rvNext", v).onclick = () => this.go(this.cur + 1);
    $("#rvNextU", v).onclick = () => { const i = App.tiles.findIndex((t, k) => k > this.cur && !App.hasReq(t.n)); if (i < 0) return UI.toast("뒤에 미검수 장이 없습니다", "o"); this.go(i); };
    v.onclick = e => { const a = e.target.closest("[data-act]"); if (a) ACT[a.dataset.act](); };
    $("#rvDraw", v).onclick = () => this.setDraw(!this.drawing);

    /* 영역 목록 */
    const L = $("#rgl", v);
    L.addEventListener("input", e => { const t = e.target.closest("textarea[data-ri]"); if (!t) return; const r = this.rec(); if (r.regions[+t.dataset.ri]) { r.regions[+t.dataset.ri].text = t.value; this.cap(); } });
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
        if (w > .01 && h > .01) { const rec = this.rec(); rec.regions.push({ x: +x.toFixed(4), y: +y.toFixed(4), w: +w.toFixed(4), h: +h.toFixed(4), text: "" }); this.hi = rec.regions.length - 1; this.cap(); this.list(); const ta = $(`#rgl textarea[data-ri="${this.hi}"]`); if (ta) ta.focus(); }
        this.paint(); return; }
      this._drag = null; st.classList.remove("grab");
    };
    st.ondblclick = e => { if (e.target.closest(".zctl,.rv-tools") || this.drawing) return; if (Math.abs(this.s - this.fitS) < .01) this.zoomTo(1, e.clientX, e.clientY); else this.layout(true); };
    $(".zctl", st).onclick = e => { const b = e.target.closest("[data-z]"); if (!b) return; const k = b.dataset.z; if (k === "fit") return this.layout(true); this.zoomTo(k === "+" ? this.s * 1.15 : k === "-" ? this.s / 1.15 : 1); };
    if (this._ro) this._ro.disconnect();
    this._ro = new ResizeObserver(() => this.layout(false)); this._ro.observe(st);
    this.go(this.cur);
  },
  setDraw(on) { this.drawing = on; const b = $("#rvDraw"), st = $("#rvStage"); if (b) { b.classList.toggle("pri", !on); b.classList.toggle("dgr", on); b.innerHTML = on ? svg("x") + " 영역 잡기 끝" : svg("plus") + " 영역 잡기"; } if (st) st.classList.toggle("draw", on); },
  imgPt(e, clampIt) { const img = $("#rvImg"); if (!img) return null; const r = img.getBoundingClientRect(); let x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; if (clampIt) { x = clamp(x, 0, 1); y = clamp(y, 0, 1); } return { x, y }; },
  rec() { const t = App.tiles[this.cur]; const r = App.review[t.n]; if (!r || !Array.isArray(r.regions)) App.review[t.n] = { regions: (r && r.regions) || [], note: (r && r.note) || "" }; return App.review[t.n]; },
  go(i) {
    this.cur = clamp(i, 0, App.tiles.length - 1);
    const t = App.tiles[this.cur], r = this.rec(); App.curTile = t.n; this.hi = -1; this._rect = null;
    const img = $("#rvImg"); img.classList.remove("in"); img.src = t.f; img.onload = () => { img.classList.add("in"); this.layout(true); this.paint(); };
    $("#rvN").textContent = t.n; $("#rvT").textContent = t.name || "타일"; $("#rvS").textContent = t.copy || "";
    $("#rvNote").value = r.note || "";
    $("#rvPrev").disabled = this.cur === 0; $("#rvNext").disabled = this.cur === App.tiles.length - 1;
    this.list(); this.paint();
    renderSide(); const cur = $("#sideBody .sitem.on"); if (cur) cur.scrollIntoView({ block: "nearest" });
  },
  list() {
    const L = $("#rgl"); if (!L) return; const r = this.rec();
    $("#rvCnt").textContent = r.regions.length ? `${r.regions.length}개` : "없음";
    L.innerHTML = r.regions.length ? r.regions.map((g, i) => `<div class="rgi${i === this.hi ? " hi" : ""}" data-ri="${i}"><span class="rgn">${i + 1}</span><textarea data-ri="${i}" placeholder="이 영역을 어떻게 바꿀까요? 예: 숫자를 130%로, 글씨 더 굵게">${esc(g.text)}</textarea><button class="rgx" data-del="${i}" title="삭제">${svg("x")}</button></div>`).join("")
      : `<p class="hint" style="margin:4px 0 0"><b>영역 잡기</b>를 누르고 이미지 위를 끌어보세요.</p>`;
  },
  paint() {
    const A = $("#rvAnn"); if (!A) return; const r = this.rec();
    let h = r.regions.map((g, i) => `<div class="rg${i === this.hi ? " hi" : ""}" style="left:${g.x * 100}%;top:${g.y * 100}%;width:${g.w * 100}%;height:${g.h * 100}%"><b>${i + 1}</b></div>`).join("");
    if (this._rect) { const q = this._rect; h += `<div class="rg tmp" style="left:${Math.min(q.x0, q.x1) * 100}%;top:${Math.min(q.y0, q.y1) * 100}%;width:${Math.abs(q.x1 - q.x0) * 100}%;height:${Math.abs(q.y1 - q.y0) * 100}%"></div>`; }
    A.innerHTML = h;
    $$(".rgi", $("#rgl")).forEach(x => x.classList.toggle("hi", +x.dataset.ri === this.hi));
  },
  layout(fit) {
    const st = $("#rvStage"), img = $("#rvImg"); if (!st || !img || !img.naturalWidth) return;
    const W = st.clientWidth - 48, H = st.clientHeight - 88;
    this.fitS = Math.min(W / img.naturalWidth, H / img.naturalHeight, 1);
    if (fit) { this.s = this.fitS; this.x = 0; this.y = 0; }
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
  /* 영역을 빨간 번호 박스로 그린 PNG → review/NN_marked.png (AI 가 영역을 정확히 알아보게) */
  async buildMarked(tile) {
    const r = App.review[tile.n]; if (!r || !r.regions || !r.regions.length) return null;
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = tile.f; });
    const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const x = c.getContext("2d"); x.drawImage(img, 0, 0);
    const lw = Math.max(6, Math.round(c.width * .005)), fs = Math.max(28, Math.round(c.width * .035));
    r.regions.forEach((g, i) => {
      const X = g.x * c.width, Y = g.y * c.height, W = g.w * c.width, H = g.h * c.height;
      x.fillStyle = "rgba(255,45,45,.14)"; x.fillRect(X, Y, W, H);
      x.strokeStyle = "#FF2D2D"; x.lineWidth = lw; x.strokeRect(X, Y, W, H);
      const R = fs * .75; x.beginPath(); x.arc(X + R * .9, Y + R * .9, R, 0, Math.PI * 2); x.fillStyle = "#FF2D2D"; x.fill();
      x.fillStyle = "#fff"; x.font = `bold ${fs}px Pretendard, Arial, sans-serif`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(String(i + 1), X + R * .9, Y + R * .95);
    });
    const blob = await new Promise(res => c.toBlob(res, "image/png"));
    const file = `review/${tile.n}_marked.png`;
    await Local.saveImage(FS.name, file, blob);
    return file;
  }
};
document.addEventListener("keydown", e => {
  if (App.view !== "review" || !App.tiles.length) return;
  if (/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName) || $(".ovl.on") || $(".lbx.on")) return;
  if (e.key === "ArrowLeft") Review.go(Review.cur - 1);
  if (e.key === "ArrowRight" || e.key === "Enter") Review.go(Review.cur + 1);
  if (e.key === "d" || e.key === "D") Review.setDraw(!Review.drawing);
  if (e.key === "Escape" && Review.drawing) Review.setDraw(false);
  if ((e.key === "Delete" || e.key === "Backspace") && Review.hi >= 0) { Review.rec().regions.splice(Review.hi, 1); Review.hi = -1; Review.cap(); Review.paint(); Review.list(); }
});

/* ── AI 실행 패널 (EXE: Claude Code 헤드리스) ── */
const RunUI = {
  el: null, timer: null, next: 0, open: false, min: false,
  ensure() {
    if (this.el) return this.el;
    this.el = el("div", "runp", `<div class="rh"><span class="rdot"></span><b id="runT">AI 작업</b><span class="sp"></span><button class="ib" id="runMin" title="접기">${svg("chev")}</button><button class="ib" id="runX" title="닫기">${svg("x")}</button></div>
      <div class="rl" id="runL"></div>
      <div class="rf"><span id="runS" class="hint"></span><span class="sp"></span><button class="btn sm dgr" id="runStop">${svg("stop")} 중단</button><button class="btn sm pri" id="runReload" hidden>${svg("refresh")} 타일 새로고침</button></div>`);
    document.body.appendChild(this.el);
    $("#runMin", this.el).onclick = () => { this.min = !this.min; this.el.classList.toggle("min", this.min); };
    $("#runX", this.el).onclick = () => this.hide();
    $("#runStop", this.el).onclick = async () => { if (!(await UI.confirm("AI 작업을 중단할까요?", "지금까지 만든 파일은 남습니다.", { ok: "중단", danger: true }))) return; try { await Local.runStop(); } catch (e) { UI.toast(e.message, "w"); } };
    $("#runReload", this.el).onclick = () => this.reload();
    return this.el;
  },
  show(title) { this.ensure(); this.open = true; this.min = false; this.el.classList.add("on"); this.el.classList.remove("min", "done", "fail"); $("#runT", this.el).textContent = title || "AI 작업"; $("#runL", this.el).innerHTML = ""; $("#runReload", this.el).hidden = true; $("#runStop", this.el).hidden = false; this.next = 0; this.poll(); },
  hide() { this.open = false; if (this.el) this.el.classList.remove("on"); clearInterval(this.timer); this.timer = null; },
  async poll() {
    clearInterval(this.timer);
    const tick = async () => {
      let j; try { j = await Local.runStatus(this.next); } catch (e) { return; }
      const L = $("#runL", this.el);
      (j.lines || []).forEach(ln => { const d = el("div", "ln " + ln.kind, `<i>${new Date(ln.t).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</i><span>${esc(ln.text)}</span>`); L.appendChild(d); });
      if ((j.lines || []).length) L.scrollTop = L.scrollHeight;
      this.next = j.next || this.next;
      const el2 = $("#runS", this.el);
      if (j.running) el2.textContent = `실행 중 · ${Math.round((Date.now() - j.startedAt) / 60000)}분`;
      else if (j.done) { clearInterval(this.timer); this.timer = null; el2.textContent = j.exit === 0 ? "완료" : "종료됨"; this.el.classList.add(j.exit === 0 ? "done" : "fail"); $("#runStop", this.el).hidden = true; $("#runReload", this.el).hidden = false; UI.toast(j.exit === 0 ? "AI 작업이 끝났습니다" : "AI 작업이 종료됐습니다", j.exit === 0 ? "o" : "w"); if (j.exit === 0) this.reload(); }
      else el2.textContent = "";
    };
    await tick(); this.timer = setInterval(tick, 1500);
  },
  async reload() { if (!FS.name) return; await FS.load(FS.name, true); Local._projects = null; if (["tiles", "review", "home"].includes(App.view)) go(App.view); else renderSide(); }
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

    ${Local.desktop ? `<h3 class="h3">업데이트</h3>
    <div class="card open"><div class="cbody" style="border-top:0"><div class="srow" style="margin-top:14px"><span><b>버전 <span id="updV">확인 중…</span></b><small id="updS">GitHub 에 새 버전이 올라오면 정중앙 팝업으로 알려드립니다 (6시간마다 · 켤 때).</small></span><button class="btn" id="updChk">${svg("refresh")} 지금 확인</button></div></div></div>` : ""}

    <h3 class="h3">데이터</h3>
    <div class="card open"><div class="cbody" style="border-top:0"><div class="srow" style="margin-top:14px"><span><b>브리프·검수 초기화</b><small>이 콘솔에 저장된 입력을 지웁니다. 폴더의 파일은 그대로입니다.</small></span><button class="btn dgr" data-act="reset">${svg("x")} 초기화</button></div>
      <div class="srow"><span><b>설정 기본값으로</b><small>테마·작업 설정을 처음 값으로 되돌립니다.</small></span><button class="btn" data-act="resetSet">${svg("refresh")} 되돌리기</button></div></div></div>

    <p class="hint" style="margin-top:18px">re:boot · <code>#F86010</code> · 기준 문서는 상위 폴더 <code>README.md</code>${Local.desktop ? ` · 로그 <code>%APPDATA%\\re-boot 콘솔\\main-error.log</code>` : ""}</p>
  </div>`;
  renderConnect($("#connBox", v));
  if (Local.desktop) {
    const showU = u => { const V = $("#updV", v), S = $("#updS", v); if (!V) return; V.textContent = "v" + (u.current || "?"); S.textContent = u.state === "portable" ? "포터블 EXE 는 자동 업데이트가 없습니다. 설치형(setup)을 쓰세요." : u.state === "available" ? `새 버전 ${u.version} 있음` : u.state === "downloaded" ? `${u.version} 내려받음 — 다시 시작하면 설치` : u.state === "latest" ? "최신 버전입니다" : u.state === "checking" ? "확인 중…" : u.state === "error" ? "확인 실패: " + (u.error || "") : u.state === "unsupported" ? "개발 실행에서는 꺼져 있습니다" : "GitHub 에 새 버전이 올라오면 정중앙 팝업으로 알려드립니다."; };
    Local.update().then(showU).catch(() => {});
    $("#updChk", v).onclick = async () => { try { await Local.updateAct("check"); } catch (e) {} UI.toast("확인 중…"); setTimeout(async () => { const u = await Update.poll(true); if (u) showU(u); }, 4000); };
  }
  v.addEventListener("click", e => {
    if (e.target.closest("#connBox")) return;
    const sb = e.target.closest(".seg[data-set] button"); if (sb) { const k = sb.parentElement.dataset.set; SET[k] = sb.dataset.v; saveSet(); $$("button", sb.parentElement).forEach(b => b.classList.toggle("on", b === sb)); UI.toast("적용했습니다", "o"); return; }
    const a = e.target.closest("[data-act]"); if (a) ACT[a.dataset.act]();
  });
  v.addEventListener("change", e => {
    const t = e.target; if (!t.dataset || !t.dataset.set) return;
    const k = t.dataset.set;
    if (t.type === "checkbox") SET[k] = t.checked;
    else { let n = parseFloat(t.value); if (isNaN(n)) n = SET_DEF[k]; n = clamp(n, +t.min, +t.max); t.value = n; SET[k] = n; }
    saveSet(); UI.toast("저장했습니다", "o");
  });
}};

/* ═══ 액션 ═══ */
const photoRows = () => FS.analysis.map(a => ({ name: a.name, w: a.w, h: a.h, size: a.size, orient: a.orient, resGrade: a.resGrade, bgSimple: a.bgSimple, palette: (a.pal || []).map(x => x.hex) }));
async function aiReady() {
  if (!Local.desktop) return { ok: false, why: "EXE 에서만 바로 실행됩니다" };
  let t; try { t = await Local.tools(); } catch (e) { return { ok: false, why: e.message }; }
  if (t.run && t.run.running) return { ok: false, why: "이미 AI 작업이 실행 중입니다", running: true };
  if (!t.claude.installed) return { ok: false, why: "Claude Code 가 설치되지 않았습니다", fix: true };
  if (!t.claude.loggedIn) return { ok: false, why: "Claude Code 로그인이 필요합니다", fix: true };
  if (!t.higgsfield.connected || !t.higgsfield.authed) return { ok: false, why: "Higgsfield MCP 인증이 필요합니다", fix: true };
  return { ok: true };
}
const ACT = {
  gobrief() { go("brief"); }, gotiles() { go("tiles"); }, goreview() { go("review"); }, goprojects() { go("projects"); }, reconnect() { go("settings"); },
  async newproj() {
    if (!Local.ok) return UI.alert("서버가 없습니다", "<b>re-boot 콘솔.exe</b> 로 실행해야 합니다.", "w");
    const today = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const v = await UI.dialog({ title: "새 프로젝트", sub: "상품 이름만 정하면 됩니다. 사진은 다음 화면에서 끌어다 넣으세요.", icon: "plus", tone: "b",
      body: `<div class="fld"><label>상품 이름</label><input type="text" id="npName" placeholder="예: 벤딕트 에어건" maxlength="40"></div><p class="hint">폴더 이름은 <code>${today}_상품이름</code> 으로 만들어집니다.</p>`,
      buttons: [{ label: "취소", value: 0 }, { label: "만들기", value: 1, kind: "pri" }], onOpen(d) { const i = $("#npName", d); setTimeout(() => i.focus(), 60); i.onkeydown = e => { if (e.key === "Enter") UI._close(1); }; } });
    const nm = ($("#npName") && $("#npName").value.trim()) || ""; if (v !== 1) return; if (!nm) return UI.toast("상품 이름을 적어주세요", "w");
    try { const j = await Local.createProject(`${today}_${nm}`); Local._projects = null; App.brief = {}; App.review = {}; await FS.load(j.name, true); Store.set("lastProject", j.name); UI.toast(j.existed ? "이미 있는 프로젝트를 열었습니다" : `${j.name} 만들었습니다 — 사진을 넣어주세요`, "o"); go("brief"); setTimeout(() => openCard("photos", true), 60); }
    catch (e) { UI.alert("만들지 못했습니다", esc(e.message), "d"); }
  },
  gophotos() { go("brief"); setTimeout(() => openCard("photos", true), 60); },
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
  /* 브리프 → order.json → (EXE) 이 창에서 바로 제작 */
  async make() {
    if (!App.secDone("product")) { if (App.view !== "brief") go("brief"); setTimeout(() => openCard("product"), 80); return UI.toast("상품 섹션(상품명·카테고리)부터 채워주세요", "w"); }
    const p = App.progress(), order = buildOrder();
    const r = await FS.write("order.json", JSON.stringify({ project: FS.name || Store.get("lastProject", ""), savedAt: new Date().toISOString(), brief: App.brief, review: App.review, order, photos: photoRows(), photoSummary: FS.summary, layout: layoutSel(), photoMode: (App.brief.req || {}).photoMode || "keep" }, null, 2));
    const cmd = `${FS.name || "프로젝트"} 만들어줘`;
    const rd = Local.desktop ? await aiReady() : { ok: false };
    if (!FS.analysis.length) return UI.alert("사진이 없습니다", "제품 사진을 먼저 넣어주세요. 사진 없이는 제품이 들어간 타일을 만들 수 없습니다.", "w");
    const btns = [{ label: "닫기", value: 0 }];
    if (Local.desktop) btns.push(rd.ok ? { label: "여기서 바로 제작", value: 3, kind: "pri" } : rd.fix ? { label: "연결 설정으로", value: 4, kind: "pri" } : { label: "터미널로 열기", value: 5, kind: "pri" });
    else btns.push({ label: "명령 복사", value: 1, kind: "pri" });
    const v = await UI.dialog({ title: "제작 준비가 됐습니다", sub: `브리프와 사진 분석을 정리했습니다.`, icon: "sparkles", tone: rd.ok ? "o" : "b",
      body: `<p style="margin:0 0 10px">${rd.ok ? "<b>여기서 바로 제작</b>을 누르면 Claude Code 가 이 창 안에서 기획안 → 타일 생성까지 돌립니다. 진행 로그가 오른쪽 아래에 뜹니다. 보통 15~30분, 크레딧 약 " + (layoutSel().length * 3) + "." : Local.desktop ? `<b>${esc(rd.why || "")}</b>` : "Claude 대화창에 아래 한 줄을 붙여넣으면 <code>order.json</code>을 읽어 <b>기획안 → 타일 생성</b>으로 이어집니다."}</p>${Local.desktop && rd.ok ? "" : `<pre class="cmd">${esc(cmd)}</pre>`}<p class="hint" style="margin:10px 0 0">브리프 ${p.done}/${p.total} · 사진 ${FS.analysis.length}장 · 구성 ${layoutSel().length}섹션 · 제품 사진 ${(App.brief.req || {}).photoMode === "reinterpret" ? "AI 재해석" : "원본 합성"}</p>`,
      buttons: btns });
    if (v === 3) return ACT.runAI("make");
    if (v === 4) return go("settings");
    if (v === 5) return ACT.runClaudeTerm();
    const txt = v === 1 ? cmd : v === 2 ? order : null; if (!txt) return;
    try { await navigator.clipboard.writeText(txt); UI.toast("복사했습니다 — 대화창에 붙여넣으세요", "o"); } catch (e) { UI.toast("복사 실패", "d"); }
  },
  async runAI(mode) {
    try { await Local.run(FS.name, mode); RunUI.show(mode === "make" ? `제작 — ${FS.name}` : `검수 반영 — ${FS.name}`); UI.toast("AI 작업을 시작했습니다", "o"); }
    catch (e) { UI.alert("시작 실패", esc(e.message), "d"); }
  },
  /* 검수 영역·코멘트 → review.json + review/NN_marked.png → (EXE) AI 수정 */
  async revise() {
    const targets = App.tiles.filter(t => App.hasReq(t.n));
    if (!targets.length) return UI.toast("영역이나 요청을 먼저 남겨주세요", "w");
    if (!Local.ok || !FS.name) return UI.alert("서버가 필요합니다", "EXE 로 실행한 상태에서만 됩니다.", "w");
    const ok = await UI.dialog({ title: "검수 반영 — AI 수정", sub: `${targets.length}장 · 영역 ${App.tally().regions}개. 표시된 영역과 코멘트만 반영하고 나머지는 그대로 둡니다.`, icon: "sparkles", tone: "o",
      body: `<ul class="ul">${targets.map(t => { const r = App.review[t.n]; return `<li><b>${esc(t.n)}${t.name ? ". " + esc(t.name) : ""}</b> — 영역 ${(r.regions || []).length}개${(r.note || "").trim() ? " · 전체 요청" : ""}</li>`; }).join("")}</ul><p class="hint" style="margin-top:10px">영역 표시본이 <code>review/</code> 에 저장되고 AI 가 그 번호를 보고 고칩니다. 원본은 <code>tiles/v_prev/</code> 에 백업됩니다.</p>`,
      buttons: [{ label: "취소", value: 0 }, { label: Local.desktop ? "AI 수정 시작" : "파일 저장 + 명령 복사", value: 1, kind: "pri" }] });
    if (!ok) return;
    UI.toast("영역 표시본 만드는 중…");
    try { for (const t of targets) await Review.buildMarked(t); await FS.saveReviewFile(); }
    catch (e) { return UI.alert("저장 실패", esc(e.message), "d"); }
    const cmd = `${FS.name} 검수 반영해줘`;
    if (Local.desktop) {
      const rd = await aiReady();
      if (rd.ok) return ACT.runAI("revise");
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

function buildOrder() {
  const L = [], b = App.brief, s = FS.summary, p = App.progress();
  L.push(`[${FS.name || Store.get("lastProject", "프로젝트")}] 작업 요청`, `작성: ${new Date().toLocaleString("ko-KR")}`, "");
  L.push(`■ 브리프 (${p.done}/${p.total} 섹션)`);
  SECTIONS.filter(x => x.id !== "photos").forEach(sec => { if (App.secDone(sec.id)) L.push(`  ${sec.n}. ${sec.title} — ${App.secSummary(sec.id)}`); });
  const miss = SECTIONS.filter(x => x.id !== "photos" && !App.secDone(x.id)); if (miss.length) L.push(`  미작성: ${miss.map(m => m.title).join(", ")}`);
  L.push(`  제품 사진 처리: ${(b.req || {}).photoMode === "reinterpret" ? "AI 재해석 허용" : "원본 그대로 합성 (TRACK A — 누끼·업스케일만, 재생성 금지)"}`, "");
  const sel = layoutSel();
  L.push(`■ 페이지 구성 (${sel.length}개 섹션)`, "  " + sel.map(id => catOf(id).label).join(" → "));
  const hasReviews = !!(b.proof && (b.proof.reviews || "").trim()), hasAwards = !!(b.proof && (b.proof.certs || []).filter(x => x !== "없음").length);
  const blocked = sel.filter(id => (id === "reviews" && !hasReviews) || (id === "awards" && !hasAwards));
  if (blocked.length) L.push("  ⚠ 자료 없음 → 제작 보류: " + blocked.map(id => catOf(id).label).join(", "));
  L.push("");
  if (s) { L.push("■ 사진 분석", `  ${s.total}장 · 평균 긴 변 ${s.avgLong}px · 누끼 적합 ${s.cuttable}장 · 포인트 컬러 ${s.accent}`); if (s.low) L.push(`  ⚠ 해상도 부족 ${s.low}장 — ${s.lowNames.join(", ")} → 업스케일 후 합성`); L.push(""); }
  if (App.tiles.length) {
    const todo = []; let regions = 0;
    L.push(`■ 페이지 순서 (${App.tiles.length}장)`, "   " + App.tiles.map(t => t.n).join(" → "), "");
    App.tiles.forEach(t => { const r = App.review[t.n]; if (!App.hasReq(t.n)) return;
      const x = [`▸ ${t.n}. ${t.name || ""}  — review/${t.n}_marked.png`];
      (r.regions || []).forEach((g, i) => { regions++; x.push(`   ${i + 1}) 영역 x${Math.round(g.x * 100)}% y${Math.round(g.y * 100)}% w${Math.round(g.w * 100)}% h${Math.round(g.h * 100)}%: ${(g.text || "").trim() || "(코멘트 없음)"}`); });
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
  if (Local.desktop) { try { const st = await Local.runStatus(0); if (st.running) RunUI.show(`${st.mode === "make" ? "제작" : "검수 반영"} — ${st.name}`); } catch (e) {} Update.start(); }
}
document.addEventListener("DOMContentLoaded", boot);
window.rebootApp = { App, FS, UI, go, Store, Local, Tiles, Review, RunUI, ACT, Update };
})();

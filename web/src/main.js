import * as THREE from 'three';
import { loadCase } from './volume.js';
import { SliceView } from './sliceView.js';
import { View3D } from './view3d.js';
import { Quiz } from './quiz.js';
import { TourPlayer } from './tours.js';
import { Handbook } from './lessons.js';

const $ = (s) => document.querySelector(s);
const V = typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'dev';

// 旧版 meta.json 没有 presets 字段时使用的 CT 默认窗
const CT_PRESETS = [
  { zh: '软组织', w: 400, l: 40 },
  { zh: '肝脏', w: 160, l: 60 },
  { zh: '肺窗', w: 1500, l: -600 },
  { zh: '骨窗', w: 1800, l: 400 },
];

const SYSTEM_ORDER = ['digestive', 'respiratory', 'cardio', 'urogenital', 'endocrine', 'nervous', 'skeletal', 'muscular'];

function hexToRgb(h) { return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); }
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

async function main() {
  const bar = $('#loading i');
  // 病例列表
  let cases = [];
  try { cases = await (await fetch(`./cases/index.json?v=${V}`)).json(); } catch { /* 单病例部署时可没有 index.json */ }
  const DEFAULT_CASE = cases.find((c) => c.default)?.id || cases.find((c) => c.modality === 'CT')?.id || cases[0]?.id || 's0344';
  let CASE = new URLSearchParams(location.search).get('case') || DEFAULT_CASE;
  let caseNotice = '';
  if (cases.length && !cases.some((c) => c.id === CASE)) {
    // 链接里的病例不存在（拼错或已移除）：打开默认病例并提示，而不是停在加载失败页
    caseNotice = `未找到病例"${CASE}"，已打开默认病例。`;
    CASE = DEFAULT_CASE;
    const u = new URL(location.href); u.searchParams.delete('case'); u.searchParams.delete('tour');
    history.replaceState(null, '', u);
  }
  const vol = await loadCase(`./cases/${CASE}`, (p) => { bar.style.width = `${(p * 100).toFixed(0)}%`; });
  const { meta } = vol;
  const unit = meta.unit || 'HU';
  let WL_PRESETS = meta.presets || CT_PRESETS;
  document.body.classList.toggle('mr', meta.modality === 'MR');
  if (meta.source) $('.credit').textContent = `数据：${meta.source}。仅供教学，不用于诊断。`;

  // ---------------- 全局状态 ----------------
  const colorLut = new Uint8Array((Math.max(...meta.structures.map((s) => s.id)) + 1) * 3);
  for (const s of meta.structures) colorLut.set(hexToRgb(s.color), s.id * 3);

  const state = {
    cursor: [vol.nx / 2, vol.ny / 2, vol.nz / 2],
    selected: 0,
    wl: [400, 40],
    lut: new Uint8Array(4096),
    colorLut,
    overlay: 0.35,
    outline: true,
    ghost: true,
    showPlanes: { axial: true, coronal: false, sagittal: false },
    hiddenIds: new Set(),
    hideCrosshair: false,
    quiz: null,
    setCursor(v, opts = {}) {
      const prev = this.cursor.map(Math.round);
      this.cursor = v.map((x, a) => Math.max(0, Math.min([vol.nx, vol.ny, vol.nz][a] - 1, x)));
      const now = this.cursor.map(Math.round);
      for (const sv of Object.values(views)) {
        if (prev[sv.p.n] !== now[sv.p.n]) sv.dirty = true;
      }
      schedule();
    },
    setWL(w, l, presetIdx) {
      this.wl = [Math.round(w), Math.round(l)];
      buildLut();
      document.querySelectorAll('#wl-presets button').forEach((b, i) => b.classList.toggle('on', i === presetIdx));
      $('#wl-readout').textContent = `W ${this.wl[0]}  L ${this.wl[1]}`;
      invalidateAll();
    },
    select(id, opts = {}) {
      if (this.quiz?.intercept(id, opts)) return;
      const changed = id !== this.selected;
      this.selected = id;
      if (id && opts.from !== 'axial' && opts.from !== 'coronal' && opts.from !== 'sagittal') {
        const v = opts.voxel && vol.labelAt(...opts.voxel) === id ? opts.voxel : anchorOf(vol.byId.get(id));
        this.setCursor(v);
      }
      if (changed) {
        invalidateAll();
        with3d((v) => v.applyAppearance());
        renderCard();
        highlightTree(opts.from !== 'tree');
      }
    },
    tooltip(t) {
      const el = $('#tooltip');
      const masked = t && this.quiz?.hideNames;
      if (!t || (!t.s && t.hu == null) || (masked && t.hu == null)) { el.hidden = true; return; }
      el.hidden = false;
      el.innerHTML = (masked ? '' : t.s ? `<b>${esc(t.s.zh)}</b><span class="en">${esc(t.s.en)}</span>` : '<span class="en">未标注</span>') +
        (t.hu != null ? `<span class="en">${t.hu} ${unit}</span>` : '');
      el.style.left = `${t.x + 14}px`; el.style.top = `${t.y + 12}px`;
    },
  };

  function buildLut() {
    const [w, l] = state.wl, lo = l - w / 2;
    for (let i = 0; i < 4096; i++) state.lut[i] = Math.max(0, Math.min(255, ((i - 1024 - lo) / w) * 255));
  }
  buildLut();

  // 结构的"定位点"：在代表横断层内，取离该层截面质心最近的结构体素
  function anchorOf(s) {
    const k = s.bestSlice[2];
    const [[i0, i1], [j0, j1]] = s.bboxVoxel;
    let si = 0, sj = 0, n = 0;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (vol.labels[vol.idx(i, j, k)] === s.id) { si += i; sj += j; n++; }
    if (!n) return s.centroidVoxel;
    const mi = si / n, mj = sj / n;
    let best = null, bd = Infinity;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      if (vol.labels[vol.idx(i, j, k)] !== s.id) continue;
      const d = (i - mi) ** 2 + (j - mj) ** 2;
      if (d < bd) { bd = d; best = [i, j, k]; }
    }
    return best;
  }

  // ---------------- 视图 ----------------
  const views = {};
  document.querySelectorAll('.view.slice').forEach((el) => {
    views[el.dataset.plane] = new SliceView(el, el.dataset.plane, vol, state);
  });
  let view3d = null;
  let ready3d = false;
  let pendingView = null;   // 导览在 3D 就绪前请求的相机方向
  // 3D 模型就绪后才执行（模型加载中或失败时，二维功能照常工作）
  const with3d = (fn) => { if (ready3d) fn(view3d); };
  let pending = false;
  function invalidateAll() { for (const sv of Object.values(views)) sv.dirty = true; schedule(); }
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      for (const sv of Object.values(views)) { sv.draw(sv.dirty); sv.dirty = false; }
      view3d?.syncSlices();
      if (state.selected) updateCardCursor();
    });
  }

  // 初始位置：肝的代表层面
  const liver = vol.byKey.get('liver');
  if (liver) state.cursor = anchorOf(liver);

  // ---------------- 顶栏 ----------------
  const pre = $('#wl-presets');
  function renderPresets() {
    pre.innerHTML = '';
    WL_PRESETS.forEach((p, i) => {
      const b = document.createElement('button');
      b.textContent = p.zh; b.title = `W ${p.w} / L ${p.l}`;
      b.onclick = () => state.setWL(p.w, p.l, i);
      pre.appendChild(b);
    });
    state.setWL(WL_PRESETS[0].w, WL_PRESETS[0].l, 0);
  }
  renderPresets();

  // MRI 多序列（如 T1 / T2）切换：同一网格，只替换图像数据与窗位预设
  const seqBox = $('#seq');
  // guard：可选，返回 false 时放弃提交（用于导览：下载期间导览已退出或换了步骤）
  let seqReq = 0;
  async function setSequence(id, guard) {
    const sq = meta.sequences?.find((x) => x.id === id);
    if (!sq) return false;
    if (state.seq === id) return true;
    const req = ++seqReq;
    seqBox.querySelectorAll('button').forEach((b) => { b.classList.toggle('on', b.dataset.id === id); b.disabled = true; });
    try {
      await vol.fetchSequence(sq.file);
      if (req !== seqReq || (guard && !guard())) return false;   // 已有更新的请求，或调用方已不需要
      vol.useSequence(sq.file);
      state.seq = id;
      WL_PRESETS = sq.presets;
      renderPresets();
      invalidateAll();
      tour?.refreshProbe();
      return true;
    } finally {
      if (req === seqReq) seqBox.querySelectorAll('button').forEach((b) => { b.disabled = false; b.classList.toggle('on', b.dataset.id === state.seq); });
    }
  }
  if (meta.sequences?.length > 1) {
    state.seq = meta.sequences[0].id;
    seqBox.hidden = false;
    seqBox.innerHTML = '<span class="lbl">序列</span><div class="seg">' +
      meta.sequences.map((x) => `<button data-id="${x.id}" class="${x.id === state.seq ? 'on' : ''}">${x.id}</button>`).join('') + '</div>';
    seqBox.querySelectorAll('button').forEach((b) => b.onclick = () => setSequence(b.dataset.id)
      .catch((err) => showToast(`${b.dataset.id} 序列下载失败：${err.message || err}`)));
  }
  const c = meta.caseInfo || {};
  const sp = meta.spacing.map((x) => +x.toFixed(2));
  const spTxt = sp.every((x) => x === sp[0]) ? `${sp[0]} mm 各向同性` : `${sp.join('×')} mm`;
  $('#case-info').textContent = [c.desc, spTxt, `${meta.structures.length} 个结构`].filter(Boolean).join(' · ');
  // 病例切换
  const sel = $('#case-select');
  const list = cases.length ? cases : [{ id: meta.caseId, modality: meta.modality || 'CT', desc: c.desc || '' }];
  sel.innerHTML = ['CT', 'MR'].map((m) => {
    const items = list.filter((x) => x.modality === m);
    return items.length ? `<optgroup label="${m === 'CT' ? 'CT' : 'MRI'}">${items.map((x) =>
      `<option value="${x.id}">${m === 'MR' ? 'MRI' : 'CT'} · ${esc(x.desc || x.id)}</option>`).join('')}</optgroup>` : '';
  }).join('');
  sel.value = CASE;
  sel.addEventListener('change', () => {
    const u = new URL(location.href);
    u.searchParams.set('case', sel.value);
    location.href = u.toString();
  });

  // ---------------- 左侧结构树 ----------------
  const sortKey = (k) => k.replace(/vertebrae_([CTLS])/, (_, ch) => `vertebrae_${'CTLS'.indexOf(ch)}${ch}`);
  const groups = [...SYSTEM_ORDER, ...Object.keys(meta.systems).filter((k) => !SYSTEM_ORDER.includes(k))].map((sys) => ({
    sys, info: meta.systems[sys],
    items: meta.structures.filter((s) => s.system === sys)
      .sort((a, b) => sortKey(a.key).localeCompare(sortKey(b.key), 'en', { numeric: true })),
  })).filter((g) => g.items.length);

  const tree = $('#tree');
  const itemEls = new Map();
  for (const g of groups) {
    const box = document.createElement('div');
    box.className = 'sys' + (['skeletal', 'muscular'].includes(g.sys) ? ' collapsed' : '');
    box.innerHTML = `<div class="sys-head"><span class="caret">▾</span><span class="dot" style="background:${g.info.color}"></span>
      <span class="name">${g.info.zh} <span class="count">${g.info.en}</span></span><span class="count">${g.items.length}</span>
      <button class="eye" title="显示/隐藏整个系统">👁</button></div><div class="items"></div>`;
    const head = box.querySelector('.sys-head');
    head.addEventListener('click', (e) => { if (!e.target.classList.contains('eye')) box.classList.toggle('collapsed'); });
    head.querySelector('.eye').addEventListener('click', () => {
      const allHidden = g.items.every((s) => state.hiddenIds.has(s.id));
      for (const s of g.items) setHidden(s.id, !allHidden);
    });
    const list = box.querySelector('.items');
    for (const s of g.items) {
      const it = document.createElement('div');
      it.className = 'item';
      it.dataset.search = `${s.zh} ${s.en} ${s.key}`.toLowerCase();
      it.innerHTML = `<span class="dot" style="background:${s.color}"></span><span class="zh">${esc(s.zh)}</span>
        <span class="en">${esc(s.en)}</span><button class="eye" title="显示/隐藏">👁</button>`;
      it.addEventListener('click', (e) => {
        if (e.target.classList.contains('eye')) { setHidden(s.id, !state.hiddenIds.has(s.id)); return; }
        state.select(s.id, { from: 'tree' });
      });
      list.appendChild(it);
      itemEls.set(s.id, it);
    }
    tree.appendChild(box);
  }

  function setHidden(id, hide) {
    if (hide) state.hiddenIds.add(id); else state.hiddenIds.delete(id);
    itemEls.get(id)?.classList.toggle('hidden3d', hide);
    with3d((v) => v.applyAppearance());
    invalidateAll();
  }

  function highlightTree(scroll) {
    for (const [id, el] of itemEls) el.classList.toggle('sel', id === state.selected);
    const el = itemEls.get(state.selected);
    if (el && scroll) {
      el.closest('.sys').classList.remove('collapsed');
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  $('#search').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll('.sys').forEach((box) => {
      let any = false;
      box.querySelectorAll('.item').forEach((it) => {
        const ok = !q || it.dataset.search.includes(q);
        it.style.display = ok ? '' : 'none';
        any ||= ok;
      });
      box.style.display = any ? '' : 'none';
      if (q && any) box.classList.remove('collapsed');
    });
  });

  // ---------------- 右侧信息卡 ----------------
  const card = $('#card');
  const emptyCard = card.innerHTML;
  function renderCard() {
    const s = vol.byId.get(state.selected);
    if (!s) { card.className = 'card empty'; card.innerHTML = emptyCard; return; }
    const sys = meta.systems[s.system];
    card.className = 'card';
    card.innerHTML = `
      <h2><span class="dot" style="background:${s.color};width:14px;height:14px"></span>${esc(s.zh)}</h2>
      <div class="en">${esc(s.en)}</div>
      <div class="meta">
        <span>系统</span><b>${sys.zh} · ${sys.en}</b>
        <span>体积</span><b>${s.volumeMl.toLocaleString()} mL</b>
        <span>范围</span><b>横断层 ${s.bboxVoxel[2][0] + 1} – ${s.bboxVoxel[2][1] + 1}</b>
        <span>光标处</span><b id="card-hu">—</b>
      </div>
      ${s.desc ? `<p class="desc">${esc(s.desc)}</p>` : ''}
      <div class="acts">
        <button data-act="locate">定位到代表层面</button>
        <button data-act="isolate">${isIsolated(s.id) ? '显示全部' : '仅显示此结构'}</button>
        <button data-act="hide">${state.hiddenIds.has(s.id) ? '显示' : '隐藏'}</button>
      </div>`;
    card.querySelector('[data-act=locate]').onclick = () => state.setCursor(anchorOf(s));
    card.querySelector('[data-act=isolate]').onclick = () => {
      const iso = isIsolated(s.id);
      for (const o of meta.structures) setHidden(o.id, iso ? false : o.id !== s.id);
      renderCard();
    };
    card.querySelector('[data-act=hide]').onclick = () => { setHidden(s.id, !state.hiddenIds.has(s.id)); renderCard(); };
    updateCardCursor();
  }
  function isIsolated(id) { return state.hiddenIds.size === meta.structures.length - 1 && !state.hiddenIds.has(id); }
  function updateCardCursor() {
    const el = $('#card-hu');
    if (!el) return;
    const hu = vol.huAt(...state.cursor);
    const id = vol.labelAt(...state.cursor);
    el.textContent = `${hu} ${unit}${id === state.selected ? '（在结构内）' : ''}`;
  }

  // ---------------- 选项 ----------------
  $('#opt-overlay').addEventListener('input', (e) => { state.overlay = e.target.value / 100; invalidateAll(); });
  $('#opt-outline').addEventListener('change', (e) => { state.outline = e.target.checked; invalidateAll(); });
  $('#opt-ghost').addEventListener('change', (e) => { state.ghost = e.target.checked; with3d((v) => v.applyAppearance()); });
  document.querySelectorAll('.planes input').forEach((cb) => cb.addEventListener('change', () => {
    state.showPlanes[cb.dataset.plane] = cb.checked; view3d?.syncSlices();
  }));
  $('#opt-clip').addEventListener('change', (e) => with3d((v) => v.setClip(e.target.value)));
  $('#btn-reset').addEventListener('click', () => with3d((v) => v.resetView()));
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'Escape') state.select(0, { from: 'key' });
  });

  // ---------------- 3D ----------------
  // 二维切片此时已可用：先撤掉全屏加载层，3D 在自己的面板里异步加载，失败时可重试
  $('#loading').remove();
  if (caseNotice) showToast(caseNotice);
  const v3el = $('#view3d');
  const v3msg = document.createElement('div');
  v3msg.className = 'v3-msg';
  v3el.appendChild(v3msg);
  async function init3d() {
    v3msg.hidden = false;
    v3msg.innerHTML = '3D 模型加载中… <span>0%</span>';
    try {
      if (!view3d) view3d = new View3D(v3el, vol, state, views);
      invalidateAll();
      await view3d.loadModel((p) => { v3msg.querySelector('span').textContent = `${Math.round(p * 100)}%`; });
      ready3d = true;
      v3msg.hidden = true;
      view3d.applyAppearance();
      view3d.setClip($('#opt-clip').value);
      if (pendingView) { view3d.resetView(new THREE.Vector3(...pendingView)); pendingView = null; }
      invalidateAll();
    } catch (err) {
      console.error(err);
      const webgl = !view3d;
      v3msg.innerHTML = `<b>3D 模型${webgl ? '无法显示' : '加载失败'}</b><p>${webgl ? '浏览器未能启用 WebGL（可能被禁用或显卡不支持）。' : '模型文件下载或解析失败，请检查网络后重试。'}</p>
        <p class="v3-err">${esc(err.message || String(err))}</p>
        <p>二维切片、导览和测验仍可正常使用。</p>${webgl ? '' : '<button>重试</button>'}`;
      v3msg.querySelector('button')?.addEventListener('click', init3d);
    }
  }
  init3d();

  // ---------------- 测验模式 ----------------
  const quizBtn = $('#btn-quiz');
  const quiz = new Quiz({
    vol, state, anchorOf,
    panel: $('#quiz'),
    refresh: () => { invalidateAll(); with3d((v) => v.applyAppearance()); },
    focus3d: (id) => with3d((v) => (id ? v.focusOn(id) : v.resetView())),
    onEnter: () => {
      $('#quiz').hidden = false; $('#card').hidden = true; $('.overlay-ctl').hidden = true;
      quizBtn.classList.add('on'); quizBtn.textContent = '退出测验';
      highlightTree(false);
    },
    onExit: (selectId) => {
      $('#quiz').hidden = true; $('#card').hidden = false; $('.overlay-ctl').hidden = false;
      quizBtn.classList.remove('on'); quizBtn.textContent = '测验模式';
      for (const [id, el] of itemEls) el.classList.toggle('hidden3d', state.hiddenIds.has(id));
      state.select(selectId || 0, { from: 'quiz' });
      renderCard(); highlightTree(true);
      invalidateAll(); with3d((v) => v.applyAppearance());
    },
  });
  quizBtn.addEventListener('click', () => {
    if (quiz.active) { quiz.exit(); return; }
    tour.exit();
    quiz.enter();
  });

  // ---------------- 导览模式 ----------------
  const tourBtn = $('#btn-tour');
  let saved = null;
  const tour = new TourPlayer({
    vol, state,
    panel: $('#tour'),
    select: (key) => state.select(vol.byKey.get(key).id, { from: 'tour' }),
    axialTo: (k) => state.setCursor([state.cursor[0], state.cursor[1], k]),
    setSequence,
    setPreset: (name) => {
      const i = WL_PRESETS.findIndex((p) => p.zh === name);
      if (i >= 0) state.setWL(WL_PRESETS[i].w, WL_PRESETS[i].l, i);
    },
    setVisible: (keys) => {
      for (const s of meta.structures) setHidden(s.id, !!keys && !keys.has(s.key));
      with3d((v) => v.resetView());
    },
    setClip: (mode) => { $('#opt-clip').value = mode; with3d((v) => v.setClip(mode)); },
    setOverlay: (v) => { state.overlay = v; $('#opt-overlay').value = Math.round(v * 100); invalidateAll(); },
    openLesson: (id) => handbook.open(id),
    runTour: (c, t) => runTour(c, t),
    hasCase: (id) => id === CASE || list.some((x) => x.id === id),
    setView: (d) => {
      // 3D 尚未就绪时记下导览要求的视角，模型加载完成后再应用
      if (ready3d) view3d.resetView(new THREE.Vector3(...d)); else pendingView = d;
    },
    onEnter: () => {
      saved = { overlay: state.overlay, hidden: new Set(state.hiddenIds), clip: $('#opt-clip').value, planes: { ...state.showPlanes } };
      $('#tour').hidden = false; $('#card').hidden = true;
      tourBtn.classList.add('on'); tourBtn.textContent = '退出导览';
    },
    onExit: () => {
      pendingView = null;
      $('#tour').hidden = true; $('#card').hidden = false;
      tourBtn.classList.remove('on'); tourBtn.textContent = '导览';
      for (const s of meta.structures) setHidden(s.id, saved.hidden.has(s.id));
      $('#opt-clip').value = saved.clip;
      with3d((v) => v.setClip(saved.clip));
      Object.assign(state.showPlanes, saved.planes);
      document.querySelectorAll('.planes input').forEach((cb) => { cb.checked = !!state.showPlanes[cb.dataset.plane]; });
      with3d((v) => { v.applyAppearance(); v.syncSlices(); });
      tour.api.setOverlay(saved.overlay);
      renderCard();
    },
  });
  tourBtn.addEventListener('click', () => {
    if (tour.active) { tour.exit(); return; }
    quiz.exit();
    tour.enter();
  });
  window.addEventListener('keydown', (e) => { if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') tour.onKey(e); });
  window.addEventListener('keydown', (e) => {
    if (!quiz.active || e.target.tagName === 'INPUT') return;
    const next = $('#quiz [data-act=next]');
    if (e.key === 'Enter' && next) { e.preventDefault(); next.click(); }
    const n = +e.key;
    if (n >= 1 && n <= 4) $('#quiz .q-choices')?.querySelectorAll('button')[n - 1]?.click();
  });

  // ---------------- 读片手册 ----------------
  // 在指定病例中启动导览；病例不同时带参数跳转页面
  function runTour(caseId, tourId) {
    if (caseId !== CASE) {
      const u = new URL(location.href);
      u.searchParams.set('case', caseId); u.searchParams.set('tour', tourId);
      location.href = u.toString();
      return;
    }
    quiz.exit(); tour.enter(); tour.startById(tourId);
  }
  const handbook = new Handbook({
    currentCase: CASE,
    hasCase: (id) => id === CASE || list.some((x) => x.id === id),
    runTour,
  });
  $('#btn-learn').addEventListener('click', () => handbook.open());
  const tourParam = new URLSearchParams(location.search).get('tour');
  if (tourParam) {
    tour.enter(); tour.startById(tourParam);
    const u = new URL(location.href); u.searchParams.delete('tour'); history.replaceState(null, '', u);
  }

  window.__app = { vol, state, views, get view3d() { return view3d; }, quiz, tour };
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 6000);
}

main().catch((err) => {
  console.error(err);
  const box = $('#loading');
  if (!box) { showToast(`出错：${err.message}`); return; }
  box.querySelector('.bar')?.remove();
  box.querySelector('p').innerHTML = `加载失败：${esc(err.message || String(err))}<br><br>
    <button onclick="location.reload()">重试</button> <a href="./">打开默认病例</a>`;
});

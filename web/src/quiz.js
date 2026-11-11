// 测验模式
//
// 三种题型：
//   locate   看名称 → 在断层上点出结构
//   from3d   3D 中高亮一个结构 → 在断层上点出它
//   identify 断层上描边 + 3D 显示 → 从 4 个选项中选出名称
//
// 作答期间：关闭标签叠加、隐藏十字线、悬停不显示名称、左侧结构树锁定、3D 点击不生效。

const TYPES = {
  locate:   { zh: '看名称找结构', en: 'Name → Locate' },
  from3d:   { zh: '看 3D 找断层', en: '3D → Slice' },
  identify: { zh: '看断层认结构', en: 'Slice → Name' },
};
const PLANES = new Set(['axial', 'coronal', 'sagittal']);
// 各切面的面内两轴（与 sliceView 的 PLANES 一致）
const SLICE_AXES = { axial: { u: 0, v: 1 }, coronal: { u: 0, v: 2 }, sagittal: { u: 1, v: 2 } };
const DEFAULT_SYSTEMS = ['digestive', 'respiratory', 'cardio', 'urogenital', 'endocrine', 'nervous'];
const MIN_ML = 3; // 体积过小的结构不出题（太难点中）

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export class Quiz {
  constructor({ vol, state, anchorOf, refresh, focus3d, panel, onEnter, onExit, getClip, setClip }) {
    Object.assign(this, { vol, state, anchorOf, refresh, focus3d, panel, onEnter, onExit, getClip, setClip });
    this.active = false;
    const present = new Set(vol.meta.structures.map((s) => s.system));
    const def = DEFAULT_SYSTEMS.filter((k) => present.has(k));
    // 脑图谱等病例没有默认系统时，默认全选
    this.cfg = { types: new Set(Object.keys(TYPES)), systems: new Set(def.length ? def : present), count: 10 };
  }

  // ---------------- 进入 / 退出 ----------------
  enter() {
    if (this.active) return;
    const s = this.state;
    this.saved = { overlay: s.overlay, outline: s.outline, ghost: s.ghost, selected: s.selected, hidden: new Set(s.hiddenIds), clip: this.getClip?.() };
    // 测验期间暂停 3D 剖切：题目目标可能整体落在被裁掉的一侧（如矢状剖切去掉左半身）
    if (this.saved.clip && this.saved.clip !== 'none') this.setClip?.('none');
    this.active = true;
    s.quiz = this;
    this.onEnter?.();
    this.renderSetup();
  }

  exit(selectId = 0) {
    if (!this.active) return;
    const s = this.state;
    Object.assign(s, { overlay: this.saved.overlay, outline: this.saved.outline, ghost: this.saved.ghost, hideCrosshair: false });
    s.hiddenIds = this.saved.hidden;
    s.selected = 0;
    this.active = false;
    this.phase = null;
    s.quiz = null;
    this._lockView(false);   // 答题途中退出时解除作答锁定（结构列表模糊、不可点击）
    this.onExit?.(selectId || this.saved.selected);
    if (this.saved.clip && this.saved.clip !== 'none') this.setClip?.(this.saved.clip);
  }

  // 作答阶段遮蔽名称
  get hideNames() { return this.active && this.phase === 'ask'; }

  // ---------------- 设置页 ----------------
  renderSetup() {
    this.phase = 'setup';
    this._lockView(false);
    const { meta } = this.vol;
    const sysCounts = {};
    for (const s of meta.structures) if (s.volumeMl >= MIN_ML) sysCounts[s.system] = (sysCounts[s.system] || 0) + 1;
    this.panel.innerHTML = `
      <div class="q-head"><h2>测验模式 <small>Quiz</small></h2><button class="q-x" title="退出测验">✕</button></div>
      <div class="q-sec">题型</div>
      ${Object.entries(TYPES).map(([k, t]) => `
        <label class="q-opt"><input type="checkbox" name="type" value="${k}" ${this.cfg.types.has(k) ? 'checked' : ''}/>
          ${t.zh} <span class="en">${t.en}</span></label>`).join('')}
      <div class="q-sec">范围（系统）</div>
      <div class="q-sys">
      ${Object.entries(meta.systems).filter(([k]) => sysCounts[k]).map(([k, v]) => `
        <label class="q-opt"><input type="checkbox" name="sys" value="${k}" ${this.cfg.systems.has(k) ? 'checked' : ''}/>
          <span class="dot" style="background:${v.color}"></span>${v.zh} <span class="en">${sysCounts[k]}</span></label>`).join('')}
      </div>
      <div class="q-sec">题数</div>
      <div class="seg q-count">${[5, 10, 20].map((n) => `<button data-n="${n}" class="${n === this.cfg.count ? 'on' : ''}">${n}</button>`).join('')}</div>
      <p class="q-note"></p>
      <button class="q-primary" data-act="start">开始测验</button>`;
    const p = this.panel;
    p.querySelector('.q-x').onclick = () => this.exit();
    p.querySelectorAll('.q-count button').forEach((b) => b.onclick = () => {
      this.cfg.count = +b.dataset.n;
      p.querySelectorAll('.q-count button').forEach((x) => x.classList.toggle('on', x === b));
    });
    p.querySelector('[data-act=start]').onclick = () => {
      this.cfg.types = new Set([...p.querySelectorAll('input[name=type]:checked')].map((i) => i.value));
      this.cfg.systems = new Set([...p.querySelectorAll('input[name=sys]:checked')].map((i) => i.value));
      const pool = this._pool();
      const note = p.querySelector('.q-note');
      if (!this.cfg.types.size) { note.textContent = '请至少选择一种题型。'; return; }
      if (pool.length < 4) { note.textContent = '所选范围内结构太少，请多选几个系统。'; return; }
      this.start(pool);
    };
  }

  _pool() {
    return this.vol.meta.structures.filter((s) => this.cfg.systems.has(s.system) && s.volumeMl >= MIN_ML && s.hasMesh && !s.key.includes('cyst'));
  }

  // ---------------- 出题 ----------------
  start(pool) {
    this.pool = pool;
    const types = [...this.cfg.types];
    // 结构尽量不重复；不够时循环
    let order = shuffle([...pool]);
    while (order.length < this.cfg.count) order = order.concat(shuffle([...pool]));
    this.questions = order.slice(0, this.cfg.count).map((s, i) => ({ s, type: types[i % types.length] }));
    shuffle(this.questions);
    this.i = 0;
    this.score = 0;
    this.log = [];
    this.ask();
  }

  ask() {
    const q = this.questions[this.i];
    const { state, vol } = this;
    this.phase = 'ask';
    this.answered = false;
    state.hiddenIds = new Set();
    state.overlay = 0;
    state.hideCrosshair = true;
    state.ghost = true;
    const anchor = this.anchorOf(q.s);

    if (q.type === 'identify') {
      state.selected = q.s.id;
      state.outline = true;
      state.setCursor(anchor);
      q.options = shuffle([q.s, ...this._distractors(q.s, 3)]);
    } else {
      // 只把横断层放到结构所在层面；冠状/矢状放在体中心，避免十字位置泄露答案
      state.setCursor([vol.nx / 2, vol.ny / 2, anchor[2]]);
      state.outline = false;
      state.selected = q.type === 'from3d' ? q.s.id : 0;
    }
    this._lockView(true);
    this.refresh();
    // 看 3D / 认结构 两种题型把镜头对准目标；看名称找结构则复位全身视图，避免泄露位置
    this.focus3d?.(q.type === 'locate' ? null : q.s.id);
    this._renderQuestion();
  }

  // 干扰项：优先选空间上相邻的结构（更像真实的鉴别）
  _distractors(s, n) {
    const c = s.centroidVoxel;
    const near = this.pool.filter((o) => o.id !== s.id && o.zh !== s.zh)
      .map((o) => ({ o, d: o.centroidVoxel.reduce((a, v, k) => a + (v - c[k]) ** 2, 0) }))
      .sort((a, b) => a.d - b.d).slice(0, 8).map((x) => x.o);
    return shuffle(near).slice(0, n);
  }

  _renderQuestion(feedback = '') {
    const q = this.questions[this.i];
    const t = TYPES[q.type];
    let body = '';
    if (q.type === 'locate') {
      body = `<p class="q-prompt">请在断层图像上点出：</p>
        <div class="q-target">${esc(q.s.zh)}<span>${esc(q.s.en)}</span></div>
        <p class="q-hint">横断位已翻到该结构所在层面；可滚轮翻层，三个视图任选其一作答。</p>`;
    } else if (q.type === 'from3d') {
      body = `<p class="q-prompt">3D 模型中<b class="hl">高亮</b>的结构，在断层上是哪一块？请点出它。</p>
        <p class="q-hint">可旋转 3D 模型观察形态和位置；横断位已翻到该结构所在层面。</p>`;
    } else {
      body = `<p class="q-prompt">断层上<b class="hl">黄色描边</b>的结构是：</p>
        <div class="q-choices">${q.options.map((o) => `
          <button data-id="${o.id}">${esc(o.zh)}<span>${esc(o.en)}</span></button>`).join('')}</div>`;
    }
    this.panel.innerHTML = `
      <div class="q-head"><h2>${t.zh} <small>${t.en}</small></h2><button class="q-x" title="退出测验">✕</button></div>
      <div class="q-progress"><span>第 ${this.i + 1} / ${this.questions.length} 题</span><span>得分 ${this.score}</span></div>
      <div class="q-bar"><i style="width:${(this.i / this.questions.length) * 100}%"></i></div>
      ${body}
      <div class="q-feedback">${feedback}</div>
      <div class="q-acts">
        ${this.answered
          ? `<button class="q-primary" data-act="next">${this.i + 1 < this.questions.length ? '下一题 →' : '查看成绩'}</button>`
          : '<button data-act="skip">不会，看答案</button>'}
      </div>`;
    const p = this.panel;
    p.querySelector('.q-x').onclick = () => this.exit();
    p.querySelector('[data-act=next]')?.addEventListener('click', () => this.next());
    p.querySelector('[data-act=skip]')?.addEventListener('click', () => this._answer(null, '跳过'));
    p.querySelectorAll('.q-choices button').forEach((b) => {
      if (this.answered) {
        b.disabled = true;
        if (+b.dataset.id === q.s.id) b.classList.add('right');
        else if (+b.dataset.id === this.lastPick) b.classList.add('wrong');
      } else {
        b.onclick = () => this._answer(+b.dataset.id);
      }
    });
    p.querySelector('[data-act=next]')?.focus();
  }

  // 由 state.select 调用：返回 true 表示已被测验接管
  intercept(id, opts) {
    if (this.phase === 'setup' || this.phase === 'done') return false;
    if (this.phase !== 'ask') return false; // 揭晓答案后允许自由浏览
    const q = this.questions[this.i];
    if (q.type !== 'identify' && PLANES.has(opts.from) && !this.answered) {
      this._answer(this._hit(q.s.id, opts.voxel, opts.from) ? q.s.id : id);
    }
    return true;
  }

  // 点击容差：只在用户点击的那一层切片内搜索，点击处 3 mm 以内有目标结构即算对。
  // 容差按体素间距换算成毫米，不同分辨率的病例判定一致；不跨层，避免相邻层的结构被判为点中。
  _hit(id, v, plane) {
    if (!v) return false;
    const TOL = 3;
    const p = SLICE_AXES[plane];
    if (!p) return this.vol.labelAt(...v) === id;
    const sp = this.vol.meta.spacing;
    const ru = Math.floor(TOL / sp[p.u]), rv = Math.floor(TOL / sp[p.v]);
    const c = v.map(Math.round);
    const x = [...c];
    for (let dv = -rv; dv <= rv; dv++) for (let du = -ru; du <= ru; du++) {
      if ((du * sp[p.u]) ** 2 + (dv * sp[p.v]) ** 2 > TOL * TOL) continue;
      x[p.u] = c[p.u] + du; x[p.v] = c[p.v] + dv;
      if (this.vol.labelAt(...x) === id) return true;
    }
    return false;
  }

  _answer(pickId, label) {
    const q = this.questions[this.i];
    const ok = pickId === q.s.id;
    this.answered = true;
    this.lastPick = pickId;
    if (ok) this.score++;
    const picked = pickId ? this.vol.byId.get(pickId) : null;
    this.log.push({ q, ok, picked });

    // 揭晓：显示目标结构描边与 3D 高亮，恢复十字线和名称
    const { state } = this;
    this.phase = 'review';
    state.selected = q.s.id;
    state.outline = true;
    state.hideCrosshair = false;
    if (q.type !== 'identify') state.setCursor(this.anchorOf(q.s));
    this._lockView(false);
    this.refresh();

    const name = `<b>${esc(q.s.zh)}</b> <span class="en">${esc(q.s.en)}</span>`;
    let fb;
    if (ok) fb = `<div class="ok">✓ 正确！${name}</div>`;
    else if (label === '跳过') fb = `<div class="bad">答案：${name}</div>`;
    else {
      const you = picked ? `<b>${esc(picked.zh)}</b> <span class="en">${esc(picked.en)}</span>` : '未标注区域';
      fb = `<div class="bad">✗ 你选的是：${you}<br>正确答案：${name}</div>`;
    }
    if (q.s.desc) fb += `<p class="q-desc">${esc(q.s.desc)}</p>`;
    this._renderQuestion(fb);
  }

  next() {
    this.i++;
    if (this.i < this.questions.length) this.ask();
    else this.finish();
  }

  finish() {
    this.phase = 'done';
    const { state } = this;
    state.selected = 0;
    state.overlay = this.saved.overlay;
    state.hideCrosshair = false;
    this._lockView(false);
    this.refresh();
    const n = this.questions.length, pct = Math.round((this.score / n) * 100);
    const wrong = this.log.filter((l) => !l.ok);
    const grade = pct >= 90 ? '优秀' : pct >= 70 ? '良好' : pct >= 50 ? '继续加油' : '建议先在探索模式复习';
    this.panel.innerHTML = `
      <div class="q-head"><h2>测验完成 <small>Result</small></h2><button class="q-x" title="退出测验">✕</button></div>
      <div class="q-score"><b>${this.score}</b> / ${n}<span>${pct}% · ${grade}</span></div>
      ${wrong.length ? `<div class="q-sec">错题回顾（点击查看）</div>
        <ul class="q-wrong">${wrong.map((l) => `
          <li data-id="${l.q.s.id}"><span class="dot" style="background:${l.q.s.color}"></span>
          <b>${esc(l.q.s.zh)}</b><span class="en">${esc(l.q.s.en)}</span>
          <small>${TYPES[l.q.type].zh}${l.picked ? ` · 误选 ${esc(l.picked.zh)}` : ''}</small></li>`).join('')}</ul>`
        : '<p class="q-note">全部答对！</p>'}
      <div class="q-acts">
        <button class="q-primary" data-act="again">再来一组</button>
        ${wrong.length ? '<button data-act="retry">只练错题</button>' : ''}
        <button data-act="exit">退出测验</button>
      </div>`;
    const p = this.panel;
    p.querySelector('.q-x').onclick = () => this.exit();
    p.querySelector('[data-act=exit]').onclick = () => this.exit();
    p.querySelector('[data-act=again]').onclick = () => this.renderSetup();
    p.querySelector('[data-act=retry]')?.addEventListener('click', () => {
      this.questions = shuffle(wrong.map((l) => ({ ...l.q })));
      this.i = 0; this.score = 0; this.log = [];
      this.ask();
    });
    p.querySelectorAll('.q-wrong li').forEach((li) => li.onclick = () => this.exit(+li.dataset.id));
  }

  // 作答时锁定左侧结构树（防止直接看到名称）
  _lockView(lock) { document.body.classList.toggle('quiz-lock', lock); }
}

// 2D 断层视图：横断位 / 冠状位 / 矢状位（放射学惯例：患者右侧显示在屏幕左侧）
//
// 每个平面由 法向轴 n、屏幕横轴 u、屏幕纵轴 v 定义（轴编号 0=i/R, 1=j/A, 2=k/S）。
// 三个平面的 u、v 都做翻转：屏幕列 c → 体素 u = Nu-1-c，屏幕行 r → 体素 v = Nv-1-r。
export const PLANES = {
  axial:    { n: 2, u: 0, v: 1, dirs: { l: 'R', r: 'L', t: 'A', b: 'P' } },
  coronal:  { n: 1, u: 0, v: 2, dirs: { l: 'R', r: 'L', t: 'S', b: 'I' } },
  sagittal: { n: 0, u: 1, v: 2, dirs: { l: 'A', r: 'P', t: 'S', b: 'I' } },
};

const SPOT_DIM = 0.3, SPOT_PAD_MM = 15, SPOT_NEAR_MM = 60, SPOT_SNUG_MM = 10, SPOT_MAIN_MM = 100, SPOT_FIT = 1.2;

export class SliceView {
  constructor(el, plane, vol, state) {
    this.el = el;
    this.plane = plane;
    this.p = PLANES[plane];
    this.vol = vol;
    this.state = state;
    this.canvas = el.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    const dims = [vol.nx, vol.ny, vol.nz];
    const sp = vol.meta.spacing;
    this.Nu = dims[this.p.u]; this.Nv = dims[this.p.v]; this.Nn = dims[this.p.n];
    this.su = sp[this.p.u]; this.sv = sp[this.p.v];
    // 离屏画布：体素分辨率的切片图像（灰度 + 标签叠加），同时作为 3D 切面纹理
    this.off = document.createElement('canvas');
    this.off.width = this.Nu; this.off.height = this.Nv;
    this.offCtx = this.off.getContext('2d');
    this.img = this.offCtx.createImageData(this.Nu, this.Nv);
    this.zoom = 1; this.pan = [0, 0];
    this.dirty = true;
    this.version = 0;
    const d = this.p.dirs;
    el.querySelector('.dirs').innerHTML =
      `<span style="left:8px;top:50%">${d.l}</span><span style="right:8px;top:50%">${d.r}</span>` +
      `<span style="left:50%;top:26px">${d.t}</span><span style="left:50%;bottom:6px">${d.b}</span>`;
    this.posEl = el.querySelector('.vpos');
    this._bind();
    new ResizeObserver(() => this._resize()).observe(el);
    this._resize();
  }

  get slice() { return Math.round(this.state.cursor[this.p.n]); }

  // 当前切片 → 离屏 ImageData
  renderSlice() {
    const { vol, state, p, Nu, Nv } = this;
    const { ct, labels, nx, ny } = vol;
    const lut = state.lut, colors = state.colorLut;
    const data = this.img.data;
    const s = Math.max(0, Math.min(this.Nn - 1, this.slice));
    const sel = state.selected || 0;
    const a = state.overlay, aSel = Math.min(1, a + 0.3);
    const strides = [1, nx, nx * ny];
    const su = strides[p.u], sv = strides[p.v], base = s * strides[p.n];
    const showOverlay = a > 0;
    const hidden = state.hiddenIds;
    const isolated = state.isolatedSliceLabel;
    const spot = this.spot = this._spotlight(base, su, sv);
    // 聚光灯开启时记录本层可操作（照亮范围内，或本层无目标时整层）的结构，供 3D / 结构树判断能否选中
    const lit = this.litLabels = this.state.spotlight ? new Set() : null;
    const litLim = spot ? ((1 + spot.out) / 2) ** 2 : Infinity;
    for (let r = 0; r < Nv; r++) {
      const vv = Nv - 1 - r;
      let idx = base + vv * sv + (Nu - 1) * su;
      let o = r * Nu * 4;
      const dy = spot ? (r - spot.cy) / spot.ry : 0;
      for (let c = 0; c < Nu; c++, idx -= su, o += 4) {
        let g = lut[ct[idx] + 1024];
        let f = 1;
        const L = labels[idx];
        if (spot) {
          const dx = (c - spot.cx) / spot.rx, d2 = dx * dx + dy * dy;
          if (L && d2 <= litLim) lit.add(L);
          if (d2 > 1) f = d2 >= spot.out2 ? SPOT_DIM : 1 - (1 - SPOT_DIM) * (Math.sqrt(d2) - 1) / (spot.out - 1);
          g *= f;
        } else if (L && lit) lit.add(L);
        if (L && showOverlay && (!isolated || L === isolated) && !hidden.has(L)) {
          const k = L === sel ? aSel : a, k1 = 1 - k, kf = k * f;
          data[o] = g * k1 + colors[L * 3] * kf;
          data[o + 1] = g * k1 + colors[L * 3 + 1] * kf;
          data[o + 2] = g * k1 + colors[L * 3 + 2] * kf;
        } else {
          data[o] = data[o + 1] = data[o + 2] = g;
        }
        data[o + 3] = 255;
      }
    }
    // 选中结构描边（四邻域边界）；结构被隐藏时不描边，与彩色叠加一致
    if (sel && state.outline && (!isolated || sel === isolated) && !hidden.has(sel)) {
      for (let r = 0; r < Nv; r++) {
        const vv = Nv - 1 - r;
        for (let c = 0; c < Nu; c++) {
          const uu = Nu - 1 - c;
          const idx = base + vv * sv + uu * su;
          if (labels[idx] !== sel) continue;
          const edge = uu === 0 || uu === Nu - 1 || vv === 0 || vv === Nv - 1 ||
            labels[idx - su] !== sel || labels[idx + su] !== sel ||
            labels[idx - sv] !== sel || labels[idx + sv] !== sel;
          if (edge) { const o = (r * Nu + c) * 4; data[o] = 255; data[o + 1] = 213; data[o + 2] = 79; }
        }
      }
    }
    this.offCtx.putImageData(this.img, 0, 0);
    this.version++;
  }

  // 聚光灯：导览本步所指结构（spotlightIds，不随学生点选而移动）在本层截面的包围盒外扩一圈（保留毗邻结构作为上下文），
  // 椭圆外逐渐压暗。返回离屏图像像素坐标下的椭圆；未开启或本层没有这些结构时返回 null（整幅正常显示、可自由操作）
  _spotlight(base, su, sv) {
    const ids = this.state.spotlightIds, main = this.state.spotlightMain;
    if (!this.state.spotlight || !ids.size) return null;
    const { Nu, Nv } = this, labels = this.vol.labels;
    // 两遍扫描：先取主结构（本步 select）的包围盒；配角结构（如腹主动脉、下腔静脉这类长结构）只计入
    // 主结构包围盒外 SPOT_NEAR_MM 以内的部分，避免冠状 / 矢状位上整条血管把聚光灯撑成整幅。
    // 主结构不在本层时（如分叉层面已看不到腹主动脉）配角结构全部计入
    const box = (test, lim) => {
      let c0 = Nu, c1 = -1, r0 = Nv, r1 = -1;
      for (let r = 0; r < Nv; r++) {
        if (lim && (r < lim.r0 || r > lim.r1)) continue;
        let idx = base + (Nv - 1 - r) * sv + (Nu - 1) * su;
        for (let c = 0; c < Nu; c++, idx -= su) {
          if (lim && (c < lim.c0 || c > lim.c1)) continue;
          const L = labels[idx];
          if (!L || !test(L)) continue;
          if (c < c0) c0 = c; if (c > c1) c1 = c; if (r < r0) r0 = r; if (r > r1) r1 = r;
        }
      }
      return c1 < 0 ? null : { c0, c1, r0, r1 };
    };
    // 主结构只计入本步开始时光标位置（spotlightAnchor，导览已把光标放在目标处；之后学生点选不移动聚光灯）附近 SPOT_MAIN_MM 内的部分：长结构（主动脉等）在冠状 / 矢状位上
    // 可能只在远处露出一段，不能把聚光灯带离目标
    const anc = this.state.spotlightAnchor || this.state.cursor;
    const cu = Nu - 1 - anc[this.p.u], cv = Nv - 1 - anc[this.p.v];
    const mu = SPOT_MAIN_MM / this.su, mv = SPOT_MAIN_MM / this.sv;
    const aw = { c0: cu - mu, c1: cu + mu, r0: cv - mv, r1: cv + mv };
    let b = ids.has(main) ? box((L) => L === main, aw) : null;
    if (b) {
      // 配角结构：先限定在主结构包围盒外 SPOT_NEAR_MM 内；再逐轴收紧——配角在某一轴上与主结构范围重叠时
      // （如冠状位上腹主动脉与左肾上下并行），该轴只保留主结构范围外 SPOT_SNUG_MM，不让长结构沿该轴撑大
      const mc = SPOT_NEAR_MM / this.su, mr = SPOT_NEAR_MM / this.sv;
      const win = { c0: b.c0 - mc, c1: b.c1 + mc, r0: b.r0 - mr, r1: b.r1 + mr };
      const sc = SPOT_SNUG_MM / this.su, sr = SPOT_SNUG_MM / this.sv;
      const m = { ...b };
      for (const id of ids) {
        if (id === main) continue;
        const near = box((L) => L === id, win);   // 每个配角结构单独收紧，互不影响
        if (!near) continue;
        if (near.c0 <= b.c1 && near.c1 >= b.c0) { near.c0 = Math.max(near.c0, b.c0 - sc); near.c1 = Math.min(near.c1, b.c1 + sc); }
        if (near.r0 <= b.r1 && near.r1 >= b.r0) { near.r0 = Math.max(near.r0, b.r0 - sr); near.r1 = Math.min(near.r1, b.r1 + sr); }
        m.c0 = Math.min(m.c0, near.c0); m.c1 = Math.max(m.c1, near.c1); m.r0 = Math.min(m.r0, near.r0); m.r1 = Math.max(m.r1, near.r1);
      }
      b = m;
    } else b = box((L) => L !== main && ids.has(L), aw);   // 主结构不在附近时，配角结构同样只取目标附近的部分
    if (!b) return null;
    // 椭圆略大于包围盒（×SPOT_FIT，再加 SPOT_PAD_MM 余量，四角落在羽化带内侧）；羽化带宽为半径的 35%
    const pad = (sz, mm) => (sz / 2) * SPOT_FIT + SPOT_PAD_MM / mm;
    const out = 1.35;
    return { cx: (b.c0 + b.c1) / 2, cy: (b.r0 + b.r1) / 2, rx: pad(b.c1 - b.c0 + 1, this.su), ry: pad(b.r1 - b.r0 + 1, this.sv), out, out2: out * out };
  }

  // 屏幕点（CSS 像素）是否在聚光灯照亮范围内（含羽化带内侧一半）；聚光灯外不响应定位、点选和悬停
  inSpot(x, y) {
    const sp = this.spot;
    if (!sp) return true;
    const g = this._geom();
    const c = ((x * this.dpr - g.ox) / g.w) * this.Nu - 0.5, r = ((y * this.dpr - g.oy) / g.h) * this.Nv - 0.5;
    const dx = (c - sp.cx) / sp.rx, dy = (r - sp.cy) / sp.ry, lim = (1 + sp.out) / 2;
    return dx * dx + dy * dy <= lim * lim;
  }

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    const r = this.el.getBoundingClientRect();
    this.canvas.width = Math.max(1, r.width * dpr);
    this.canvas.height = Math.max(1, r.height * dpr);
    this.dpr = dpr;
    this.draw(false);
  }

  // 视图几何：毫米 → 屏幕像素
  _geom() {
    const cw = this.canvas.width, ch = this.canvas.height;
    const W = this.Nu * this.su, H = this.Nv * this.sv;
    const scale = Math.min(cw / W, ch / H) * 0.94 * this.zoom;
    const w = W * scale, h = H * scale;
    return { scale, w, h, ox: (cw - w) / 2 + this.pan[0] * this.dpr, oy: (ch - h) / 2 + this.pan[1] * this.dpr };
  }

  // 屏幕坐标（CSS 像素）→ 体素坐标（浮点）
  screenToVoxel(x, y) {
    const g = this._geom();
    const c = ((x * this.dpr - g.ox) / g.w) * this.Nu - 0.5;
    const r = ((y * this.dpr - g.oy) / g.h) * this.Nv - 0.5;
    const v = [...this.state.cursor];
    v[this.p.u] = this.Nu - 1 - c;
    v[this.p.v] = this.Nv - 1 - r;
    return v;
  }

  draw(rerender = true) {
    if (rerender) this.renderSlice();
    const { ctx, canvas } = this;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const g = this._geom();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(this.off, g.ox, g.oy, g.w, g.h);
    // 十字线：另外两个平面的位置
    const cur = this.state.cursor;
    const cx = g.ox + ((this.Nu - 1 - cur[this.p.u]) + 0.5) / this.Nu * g.w;
    const cy = g.oy + ((this.Nv - 1 - cur[this.p.v]) + 0.5) / this.Nv * g.h;
    ctx.lineWidth = this.dpr;
    ctx.setLineDash([6 * this.dpr, 5 * this.dpr]);
    const colorOf = (axis) => ({ 0: '#ef5350', 1: '#66bb6a', 2: '#42a5f5' })[axis];
    if (!this.state.hideCrosshair) {
      ctx.strokeStyle = colorOf(this.p.u);   // 竖线 = 与 u 轴垂直的平面
      ctx.beginPath(); ctx.moveTo(cx, g.oy); ctx.lineTo(cx, g.oy + g.h); ctx.stroke();
      ctx.strokeStyle = colorOf(this.p.v);
      ctx.beginPath(); ctx.moveTo(g.ox, cy); ctx.lineTo(g.ox + g.w, cy); ctx.stroke();
    }
    ctx.setLineDash([]);
    const sp = this.vol.meta.spacing[this.p.n];
    const w = this.vol.toWorld(cur);
    const mm = [w.x, w.y, w.z][this.p.n];
    this.posEl.textContent = `层 ${this.slice + 1} / ${this.Nn}  ·  ${mm.toFixed(1)} mm  ·  层间距 ${+sp.toFixed(2)} mm  ·  缩放 ${this.zoom.toFixed(1)}×  ·  W ${this.state.wl[0]} / L ${this.state.wl[1]}`;
  }

  _bind() {
    const c = this.canvas;
    let mode = null, sx = 0, sy = 0, moved = false, wl0 = null;
    c.addEventListener('contextmenu', (e) => e.preventDefault());
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.shiftKey || e.ctrlKey) {
        const f = Math.exp(-(e.deltaY || e.deltaX) * 0.0015);
        this.zoom = Math.max(0.5, Math.min(8, this.zoom * f));
        if (this.zoom <= 1) this.pan = [0, 0];
        this.draw(false);
      } else {
        const step = Math.sign(e.deltaY) * (Math.abs(e.deltaY) > 60 ? 2 : 1);
        const cur = [...this.state.cursor];
        cur[this.p.n] = Math.max(0, Math.min(this.Nn - 1, Math.round(cur[this.p.n]) - step));
        this.state.setCursor(cur, { from: this.plane });
      }
    }, { passive: false });
    c.addEventListener('pointerdown', (e) => {
      c.setPointerCapture(e.pointerId);
      sx = e.offsetX; sy = e.offsetY; moved = false;
      // 右键拖动调窗；Mac 触控板难以按住右键拖动，因此 Ctrl / ⌘ + 左键拖动等效
      if (e.button === 2 || (e.button === 0 && (e.ctrlKey || e.metaKey))) { mode = 'wl'; wl0 = [...this.state.wl]; }
      else if (e.button === 1 || (e.button === 0 && e.altKey)) { mode = 'pan'; wl0 = [...this.pan]; }
      else if (e.button === 0 && this.inSpot(e.offsetX, e.offsetY)) { mode = 'cursor'; this.state.setCursor(this.screenToVoxel(e.offsetX, e.offsetY), { from: this.plane }); }
    });
    c.addEventListener('pointermove', (e) => {
      const dx = e.offsetX - sx, dy = e.offsetY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      if (mode === 'wl') {
        this.state.setWL(Math.max(1, wl0[0] + dx * 4), wl0[1] - dy * 2, null);
      } else if (mode === 'pan') {
        this.pan = [wl0[0] + dx, wl0[1] + dy]; this.draw(false);
      } else if (mode === 'cursor' && this.inSpot(e.offsetX, e.offsetY)) {
        this.state.setCursor(this.screenToVoxel(e.offsetX, e.offsetY), { from: this.plane });
      }
      this._hover(e);
    });
    c.addEventListener('pointerup', (e) => {
      if (mode === 'cursor' && !moved) {
        const v = this.screenToVoxel(e.offsetX, e.offsetY);
        const id = this.vol.labelAt(...v);
        this.state.select(id || 0, { from: this.plane, voxel: v });
      }
      mode = null;
    });
    c.addEventListener('pointerleave', () => this.state.tooltip(null));
  }

  _hover(e) {
    const ok = this.inSpot(e.offsetX, e.offsetY);
    this.canvas.style.cursor = ok ? '' : 'not-allowed';
    if (!ok) { this.state.tooltip(null); return; }
    const v = this.screenToVoxel(e.offsetX, e.offsetY);
    const hu = this.vol.huAt(...v);
    if (hu === null) { this.state.tooltip(null); return; }
    const id = this.vol.labelAt(...v);
    const s = id ? this.vol.byId.get(id) : null;
    this.state.tooltip({ x: e.clientX, y: e.clientY, s, hu });
  }
}

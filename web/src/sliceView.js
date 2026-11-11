// 2D 断层视图：横断位 / 冠状位 / 矢状位（放射学惯例：患者右侧显示在屏幕左侧）
//
// 每个平面由 法向轴 n、屏幕横轴 u、屏幕纵轴 v 定义（轴编号 0=i/R, 1=j/A, 2=k/S）。
// 三个平面的 u、v 都做翻转：屏幕列 c → 体素 u = Nu-1-c，屏幕行 r → 体素 v = Nv-1-r。
export const PLANES = {
  axial:    { n: 2, u: 0, v: 1, dirs: { l: 'R', r: 'L', t: 'A', b: 'P' } },
  coronal:  { n: 1, u: 0, v: 2, dirs: { l: 'R', r: 'L', t: 'S', b: 'I' } },
  sagittal: { n: 0, u: 1, v: 2, dirs: { l: 'A', r: 'P', t: 'S', b: 'I' } },
};

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
    for (let r = 0; r < Nv; r++) {
      const vv = Nv - 1 - r;
      let idx = base + vv * sv + (Nu - 1) * su;
      let o = r * Nu * 4;
      for (let c = 0; c < Nu; c++, idx -= su, o += 4) {
        const g = lut[ct[idx] + 1024];
        const L = labels[idx];
        if (L && showOverlay && !hidden.has(L)) {
          const k = L === sel ? aSel : a, k1 = 1 - k;
          data[o] = g * k1 + colors[L * 3] * k;
          data[o + 1] = g * k1 + colors[L * 3 + 1] * k;
          data[o + 2] = g * k1 + colors[L * 3 + 2] * k;
        } else {
          data[o] = data[o + 1] = data[o + 2] = g;
        }
        data[o + 3] = 255;
      }
    }
    // 选中结构描边（四邻域边界）；结构被隐藏时不描边，与彩色叠加一致
    if (sel && state.outline && !hidden.has(sel)) {
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
    this.posEl.textContent = `层 ${this.slice + 1} / ${this.Nn}  ·  ${mm.toFixed(1)} mm  ·  层厚 ${+sp.toFixed(2)} mm  ·  缩放 ${this.zoom.toFixed(1)}×  ·  W ${this.state.wl[0]} / L ${this.state.wl[1]}`;
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
      else if (e.button === 0) { mode = 'cursor'; this.state.setCursor(this.screenToVoxel(e.offsetX, e.offsetY), { from: this.plane }); }
    });
    c.addEventListener('pointermove', (e) => {
      const dx = e.offsetX - sx, dy = e.offsetY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      if (mode === 'wl') {
        this.state.setWL(Math.max(1, wl0[0] + dx * 4), wl0[1] - dy * 2, null);
      } else if (mode === 'pan') {
        this.pan = [wl0[0] + dx, wl0[1] + dy]; this.draw(false);
      } else if (mode === 'cursor') {
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
    const v = this.screenToVoxel(e.offsetX, e.offsetY);
    const hu = this.vol.huAt(...v);
    if (hu === null) { this.state.tooltip(null); return; }
    const id = this.vol.labelAt(...v);
    const s = id ? this.vol.byId.get(id) : null;
    this.state.tooltip({ x: e.clientX, y: e.clientY, s, hu });
  }
}

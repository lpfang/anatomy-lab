// 3D 视图：器官网格 + 三个正交切面（贴当前 CT 切片图像）+ 剖切 + 拾取
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// RAS(mm) → three.js 场景坐标：X = 患者左（-R），Y = 上（S），Z = 前（A）。
// 这样相机默认在 +Z 方向看到的就是患者正面（解剖学姿势），且为纯旋转、无镜像。
const RAS2SCENE = new THREE.Matrix4().set(
  -1, 0, 0, 0,
   0, 0, 1, 0,
   0, 1, 0, 0,
   0, 0, 0, 1);

const PLANE_COLORS = { axial: 0x42a5f5, coronal: 0x66bb6a, sagittal: 0xef5350 };

export class View3D {
  constructor(el, vol, state, sliceViews) {
    this.el = el; this.vol = vol; this.state = state; this.sliceViews = sliceViews;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.localClippingEnabled = true;
    this.renderer.setClearColor(0x0b0e13);
    el.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, 1, 5000);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.addEventListener('change', () => this.requestRender());

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1.2));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(0.4, 0.6, 1);
    this.camera.add(key);
    this.scene.add(this.camera);

    // root：RAS 世界坐标容器，并平移到体数据中心
    const { nx, ny, nz } = vol;
    this.center = vol.toWorld([(nx - 1) / 2, (ny - 1) / 2, (nz - 1) / 2]);
    this.root = new THREE.Group();
    this.root.matrixAutoUpdate = false;
    this.root.matrix.copy(RAS2SCENE).multiply(new THREE.Matrix4().makeTranslation(-this.center.x, -this.center.y, -this.center.z));
    this.scene.add(this.root);

    this.meshes = new Map(); // id → mesh
    this.clipMode = 'none';
    this.clipPlanes = [new THREE.Plane()];
    this._initSlicePlanes();
    this._bind();
    new ResizeObserver(() => this._resize()).observe(el);
    this._resize();
    this._loop();
  }

  async loadModel(onProgress) {
    const gltf = await new GLTFLoader().loadAsync(this.vol.glbUrl, (e) => e.total && onProgress?.(e.loaded / e.total));
    const meshes = [];
    gltf.scene.traverse((o) => { if (o.isMesh) meshes.push(o); });
    for (const m of meshes) {
      const key = this.vol.byKey.has(m.name) ? m.name : m.parent?.name;
      const s = this.vol.byKey.get(key);
      if (!s) continue;
      m.geometry.deleteAttribute('color');
      if (!m.geometry.attributes.normal) m.geometry.computeVertexNormals();
      const base = s.opacity ?? (s.system === 'respiratory' ? 0.28 : 1);
      m.material = new THREE.MeshStandardMaterial({
        color: s.color, roughness: 0.55, metalness: 0.02, side: THREE.DoubleSide,
        transparent: base < 1, opacity: base, depthWrite: base >= 1,
        clippingPlanes: this.clipPlanes, clipShadows: true,
      });
      m.userData = { id: s.id, baseOpacity: base };
      // GLB 中顶点已经是 RAS 坐标；去掉节点自带变换后直接挂到 root
      m.matrixAutoUpdate = false; m.matrix.identity();
      m.renderOrder = base < 1 ? 2 : 1;
      this.root.add(m);
      this.meshes.set(s.id, m);
    }
    this.root.updateMatrixWorld(true);
    this.box = new THREE.Box3();
    for (const m of this.meshes.values()) this.box.expandByObject(m);
    this.resetView();
    this.applyAppearance();
  }

  // 按包围盒贴合视口；dir 为相机相对目标的方向（场景坐标，默认正前方略偏上）
  resetView(dir = new THREE.Vector3(0, 0.1, 1)) {
    const box = new THREE.Box3();
    for (const m of this.meshes.values()) if (m.visible) box.expandByObject(m);
    if (box.isEmpty()) box.copy(this.box);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const t = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const halfH = size.y / 2, halfW = Math.max(size.x, size.z) / 2;
    const dist = Math.max(halfH / t, halfW / (t * this.camera.aspect)) * 1.08 + Math.max(size.x, size.z) / 2;
    this.controls.target.copy(center);
    this.camera.position.copy(center).add(dir.clone().normalize().multiplyScalar(dist));
    this.camera.near = dist / 50; this.camera.far = dist * 10; this.camera.updateProjectionMatrix();
    this.controls.update();
    this.requestRender();
  }

  // 镜头对准某个结构（保持当前观察方向），让小结构也清晰可见，同时保留周围约 3 倍范围的上下文
  focusOn(id) {
    const m = this.meshes.get(id);
    if (!m) return;
    const box = new THREE.Box3().setFromObject(m);
    const center = box.getCenter(new THREE.Vector3());
    const r = Math.max(box.getSize(new THREE.Vector3()).length() / 2, 25);
    const t = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * Math.min(1, this.camera.aspect);
    const dist = Math.max((r * 3) / t, 220);
    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    this.controls.target.copy(center);
    this.camera.position.copy(center).addScaledVector(dir, dist);
    this.controls.update();
    this.requestRender();
  }

  // 根据选中 / 隐藏 / 半透明模式刷新材质
  applyAppearance() {
    const sel = this.state.selected, ghost = this.state.ghost && sel;
    for (const [id, m] of this.meshes) {
      const mat = m.material;
      m.visible = !this.state.hiddenIds.has(id);
      let op = m.userData.baseOpacity;
      if (ghost && id !== sel) op = Math.min(op, 0.1);
      if (id === sel) op = 1;
      mat.opacity = op; mat.transparent = op < 1; mat.depthWrite = op >= 1;
      mat.emissive.setHex(id === sel ? 0x553300 : 0x000000);
      m.renderOrder = op < 1 ? 2 : 1;
      mat.needsUpdate = true;
    }
    this.requestRender();
  }

  // ---- 切面 ----
  _initSlicePlanes() {
    this.planes = {};
    for (const [name, sv] of Object.entries(this.sliceViews)) {
      const tex = new THREE.CanvasTexture(sv.off);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2));
      geo.setIndex([0, 1, 2, 0, 2, 3]);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true, opacity: 0.92 }));
      const border = new THREE.LineLoop(geo, new THREE.LineBasicMaterial({ color: PLANE_COLORS[name] }));
      mesh.renderOrder = 3;
      mesh.matrixAutoUpdate = false; border.matrixAutoUpdate = false;
      this.root.add(mesh, border);
      this.planes[name] = { mesh, border, tex, sv, version: -1 };
    }
  }

  // 切面四角：按离屏画布像素边缘反推体素坐标（与 SliceView 的翻转约定一致）
  _updatePlaneGeometry(pl) {
    const { sv } = pl, p = sv.p;
    const pos = pl.mesh.geometry.attributes.position;
    const uvs = [[0, 0], [1, 0], [1, 1], [0, 1]];
    uvs.forEach(([s, t], i) => {
      const v = [0, 0, 0];
      v[p.n] = sv.slice;
      v[p.u] = sv.Nu - 0.5 - s * sv.Nu;
      v[p.v] = t * sv.Nv - 0.5;
      const w = this.vol.toWorld(v);
      pos.setXYZ(i, w.x, w.y, w.z);
    });
    pos.needsUpdate = true;
    pl.mesh.geometry.computeBoundingSphere();
  }

  syncSlices() {
    for (const [name, pl] of Object.entries(this.planes)) {
      const show = this.state.showPlanes[name];
      pl.mesh.visible = pl.border.visible = show;
      if (!show) continue;
      if (pl.version !== pl.sv.version) {
        pl.version = pl.sv.version;
        pl.tex.needsUpdate = true;
        this._updatePlaneGeometry(pl);
      }
    }
    this._updateClip();
    this.requestRender();
  }

  setClip(mode) {
    this.clipMode = mode;
    // 剖切时自动显示对应切面，并把相机转到能看到剖面的角度
    if (mode !== 'none') {
      this.state.showPlanes[mode] = true;
      const cb = document.querySelector(`.planes input[data-plane=${mode}]`);
      if (cb) cb.checked = true;
    }
    const dirs = {
      none: new THREE.Vector3(0, 0.1, 1),
      axial: new THREE.Vector3(0, 1.1, 1),      // 前上方俯视横断面
      coronal: new THREE.Vector3(0.25, 0.2, 1),  // 正前方略偏
      sagittal: new THREE.Vector3(1, 0.2, 0.35), // 从患者左侧看（场景 +X = 患者左）
    };
    this.resetView(dirs[mode]);
    this.syncSlices();
  }

  _updateClip() {
    const plane = this.clipPlanes[0];
    if (this.clipMode === 'none') { plane.set(new THREE.Vector3(0, 0, 0), 1); return; } // 恒正，不裁剪
    const cur = this.vol.toWorld(this.state.cursor);
    const axis = { axial: 2, coronal: 1, sagittal: 0 }[this.clipMode];
    // three.js 保留法向正侧。横断：去上方（保留 -S）；冠状：去前方（保留 -A）；
    // 矢状：去患者左侧（左 = R 负方向，保留 +R）
    const nRas = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, -1)][axis];
    const m = this.root.matrixWorld;
    const p = cur.clone().applyMatrix4(m);
    const n = nRas.transformDirection(m);
    plane.setFromNormalAndCoplanarPoint(n, p);
    // 多裁掉约半个体素，避免模型表面盖住切面图像
    plane.constant -= 0.75;
  }

  // ---- 交互 ----
  _bind() {
    const dom = this.renderer.domElement;
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let down = null;
    const pick = (e) => {
      const r = dom.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, this.camera);
      const targets = [...this.meshes.values()].filter((m) => m.visible && m.material.opacity > 0.15);
      const plane = this.clipPlanes[0];
      for (const h of ray.intersectObjects(targets, false)) {
        if (this.clipMode !== 'none' && plane.distanceToPoint(h.point) < 0) continue;
        return { id: h.object.userData.id, point: h.point, dir: ray.ray.direction.clone() };
      }
      // 半透明结构（如肺）作为兜底
      const all = [...this.meshes.values()].filter((m) => m.visible);
      for (const h of ray.intersectObjects(all, false)) {
        if (this.clipMode !== 'none' && plane.distanceToPoint(h.point) < 0) continue;
        return { id: h.object.userData.id, point: h.point, dir: ray.ray.direction.clone() };
      }
      return null;
    };
    dom.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
    dom.addEventListener('pointerup', (e) => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 4 || e.button !== 0) return;
      const hit = pick(e);
      if (!hit) { this.state.select(0, { from: '3d' }); return; }
      // 交点沿视线方向推进 2mm，落到结构内部，再换算到体素坐标
      const inv = this.root.matrixWorld.clone().invert();
      const pRas = hit.point.clone().addScaledVector(hit.dir, 2).applyMatrix4(inv);
      this.state.select(hit.id, { from: '3d', voxel: this.vol.toVoxel(pRas).toArray() });
    });
    let hoverT = 0;
    dom.addEventListener('pointermove', (e) => {
      if (e.buttons) { this.state.tooltip(null); return; }
      const now = performance.now();
      if (now - hoverT < 40) return;
      hoverT = now;
      const hit = pick(e);
      this.state.tooltip(hit ? { x: e.clientX, y: e.clientY, s: this.vol.byId.get(hit.id) } : null);
    });
    dom.addEventListener('pointerleave', () => this.state.tooltip(null));
  }

  _resize() {
    const r = this.el.getBoundingClientRect();
    this.renderer.setSize(r.width, r.height, false);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.camera.aspect = r.width / Math.max(1, r.height);
    this.camera.updateProjectionMatrix();
    // setSize 会清空画布，立即重绘一次，避免出现黑屏帧
    this.renderer.render(this.scene, this.camera);
  }

  requestRender() { this.needsRender = true; }

  _loop() {
    requestAnimationFrame(() => this._loop());
    this.controls.update();
    if (!this.needsRender) return;
    this.needsRender = false;
    this.renderer.render(this.scene, this.camera);
  }
}

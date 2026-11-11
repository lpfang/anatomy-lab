// 体数据加载与坐标换算（体素 ijk ↔ RAS 世界坐标 mm）
import * as THREE from 'three';

const V = typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'dev';

async function fetchBytes(url, onProgress) {
  const res = await fetch(`${url}?v=${V}`);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const total = +res.headers.get('content-length') || 0;
  const reader = res.body.getReader();
  const chunks = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    onProgress?.(got, total);
  }
  let buf = new Uint8Array(got);
  let o = 0;
  for (const c of chunks) { buf.set(c, o); o += c.length; }
  // 服务器可能已经透明解压（Content-Encoding: gzip），因此按魔数判断
  if (buf[0] === 0x1f && buf[1] === 0x8b) {
    const ds = new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip')));
    buf = new Uint8Array(await ds.arrayBuffer());
  }
  return buf;
}

export async function loadCase(base, onProgress) {
  const meta = await (await fetch(`${base}/meta.json?v=${V}`)).json();
  const prog = { ct: 0, lab: 0, glb: 0 };
  const report = () => onProgress?.((prog.ct * 0.62 + prog.lab * 0.03 + prog.glb * 0.35));
  const [ctBytes, labBytes] = await Promise.all([
    fetchBytes(`${base}/image.i16.gz`, (g, t) => { prog.ct = Math.min(1, g / (t || 25e6)); report(); }),
    fetchBytes(`${base}/labels.u8.gz`, (g) => { prog.lab = Math.min(1, g / 5e5); report(); }),
  ]);
  const ct = new Int16Array(ctBytes.buffer, ctBytes.byteOffset, ctBytes.byteLength / 2);
  const labels = labBytes;
  const [nx, ny, nz] = meta.dims;
  if (ct.length !== nx * ny * nz) throw new Error('CT 尺寸不匹配');

  const a = meta.affine;
  const vox2ras = new THREE.Matrix4().set(...a[0], ...a[1], ...a[2], ...a[3]);
  const ras2vox = vox2ras.clone().invert();
  const byId = new Map(meta.structures.map((s) => [s.id, s]));
  const byKey = new Map(meta.structures.map((s) => [s.key, s]));

  return {
    meta, ct, labels, nx, ny, nz, byId, byKey, vox2ras, ras2vox,
    glbUrl: `${base}/anatomy.glb?v=${V}`,
    setGlbProgress(p) { prog.glb = p; report(); },
    // 载入另一序列（同网格），替换 ct 数据；结果缓存
    _seqCache: new Map(),
    // 分两步：fetchSequence 只下载并缓存，useSequence 才替换当前图像。
    // 调用方可在两步之间检查请求是否已过期（例如用户又切换了序列或退出了导览）。
    async fetchSequence(file) {
      if (!this._seqCache.has('__primary')) this._seqCache.set('__primary', this.ct);
      if (file !== 'image.i16.gz' && !this._seqCache.has(file)) {
        const b = await fetchBytes(`${base}/${file}`);
        this._seqCache.set(file, new Int16Array(b.buffer, b.byteOffset, b.byteLength / 2));
      }
    },
    useSequence(file) {
      this.ct = file === 'image.i16.gz' ? this._seqCache.get('__primary') : this._seqCache.get(file);
    },
    idx(i, j, k) { return i + nx * (j + ny * k); },
    inside(i, j, k) { return i >= 0 && j >= 0 && k >= 0 && i < nx && j < ny && k < nz; },
    labelAt(i, j, k) {
      i = Math.round(i); j = Math.round(j); k = Math.round(k);
      return this.inside(i, j, k) ? labels[this.idx(i, j, k)] : 0;
    },
    huAt(i, j, k) {
      i = Math.round(i); j = Math.round(j); k = Math.round(k);
      return this.inside(i, j, k) ? this.ct[this.idx(i, j, k)] : null;
    },
    toWorld(v) { return new THREE.Vector3(...v).applyMatrix4(vox2ras); },
    toVoxel(w) { return w.clone().applyMatrix4(ras2vox); },
  };
}

// 导览模式：预设教学路线。每一步只引用结构 key，不依赖具体病例；
// 当前病例缺少某步所需结构时该步自动跳过，因此同一条路线可用于 CT 和 MRI 的不同病例。
//
// 步骤字段：
//   title / text   标题与讲解（中文，可含 <b> 等简单标签）
//   select         选中并定位到该结构（代表层面）
//   at             { key, pos: 'top' | 'bottom' | 'best', offset } 把横断位移到某结构的上缘 / 下缘 / 代表层面
//   wl             窗位预设名（如 '肺窗'），当前病例没有该预设则忽略
//   only           3D 中只显示这些结构 key（其余隐藏）；'all' 表示全部显示
//   systems        3D 中只显示这些系统
//   clip           剖切模式 none / axial / coronal / sagittal
//   view           3D 视角 front / top / left / right / back
//   requires       该步需要的结构（默认取 select / at.key）

export const TOURS = [
  {
    id: 'abdomen-axial',
    title: '腹部横断面巡礼',
    en: 'Abdominal axial levels',
    desc: '自上而下走过 5 个关键横断层面，建立"层面 ↔ 器官"的对应。',
    steps: [
      {
        title: '起点：膈顶与肝顶',
        at: { key: 'liver', pos: 'top', offset: -8 }, select: 'liver', clip: 'axial', view: 'top',
        text: '横断位从<b>肝顶</b>下方开始。右膈顶通常高于左侧，因为下方有肝。此层面可同时看到<b>心的下部</b>、<b>肺下叶</b>和肝。3D 已在当前层面剖切，从上方俯视剖面。',
      },
      {
        title: '肝门与胰腺层面',
        select: 'pancreas', clip: 'axial', view: 'top',
        text: '<b>胰</b>横卧于脊柱前方：胰头在右侧被十二指肠环绕，胰尾伸向左侧脾门。胰体后方可见<b>脾静脉</b>走行，这是 CT/MRI 上辨认胰腺的重要标志。',
      },
      {
        title: '门静脉',
        select: 'portal_vein_and_splenic_vein', clip: 'axial', view: 'top',
        text: '肠系膜上静脉与脾静脉在<b>胰颈后方</b>汇合成门静脉，斜向右上进入肝门。注意它与下腔静脉的前后关系：门静脉在前，下腔静脉在后。',
      },
      {
        title: '肾门层面',
        select: 'kidney_left', clip: 'axial', view: 'top',
        text: '肾门朝向前内侧。左肾静脉较长，从<b>腹主动脉与肠系膜上动脉之间</b>穿过汇入下腔静脉。通常左肾比右肾高约半个椎体。',
      },
      {
        title: '腹主动脉分叉',
        at: { key: 'aorta', pos: 'bottom', offset: 2 }, select: 'aorta', clip: 'axial', view: 'front',
        requires: ['aorta'],
        text: '腹主动脉在约<b>第 4 腰椎</b>水平分为左右髂总动脉，这一层面也大约是髂嵴最高点的水平。下腔静脉位于其右侧，在稍低的 L5 水平由左右髂总静脉汇合而成。',
      },
      {
        title: '盆腔：膀胱',
        select: 'urinary_bladder', clip: 'none', view: 'front',
        text: '<b>膀胱</b>位于耻骨联合后方。充盈的膀胱 CT 上呈水样密度；MRI T1 上为低信号，T2 上为高信号。男性在其下方可见前列腺。',
      },
    ],
  },
  {
    id: 'retroperitoneum',
    title: '腹膜后器官',
    en: 'Retroperitoneal organs',
    desc: '把肾、肾上腺、胰、十二指肠和大血管单独拿出来，看它们的前后与毗邻关系。',
    steps: [
      {
        title: '腹膜后间隙一览',
        only: ['kidney_left', 'kidney_right', 'adrenal_gland_left', 'adrenal_gland_right', 'pancreas', 'duodenum', 'aorta', 'inferior_vena_cava', 'vertebrae_L1', 'vertebrae_L2', 'vertebrae_L3', 'vertebrae', 'iliopsoas_left', 'iliopsoas_right'],
        select: 'pancreas', clip: 'none', view: 'front', requires: ['pancreas', 'kidney_left'],
        text: '3D 中只保留腹膜后结构。旋转模型可以看到：<b>胰</b>和<b>十二指肠</b>位于最前方，<b>肾</b>和<b>肾上腺</b>靠后贴近腰大肌，大血管紧贴脊柱前方。',
      },
      {
        title: '肾上腺',
        select: 'adrenal_gland_right', view: 'back',
        text: '<b>右肾上腺</b>位于右肾上极上方、<b>下腔静脉正后方</b>。CT 上呈细线状或倒 V 形，厚度通常不超过相邻膈肌脚。',
      },
      {
        title: '左肾上腺',
        select: 'adrenal_gland_left', view: 'back',
        text: '<b>左肾上腺</b>位于左肾上极前内侧、腹主动脉左侧，形态多呈倒 Y 形，位置比右侧略低。',
      },
      {
        title: '十二指肠 C 形环',
        select: 'duodenum', view: 'front',
        text: '<b>十二指肠</b>呈 C 形包绕胰头。降部内侧壁有十二指肠乳头，是胆总管和胰管的开口；水平部从腹主动脉与肠系膜上动脉之间穿过。',
      },
      {
        title: '腹主动脉与下腔静脉',
        select: 'inferior_vena_cava', view: 'front',
        text: '<b>下腔静脉</b>在右、<b>腹主动脉</b>在左，两者并行于脊柱前方。下腔静脉向上穿膈肌腔静脉孔（约 T8）注入右心房。',
      },
    ],
  },
  {
    id: 'mediastinum',
    title: '纵隔与大血管',
    en: 'Mediastinum & great vessels',
    desc: '从主动脉弓到心底，认识纵隔内的大血管、气管和食管。',
    steps: [
      {
        title: '主动脉弓',
        at: { key: 'aorta', pos: 'top', offset: -3 }, select: 'aorta', wl: '软组织', clip: 'none', view: 'front',
        systems: ['cardio', 'respiratory', 'digestive'], requires: ['aorta', 'brachiocephalic_trunk'],
        text: '横断位位于<b>主动脉弓</b>水平（约 T4 下缘 / 胸骨角平面）。弓上自右向左发出三大分支：头臂干、左颈总动脉、左锁骨下动脉。',
      },
      {
        title: '头臂干',
        select: 'brachiocephalic_trunk', view: 'front',
        text: '<b>头臂干</b>是主动脉弓的第一个分支，在右胸锁关节后方分为右颈总动脉和右锁骨下动脉。它的前方是<b>左头臂静脉</b>，后者斜跨三大分支前方。',
      },
      {
        title: '上腔静脉',
        select: 'superior_vena_cava', view: 'front',
        text: '左右头臂静脉汇合成<b>上腔静脉</b>，位于升主动脉右侧，向下注入右心房。',
      },
      {
        title: '气管与食管',
        select: 'trachea', wl: '肺窗', view: 'right',
        text: '<b>气管</b>在胸骨角平面分为左右主支气管。<b>食管</b>位于气管后方、脊柱前方，在主动脉弓水平略偏左。肺窗下气道与肺实质最清楚。',
      },
      {
        title: '心与左心耳',
        select: 'heart', wl: '软组织', view: 'front',
        text: '<b>心</b>约 2/3 位于正中线左侧。左心耳是左心房向前的盲囊，是房颤时血栓的好发部位。平扫 CT 上心腔和心肌密度相近，增强后才能区分。',
      },
    ],
  },
  {
    id: 'lungs',
    title: '肺叶与肺裂',
    en: 'Lung lobes',
    desc: '肺窗下认识右肺三叶、左肺两叶。',
    steps: [
      {
        title: '右肺上叶',
        select: 'lung_upper_lobe_right', wl: '肺窗', systems: ['respiratory'], view: 'front', clip: 'none',
        text: '切换为<b>肺窗</b>。右肺由<b>斜裂</b>和<b>水平裂</b>分为上、中、下三叶。肺裂在 CT 上表现为细线状影，或血管稀少的透亮带。',
      },
      {
        title: '右肺中叶',
        select: 'lung_middle_lobe_right', view: 'right',
        text: '<b>中叶</b>只有右肺有，位于水平裂与斜裂之间，紧贴心右缘。中叶病变常使右心缘模糊（"轮廓征"）。',
      },
      {
        title: '右肺下叶',
        select: 'lung_lower_lobe_right', view: 'back',
        text: '<b>下叶</b>位于斜裂后下方，占据肺底和后部，是吸入性病变的好发部位。',
      },
      {
        title: '左肺上叶',
        select: 'lung_upper_lobe_left', view: 'front',
        text: '左肺只有斜裂，分为上、下两叶。左肺上叶的<b>舌段</b>相当于右肺中叶，贴近左心缘。',
      },
      {
        title: '左肺下叶',
        select: 'lung_lower_lobe_left', view: 'back',
        text: '<b>左肺下叶</b>位于斜裂后下方。冠状位上可以完整看到斜裂从后上斜向前下的走行。',
      },
    ],
  },
  {
    id: 'spine-levels',
    title: '椎体计数与体表标志',
    en: 'Vertebral levels',
    desc: '用 T12 / 第 12 肋、L4 等标志确定横断层面的椎体序数。',
    steps: [
      {
        title: '第 12 胸椎与第 12 肋',
        select: 'vertebrae_T12', wl: '骨窗', systems: ['skeletal'], view: 'back', clip: 'none',
        requires: ['vertebrae_T12', 'rib_left_12'],
        text: '<b>骨窗</b>下从最后一对肋（第 12 肋）找到 <b>T12</b>，这是计数腰椎最常用的起点。注意有少数人存在腰肋或骶化变异。',
      },
      {
        title: '第 1 腰椎',
        select: 'vertebrae_L1', view: 'back',
        text: '<b>L1</b> 是第一个不带肋骨的椎体。成人<b>脊髓圆锥</b>约终止于 L1 下缘，腰椎穿刺因此选在 L3–L4 或 L4–L5 间隙。',
      },
      {
        title: '第 4 腰椎',
        select: 'vertebrae_L4', view: 'front',
        text: '<b>L4</b> 约平髂嵴最高点（Jacoby 线），腹主动脉多在此水平分叉。',
      },
      {
        title: '骶骨',
        select: 'sacrum', view: 'back',
        text: '<b>骶骨</b>由 5 块骶椎融合而成，与两侧髋骨构成骶髂关节。',
      },
    ],
  },
];

const VIEW_DIRS = {
  front: [0, 0.1, 1], back: [0, 0.1, -1], top: [0, 1.1, 1],
  left: [1, 0.15, 0.2], right: [-1, 0.15, 0.2], // 场景 +X = 患者左侧
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export class TourPlayer {
  // api: { vol, state, panel, select(key), axialTo(k), setPreset(name), setVisible(keySet|null), setClip(mode), setView(dir), onEnter, onExit }
  constructor(api) {
    this.api = api;
    this.active = false;
  }

  available() {
    const has = (k) => this.api.vol.byKey.has(k);
    return TOURS.map((t) => {
      const steps = t.steps.filter((s) => (s.requires || [s.select, s.at?.key].filter(Boolean)).every(has));
      return { ...t, steps };
    }).filter((t) => t.steps.length >= 2);
  }

  enter() {
    if (this.active) return;
    this.active = true;
    this.api.onEnter();
    this.renderList();
  }

  exit() {
    if (!this.active) return;
    this.active = false;
    this.tour = null;
    this.api.onExit();
  }

  renderList() {
    this.tour = null;
    const tours = this.available();
    const p = this.api.panel;
    p.innerHTML = `
      <div class="q-head"><h2>导览 <small>Guided tours</small></h2><button class="q-x" title="退出导览">✕</button></div>
      ${tours.length ? '' : '<p class="q-note">当前病例缺少导览所需的结构。</p>'}
      <div class="t-list">${tours.map((t, i) => `
        <button data-i="${i}"><b>${esc(t.title)}</b><span class="en">${esc(t.en)} · ${t.steps.length} 步</span>
        <small>${esc(t.desc)}</small></button>`).join('')}</div>`;
    p.querySelector('.q-x').onclick = () => this.exit();
    p.querySelectorAll('.t-list button').forEach((b) => b.onclick = () => this.start(tours[+b.dataset.i]));
  }

  start(tour) {
    this.tour = tour;
    this.i = 0;
    this.show();
  }

  go(d) {
    const n = this.i + d;
    if (n < 0 || n >= this.tour.steps.length) return;
    this.i = n;
    this.show();
  }

  show() {
    const { api } = this;
    const t = this.tour, s = t.steps[this.i];
    // 3D 可见性：only / systems / 全部
    if (s.only) api.setVisible(new Set(s.only.filter((k) => api.vol.byKey.has(k))));
    else if (s.systems) api.setVisible(new Set(api.vol.meta.structures.filter((x) => s.systems.includes(x.system)).map((x) => x.key)));
    else if (this.i === 0) api.setVisible(null);
    if (s.wl) api.setPreset(s.wl);
    if (s.select) api.select(s.select);
    if (s.at) {
      const st = api.vol.byKey.get(s.at.key);
      const [k0, k1] = st.bboxVoxel[2];
      const k = s.at.pos === 'top' ? k1 : s.at.pos === 'bottom' ? k0 : st.bestSlice[2];
      api.axialTo(k + (s.at.offset || 0));
    }
    if (s.clip) api.setClip(s.clip);
    if (s.view) api.setView(VIEW_DIRS[s.view]);

    const n = t.steps.length;
    const p = api.panel;
    p.innerHTML = `
      <div class="q-head"><h2>${esc(t.title)}</h2><button class="q-x" title="退出导览">✕</button></div>
      <div class="q-progress"><span>第 ${this.i + 1} / ${n} 步</span><span class="en">${esc(t.en)}</span></div>
      <div class="q-bar"><i style="width:${((this.i + 1) / n) * 100}%"></i></div>
      <h3 class="t-step">${esc(s.title)}</h3>
      <p class="t-text">${s.text}</p>
      <p class="q-hint">可随时滚轮翻层、点击结构、旋转 3D 自由探索；点"下一步"继续路线。</p>
      <div class="q-acts">
        <button data-act="prev" ${this.i === 0 ? 'disabled' : ''}>← 上一步</button>
        ${this.i + 1 < n ? '<button class="q-primary" data-act="next">下一步 →</button>'
          : '<button class="q-primary" data-act="done">完成，返回列表</button>'}
      </div>`;
    p.querySelector('.q-x').onclick = () => this.exit();
    p.querySelector('[data-act=prev]').onclick = () => this.go(-1);
    p.querySelector('[data-act=next]')?.addEventListener('click', () => this.go(1));
    p.querySelector('[data-act=done]')?.addEventListener('click', () => { api.setVisible(null); api.setClip('none'); this.renderList(); });
  }

  onKey(e) {
    if (!this.active || !this.tour) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); this.go(1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); this.go(-1); }
  }
}

// 导览模式：预设教学路线。每一步只引用结构 key，不依赖具体病例；
// 当前病例缺少某步所需结构时该步自动跳过，因此同一条路线可用于 CT 和 MRI 的不同病例。
//
// 步骤字段：
//   title / text   标题与讲解（中文，可含 <b> 等简单标签）
//   select         选中并定位到该结构（代表层面）
//   at             { key, pos: 'top' | 'bottom' | 'best', offset } 把横断位移到某结构的上缘 / 下缘 / 代表层面
//   seq            切换 MRI 序列（如 'T2'），仅对多序列病例生效
//   wl             窗位预设名（如 '肺窗'），当前病例没有该预设则忽略
//   only           3D 中只显示这些结构 key（其余隐藏）；'all' 表示全部显示
//   systems        3D 中只显示这些系统
//   clip           剖切模式 none / axial / coronal / sagittal
//   view           3D 视角 front / top / left / right / back
//   requires       该步需要的结构（默认取 select / at.key）
//   overlay        标签叠加透明度 0–1（0 = 只看原始灰度图像）；导览结束后恢复
//   probe          在面板中列出这些结构的实测中位数（CT 为 HU，MRI 为当前序列的相对信号）
//   （路线级）cases  仅在这些病例中出现（讲解中引用了具体病例的实测值时使用）
//   next           { case, tour, label } 在本步显示"继续"按钮，切换到另一病例的导览（用于跨病例对比）
//   lesson         附带"读片手册"中对应章节的链接（章节 id）

export const TOURS = [
  // ------------------------- 读片入门 -------------------------
  {
    id: 'ct-basics',
    cases: ['s0344'],
    title: 'CT 读片入门',
    en: 'How to read a CT',
    desc: '方位约定 → CT 值 → 平扫还是增强 → 窗宽窗位 → 多平面重建 → 读片顺序。',
    steps: [
      {
        title: '先关掉颜色，看原片',
        overlay: 0, wl: '软组织', select: 'liver', clip: 'none', view: 'front', only: 'all', lesson: 'orient',
        text: '真实的 CT 是<b>灰度图像</b>，本平台的彩色只是教学用的标签叠加，这一路线先把它关掉。<br><br><b>方位约定</b>：横断位相当于<b>从患者足侧向头侧看</b>，所以<b>屏幕左侧 = 患者右侧</b>。肝位于屏幕左侧、脾位于屏幕右侧，这是正常的。冠状位相当于面对面看患者，同样是屏幕左 = 患者右。图像四周的橙色字母（R/L/A/P/S/I）标明方向，读片前先看一眼。',
      },
      {
        title: 'CT 值（HU）：密度的"刻度尺"',
        select: 'liver', lesson: 'hu',
        probe: ['lung_upper_lobe_left', 'gallbladder', 'urinary_bladder', 'iliopsoas_left', 'liver', 'spleen', 'kidney_left', 'aorta', 'vertebrae_L3'],
        text: 'CT 测量的是组织对 X 线的衰减，以<b>水 = 0 HU、空气 = −1000 HU</b> 为基准。常用参考：脂肪 −100 ~ −50，水/尿/胆汁 0 ~ 20，肌肉 40 ~ 50，平扫肝 50 ~ 65，松质骨 200 ~ 400，皮质骨 > 1000。<br><br>下表是<b>本病例的实测中位数</b>。把鼠标移到皮下脂肪或体外空气上，提示框会显示该点的 HU。CT 上描述为<b>高密度 / 等密度 / 低密度</b>（MRI 上则说"信号"）。<br><br>注意本例肝、脾、主动脉都比上面的平扫参考值高——为什么？下一步揭晓。',
      },
      {
        title: '平扫还是增强？',
        select: 'aorta', lesson: 'hu',
        probe: ['aorta', 'portal_vein_and_splenic_vein', 'inferior_vena_cava', 'liver', 'iliopsoas_left'],
        text: '读片第一件事是确认<b>有没有打造影剂</b>。平扫时血液约 40 ~ 50 HU，与肌肉接近，血管和周围组织分不开。<br><br>看下表的主动脉：<b>明显高于肌肉</b>说明是增强扫描；主动脉远高于门静脉（常 > 200 HU）为<b>动脉期</b>；主动脉与门静脉接近、肝实质同步强化为<b>门静脉期</b>。你来判断本例是哪一种。',
      },
      {
        title: '窗宽窗位：同一组数据，换个"看法"',
        wl: '软组织', select: 'pancreas', lesson: 'window',
        text: '人眼只能分辨几十级灰度，而 CT 值跨越几千 HU。<b>窗位（L）</b>是要显示的 HU 范围的中心，<b>窗宽（W）</b>是范围的大小：低于 L − W/2 显示为纯黑，高于 L + W/2 显示为纯白。<br><br>当前是<b>软组织窗 W400 / L40</b>，显示 −160 ~ +240 HU，适合看实质脏器和血管。在任意切片上<b>按住右键拖动</b>（Mac 触控板：<b>Ctrl 或 ⌘ + 左键拖动</b>）可以连续调节：左右改窗宽、上下改窗位，顶栏和切片左下角会显示当前 W / L。',
      },
      {
        title: '肺窗',
        wl: '肺窗', select: 'lung_upper_lobe_right', lesson: 'window',
        text: '<b>肺窗 W1500 / L−600</b>：窗位降到负值、窗宽很大，肺纹理、支气管、小结节才看得清。软组织窗下肺是一片黑，肺窗下纵隔和腹部则"糊"成一片白。<b>胸部 CT 必须分别在肺窗和纵隔（软组织）窗下各读一遍。</b>',
      },
      {
        title: '骨窗',
        wl: '骨窗', select: 'vertebrae_L1', clip: 'sagittal', view: 'left', lesson: 'window',
        text: '<b>骨窗</b>窗位高、窗宽大，皮质骨与松质骨的细节清楚，用于观察骨折、骨质破坏和骨转移。矢状位上可以一眼看到整条脊柱的排列与椎体高度。',
      },
      {
        title: '多平面重建（MPR）',
        overlay: 0.35, wl: '软组织', select: 'kidney_left', clip: 'coronal', view: 'front', lesson: 'orient',
        text: '现代 CT 一次扫描得到的是<b>一整块三维数据</b>，冠状位和矢状位都是从同一块数据里"切"出来的重建图像，所以三个平面的光标可以联动。<br><br>标签颜色已重新打开：对照 3D 模型可以看到，横断位上的一个"圆"在冠状位上可能是一条"管"，这就是建立空间概念的关键。',
      },
      {
        title: '系统化读片顺序',
        overlay: 0.35, clip: 'none', view: 'front', lesson: 'system',
        text: '初学者最容易犯的错误是"盯着最显眼的病变，漏掉其他发现"。建议每次都按固定顺序读：<br>① 核对信息：姓名、日期、部位、平扫/增强、层厚<br>② 实质脏器：肝 → 胆 → 胰 → 脾 → 肾、肾上腺<br>③ 空腔脏器：胃、十二指肠、小肠、结肠<br>④ 血管与淋巴结：主动脉、门静脉、腹膜后淋巴结<br>⑤ 腹膜、腹壁、盆腔<br>⑥ 骨窗看骨骼，肺窗看肺底<br>⑦ 与旧片比较。',
      },
    ],
  },
  {
    id: 'mri-sequences',
    title: 'MRI 序列：T1 / T2 / PD',
    en: 'MRI sequences',
    desc: '同一个大脑、三种序列：学会看脑脊液、灰白质的信号来认序列。',
    steps: [
      {
        title: 'T1 加权像（T1WI）',
        seq: 'T1', wl: '标准', overlay: 0, select: 'lateral_ventricle_left', clip: 'none', view: 'top', only: 'all', lesson: 'mri-basic',
        requires: ['lateral_ventricle_left', 'cerebral_white_matter_left'],
        probe: ['lateral_ventricle_left', 'eye_left', 'precentral_left', 'caudate_left', 'cerebral_white_matter_left'],
        text: 'MRI 的数值<b>没有绝对单位</b>，只能和同一幅图中的其他组织比较，描述为<b>高 / 等 / 低信号</b>。<br><br><b>T1WI</b>：<b>脑脊液黑</b>（侧脑室、眼球玻璃体都是暗的），<b>白质比灰质亮</b>，脂肪很亮。灰白质分界清楚、解剖细节好，常被称为"<b>解剖像</b>"，也是打钆造影剂后观察强化的序列。',
      },
      {
        title: 'T2 加权像（T2WI）',
        seq: 'T2', wl: '标准', select: 'lateral_ventricle_left', lesson: 'mri-basic',
        probe: ['lateral_ventricle_left', 'eye_left', 'precentral_left', 'caudate_left', 'cerebral_white_matter_left'],
        text: '<b>T2WI</b>：<b>水最亮</b>——脑脊液、玻璃体呈明显高信号；<b>灰质比白质亮</b>，与 T1 正好相反。<br><br>绝大多数病变（水肿、炎症、肿瘤、梗死）含水量增加，在 T2 上变亮，所以 T2 常被称为"<b>病变像</b>"。记住一句话：<b>T2 上水是白的</b>。',
      },
      {
        title: '质子密度像（PD）',
        seq: 'PD', wl: '标准', select: 'lateral_ventricle_left', lesson: 'mri-basic',
        probe: ['lateral_ventricle_left', 'eye_left', 'precentral_left', 'caudate_left', 'cerebral_white_matter_left'],
        text: '<b>PD</b> 尽量减少 T1 和 T2 的影响，信号主要反映组织中<b>氢质子的多少</b>。灰质仍略亮于白质，脑脊液含水多、质子密度高，因此也偏亮，但整体灰白质对比较平淡。PD 在脑部已较少单独使用，但在<b>关节（半月板、软骨、韧带）</b>检查中非常常用，常配合脂肪抑制。',
      },
      {
        title: '来回切换，自己总结',
        seq: 'T1', select: 'caudate_left', clip: 'coronal', view: 'front', lesson: 'mri-table',
        text: '用顶栏的 <b>T1 / T2 / PD</b> 按钮来回切换，观察同一结构的变化。辨认序列的口诀：<br>① <b>先看水</b>（脑脊液、眼球、膀胱尿液、胆囊胆汁）：水黑 → T1 或 FLAIR；水白 → T2。<br>② <b>再看灰白质</b>：白质亮于灰质 → T1；灰质亮于白质 → T2 / PD / FLAIR。<br>③ <b>水黑但灰质亮于白质</b> → FLAIR（压了水的 T2）。<br>④ <b>脂肪变暗</b> → 用了脂肪抑制。',
      },
      {
        title: '本平台尚未包含的序列',
        overlay: 0.35, select: 'hippocampus_left', clip: 'coronal', lesson: 'mri-more',
        text: '临床上还有很多重要序列：<b>FLAIR</b>（抑制脑脊液的 T2，脑室旁病变最清楚）、<b>DWI / ADC</b>（急性脑梗死数分钟即可在 DWI 上变亮）、<b>T1 增强</b>（血脑屏障破坏处强化）、<b>SWI</b>（出血、微出血、钙化）、<b>MRA</b>（不打药显示血管）。本病例是群体平均模板，没有这些序列的图像；它们的原理和信号特点见右上角 <b>读片入门</b> 手册。',
      },
    ],
  },
  {
    id: 'mri-abdomen',
    cases: ['mr_s0646'],
    title: '腹部 MRI：从信号推断序列',
    en: 'Abdominal MRI detective',
    desc: '一幅没有标注序列的腹部 MRI：根据脑脊液、椎间盘、血管的信号推断它是什么序列。',
    steps: [
      {
        title: '信号只有相对意义',
        overlay: 0, wl: '标准', select: 'liver', clip: 'none', view: 'front', only: 'all', lesson: 'mri-table',
        requires: ['liver', 'aorta', 'spinal_cord'],
        probe: ['portal_vein_and_splenic_vein', 'liver', 'kidney_left', 'spleen', 'aorta', 'gallbladder', 'iliopsoas_left', 'intervertebral_discs', 'spinal_cord'],
        text: '下表是本例 MRI 的实测信号，数值本身没有意义（不同机器、参数下完全不同），但<b>排序</b>有意义。描述时说"肝呈<b>稍高信号</b>"，而不是"肝 1400"。<br><br>这个病例数据集没有给出序列名称，我们来当一回侦探。',
      },
      {
        title: '线索一：水在哪里？',
        select: 'spinal_cord', clip: 'sagittal', view: 'left', requires: ['spinal_cord'],
        text: '矢状位看椎管：如果是 T2，脊髓周围的<b>脑脊液应该是一圈亮白</b>。这里椎管整体偏暗，椎间盘也偏暗——<b>水不亮，说明不是 T2</b>。',
      },
      {
        title: '线索二：血管为什么这么亮？',
        select: 'portal_vein_and_splenic_vein', clip: 'axial', view: 'top', requires: ['portal_vein_and_splenic_vein', 'aorta'],
        text: '在常规自旋回波序列上，快速流动的血液通常呈<b>流空黑影</b>。这里主动脉、门静脉、下腔静脉都<b>明显高信号</b>，并且门静脉也同样亮——这是<b>钆造影剂</b>进入静脉系统后的表现。<br><br><b>结论（推测）</b>：这很可能是<b>T1 加权增强扫描（门静脉期）</b>。临床上以 T1 梯度回波（如 VIBE / LAVA）动态增强最为常见。',
      },
      {
        title: '和 CT 对照',
        overlay: 0.35, select: 'kidney_left', clip: 'coronal', view: 'front', lesson: 'compare',
        text: '可以切换到 CT 病例对照：CT 对<b>骨骼、肺、钙化、急性出血</b>更敏感、扫描快；MRI 无电离辐射、<b>软组织对比更好</b>，能区分脂肪、水、出血、纤维组织等成分，在肝脏局灶病变、胰胆管（MRCP）、盆腔、神经系统和关节中优势明显。',
      },
    ],
  },
  // ------------- 肾的三个增强期相（跨病例，依次切换） -------------
  {
    id: 'kidney-phase-1',
    cases: ['s1421'],
    title: '肾的增强期相 ①：皮髓质期',
    en: 'Renal phases 1/3: corticomedullary',
    desc: '三个病例连起来看：皮髓质期 → 肾实质期 → 排泄期。本病例为第一站。',
    steps: [
      {
        title: '动脉期：皮质先亮',
        select: 'kidney_left', wl: '血管窗', overlay: 0, clip: 'coronal', view: 'front', only: 'all', lesson: 'uro',
        requires: ['kidney_left', 'aorta'],
        probe: ['aorta', 'kidney_left', 'portal_vein_and_splenic_vein', 'liver', 'urinary_bladder'],
        text: '注射造影剂后约 <b>25 ~ 40 秒</b>，造影剂首先到达血供最丰富的<b>肾皮质</b>，髓质还来不及强化。冠状位上可以看到：<b>肾周边一圈亮的皮质</b>，以及向内伸入的肾柱，包绕着<b>较暗的锥形髓质（肾锥体）</b>。<br><br>同时看下表：<b>主动脉 500 多 HU</b>，而门静脉不到 100 HU——这是典型的<b>动脉期</b>。',
      },
      {
        title: '皮质与髓质：自己测一测',
        select: 'kidney_right', clip: 'axial', view: 'top',
        text: '把鼠标分别放在肾皮质（外周亮环）和髓质（内部暗区）上，比较提示框中的 CT 值：本例皮质约 <b>250 ~ 300 HU</b>，髓质只有约 <b>100 ~ 150 HU</b>。<br><br><b>用途</b>：评估肾动脉、富血供肿瘤（如透明细胞癌）的强化程度。<b>陷阱</b>：较暗的髓质可能掩盖或"假装"成小肿瘤，因此不能只看这一期。',
      },
      {
        title: '膀胱里为什么已经有造影剂？',
        select: 'urinary_bladder', wl: '软组织', clip: 'sagittal', view: 'left',
        probe: ['urinary_bladder'],
        text: '动脉期才过了几十秒，这次注射的造影剂不可能已经排到膀胱。本例膀胱下半部分是浓造影剂（约 900 HU 以上），上方是尿液，形成液-液平面——最可能来自<b>之前另一次增强检查</b>残留的造影剂（病史不详，属推测）。<br><br><b>启示</b>：判断期相要看<b>血管和肾实质</b>，不能只看膀胱亮不亮。',
      },
      {
        title: '下一站：肾实质期',
        select: 'kidney_left', clip: 'coronal', view: 'front', overlay: 0,
        next: { case: 's0344', tour: 'kidney-phase-2', label: '肾实质期（切换病例）' },
        text: '记住皮质和髓质这种"一亮一暗"的对比。点击下方按钮，切换到另一例在<b>门静脉期</b>扫描的 CT，看看大约一分钟之后肾会变成什么样。',
      },
    ],
  },
  {
    id: 'kidney-phase-2',
    cases: ['s0344'],
    title: '肾的增强期相 ②：肾实质期',
    en: 'Renal phases 2/3: nephrographic',
    desc: '门静脉期 / 肾实质期：皮髓质均匀强化，最适合发现肾肿块。',
    steps: [
      {
        title: '皮髓质"融"成一片',
        select: 'kidney_left', wl: '软组织', overlay: 0, clip: 'coronal', view: 'front', only: 'all', lesson: 'uro',
        probe: ['aorta', 'kidney_left', 'portal_vein_and_splenic_vein', 'liver', 'urinary_bladder'],
        text: '注射后约 <b>80 ~ 120 秒</b>，造影剂进入肾小管，髓质也强化起来，<b>皮质和髓质密度趋于一致</b>，整个肾实质均匀强化。这一期称为<b>肾实质期（肾图期）</b>，时间上与腹部常规的<b>门静脉期</b>大致重合。<br><br>对比下表与上一个病例：主动脉已降到约 100 HU，与门静脉接近；膀胱尿液仍是水样密度——造影剂还没排出来。',
      },
      {
        title: '为什么这一期最适合找肿瘤？',
        select: 'kidney_right', clip: 'axial', view: 'top',
        text: '肾实质均匀，任何<b>不强化或强化程度不同</b>的病灶都会显得很突出，因此肾实质期是<b>检出肾肿块最敏感</b>的一期。皮髓质期里髓质本来就暗，小肿瘤容易混在其中被漏掉。<br><br>临床上肾肿块的标准 CT 方案通常包括：平扫 + 皮髓质期 + 肾实质期（必要时加排泄期）。',
      },
      {
        title: '下一站：排泄期',
        select: 'kidney_left', clip: 'coronal', view: 'front',
        next: { case: 'uro_s0329', tour: 'kidney-phase-3', label: '排泄期（切换病例）' },
        text: '再等几分钟，造影剂会被滤过进入集合系统。点击下方按钮，切换到排泄期病例。',
      },
    ],
  },
  {
    id: 'kidney-phase-3',
    cases: ['uro_s0329'],
    title: '肾的增强期相 ③：排泄期',
    en: 'Renal phases 3/3: excretory',
    desc: '造影剂排入肾盏、肾盂、输尿管和膀胱；三期总结。',
    steps: [
      {
        title: '集合系统被充盈',
        select: 'renal_pelvis_left', wl: '尿路窗', overlay: 0, clip: 'coronal', view: 'front', only: 'all', lesson: 'uro',
        requires: ['renal_pelvis_left'],
        probe: ['aorta', 'kidney_left', 'renal_pelvis_left', 'ureter_left', 'urinary_bladder'],
        text: '注射后约 <b>5 ~ 15 分钟</b>：肾实质强化开始消退，<b>肾盏、肾盂、输尿管</b>被高密度造影剂充盈，膀胱背侧出现造影剂分层。主动脉降到约 80 HU。<br><br>这一期用来观察<b>尿路腔内</b>：充盈缺损（尿路上皮肿瘤、结石、血块）、狭窄、扩张和尿漏。',
      },
      {
        title: '三期总结',
        select: 'kidney_left', wl: '软组织', overlay: 0.35, clip: 'none',
        next: { case: 'uro_s0329', tour: 'uro-ctu', label: '沿尿路走一遍（排泄期导览）' },
        text: '<table class="t-tbl"><tr><th>期相</th><th>时间</th><th>主动脉</th><th>肾</th><th>尿路</th></tr>' +
          '<tr><td>皮髓质期</td><td>25 ~ 40 s</td><td>很亮</td><td>皮质亮、髓质暗</td><td>不显影</td></tr>' +
          '<tr><td>肾实质期</td><td>80 ~ 120 s</td><td>中等</td><td>均匀强化</td><td>不显影</td></tr>' +
          '<tr><td>排泄期</td><td>5 ~ 15 min</td><td>减低</td><td>强化消退</td><td>充盈</td></tr></table>' +
          '读片时先问：<b>造影剂走到哪里了？</b>看主动脉、门静脉、肾皮髓质和集合系统，就能判断期相，进而知道这一期适合看什么、可能漏掉什么。',
      },
    ],
  },
  {
    id: 'uro-ctu',
    title: '排泄期 CT：尿路全程',
    en: 'Excretory-phase CT urography',
    desc: '造影剂充盈的肾盏、肾盂、输尿管和膀胱：沿尿路走一遍，认识三个狭窄和膀胱液-液平面。',
    steps: [
      {
        title: '排泄期：尿路"亮"起来了',
        only: ['renal_pelvis_left', 'renal_pelvis_right', 'ureter_left', 'ureter_right', 'urinary_bladder', 'kidney_left', 'kidney_right', 'vertebrae_L1', 'vertebrae_L2', 'vertebrae_L3', 'vertebrae_L4', 'vertebrae_L5', 'sacrum', 'hip_left', 'hip_right'],
        select: 'renal_pelvis_left', wl: '尿路窗', overlay: 0.35, clip: 'none', view: 'front', lesson: 'uro',
        requires: ['renal_pelvis_left', 'ureter_left', 'urinary_bladder'],
        text: '注射碘造影剂约 <b>5 ~ 15 分钟</b>后，造影剂经肾小球滤过排入集合系统，<b>肾盏、肾盂、输尿管和膀胱</b>都被充盈成高密度——这就是 CT 尿路造影（CTU）的<b>排泄期</b>。3D 中可以看到完整的尿路，相当于传统"静脉肾盂造影"的三维版本。<br><br>当前使用<b>尿路窗（W1500 / L350）</b>：造影剂密度可达数百至上千 HU，软组织窗下会一片"过曝"，加宽窗才能看清腔内细节。<br><br><small>说明：本例肾盂肾盏和输尿管由造影剂阈值自动提取，未经人工校对。</small>',
      },
      {
        title: '怎么确认是排泄期？',
        select: 'renal_pelvis_left', wl: '软组织', overlay: 0, lesson: 'uro',
        probe: ['aorta', 'inferior_vena_cava', 'kidney_left', 'renal_pelvis_left', 'ureter_left', 'urinary_bladder'],
        text: '对比下表：<b>主动脉只有约 80 HU</b>，血管里的造影剂已大部分被稀释和排出；而<b>肾盂、输尿管数百 HU</b>，远高于血管。这正是排泄期的特征。<br><br>对照胸腹 CT 病例 s0344（门静脉期）：那里主动脉约 100 HU，膀胱尿液只有 10 HU。<b>判断期相，就看造影剂"走到了哪里"</b>。',
      },
      {
        title: '肾盏与肾盂',
        select: 'renal_pelvis_right', wl: '尿路窗', overlay: 0.35, clip: 'coronal', view: 'front', only: 'all',
        text: '<b>冠状位</b>最适合观察集合系统：每个<b>肾小盏</b>呈杯口状包绕肾乳头，数个小盏汇成<b>肾大盏</b>，再汇合成漏斗状的<b>肾盂</b>。<br><br>读片时注意：杯口是否锐利（变钝提示积水或感染）、腔内有无<b>充盈缺损</b>（结石、血块、尿路上皮肿瘤）。用滚轮前后翻层，逐个检查每个肾盏。',
      },
      {
        title: '第一个狭窄：肾盂输尿管连接部',
        select: 'ureter_right', at: { key: 'renal_pelvis_right', pos: 'bottom', offset: 0 }, clip: 'none', view: 'front',
        text: '肾盂出肾门后逐渐变细，移行为输尿管，这里称为<b>肾盂输尿管连接部（UPJ）</b>，是第一个生理狭窄。先天性 UPJ 梗阻是儿童肾积水最常见的原因。',
      },
      {
        title: '第二个狭窄：跨越髂血管',
        select: 'ureter_right', at: { key: 'ureter_right', pos: 'bottom', offset: 58 }, clip: 'axial', view: 'top',
        requires: ['ureter_right', 'iliac_artery_right'],
        text: '横断位已移到<b>右输尿管与右髂动脉最接近的层面</b>（本例相距仅约 3 mm）。输尿管在骨盆入口处从<b>髂血管前方</b>跨过进入盆腔，这是第二个狭窄。<br><br>在 3D 中旋转，可以看到输尿管从腰大肌前方下行、在骨盆缘越过髂血管、再弯向内侧进入膀胱的完整路径。',
      },
      {
        title: '第三个狭窄：膀胱壁内段',
        select: 'ureter_left', at: { key: 'ureter_left', pos: 'bottom', offset: 2 }, clip: 'none', view: 'front',
        text: '输尿管下端<b>斜行穿过膀胱壁</b>（壁内段约 1.5 cm），开口于膀胱三角的外上角。这一段最窄，是<b>结石最常嵌顿</b>的部位。斜穿的结构在膀胱充盈时可被压闭，起到防止尿液反流的作用。',
      },
      {
        title: '膀胱：液-液平面',
        select: 'urinary_bladder', wl: '软组织', overlay: 0, clip: 'sagittal', view: 'left',
        probe: ['urinary_bladder'],
        text: '关掉标签，看矢状位和横断位：造影剂比重大于尿液，仰卧时沉在膀胱<b>背侧</b>，与上方未混匀的尿液形成水平的<b>液-液平面</b>。这是排泄期早期的正常表现，不要误认为病变。<br><br>正因为造影剂分层，膀胱前壁附近的小病灶可能被漏掉；临床上有时会让患者翻身后再扫一次。',
      },
      {
        title: '输尿管为什么"时断时续"？',
        select: 'ureter_left', wl: '尿路窗', overlay: 0.35, clip: 'none', view: 'front',
        text: '输尿管靠<b>蠕动</b>把尿液一段段送向膀胱，所以排泄期 CT 上它常常<b>节段性显影</b>，某一段不显影并不一定是梗阻。本例两侧显影较完整，比较少见。<br><br>判断梗阻要看：近端是否扩张、肾盂是否积水、造影剂是否延迟排出，必要时加扫更晚的延迟期或俯卧位。',
      },
    ],
  },
  {
    id: 'prostate-mri',
    cases: ['mr_s0273'],
    title: '前列腺 MRI',
    en: 'Prostate MRI',
    desc: '三维 T2 加权像上认识前列腺的位置、毗邻和分区，以及多参数 MRI 与 PI-RADS。',
    steps: [
      {
        title: '盆腔 T2 加权像',
        select: 'urinary_bladder', wl: '标准', overlay: 0, clip: 'none', view: 'front', only: 'all', lesson: 'uro',
        requires: ['prostate', 'urinary_bladder'],
        probe: ['urinary_bladder', 'prostate', 'colon', 'hip_left'],
        text: '这是一例<b>三维 T2 加权</b>盆腔 MRI（体素约 1 mm），可以在任意平面重建。先按"先看水"的口诀确认序列：<b>膀胱尿液很亮</b>，所以是 T2。<br><br>与 CT 相比，MRI 能看清前列腺内部的结构，而 CT 上前列腺只是一团均匀的软组织。',
      },
      {
        title: '前列腺的位置与大小',
        select: 'prostate', overlay: 0.35, clip: 'sagittal', view: 'left',
        text: '矢状位上：前列腺位于<b>膀胱颈下方</b>、<b>耻骨联合后方</b>、<b>直肠前方</b>，形似倒置的栗子——上端宽大的<b>底部</b>贴膀胱颈，下端尖细的<b>尖部</b>朝向尿生殖膈。<br><br>正常成人前列腺约 20 ~ 25 mL；本例 77 岁，实测约 <b>39 mL</b>，提示轻度增大，与年龄相关的<b>良性前列腺增生</b>常见。',
      },
      {
        title: '前列腺的分区',
        select: 'prostate', overlay: 0, clip: 'axial', view: 'top',
        text: '关掉标签，在横断位上辨认（本例只标注了整个前列腺，分区需要自己在图上找）：<br>• <b>外周带</b>：位于后外侧，占年轻人腺体约 70%，T2 上呈<b>较高信号</b>；约 70% 的前列腺癌发生于此，表现为高信号背景中的<b>低信号灶</b>。<br>• <b>移行带</b>：围绕尿道前部，是<b>良性增生</b>的发生部位；增生结节使其增大、信号混杂，老年人常把外周带挤成一薄层。<br>• <b>中央带</b>：位于底部、射精管周围。<br>• <b>前纤维肌基质</b>：前方，T2 低信号。',
      },
      {
        title: '尿道与膀胱颈',
        select: 'prostate', clip: 'coronal', view: 'front', overlay: 0,
        text: '<b>冠状位</b>上，前列腺部尿道从膀胱颈向下穿过腺体中央。前列腺增生时移行带增大，压迫并拉长尿道，导致排尿困难；明显增大的腺体还可向上突入膀胱底部。',
      },
      {
        title: '与直肠的毗邻',
        select: 'colon', at: { key: 'prostate', pos: 'best' }, overlay: 0.35, clip: 'sagittal', view: 'left',
        requires: ['colon', 'prostate'],
        text: '前列腺后方隔着薄层的<b>直肠膀胱筋膜（Denonvilliers 筋膜）</b>紧贴<b>直肠</b>（本例直肠包含在"结肠"标注中）。这一毗邻关系是<b>直肠指检</b>能触及前列腺的解剖基础，也是经直肠超声和穿刺的入路。肿瘤是否突破包膜、侵犯精囊或直肠，决定了分期和治疗方式。',
      },
      {
        title: '多参数 MRI 与 PI-RADS',
        select: 'prostate', overlay: 0.35, clip: 'none', view: 'front', lesson: 'mri-more',
        text: '临床前列腺 MRI 是<b>多参数</b>检查，本例只有其中的 T2：<br>• <b>T2WI</b>：显示解剖和分区，是<b>移行带</b>病灶评分的主序列。<br>• <b>DWI / ADC</b>：癌组织细胞密集，弥散受限（DWI 高、ADC 低），是<b>外周带</b>病灶评分的主序列。<br>• <b>动态增强（DCE）</b>：癌灶早期快速强化，作为补充。<br><br>综合评分为 <b>PI-RADS 1 ~ 5 分</b>：1 ~ 2 分临床显著癌可能性低，4 ~ 5 分可能性高，通常建议 MRI 引导下的靶向穿刺。',
      },
    ],
  },
  {
    id: 'uro-ct',
    cases: ['s0344'],   // 文字中描述了本病例的期相与实测值
    title: '泌尿系统 CT',
    en: 'Urinary tract on CT',
    desc: '肾的位置与毗邻、肾门、增强期相、输尿管走行、膀胱与前列腺。',
    steps: [
      {
        title: '全景：肾的位置',
        only: ['kidney_left', 'kidney_right', 'adrenal_gland_left', 'adrenal_gland_right', 'urinary_bladder', 'prostate', 'aorta', 'inferior_vena_cava', 'iliac_artery_left', 'iliac_artery_right', 'iliac_vena_left', 'iliac_vena_right', 'iliopsoas_left', 'iliopsoas_right', 'vertebrae_T11', 'vertebrae_T12', 'vertebrae_L1', 'vertebrae_L2', 'vertebrae_L3', 'vertebrae_L4', 'vertebrae_L5', 'sacrum', 'hip_left', 'hip_right'],
        select: 'kidney_right', wl: '软组织', overlay: 0.35, clip: 'none', view: 'front', lesson: 'uro',
        requires: ['kidney_left', 'kidney_right', 'urinary_bladder'],
        text: '3D 中只保留泌尿系统、大血管、腰大肌和脊柱。肾位于腹膜后、脊柱两侧，约平 <b>T12 ~ L3</b>。教科书说<b>右肾因上方有肝，通常比左肾低约半个椎体</b>。<br><br>但看本例：<b>右肾上极平 T11 ~ T12，左肾上极平 L1</b>，右肾反而更高。这是正常的个体差异——<b>读片要以实际图像为准</b>，不能只凭"规律"判断左右。',
      },
      {
        title: '右肾的毗邻',
        select: 'kidney_right', only: 'all', clip: 'axial', view: 'top',
        text: '横断位上：右肾<b>前方</b>是肝、十二指肠降部和结肠肝曲；<b>后方</b>是膈肌和腰方肌，内后方贴<b>腰大肌</b>；<b>内侧</b>紧邻下腔静脉。右肾上极内上方是右肾上腺。',
      },
      {
        title: '左肾的毗邻',
        select: 'kidney_left',
        text: '左肾<b>前方</b>自上而下为胃、脾、胰尾和结肠脾曲；<b>内侧</b>靠近腹主动脉。左肾静脉较长，从<b>腹主动脉与肠系膜上动脉之间</b>穿过汇入下腔静脉——此处受压称为"胡桃夹"现象。',
      },
      {
        title: '肾门与肾窦',
        select: 'kidney_left', overlay: 0, wl: '软组织',
        text: '关掉标签看原片：肾门朝向前内侧，向内凹入形成<b>肾窦</b>，内有肾盂、肾盏、血管和脂肪（低密度）。肾门结构由前向后为<b>肾静脉 → 肾动脉 → 肾盂</b>（VAP）。<br><br>在横断位上滚动翻层，找一找肾门处的血管和肾盂。',
      },
      {
        title: '这是哪个增强期相？',
        select: 'kidney_left', overlay: 0, wl: '软组织', lesson: 'uro',
        probe: ['kidney_left', 'kidney_right', 'liver', 'aorta', 'portal_vein_and_splenic_vein', 'urinary_bladder'],
        text: '肾的强化有明确时序：<b>皮髓质期</b>皮质亮、髓质暗；<b>肾实质期</b>皮髓质均匀强化；<b>排泄期</b>造影剂进入肾盂和膀胱，尿路变白。<br><br>本例：肾实质均匀强化、门静脉已充分显影，而<b>膀胱尿液仍是水样密度</b>（造影剂尚未排出）——这是<b>门静脉期 / 肾实质期</b>，而不是排泄期。把鼠标放在肾皮质和髓质上比较 CT 值。',
      },
      {
        title: '输尿管的走行',
        select: 'iliopsoas_right', overlay: 0.35, clip: 'none', view: 'front',
        requires: ['iliopsoas_right', 'iliac_artery_right'],
        text: '输尿管在本例中<b>没有标注</b>（未在排泄期显影，管径仅数毫米）。它从肾盂发出后，沿<b>腰大肌前方</b>下行，在骨盆入口处<b>跨过髂血管</b>进入盆腔，最后斜穿膀胱壁开口于膀胱。<br><br>三个生理狭窄——<b>肾盂输尿管连接部、跨越髂血管处、膀胱壁内段</b>——是结石最易嵌顿的部位。可以在横断位上沿腰大肌前内侧逐层寻找这个小圆点。',
      },
      {
        title: '跨越髂血管',
        select: 'iliac_artery_right', clip: 'axial', view: 'top', requires: ['iliac_artery_right'],
        text: '<b>第二个狭窄</b>：输尿管在骨盆入口处跨过髂总动脉末端或髂外动脉起始部的前方。右侧输尿管多跨髂外动脉，左侧多跨髂总动脉。这里结石嵌顿时，CT 上可见结石上方的输尿管和肾盂扩张（肾积水）。',
      },
      {
        title: '膀胱',
        select: 'urinary_bladder', clip: 'sagittal', view: 'left', overlay: 0, requires: ['urinary_bladder'],
        probe: ['urinary_bladder', 'iliopsoas_left', 'prostate'],
        text: '<b>膀胱</b>位于耻骨联合后方。充盈的膀胱内尿液约 0 ~ 20 HU，膀胱壁薄而均匀（充盈时 &lt; 3 mm）。局部壁增厚或突入腔内的软组织结节要警惕膀胱癌。<br><br>排泄期时膀胱内先出现高密度造影剂，并因比重大而沉在<b>背侧</b>（仰卧位），形成液-液平面。',
      },
      {
        title: '前列腺',
        select: 'prostate', clip: 'sagittal', view: 'left', overlay: 0.35, lesson: 'uro', requires: ['prostate'],
        text: '<b>前列腺</b>位于膀胱颈下方、耻骨联合后方，包绕尿道起始部。CT 上前列腺内部密度均匀，<b>只能评估大小和钙化</b>，无法区分内部分区。<br><br>判断前列腺癌需要<b>多参数 MRI</b>：T2 上外周带呈高信号，癌灶表现为其中的低信号区，并在 DWI 上弥散受限。',
      },
    ],
  },
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

  // ------------------------- 脑（MNI152 + CerebrA） -------------------------
  {
    id: 'brain-t1t2',
    title: '读懂 T1 与 T2',
    en: 'T1 vs T2 contrast',
    desc: '同一层面切换 T1 / T2，掌握脑脊液、灰质、白质的信号规律。',
    steps: [
      {
        title: 'T1 加权像',
        seq: 'T1', wl: '标准', select: 'lateral_ventricle_left', clip: 'axial', view: 'top',
        text: '<b>T1</b> 像上：<b>脑脊液为低信号（黑）</b>，<b>白质比灰质亮</b>。T1 解剖细节清楚，常用于观察结构和增强扫描。',
      },
      {
        title: 'T2 加权像',
        seq: 'T2', wl: '标准', select: 'lateral_ventricle_left',
        text: '切换到 <b>T2</b>：<b>脑脊液变为高信号（白）</b>，<b>白质比灰质暗</b>。多数病变（水肿、炎症、肿瘤）含水增多，在 T2 上呈高信号，因此 T2 对发现病变更敏感。',
      },
      {
        title: '眼球玻璃体',
        seq: 'T2', select: 'eye_left', view: 'front',
        text: '<b>玻璃体</b>主要由水构成：T2 上明亮，T1 上发暗——与脑脊液规律一致。可点上方"序列"按钮自己对比。',
      },
      {
        title: '口诀',
        seq: 'T1', select: 'cerebral_white_matter_left', clip: 'axial', view: 'top',
        text: '简记：<b>"T1 看解剖，T2 看病变"</b>；<b>"水在 T1 黑、在 T2 白"</b>。脂肪在两者上都偏亮，可用脂肪抑制序列区分。',
      },
    ],
  },
  {
    id: 'brain-lobes',
    title: '脑叶与功能区',
    en: 'Lobes & functional areas',
    desc: '找到运动区、感觉区、Broca 区、Wernicke 区、听觉与视觉皮质。',
    steps: [
      {
        title: '中央前回：初级运动皮质',
        seq: 'T1', wl: '标准', select: 'precentral_left', clip: 'none', view: 'left', only: 'cortex',
        text: '<b>中央沟</b>把额叶和顶叶分开。沟前方的<b>中央前回</b>是初级运动皮质，支配<b>对侧</b>躯体运动；内侧面上部代表下肢，外侧面下部代表面部和舌。',
      },
      {
        title: '中央后回：初级躯体感觉皮质',
        select: 'postcentral_left', view: 'left',
        text: '<b>中央后回</b>紧贴中央沟后方，接受对侧躯体的感觉，排列方式与运动区类似。',
      },
      {
        title: 'Broca 区（运动性语言中枢）',
        select: 'pars_opercularis_left', view: 'left',
        text: '优势半球（通常为左侧）<b>额下回的岛盖部和三角部</b>合称 Broca 区。损伤后患者能理解语言，但说话费力、不流利（运动性失语）。',
      },
      {
        title: 'Wernicke 区（感觉性语言中枢）',
        select: 'superior_temporal_left', view: 'left',
        text: '优势半球<b>颞上回后部</b>为 Wernicke 区。损伤后说话流利但内容空洞，且不能理解他人语言（感觉性失语）。',
      },
      {
        title: '颞横回：初级听觉皮质',
        select: 'transverse_temporal_left', clip: 'axial', view: 'top', only: 'all',
        text: '<b>颞横回（Heschl 回）</b>藏在外侧沟深部、颞上回上面，需要剖开才能看到。听觉为双侧投射，单侧损伤一般不致聋。',
      },
      {
        title: '距状沟：初级视觉皮质',
        select: 'pericalcarine_right', clip: 'sagittal', view: 'left',
        text: '去掉左半脑后看右半球<b>内侧面</b>：枕叶的<b>距状沟</b>两侧是初级视觉皮质（V1），上方为楔叶，下方为舌回。右侧 V1 接收<b>左侧视野</b>的信息。',
      },
    ],
  },
  {
    id: 'brain-basal',
    title: '基底核与内囊',
    en: 'Basal ganglia & internal capsule',
    desc: '在横断面上辨认尾状核、豆状核、丘脑，理解内囊的位置。',
    steps: [
      {
        title: '尾状核头',
        seq: 'T1', wl: '标准', select: 'caudate_left', clip: 'axial', view: 'top', only: 'all',
        text: '<b>尾状核</b>头部膨大，构成<b>侧脑室前角</b>的外侧壁。在横断位上它与外侧的豆状核之间夹着一条白质带——<b>内囊前肢</b>。',
      },
      {
        title: '壳核',
        select: 'putamen_left',
        text: '<b>壳核</b>位于最外侧，与内侧的苍白球合称<b>豆状核</b>（横断面上呈"凸透镜"形）。壳核外侧依次是外囊、屏状核、最外囊和岛叶。壳核是<b>高血压脑出血</b>最常见的部位。',
      },
      {
        title: '苍白球',
        select: 'pallidum_left',
        text: '<b>苍白球</b>位于壳核内侧，在 T1 上通常比壳核略亮。豆状核内侧尖端指向<b>内囊膝部</b>。',
      },
      {
        title: '丘脑与内囊后肢',
        select: 'thalamus_left',
        text: '<b>丘脑</b>位于第三脑室两侧。丘脑与豆状核之间是<b>内囊后肢</b>，内有皮质脊髓束和丘脑皮质束通过。此处小的梗死或出血即可引起对侧偏瘫和偏身感觉障碍（"三偏"征）。',
      },
    ],
  },
  {
    id: 'brain-ventricles',
    title: '脑室系统与脑脊液循环',
    en: 'Ventricles & CSF pathway',
    desc: '沿脑脊液流向：侧脑室 → 第三脑室 → 第四脑室。',
    steps: [
      {
        title: '侧脑室',
        seq: 'T2', wl: '标准', select: 'lateral_ventricle_left', clip: 'none', view: 'front', only: 'ventricles',
        text: '3D 中只保留脑室系统。<b>侧脑室</b>左右各一，分为前角、体部、后角和下角，脉络丛产生的脑脊液大部分来自这里。已切换到 <b>T2</b>，脑脊液呈高信号。',
      },
      {
        title: '侧脑室下角',
        select: 'inferior_lateral_ventricle_left', view: 'left',
        text: '<b>下角（颞角）</b>伸入颞叶，底壁就是海马。正常时很窄；下角增宽常提示海马萎缩或交通性脑积水。',
      },
      {
        title: '第三脑室',
        select: 'third_ventricle', view: 'left',
        text: '左右侧脑室经<b>室间孔</b>汇入<b>第三脑室</b>——位于两侧丘脑之间的狭窄矢状腔隙。',
      },
      {
        title: '第四脑室',
        select: 'fourth_ventricle', clip: 'sagittal', view: 'left', only: 'all',
        text: '第三脑室经<b>中脑导水管</b>通入<b>第四脑室</b>（位于脑桥、延髓与小脑之间），再经正中孔和外侧孔流入蛛网膜下腔。导水管狭窄会导致梗阻性脑积水（侧脑室和第三脑室扩大，第四脑室正常）。',
      },
    ],
  },
  {
    id: 'brain-limbic',
    title: '边缘系统与记忆',
    en: 'Limbic system & memory',
    desc: '海马、杏仁体、内嗅皮质与扣带回。',
    steps: [
      {
        title: '海马',
        seq: 'T1', wl: '标准', select: 'hippocampus_left', clip: 'coronal', view: 'front', only: 'all',
        text: '<b>海马</b>位于颞叶内侧、侧脑室下角底壁，<b>冠状位</b>最便于观察。海马萎缩是阿尔茨海默病的重要影像表现（MTA 评分）。',
      },
      {
        title: '杏仁体',
        select: 'amygdala_left',
        text: '<b>杏仁体</b>位于海马头的前上方，处理恐惧等情绪，并为情绪性记忆"加权"。',
      },
      {
        title: '内嗅皮质与海马旁回',
        select: 'entorhinal_left',
        text: '<b>内嗅皮质</b>位于海马旁回前部，是新皮质信息进入海马的门户；阿尔茨海默病的神经纤维缠结最早出现在这里。',
      },
      {
        title: '扣带回',
        select: 'posterior_cingulate_right', clip: 'sagittal', view: 'left',
        text: '去掉左半脑看右半球内侧面：<b>扣带回</b>环绕胼胝体，与海马旁回共同构成"边缘叶"。后扣带回和楔前叶是默认模式网络的核心。',
      },
    ],
  },

  // ------------------------- 头颈部 CT -------------------------
  {
    id: 'head-ct-windows',
    title: '颅脑 CT 的窗位',
    en: 'Head CT windows',
    desc: '同一组 CT，换个窗就是另一张片子：脑窗、骨窗、硬膜下窗。',
    steps: [
      {
        title: '脑窗（W80 / L40）',
        wl: '脑窗', select: 'brain', clip: 'axial', view: 'top', only: 'all',
        requires: ['brain', 'skull'],
        text: '<b>脑窗</b>窗宽很窄，用来放大脑实质内细微的密度差：灰质约 35–40 HU，白质约 25–30 HU，脑脊液约 0–10 HU。急性出血约 60–80 HU，在脑窗下呈高密度。',
      },
      {
        title: '骨窗（W2800 / L600）',
        wl: '骨窗', select: 'skull',
        text: '<b>骨窗</b>下脑组织一片灰，但颅骨的内外板、板障和骨缝清晰可见，用于观察<b>颅骨骨折</b>和颅底孔道。读颅脑外伤 CT 时，脑窗和骨窗都必须看。',
      },
      {
        title: '硬膜下窗（W200 / L75）',
        wl: '硬膜下', select: 'brain',
        text: '<b>硬膜下窗</b>介于脑窗和骨窗之间，可以把紧贴颅骨内板的薄层硬膜下血肿与颅骨区分开——在普通脑窗下它们常常"融"在一起。',
      },
    ],
  },
  {
    id: 'head-orbit',
    title: '眼眶',
    en: 'The orbit',
    desc: '眼球、晶状体、视神经与六条眼外肌。',
    steps: [
      {
        title: '眼球与晶状体',
        wl: '软组织', select: 'eye_left', clip: 'axial', view: 'top', only: 'all',
        requires: ['eye_left'],
        text: '横断位经过眼球中部。<b>玻璃体</b>接近水样密度；前部的<b>晶状体</b>呈双凸透镜状，密度明显高于玻璃体（本例层厚 1.5 mm，晶状体太小未单独标注，可在图像上直接辨认）。',
      },
      {
        title: '视神经',
        select: 'optic_nerve_left',
        text: '<b>视神经</b>从眼球后极向后内走行，经视神经管入颅。在横断位上呈略弯曲的条带状，周围是眶内脂肪（低密度）。',
      },
      {
        title: '内、外直肌',
        select: 'medial_rectus_muscle_left', requires: ['medial_rectus_muscle_left'],
        text: '与视神经同一层面可见<b>内直肌</b>和<b>外直肌</b>，二者与上、下直肌围成"肌锥"。甲状腺相关眼病时眼外肌肌腹增粗（通常不累及肌腱），下直肌和内直肌最常受累。',
      },
      {
        title: '上、下直肌与上睑提肌',
        select: 'inferior_rectus_muscle_left', clip: 'coronal', view: 'front', requires: ['inferior_rectus_muscle_left'],
        text: '<b>冠状位</b>最适合同时观察四条直肌的横断面。<b>下直肌</b>紧贴眶底，眶底爆裂骨折时可能疝入上颌窦并嵌顿，导致上视受限和复视。',
      },
    ],
  },
  {
    id: 'head-sinus-pharynx',
    title: '鼻窦与咽喉',
    en: 'Sinuses, pharynx & larynx',
    desc: '从额窦一路向下到喉：气道的解剖分段。',
    steps: [
      {
        title: '额窦',
        wl: '骨窗', select: 'sinus_frontal', clip: 'sagittal', view: 'left', only: 'all',
        requires: ['sinus_frontal'],
        text: '<b>额窦</b>位于眉弓深面，左右常不对称。正常鼻窦内为气体（约 -1000 HU），窦腔内出现软组织或液平提示炎症或外伤。',
      },
      {
        title: '上颌窦与鼻腔',
        select: 'sinus_maxillary', clip: 'coronal', view: 'front', requires: ['sinus_maxillary'],
        text: '<b>上颌窦</b>是最大的鼻旁窦。冠状位上可见窦口位于内侧壁上部、开口于<b>中鼻道</b>，这一引流通道称为窦口鼻道复合体，是功能性鼻内镜手术的关键区域。',
      },
      {
        title: '鼻咽',
        wl: '软组织', select: 'nasopharynx', clip: 'sagittal', view: 'left', requires: ['nasopharynx'],
        text: '<b>鼻咽</b>位于鼻腔后方、颅底下方。侧壁的<b>咽隐窝</b>是鼻咽癌的好发部位，在横断位上要注意两侧是否对称。',
      },
      {
        title: '口咽与喉咽',
        select: 'oropharynx', requires: ['oropharynx', 'hypopharynx'],
        text: '<b>口咽</b>从软腭到会厌上缘，<b>喉咽</b>从会厌上缘到环状软骨下缘，向下续为食管。',
      },
      {
        title: '舌骨与喉软骨',
        select: 'hyoid', view: 'front', clip: 'none',
        text: '<b>舌骨</b>约平 C3，<b>甲状软骨</b>约平 C4–C5，<b>环状软骨</b>约平 C6，后者是喉与气管、咽与食管的分界。这些骨性标志可以帮助确定颈部横断层面的高度。<br><br>本步定位舌骨。本例甲状软骨的自动分割标注不完整，无法展示完整形态。',
      },
    ],
  },
  {
    id: 'head-neck-vessels',
    title: '颈部血管与唾液腺',
    en: 'Neck vessels & salivary glands',
    desc: '颈动脉鞘、腮腺与下颌下腺。',
    steps: [
      {
        title: '颈内动脉与颈内静脉',
        wl: '软组织', select: 'internal_carotid_artery_left', clip: 'none', view: 'front',
        only: ['internal_carotid_artery_left', 'internal_carotid_artery_right', 'internal_jugular_vein_left', 'internal_jugular_vein_right', 'skull', 'mandible', 'vertebrae_C1', 'vertebrae_C2', 'vertebrae_C3', 'vertebrae_C4', 'vertebrae_C5', 'hyoid'],
        requires: ['internal_carotid_artery_left', 'internal_jugular_vein_left'],
        text: '<b>颈动脉鞘</b>内：<b>颈内动脉</b>居内侧、<b>颈内静脉</b>居外侧，迷走神经位于两者后方。颈内动脉在颈部没有分支，经颅底颈动脉管入颅。',
      },
      {
        title: '颈内静脉',
        select: 'internal_jugular_vein_right',
        text: '<b>颈内静脉</b>通常右侧较粗，是中心静脉置管的常用入路——穿刺点位于胸锁乳突肌两头与锁骨构成的三角内。',
      },
      {
        title: '腮腺',
        select: 'parotid_gland_left', only: 'all', clip: 'axial', view: 'top', requires: ['parotid_gland_left'],
        text: '<b>腮腺</b>位于下颌支后方、外耳道前下方，含较多脂肪，CT 上密度低于肌肉。<b>面神经</b>在腺体内穿行，因此腮腺肿瘤手术需要保护面神经。',
      },
      {
        title: '下颌下腺',
        select: 'submandibular_gland_left', requires: ['submandibular_gland_left'],
        text: '<b>下颌下腺</b>位于下颌下三角，其导管（Wharton 管）是唾液腺结石最好发的部位。',
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
    const caseId = this.api.vol.meta.caseId;
    return TOURS.filter((t) => !t.cases || t.cases.includes(caseId)).map((t) => {
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
    this._token = (this._token || 0) + 1;   // 让仍在等待（如序列下载）的旧步骤失效
    this.tour = null;
    this.api.onExit();
  }

  renderList() {
    this.tour = null;
    this._token = (this._token || 0) + 1;   // 与退出导览相同：让仍在等待（如序列下载）的旧步骤失效
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
    this.i = -1;          // 尚未成功显示任何一步
    return this.show(0);
  }

  go(d) {
    const n = this.i + d;
    if (n < 0 || n >= this.tour.steps.length) return;
    return this.show(n);
  }

  // 显示第 n 步。需要切换 MRI 序列时先下载，成功后才应用本步设置并提交步骤索引；
  // 下载失败则停留在当前步骤，并在面板中给出原因和重试按钮。
  async show(n = this.i) {
    const { api } = this;
    const t = this.tour, s = t.steps[n];
    const token = (this._token = (this._token || 0) + 1); // 快速连点时只让最后一次生效
    if (s.seq && api.setSequence) {
      let ok;
      try {
        ok = await api.setSequence(s.seq, () => token === this._token && this.active);
      } catch (err) {
        if (token === this._token && this.active) this.showError(n, s.seq, err);
        return;
      }
      if (!ok || token !== this._token || !this.active) return;
    }
    this.i = n;
    // 3D 可见性：only / systems / 全部
    const CORTEX = ['frontal', 'parietal', 'temporal', 'occipital', 'insula', 'limbic'];
    if (s.only === 'all') api.setVisible(null);
    else if (s.only === 'cortex') api.setVisible(new Set(api.vol.meta.structures.filter((x) => CORTEX.includes(x.system) && !['hippocampus', 'amygdala'].some((k) => x.key.startsWith(k))).map((x) => x.key)));
    else if (s.only === 'ventricles') api.setVisible(new Set(api.vol.meta.structures.filter((x) => x.system === 'ventricles').map((x) => x.key)));
    else if (s.only) api.setVisible(new Set(s.only.filter((k) => api.vol.byKey.has(k))));
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
    if (s.overlay != null) api.setOverlay(s.overlay);
    if (s.clip) api.setClip(s.clip);
    if (s.view) api.setView(VIEW_DIRS[s.view]);

    const total = t.steps.length;
    const p = api.panel;
    p.innerHTML = `
      <div class="q-head"><h2>${esc(t.title)}</h2><button class="q-x" title="退出导览">✕</button></div>
      <div class="q-progress"><span>第 ${this.i + 1} / ${total} 步</span><span class="en">${esc(t.en)}</span></div>
      <div class="q-bar"><i style="width:${((this.i + 1) / total) * 100}%"></i></div>
      <h3 class="t-step">${esc(s.title)}</h3>
      <p class="t-text">${s.text}</p>
      ${s.probe ? this.probeHtml(s.probe) : ''}
      ${s.lesson ? `<button class="t-lesson" data-lesson="${s.lesson}">📖 读片手册：相关章节</button>` : ''}
      <p class="q-hint">可随时滚轮翻层、点击结构、旋转 3D 自由探索；点"下一步"继续路线。</p>
      <div class="q-acts">
        <button data-act="prev" ${this.i === 0 ? 'disabled' : ''}>← 上一步</button>
        ${this.i + 1 < total ? '<button class="q-primary" data-act="next">下一步 →</button>'
          : s.next && api.hasCase?.(s.next.case) ? `<button class="q-primary" data-act="nextcase">继续：${esc(s.next.label)} →</button>`
          : '<button class="q-primary" data-act="done">完成，返回列表</button>'}
      </div>`;
    p.querySelector('.q-x').onclick = () => this.exit();
    p.querySelector('[data-act=prev]').onclick = () => this.go(-1);
    p.querySelector('.t-lesson')?.addEventListener('click', () => api.openLesson?.(s.lesson));
    p.querySelector('[data-act=next]')?.addEventListener('click', () => this.go(1));
    p.querySelector('[data-act=nextcase]')?.addEventListener('click', () => api.runTour(s.next.case, s.next.tour));
    p.querySelector('[data-act=done]')?.addEventListener('click', () => { api.setVisible(null); api.setClip('none'); this.renderList(); });
  }

  showError(n, seq, err) {
    const p = this.api.panel;
    p.querySelector('.t-err')?.remove();
    const box = document.createElement('div');
    box.className = 't-err';
    box.innerHTML = `<b>${esc(seq)} 序列下载失败</b>，未能进入第 ${n + 1} 步。<br><small>${esc(err?.message || String(err))}</small>
      <div class="q-acts"><button class="q-primary" data-act="retry">重试</button>${this.i < 0 ? '<button data-act="list">返回列表</button>' : ''}</div>`;
    if (this.i < 0) p.innerHTML = `<div class="q-head"><h2>${esc(this.tour.title)}</h2><button class="q-x" title="退出导览">✕</button></div>`;
    p.querySelector('.q-head').after(box);
    p.querySelector('.q-x').onclick = () => this.exit();
    box.querySelector('[data-act=retry]').onclick = () => this.show(n);
    box.querySelector('[data-act=list]')?.addEventListener('click', () => this.renderList());
  }

  refreshProbe() {
    const s = this.active && this.tour?.steps[this.i];
    const el = this.api.panel.querySelector('.t-probe');
    if (s?.probe && el) el.outerHTML = this.probeHtml(s.probe);
  }

  startById(id) {
    const t = this.available().find((x) => x.id === id);
    if (t) this.start(t);
  }

  // 结构内体素值的中位数（等间隔抽样，最多约 2 万个点）
  measure(key) {
    const { vol } = this.api;
    const st = vol.byKey.get(key);
    if (!st) return null;
    const [[i0, i1], [j0, j1], [k0, k1]] = st.bboxVoxel;
    const n = (i1 - i0 + 1) * (j1 - j0 + 1) * (k1 - k0 + 1);
    const step = Math.max(1, Math.round(Math.cbrt(n / 60000)));
    const vals = [];
    for (let k = k0; k <= k1; k += step) for (let j = j0; j <= j1; j += step) for (let i = i0; i <= i1; i += step) {
      const x = vol.idx(i, j, k);
      if (vol.labels[x] === st.id) vals.push(vol.ct[x]);
    }
    if (!vals.length) return null;
    vals.sort((a, b) => a - b);
    return { st, v: vals[vals.length >> 1] };
  }

  probeHtml(keys) {
    const { vol, state } = this.api;
    const ct = vol.meta.modality !== 'MR';
    const rows = keys.map((k) => this.measure(k)).filter(Boolean);
    if (!rows.length) return '';
    const max = Math.max(...rows.map((r) => r.v));
    const w = (v) => (ct ? (Math.max(-1000, Math.min(1000, v)) + 1000) / 20 : (v / max) * 100);
    return `<div class="t-probe">
      <div class="t-probe-h">${ct ? '本病例实测 CT 值（结构内中位数）' : (vol.meta.sequences ? `本病例实测信号 · 当前序列 <b>${esc(state.seq)}</b>（相对值）` : '本病例实测信号（相对值）')}</div>
      ${rows.map(({ st, v }) => `<div class="t-row"><span class="dot" style="background:${st.color}"></span>
        <span class="t-name">${esc(st.zh)}</span><span class="t-val">${ct ? `${v} HU` : v}</span>
        <span class="t-bar"><i style="width:${w(v).toFixed(1)}%"></i></span></div>`).join('')}
      ${ct ? '<div class="t-scale"><span>−1000</span><span>0</span><span>+1000 HU</span></div>' : ''}
    </div>`;
  }

  onKey(e) {
    if (!this.active || !this.tour) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); this.go(1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); this.go(-1); }
  }
}

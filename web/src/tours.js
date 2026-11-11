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
        select: 'thyroid_cartilage', view: 'front', clip: 'none', requires: ['thyroid_cartilage', 'hyoid'],
        text: '<b>舌骨</b>约平 C3，<b>甲状软骨</b>约平 C4–C5，<b>环状软骨</b>约平 C6，后者是喉与气管、咽与食管的分界。这些骨性标志可以帮助确定颈部横断层面的高度。',
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
        only: ['internal_carotid_artery_left', 'internal_carotid_artery_right', 'internal_jugular_vein_left', 'internal_jugular_vein_right', 'skull', 'mandible', 'vertebrae_C1', 'vertebrae_C2', 'vertebrae_C3', 'vertebrae_C4', 'vertebrae_C5', 'hyoid', 'thyroid_cartilage'],
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
    return this.show();
  }

  go(d) {
    const n = this.i + d;
    if (n < 0 || n >= this.tour.steps.length) return;
    this.i = n;
    return this.show();
  }

  async show() {
    const { api } = this;
    const t = this.tour, s = t.steps[this.i];
    const token = (this._token = (this._token || 0) + 1); // 快速连点时只让最后一次生效
    // 3D 可见性：only / systems / 全部
    const CORTEX = ['frontal', 'parietal', 'temporal', 'occipital', 'insula', 'limbic'];
    if (s.only === 'all') api.setVisible(null);
    else if (s.only === 'cortex') api.setVisible(new Set(api.vol.meta.structures.filter((x) => CORTEX.includes(x.system) && !['hippocampus', 'amygdala'].some((k) => x.key.startsWith(k))).map((x) => x.key)));
    else if (s.only === 'ventricles') api.setVisible(new Set(api.vol.meta.structures.filter((x) => x.system === 'ventricles').map((x) => x.key)));
    else if (s.only) api.setVisible(new Set(s.only.filter((k) => api.vol.byKey.has(k))));
    else if (s.systems) api.setVisible(new Set(api.vol.meta.structures.filter((x) => s.systems.includes(x.system)).map((x) => x.key)));
    else if (this.i === 0) api.setVisible(null);
    if (s.seq) await api.setSequence?.(s.seq);
    if (token !== this._token) return;
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

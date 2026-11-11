// 读片手册：CT / MRI 读片基础知识。每章可附"在图像上演示"按钮，跳转到对应病例的导览路线。
// demo: { case: 病例 id, tour: 导览 id, label }

export const LESSONS = [
  {
    id: 'compare', group: '总览', title: 'CT 与 MRI 有什么不同',
    html: `
<p>CT 和 MRI 都是<b>断层成像</b>：把身体切成一层层薄片来看，但成像原理完全不同。</p>
<table>
<tr><th></th><th>CT（计算机断层扫描）</th><th>MRI（磁共振成像）</th></tr>
<tr><td>原理</td><td>X 线穿过人体后的<b>衰减</b>程度</td><td>强磁场中<b>氢质子</b>受射频激发后的弛豫信号</td></tr>
<tr><td>数值</td><td><b>CT 值（HU）</b>，绝对刻度，可跨设备比较</td><td>信号强度，<b>相对值</b>，只能在同一幅图内比较</td></tr>
<tr><td>描述用语</td><td>高 / 等 / 低<b>密度</b></td><td>高 / 等 / 低<b>信号</b></td></tr>
<tr><td>擅长</td><td>骨骼、肺、钙化、急性出血、急诊外伤；扫描快（数秒）</td><td>脑、脊髓、软组织、肝胆胰、盆腔、关节；软组织对比好</td></tr>
<tr><td>辐射</td><td>有电离辐射</td><td>无电离辐射</td></tr>
<tr><td>主要限制</td><td>辐射剂量；碘造影剂过敏、肾功能不全</td><td>扫描时间长（数十分钟）、噪声大；非兼容起搏器、体内金属异物、幽闭恐惧</td></tr>
<tr><td>多种"对比"</td><td>主要靠<b>窗宽窗位</b>和<b>增强期相</b></td><td>靠不同<b>序列</b>（T1、T2、FLAIR、DWI……）</td></tr>
</table>
<p class="tip">一句话：CT 看"密度"，一种扫描配多个窗；MRI 看"信号"，一个部位扫多个序列。</p>`,
    demos: [{ case: 's0344', tour: 'ct-basics', label: 'CT 读片入门' }, { case: 'brain_mni152', tour: 'mri-sequences', label: 'MRI 序列对比' }],
  },
  {
    id: 'orient', group: '总览', title: '方位约定与三个断面',
    html: `
<p>放射科统一采用<b>"放射学约定"</b>显示图像，初学者最容易在这里搞反左右。</p>
<ul>
<li><b>横断位（Axial）</b>：想象自己站在患者<b>足侧</b>向头侧看。所以<b>屏幕左侧 = 患者右侧</b>，屏幕上方 = 前方（腹侧）。正常情况下肝在屏幕左边、脾在右边。</li>
<li><b>冠状位（Coronal）</b>：面对面看患者，屏幕左 = 患者右，上 = 头侧。</li>
<li><b>矢状位（Sagittal）</b>：从侧面看，屏幕上方 = 头侧。</li>
</ul>
<p>本平台在每幅切片四周用橙色字母标注方向：<b>R</b> 右、<b>L</b> 左、<b>A</b> 前、<b>P</b> 后、<b>S</b> 上、<b>I</b> 下。</p>
<p><b>多平面重建（MPR）</b>：现代 CT 和三维 MRI 一次采集的是整块三维数据，冠状位和矢状位都由同一块数据"切"出来，因此三个断面可以联动定位，也能生成 3D 模型。</p>
<p class="tip">练习：在横断位上点一个结构，观察它在冠状位、矢状位和 3D 中分别在哪里——这就是"断层 ↔ 立体"的空间转换。</p>`,
    demos: [{ case: 's0344', tour: 'ct-basics', label: 'CT 读片入门' }, { case: 's0344', tour: 'abdomen-axial', label: '腹部横断面巡礼' }],
  },
  {
    id: 'hu', group: 'CT', title: 'CT 值（HU）',
    html: `
<p>CT 值以水和空气为基准定义：<b>水 = 0 HU，空气 = −1000 HU</b>。组织对 X 线衰减越强，CT 值越高，图像上越白。</p>
<table class="hu">
<tr><th>组织</th><th>典型 CT 值（HU）</th></tr>
<tr><td>空气</td><td>−1000</td></tr>
<tr><td>肺组织</td><td>−900 ~ −700</td></tr>
<tr><td>脂肪</td><td>−120 ~ −50</td></tr>
<tr><td>水、脑脊液、尿液、胆汁</td><td>0 ~ 20</td></tr>
<tr><td>白质 / 灰质</td><td>25 ~ 30 / 35 ~ 40</td></tr>
<tr><td>肌肉、血液（平扫）</td><td>40 ~ 50</td></tr>
<tr><td>肝（平扫）</td><td>50 ~ 65</td></tr>
<tr><td>急性出血、血凝块</td><td>60 ~ 80</td></tr>
<tr><td>增强后血管（动脉期）</td><td>200 ~ 400</td></tr>
<tr><td>松质骨 / 皮质骨</td><td>200 ~ 400 / &gt; 1000</td></tr>
<tr><td>金属</td><td>&gt; 2000（常伴放射状伪影）</td></tr>
</table>
<h4>平扫还是增强？</h4>
<p>读片第一步就是确认是否使用了碘造影剂。看主动脉：平扫时约 40 ~ 50 HU，与肌肉相近；增强后明显升高。</p>
<ul>
<li><b>动脉期</b>（注药后约 25 ~ 35 秒）：主动脉极亮，门静脉尚未充分强化，肝实质强化弱；富血供肿瘤（如肝细胞癌）此期最亮。</li>
<li><b>门静脉期</b>（约 60 ~ 70 秒）：主动脉与门静脉密度接近，肝实质均匀强化，是腹部常规观察期相。</li>
<li><b>延迟期</b>（3 ~ 5 分钟以后）：造影剂进入肾盂、输尿管和膀胱。</li>
</ul>
<p class="tip">在本平台任意切片上移动鼠标，提示框会显示该点的 CT 值。试着测一下皮下脂肪、胆囊和骨皮质。</p>`,
    demos: [{ case: 's0344', tour: 'ct-basics', label: 'CT 读片入门（实测 CT 值）' }],
  },
  {
    id: 'window', group: 'CT', title: '窗宽与窗位',
    html: `
<p>CT 值跨越约 4000 HU，而显示器和人眼只能分辨几十级灰度。<b>窗</b>决定把哪一段 CT 值映射成从黑到白的灰阶：</p>
<ul>
<li><b>窗位 L（Level / Center）</b>：显示范围的中心。</li>
<li><b>窗宽 W（Width）</b>：显示范围的大小。低于 L − W/2 显示纯黑，高于 L + W/2 显示纯白。</li>
<li>窗越<b>窄</b>，对比越强，适合分辨密度接近的组织（如脑灰白质）；窗越<b>宽</b>，层次越多，适合密度差异大的部位（如肺、骨）。</li>
</ul>
<div class="wl-demo">
  <canvas width="640" height="80"></canvas>
  <div class="wl-sw"></div>
  <div class="wl-ctl">
    <label>窗宽 W <input type="range" data-k="w" min="20" max="3000" value="400" /><b data-o="w">400</b></label>
    <label>窗位 L <input type="range" data-k="l" min="-1000" max="1500" value="40" /><b data-o="l">40</b></label>
  </div>
  <div class="wl-presets"></div>
  <p class="wl-cap"></p>
</div>
<table>
<tr><th>常用窗</th><th>W / L</th><th>用途</th></tr>
<tr><td>脑窗</td><td>80 / 40</td><td>脑实质、急性出血</td></tr>
<tr><td>硬膜下窗</td><td>200 / 75</td><td>紧贴颅骨的薄层血肿</td></tr>
<tr><td>软组织（纵隔/腹部）窗</td><td>350 ~ 400 / 40 ~ 50</td><td>实质脏器、血管、淋巴结</td></tr>
<tr><td>肝窗</td><td>150 ~ 160 / 60</td><td>肝内密度差异小的病灶</td></tr>
<tr><td>肺窗</td><td>1500 / −600</td><td>肺实质、支气管、小结节</td></tr>
<tr><td>骨窗</td><td>1800 ~ 2800 / 400 ~ 600</td><td>骨折、骨质破坏</td></tr>
</table>
<p class="tip">在本平台的切片上<b>按住右键拖动</b>可连续调节窗宽窗位：左右拖动改变窗宽，上下拖动改变窗位。</p>`,
    demos: [{ case: 's0344', tour: 'ct-basics', label: '胸腹 CT：软组织/肺/骨窗' }, { case: 'head_s1194', tour: 'head-ct-windows', label: '颅脑 CT：脑窗/骨窗/硬膜下窗' }],
  },
  {
    id: 'system', group: 'CT', title: '系统化读片顺序',
    html: `
<p>漏诊最常见的原因是<b>"满足于第一个发现"</b>。固定顺序读片，每次都把该看的看完。</p>
<h4>通用步骤</h4>
<ol>
<li>核对：患者信息、检查日期、部位、<b>平扫/增强及期相</b>、层厚。</li>
<li>先看定位像，对全貌有大致印象。</li>
<li>按系统逐层浏览，<b>左右对比</b>。</li>
<li>换窗再读一遍（软组织窗、肺窗、骨窗）。</li>
<li>多平面重建确认可疑发现。</li>
<li>与旧片比较。</li>
</ol>
<h4>胸部 CT</h4>
<p><b>肺窗</b>：肺实质（结节、实变、磨玻璃影）→ 气道 → 胸膜与叶间裂。<b>纵隔窗</b>：心包、心脏、大血管 → 气管、食管 → 淋巴结（肺门、纵隔）→ 胸壁、腋窝 → 上腹部。<b>骨窗</b>：肋骨、胸椎、胸骨、肩胛骨。</p>
<h4>腹部 CT</h4>
<p>实质脏器（肝 → 胆 → 胰 → 脾 → 肾、肾上腺）→ 空腔脏器（胃、十二指肠、小肠、结肠、阑尾）→ 血管与淋巴结 → 腹膜、肠系膜、腹水、游离气体 → 盆腔 → 腹壁 → 骨窗看骨骼 → 肺窗看肺底。</p>
<h4>颅脑 CT（口诀：Blood Can Be Very Bad）</h4>
<ul>
<li><b>B</b>lood 出血：硬膜外、硬膜下、蛛网膜下腔、脑实质、脑室内</li>
<li><b>C</b>isterns 脑池：鞍上池、环池、四叠体池是否受压消失</li>
<li><b>B</b>rain 脑实质：灰白质分界、低密度灶、中线移位</li>
<li><b>V</b>entricles 脑室：大小、对称性、积水</li>
<li><b>B</b>one 骨：骨窗看颅骨骨折、鼻窦和乳突积液</li>
</ul>`,
    demos: [{ case: 's0344', tour: 'abdomen-axial', label: '腹部横断面巡礼' }, { case: 's0344', tour: 'mediastinum', label: '纵隔与大血管' }, { case: 'head_s1194', tour: 'head-ct-windows', label: '颅脑 CT 窗位' }],
  },
  {
    id: 'mri-basic', group: 'MRI', title: 'MRI 原理：T1 与 T2',
    html: `
<p>人体中大量的氢质子（主要来自水和脂肪）在强磁场中会沿磁场方向排列。射频脉冲把它们"推倒"后，质子会逐渐恢复，同时发出信号。不同组织恢复的快慢不同，这就是 MRI 对比的来源。</p>
<ul>
<li><b>T1 弛豫（纵向恢复）</b>：<b>恢复越快越亮</b>。脂肪恢复快 → T1 上亮；水恢复慢 → T1 上暗。</li>
<li><b>T2 弛豫（横向衰减）</b>：<b>衰减越慢越亮</b>。水衰减慢 → T2 上亮。</li>
</ul>
<p>通过调节两个时间参数，就能决定图像主要反映哪种特性：</p>
<table>
<tr><th>序列</th><th>TR（重复时间）</th><th>TE（回波时间）</th><th>记忆</th></tr>
<tr><td><b>T1WI</b></td><td>短（&lt; 800 ms）</td><td>短（&lt; 30 ms）</td><td>"解剖像"，水黑、脂肪亮</td></tr>
<tr><td><b>T2WI</b></td><td>长（&gt; 2000 ms）</td><td>长（&gt; 80 ms）</td><td>"病变像"，水白</td></tr>
<tr><td><b>PD</b></td><td>长</td><td>短</td><td>反映质子数量，关节常用</td></tr>
</table>
<p>大脑中白质含髓鞘（脂质多、水少），灰质含水更多，所以：<b>T1 上白质比灰质亮，T2 上灰质比白质亮</b>。</p>
<p class="tip">一句话：<b>T1 看结构，T2 找病变</b>。绝大多数病变含水增多，在 T2 上变亮、在 T1 上变暗。</p>`,
    demos: [{ case: 'brain_mni152', tour: 'mri-sequences', label: '同一大脑的 T1 / T2 / PD' }],
  },
  {
    id: 'mri-table', group: 'MRI', title: '序列信号对照与辨认口诀',
    html: `
<p>拿到一张 MRI，先判断它是什么序列，否则无法解读"亮"和"暗"的意义。</p>
<div class="tbl-wrap"><table class="sig">
<tr><th>组织</th><th>T1WI</th><th>T2WI</th><th>FLAIR</th><th>DWI</th><th>T1 增强</th></tr>
<tr><td>水 / 脑脊液</td><td class="lo">低</td><td class="hi">高</td><td class="lo">低（被抑制）</td><td class="lo">低</td><td class="lo">低</td></tr>
<tr><td>脂肪</td><td class="hi">高</td><td class="hi">高（快速自旋回波）</td><td class="hi">高</td><td class="lo">低</td><td class="hi">高</td></tr>
<tr><td>脑白质</td><td class="hi">高于灰质</td><td class="lo">低于灰质</td><td class="lo">低于灰质</td><td class="mid">等</td><td class="mid">不强化</td></tr>
<tr><td>皮质骨、钙化、空气</td><td class="lo">低</td><td class="lo">低</td><td class="lo">低</td><td class="lo">低</td><td class="lo">低</td></tr>
<tr><td>快速流动的血液</td><td class="lo">流空（黑）</td><td class="lo">流空（黑）</td><td class="lo">流空</td><td class="lo">低</td><td class="hi">高（梯度回波）</td></tr>
<tr><td>水肿 / 大多数病变</td><td class="lo">低</td><td class="hi">高</td><td class="hi">高</td><td class="mid">视病变</td><td class="mid">视病变</td></tr>
<tr><td>急性脑梗死</td><td class="mid">等/稍低</td><td class="mid">数小时后高</td><td class="mid">数小时后高</td><td class="hi">高（ADC 低）</td><td class="mid">早期不强化</td></tr>
<tr><td>钆造影剂聚集处</td><td>—</td><td>—</td><td>—</td><td>—</td><td class="hi">高</td></tr>
</table></div>
<h4>辨认口诀</h4>
<ol>
<li><b>先看水</b>（脑脊液、眼球玻璃体、膀胱尿液、胆囊胆汁）：水黑 → T1 或 FLAIR；水白 → T2。</li>
<li><b>再看灰白质</b>：白质亮于灰质 → T1；灰质亮于白质 → T2 / PD / FLAIR。</li>
<li><b>水黑、但灰质亮于白质</b> → FLAIR。</li>
<li><b>脂肪变暗</b> → 加了脂肪抑制（FS、STIR）。</li>
<li><b>血管很亮、黏膜和病灶有强化</b> → T1 增强；对比同层平扫 T1 才能确认"强化"。</li>
<li>看不出时，查看图像角落的序列名称和 TR / TE。</li>
</ol>`,
    demos: [{ case: 'brain_mni152', tour: 'mri-sequences', label: '脑 MRI：T1 / T2 / PD' }, { case: 'mr_s0646', tour: 'mri-abdomen', label: '腹部 MRI：推断序列' }],
  },
  {
    id: 'mri-more', group: 'MRI', title: '其他常用序列',
    html: `
<p class="tip">本平台目前只有 T1、T2、PD 和一例腹部增强 T1 的图像，下面这些序列暂无示例，仅作原理介绍。</p>
<dl>
<dt>FLAIR（液体衰减反转恢复）</dt>
<dd>在 T2 基础上把自由水（脑脊液）的信号压掉。脑室旁、皮层边缘的病变不再被明亮的脑脊液"淹没"，是<b>多发性硬化、脑白质病变、蛛网膜下腔出血</b>的重要序列。</dd>
<dt>DWI / ADC（弥散加权成像 / 表观弥散系数）</dt>
<dd>反映水分子的布朗运动。水分子运动受限时 DWI 高信号、ADC 低信号。<b>急性脑梗死</b>发病数分钟至数小时即可在 DWI 上显示，远早于 CT 和 T2。脓肿、细胞密集的肿瘤（如淋巴瘤）也弥散受限。注意 DWI 亮而 ADC 不低时可能是"T2 透过效应"，不是真正的弥散受限。</dd>
<dt>T1 增强（钆造影剂）</dt>
<dd>钆缩短 T1，使富血供或血脑屏障破坏的组织变亮。用于肿瘤、炎症、转移瘤的检出与鉴别。肝脏常做动态多期增强（动脉期、门静脉期、延迟期），思路与 CT 增强期相相同。</dd>
<dt>脂肪抑制（FS、STIR、Dixon）</dt>
<dd>把脂肪信号压暗，让脂肪背景中的水肿、积液和强化更突出，常用于<b>骨髓水肿、关节、眼眶、乳腺</b>。Dixon 法还能同时得到水像、脂像和同/反相位图，用于评估脂肪肝。</dd>
<dt>GRE T2* / SWI（磁敏感加权成像）</dt>
<dd>对含铁血黄素、脱氧血红蛋白、钙化极其敏感，表现为低信号且范围被"放大"（开花效应），用于发现<b>脑微出血、海绵状血管瘤、静脉畸形</b>。</dd>
<dt>MRA / MRV</dt>
<dd>利用血流效应（如 TOF）不打药即可显示动脉或静脉，常用于颅内动脉瘤、血管狭窄的筛查。</dd>
<dt>MRCP（磁共振胰胆管成像）</dt>
<dd>重 T2 加权的"水成像"：只有静止的液体（胆汁、胰液）是亮的，无创显示胆管和胰管的形态、结石和狭窄。</dd>
</dl>`,
    demos: [],
  },
  {
    id: 'bleed', group: 'MRI', title: '出血在 CT 与 MRI 上的演变',
    html: `
<p>出血是 CT 与 MRI 对比的经典例子：CT 上的表现比较简单，MRI 上则随血红蛋白的氧化状态而变化。</p>
<div class="tbl-wrap"><table class="sig">
<tr><th>时期</th><th>主要成分</th><th>CT</th><th>T1WI</th><th>T2WI</th></tr>
<tr><td>超急性期（&lt; 24 h）</td><td>氧合血红蛋白</td><td class="hi">高密度</td><td class="mid">等</td><td class="hi">高</td></tr>
<tr><td>急性期（1 ~ 3 天）</td><td>脱氧血红蛋白</td><td class="hi">高密度</td><td class="mid">等 / 稍低</td><td class="lo">低</td></tr>
<tr><td>亚急性早期（3 ~ 7 天）</td><td>细胞内正铁血红蛋白</td><td class="mid">密度逐渐减低</td><td class="hi">高</td><td class="lo">低</td></tr>
<tr><td>亚急性晚期（1 ~ 2 周）</td><td>细胞外正铁血红蛋白</td><td class="mid">等密度</td><td class="hi">高</td><td class="hi">高</td></tr>
<tr><td>慢性期（数周以后）</td><td>含铁血黄素</td><td class="lo">低密度</td><td class="lo">低（周边环）</td><td class="lo">低（周边环）</td></tr>
</table></div>
<p class="tip">临床上怀疑急性颅内出血时首选 CT：快、对急性出血敏感。MRI 的 SWI / GRE 对慢性微出血和含铁血黄素更敏感。</p>`,
    demos: [{ case: 'head_s1194', tour: 'head-ct-windows', label: '颅脑 CT 窗位' }],
  },
];

const PRESETS = [
  { zh: '脑窗', w: 80, l: 40 }, { zh: '软组织', w: 400, l: 40 }, { zh: '肝窗', w: 160, l: 60 },
  { zh: '肺窗', w: 1500, l: -600 }, { zh: '骨窗', w: 2000, l: 500 },
];
const TISSUES = [
  ['空气', -1000], ['肺', -800], ['脂肪', -90], ['水', 0], ['白质', 27], ['灰质', 38],
  ['肌肉', 45], ['肝', 60], ['血肿', 70], ['松质骨', 300], ['皮质骨', 1200],
];

// 交互式窗宽窗位示意：横轴为 CT 值，上方灰阶条显示该窗下每个 CT 值呈现的灰度
function mountWlDemo(root) {
  const box = root.querySelector('.wl-demo');
  if (!box) return;
  const cv = box.querySelector('canvas');
  const g = cv.getContext('2d');
  const st = { w: 400, l: 40 };
  const H0 = -1100, H1 = 1500;
  const X = (h) => ((h - H0) / (H1 - H0)) * cv.width;
  const gray = (h) => Math.max(0, Math.min(255, ((h - (st.l - st.w / 2)) / st.w) * 255));
  function draw() {
    g.clearRect(0, 0, cv.width, cv.height);
    for (let x = 0; x < cv.width; x++) {
      const v = gray(H0 + (x / cv.width) * (H1 - H0));
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.fillRect(x, 0, 1, 28);
    }
    // 窗范围
    g.strokeStyle = '#4fc3f7'; g.lineWidth = 2;
    const a = X(st.l - st.w / 2), b = X(st.l + st.w / 2);
    g.strokeRect(Math.max(1, a), 1, Math.min(cv.width - 2, b) - Math.max(1, a), 26);
    // 轴上只标注间隔足够远的几个刻度；全部组织的灰度见下方色块
    g.font = '12px system-ui, sans-serif'; g.textAlign = 'center';
    for (const h of [-1000, -500, 0, 500, 1000, 1500]) {
      const x = Math.min(cv.width - 14, Math.max(14, X(h)));
      g.fillStyle = '#8899aa'; g.fillRect(X(h), 28, 1, 8);
      g.fillText(String(h), x, 50);
    }
    g.fillStyle = '#4fc3f7'; g.fillText('CT 值（HU）', cv.width / 2, 72);
    box.querySelector('.wl-sw').innerHTML = TISSUES.map(([n, h]) => {
      const v = Math.round(gray(h));
      return `<span><i style="background:rgb(${v},${v},${v})"></i>${n}<small>${h}</small></span>`;
    }).join('');
    box.querySelector('[data-o=w]').textContent = st.w;
    box.querySelector('[data-o=l]').textContent = st.l;
    const lo = Math.round(st.l - st.w / 2), hi = Math.round(st.l + st.w / 2);
    const vis = TISSUES.filter(([, h]) => h > lo && h < hi).map(([n]) => n);
    box.querySelector('.wl-cap').innerHTML = `显示范围 <b>${lo} ~ ${hi} HU</b>：低于 ${lo} 全黑，高于 ${hi} 全白。` +
      (vis.length ? `能区分灰度的组织：${vis.join('、')}。` : '');
  }
  box.querySelectorAll('input').forEach((inp) => inp.addEventListener('input', () => { st[inp.dataset.k] = +inp.value; draw(); }));
  const pr = box.querySelector('.wl-presets');
  pr.innerHTML = PRESETS.map((p, i) => `<button data-i="${i}">${p.zh}</button>`).join('');
  pr.querySelectorAll('button').forEach((b) => b.onclick = () => {
    const p = PRESETS[+b.dataset.i];
    st.w = p.w; st.l = p.l;
    box.querySelector('[data-k=w]').value = p.w; box.querySelector('[data-k=l]').value = p.l;
    draw();
  });
  draw();
}

// api: { currentCase, hasCase(id), runTour(caseId, tourId) }
export class Handbook {
  constructor(api) {
    this.api = api;
    this.el = document.createElement('div');
    this.el.className = 'hb';
    this.el.hidden = true;
    const groups = [...new Set(LESSONS.map((l) => l.group))];
    this.el.innerHTML = `
      <div class="hb-box" role="dialog" aria-label="读片入门">
        <nav class="hb-nav">
          <h2>读片入门 <small>Reading basics</small></h2>
          ${groups.map((g) => `<div class="hb-g">${g}</div>${LESSONS.filter((l) => l.group === g)
            .map((l) => `<button data-id="${l.id}">${l.title}</button>`).join('')}`).join('')}
        </nav>
        <article class="hb-body"></article>
        <button class="hb-x" title="关闭（Esc）">✕</button>
      </div>`;
    document.body.appendChild(this.el);
    this.el.addEventListener('click', (e) => { if (e.target === this.el) this.close(); });
    this.el.querySelector('.hb-x').onclick = () => this.close();
    this.el.querySelectorAll('.hb-nav button').forEach((b) => b.onclick = () => this.show(b.dataset.id));
    window.addEventListener('keydown', (e) => { if (!this.el.hidden && e.key === 'Escape') { e.stopImmediatePropagation(); this.close(); } }, true);
  }

  open(id) {
    this.el.hidden = false;
    this.show(id || this.cur || LESSONS[0].id);
  }

  close() { this.el.hidden = true; }

  show(id) {
    const l = LESSONS.find((x) => x.id === id) || LESSONS[0];
    this.cur = l.id;
    this.el.querySelectorAll('.hb-nav button').forEach((b) => b.classList.toggle('on', b.dataset.id === l.id));
    const demos = l.demos.filter((d) => this.api.hasCase(d.case));
    const i = LESSONS.indexOf(l);
    const body = this.el.querySelector('.hb-body');
    body.innerHTML = `<h3>${l.title}</h3>${l.html}
      ${demos.length ? `<div class="hb-demo"><span>在图像上演示：</span>${demos.map((d, k) =>
        `<button data-k="${k}">▶ ${d.label}${d.case === this.api.currentCase ? '' : ' <small>（切换病例）</small>'}</button>`).join('')}</div>` : ''}
      <div class="hb-pager">
        ${i > 0 ? `<button data-go="${LESSONS[i - 1].id}">← ${LESSONS[i - 1].title}</button>` : '<span></span>'}
        ${i + 1 < LESSONS.length ? `<button data-go="${LESSONS[i + 1].id}">${LESSONS[i + 1].title} →</button>` : ''}
      </div>`;
    body.scrollTop = 0;
    body.querySelectorAll('.hb-demo button').forEach((b) => b.onclick = () => {
      const d = demos[+b.dataset.k];
      this.close();
      this.api.runTour(d.case, d.tour);
    });
    body.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => this.show(b.dataset.go));
    mountWlDemo(body);
  }
}

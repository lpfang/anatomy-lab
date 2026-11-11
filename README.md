# 断层解剖 · 3D 对照（Sectional Anatomy Lab）

在线体验：https://lpfang.github.io/anatomy-lab/

面向中文用户的教学工具：CT 断层图像与 3D 人体模型**逐体素对应**、双向联动，器官名称中英对照。

3D 模型直接由同一例 CT 的分割结果重建（TotalSegmentator 标注），所以断层上的任意一点都能精确对应到 3D 结构，不需要配准。

## 功能（MVP）

- 横断 / 冠状 / 矢状三视图（放射学惯例）、窗宽窗位预设（软组织 / 肝脏 / 肺窗 / 骨窗）、右键拖动调窗
- 3D 模型：107 个结构，按系统分组显隐、搜索（中文 / 英文）
- **2D → 3D**：点击断层上的结构，3D 高亮、其余半透明、显示中英文名称与说明
- **3D → 2D**：点击 3D 结构，三视图跳到该点并描出轮廓
- 3D 中同步显示当前切面（贴实时 CT 图像），支持按横断 / 冠状 / 矢状剖切
- 悬停显示结构名称和 CT 值（HU）
- **测验模式**（顶栏按钮）：三种题型可混合——看名称找结构、看 3D 找断层、看断层认结构（四选一，干扰项取空间相邻结构）；
  可按系统选范围、5/10/20 题；作答时隐藏标签叠加、十字线、悬停名称和结构列表；点击有约 3 mm 容差；
  结束后给出成绩和错题回顾，可"只练错题"。快捷键：1–4 选择，Enter 下一题
- **多病例 / MRI**：顶栏下拉切换病例（`web/public/cases/index.json`），含 3 例 CT 和 1 例腹部增强 MRI（T1）。
  MRI 信号按 99.5 百分位归一化，窗位预设由预处理按信号分布自动生成
- **头颅**：
  - 脑 MRI（MNI152 标准脑模板 + CerebrA 图谱）：99 个结构——皮质脑回（按额/顶/颞/枕/岛叶/边缘系统分组）、
    基底核、丘脑、海马、杏仁体、脑室、脑干、小脑、白质、眼球；**T1 / T2 序列可切换**
  - 头颈部 CT：脑、颅骨、颈椎之外，用 TotalSegmentator 开源头颈子任务补充眼球、晶状体、视神经、眼外肌、
    鼻窦、咽喉、喉软骨、颈内动静脉、腮腺、颈部肌肉等；脑窗 / 骨窗 / 硬膜下窗
  - 头颅导览：读懂 T1 与 T2、脑叶与功能区、基底核与内囊、脑室系统、边缘系统、CT 窗位、眼眶、鼻窦与咽喉、颈部血管
- **导览模式**（顶栏按钮）：5 条预设路线——腹部横断面巡礼、腹膜后器官、纵隔与大血管、肺叶、椎体计数。
  每步自动定位层面、选中结构、切换窗位、剖切并转动 3D；路线只引用结构名，缺少结构的步骤自动跳过，
  所以同一路线可用于不同病例和模态。路线内容在 `web/src/tours.js`，可直接增改。快捷键：← →

## 目录

```
pipeline/            Python 预处理
  fetch_case.py      从 Zenodo 按需下载单个病例（不下载整个 3.2GB 压缩包）
  build_case.py      CT + 标注 → 体数据 / 标签 / glb 网格 / meta.json
  anatomy_names.py   结构中英文名、系统分组、教学说明 ← 修改名称和说明请改这里
web/                 前端（Vite + three.js，切片渲染为自写 Canvas）
  public/cases/<id>/ 预处理输出（随仓库发布，供 GitHub Pages 直接使用；可用 pipeline 重新生成）
```

## 运行

```bash
uv venv .venv && uv pip install --python .venv/bin/python remotezip nibabel numpy scikit-image trimesh scipy fast-simplification pandas
.venv/bin/python pipeline/fetch_case.py s0344                       # CT
.venv/bin/python pipeline/build_case.py data/raw/s0344 s0344
.venv/bin/python pipeline/fetch_case.py --mri s0646                 # MRI
.venv/bin/python pipeline/build_case.py data/raw/mri/Totalsegmentator_dataset_v300/s0646 mr_s0646
.venv/bin/python pipeline/prepare_brain.py                          # 脑 MRI（先按脚本说明下载模板与图谱）
.venv/bin/python pipeline/build_case.py data/raw/brain/mni152 brain_mni152
.venv/bin/python pipeline/prepare_headct.py fetch s1194             # 头颈 CT
.venv/bin/python pipeline/prepare_headct.py segment s1194           # 需 pip install TotalSegmentator
.venv/bin/python pipeline/prepare_headct.py merge s1194
.venv/bin/python pipeline/build_case.py data/raw/headct/s1194 head_s1194
cd web && npm install && npm run dev      # http://localhost:5178
```

切换病例：`?case=<id>`。

## 发布

推送到 `main` 后，GitHub Actions（`.github/workflows/pages.yml`）会自动构建 `web/` 并发布到 GitHub Pages。
首次使用需在仓库 Settings → Pages 中把 Source 设为 **GitHub Actions**。

## 数据与许可

TotalSegmentator dataset v2.0.1（Wasserthal et al., *Radiology: Artificial Intelligence* 2023），CC BY 4.0；
TotalSegmentator MRI dataset v3.0.0（Zenodo 22688334），CC BY 4.0；
MNI ICBM152 2009c 对称模板 © 1993–2004 Louis Collins, McConnell Brain Imaging Centre, MNI, McGill University；
CerebrA 图谱（Manera et al., *Scientific Data* 2020），CC0；
头颈 CT 的细节结构由 TotalSegmentator 开源子任务（Apache-2.0）自动分割，未经人工逐层校对。仅供教学，不用于诊断。

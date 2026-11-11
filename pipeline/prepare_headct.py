"""头颈部 CT：TotalSegmentator 数据集里的头部 CT 只标注了脑、颅骨、颈椎和脊髓，
这里再用 TotalSegmentator 的免费（Apache-2.0）头颈子任务补充细节结构，合并成一个病例目录。

步骤:
  1) 下载病例（来自完整 CT 数据集 v2.0.1，经 HTTP Range 只取所需文件）:
       .venv/bin/python pipeline/prepare_headct.py fetch s1194
  2) 运行头颈子任务（CPU 上每个任务约 1–3 分钟，首次需下载权重）:
       .venv/bin/python pipeline/prepare_headct.py segment s1194
  3) 合并并生成网页数据:
       .venv/bin/python pipeline/prepare_headct.py merge s1194
       .venv/bin/python pipeline/build_case.py data/raw/headct/s1194 head_s1194
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

import nibabel as nib
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
FULL = ROOT / "data" / "raw" / "ctfull"
OUT = ROOT / "data" / "raw" / "headct"
URL = "https://zenodo.org/api/records/10047292/files/Totalsegmentator_dataset_v201.zip/content"
TASKS = ["head_glands_cavities", "craniofacial_structures", "headneck_bones_vessels",
         "oculomotor_muscles", "headneck_muscles"]
# 与数据集原有标注或其他任务重复 / 无教学意义的类别
SKIP = {"head", "skull@craniofacial_structures", "skull@oculomotor_muscles",
        "eyeball_left", "eyeball_right", "optic_nerve_left@oculomotor_muscles", "optic_nerve_right@oculomotor_muscles"}


def fetch(case):
    from remotezip import RemoteZip
    with RemoteZip(URL) as z:
        z.extract("meta.csv", FULL)
        for i in z.infolist():
            if i.filename.startswith(f"{case}/") and i.filename.endswith(".gz"):
                z.extract(i, FULL)
    print("→", FULL / case)


def segment(case):
    exe = Path(sys.executable).parent / "TotalSegmentator"
    for t in TASKS:
        dst = FULL / f"seg_{case}" / t
        if dst.exists() and any(dst.glob("*.nii.gz")):
            print("已存在，跳过", t)
            continue
        subprocess.run([str(exe), "-i", str(FULL / case / "ct.nii.gz"), "-o", str(dst), "-ta", t, "-d", "cpu"], check=True)


def merge(case):
    src = FULL / case
    dst = OUT / case
    seg = dst / "segmentations"
    if dst.exists():
        shutil.rmtree(dst)
    seg.mkdir(parents=True)
    shutil.copy(src / "ct.nii.gz", dst / "ct.nii.gz")
    n = 0
    for f in sorted((src / "segmentations").glob("*.nii.gz")):
        if np.asarray(nib.load(f).dataobj).any():
            shutil.copy(f, seg / f.name); n += 1
    for t in TASKS:
        if not (FULL / f"seg_{case}" / t).exists():
            print("未运行，跳过", t)
            continue
        for f in sorted((FULL / f"seg_{case}" / t).glob("*.nii.gz")):
            key = f.name[:-7]
            if key in SKIP or f"{key}@{t}" in SKIP or (seg / f.name).exists():
                continue
            if np.asarray(nib.load(f).dataobj).any():
                shutil.copy(f, seg / f.name); n += 1
    import pandas as pd
    r = pd.read_csv(FULL / "meta.csv", sep=";").set_index("image_id").loc[case]
    sex = {"m": "男", "f": "女"}.get(r.gender, "")
    (dst / "info.json").write_text(json.dumps({
        "desc": f"{sex} {int(r.age)} 岁 · 头颈部 CT",
        "source": "TotalSegmentator dataset v2.0.1（CC BY 4.0）；细节结构由 TotalSegmentator 开源头颈子任务"
                  "（Apache-2.0）自动分割，未经人工逐层校对",
        "presets": [{"zh": "脑窗", "w": 80, "l": 40}, {"zh": "软组织", "w": 350, "l": 50},
                    {"zh": "骨窗", "w": 2800, "l": 600}, {"zh": "硬膜下", "w": 200, "l": 75}],
    }, ensure_ascii=False, indent=1))
    print(f"{n} 个结构 → {dst}")


if __name__ == "__main__":
    {"fetch": fetch, "segment": segment, "merge": merge}[sys.argv[1]](sys.argv[2] if len(sys.argv) > 2 else "s1194")

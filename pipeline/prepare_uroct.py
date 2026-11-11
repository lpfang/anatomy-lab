"""泌尿系统排泄期 CT：TotalSegmentator 没有肾盂和输尿管标注，这里利用排泄期造影剂充盈，
用阈值 + 连通域自动提取，再与数据集原有标注合并成一个病例目录。

病例 s0329 是在完整 CT 数据集中按"膀胱内存在高密度造影剂"筛选得到的（男 46 岁，腹盆 CT，无病理）。

用法:
  .venv/bin/python pipeline/prepare_headct.py fetch s0329      # 下载（与头颈病例共用下载逻辑）
  .venv/bin/python pipeline/prepare_uroct.py s0329
  .venv/bin/python pipeline/build_case.py data/raw/uroct/s0329 uro_s0329
"""
import json
import shutil
import sys
from pathlib import Path

import nibabel as nib
import numpy as np
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
FULL = ROOT / "data" / "raw" / "ctfull"
OUT = ROOT / "data" / "raw" / "uroct"
# 这些结构里的高密度不是尿路造影剂（骨、肠道口服造影剂、血管、实质脏器），提取时排除
EXCLUDE = ('vertebra', 'rib', 'hip', 'sacrum', 'femur', 'costal', 'colon', 'small_bowel', 'duodenum', 'stomach',
           'spinal', 'aorta', 'iliac', 'vena', 'gallbladder', 'portal', 'liver', 'spleen')
HU = 130          # 充盈造影剂的阈值
VOX_MM = 1.5


def main(case):
    src = FULL / case
    img = nib.as_closest_canonical(nib.load(src / "ct.nii.gz"))
    a = np.asarray(img.dataobj).astype(np.float32)
    aff = img.affine
    segs = {f.name[:-7]: np.asarray(nib.as_closest_canonical(nib.load(f)).dataobj) > 0
            for f in sorted((src / "segmentations").glob("*.nii.gz"))}
    excl = np.zeros(a.shape, bool)
    for k, m in segs.items():
        if any(t in k for t in EXCLUDE):
            excl |= m
    excl = ndi.binary_dilation(excl, iterations=2)

    # 体内区域（去掉检查床和体表），左右限制在两肾外缘之间，上界为肾上极
    body = np.zeros(a.shape, bool)
    for k in range(a.shape[2]):
        m = ndi.binary_fill_holes(a[:, :, k] > -300)
        lab, n = ndi.label(m)
        if n:
            body[:, :, k] = lab == (np.argmax(ndi.sum(m, lab, range(1, n + 1))) + 1)
    inner = ndi.binary_erosion(body, iterations=10)
    kl, kr, bl = segs["kidney_left"], segs["kidney_right"], segs["urinary_bladder"]
    kid = kl | kr
    xs = np.where(kid.any((1, 2)))[0]
    region = np.zeros(a.shape, bool)
    region[xs.min():xs.max() + 1, :, :np.where(kid.any((0, 1)))[0].max() + 1] = True

    cand = (a > HU) & ~excl & inner & region
    # 膀胱内沉积的造影剂：TotalSegmentator 的膀胱标注常漏掉这一层，并回膀胱
    bl_zmax = np.where(bl.any((0, 1)))[0].max()
    near_bl = ndi.binary_dilation(bl, iterations=4)
    near_bl[:, :, bl_zmax + 1:] = False
    bl_full = ndi.binary_fill_holes(bl | (cand & near_bl))
    cand &= ~bl_full

    lab, n = ndi.label(cand, np.ones((3, 3, 3)))
    sizes = ndi.sum(cand, lab, range(1, n + 1))
    kidd = ndi.binary_dilation(kid, iterations=5)
    bld = ndi.binary_dilation(bl_full, iterations=4)
    keep = np.zeros(a.shape, bool)
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        comp = lab[sl] == i
        zext = (sl[2].stop - sl[2].start) * VOX_MM
        # 与肾或膀胱相连、或纵向延伸 ≥ 3 cm 的管状结构；零散小点（静脉石、钙化）丢弃
        if sizes[i - 1] >= 40 and ((kidd[sl] & comp).any() or (bld[sl] & comp).any() or zext >= 30):
            keep[sl] |= comp

    X = nib.affines.apply_affine(aff, np.c_[np.arange(a.shape[0]), np.zeros(a.shape[0]), np.zeros(a.shape[0])])[:, 0]
    right = np.broadcast_to((X > 0)[:, None, None], a.shape)   # RAS：x > 0 为右侧
    out = {"urinary_bladder": bl_full}
    for side, k, sm in (("left", kl, ~right), ("right", kr, right)):
        coll = keep & sm
        zc = int(np.argwhere(k).mean(0)[2])
        pel = coll & ndi.binary_dilation(k, iterations=10)
        pel[:, :, :zc - 8] = False       # 肾门中心以下约 12 mm 视为输尿管起始
        pel |= coll & ndi.binary_dilation(k, iterations=3)   # 下极肾小盏紧贴肾实质，仍归入肾盂肾盏
        out[f"renal_pelvis_{side}"] = pel
        out[f"ureter_{side}"] = coll & ~pel
    for k, m in out.items():
        print(f"{k:22s} {m.sum() * VOX_MM ** 3 / 1000:6.1f} mL")

    dst = OUT / case
    if dst.exists():
        shutil.rmtree(dst)
    (dst / "segmentations").mkdir(parents=True)
    nib.save(img, dst / "ct.nii.gz")
    for k, m in segs.items():
        if k in out or not m.any():
            continue
        nib.save(nib.Nifti1Image(m.astype(np.uint8), aff), dst / "segmentations" / f"{k}.nii.gz")
    for k, m in out.items():
        nib.save(nib.Nifti1Image(m.astype(np.uint8), aff), dst / "segmentations" / f"{k}.nii.gz")
    (dst / "info.json").write_text(json.dumps({
        "desc": "男 46 岁 · 腹盆 CT 排泄期（尿路造影）",
        "source": "TotalSegmentator dataset v2.0.1（CC BY 4.0）；肾盂肾盏、输尿管由排泄期造影剂阈值自动提取，未经人工校对",
        "presets": [{"zh": "软组织", "w": 400, "l": 40}, {"zh": "尿路窗", "w": 1500, "l": 350},
                    {"zh": "骨窗", "w": 1800, "l": 400}, {"zh": "肺窗", "w": 1500, "l": -600}],
    }, ensure_ascii=False, indent=1))
    print("→", dst)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "s0329")

"""把 MNI ICBM152 2009c 对称模板 + CerebrA 图谱整理成与 TotalSegmentator 相同的目录结构，
之后用 build_case.py 生成网页数据。

下载（约 60 MB）:
  https://packages.bic.mni.mcgill.ca/mni-models/icbm152/mni_icbm152_nlin_sym_09c_nifti.zip
  https://packages.bic.mni.mcgill.ca/mni-models/icbm152/mni_icbm152_nlin_sym_09c_CerebrA_nifti.zip
解压到 data/raw/brain/icbm 与 data/raw/brain/cerebra。

用法:
  .venv/bin/python pipeline/prepare_brain.py
  .venv/bin/python pipeline/build_case.py data/raw/brain/mni152 brain_mni152

CerebrA 没有标注大脑白质，这里用模板自带的白质概率图（>0.5、且不属于其他标签）补充；
眼球由 T2 上高信号的玻璃体拟合得到。左右按 RAS x 坐标正负区分。
"""
import csv
import json
import sys
from pathlib import Path

import nibabel as nib
import numpy as np
from scipy import ndimage

sys.path.insert(0, str(Path(__file__).parent))
import anatomy_names as AN  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw" / "brain"
OUT = RAW / "mni152"


def find(name: str) -> Path:
    hits = list(RAW.rglob(name))
    if not hits:
        sys.exit(f"找不到 {name}，请先按文件头说明下载并解压")
    return hits[0]


def largest_cc(m: np.ndarray) -> np.ndarray:
    lab, n = ndimage.label(m)
    if n <= 1:
        return m
    sizes = ndimage.sum(m, lab, range(1, n + 1))
    return lab == (np.argmax(sizes) + 1)


def eyeball(t2: np.ndarray, affine: np.ndarray, side: int) -> np.ndarray:
    """模板自带的 eye_mask 是用于去脸的粗糙方块，不能当眼球用。
    这里在眼眶范围内找 T2 最亮的玻璃体团块定中心，再在半径 13 mm 球内按信号阈值取眼球。side: +1 右 / -1 左。"""
    I, J, K = np.meshgrid(*[np.arange(s) for s in t2.shape], indexing="ij")
    X = affine[0, 0] * I + affine[0, 3]
    Y = affine[1, 1] * J + affine[1, 3]
    Z = affine[2, 2] * K + affine[2, 3]
    box = (side * X > 12) & (side * X < 52) & (Y > 35) & (Y < 80) & (Z > -60) & (Z < -10)
    core = largest_cc(box & (t2 > np.percentile(t2[box], 95)))
    c = nib.affines.apply_affine(affine, np.argwhere(core).mean(0))
    ball = (X - c[0]) ** 2 + (Y - c[1]) ** 2 + (Z - c[2]) ** 2 <= 13 ** 2
    m = ball & (t2 > np.percentile(t2[ball], 35))
    return largest_cc(ndimage.binary_fill_holes(ndimage.binary_closing(m, iterations=2)))


def main():
    t1 = nib.as_closest_canonical(nib.load(find("mni_icbm152_t1_tal_nlin_sym_09c.nii")))
    t2 = nib.as_closest_canonical(nib.load(find("mni_icbm152_t2_tal_nlin_sym_09c.nii")))
    pd = nib.as_closest_canonical(nib.load(find("mni_icbm152_pd_tal_nlin_sym_09c.nii")))
    lab_img = nib.as_closest_canonical(nib.load(find("mni_icbm152_CerebrA_tal_nlin_sym_09c.nii")))
    wm = np.asarray(nib.as_closest_canonical(nib.load(find("mni_icbm152_wm_tal_nlin_sym_09c.nii"))).dataobj)
    affine = t1.affine
    assert np.allclose(lab_img.affine, affine)
    L = np.asarray(lab_img.dataobj).astype(np.int32)

    seg_dir = OUT / "segmentations"
    seg_dir.mkdir(parents=True, exist_ok=True)
    for f in seg_dir.glob("*.nii.gz"):
        f.unlink()

    def save(key: str, mask: np.ndarray):
        if mask.any():
            nib.save(nib.Nifti1Image(mask.astype(np.uint8), affine), seg_dir / f"{key}.nii.gz")

    # RAS x 坐标 > 0 为右侧
    xs = nib.affines.apply_affine(affine, np.stack(np.meshgrid(np.arange(L.shape[0]), [0], [0], indexing="ij"), -1).reshape(-1, 3))[:, 0]
    right_half = np.broadcast_to((xs > 0)[:, None, None], L.shape)

    rows = list(csv.DictReader(open(find("CerebrA_LabelDetails.csv"), encoding="utf-8-sig")))
    n = 0
    for r in rows:
        key, _zh, _en, _g, _d, midline = AN.BRAIN[r["Label Name"].strip()]
        rh, lh = int(r["RH Label"]), int(r["LH Labels"])
        if midline:
            save(key, (L == rh) | (L == lh)); n += 1
        else:
            save(f"{key}_right", L == rh)
            save(f"{key}_left", L == lh)
            n += 2

    # 大脑白质：概率 > 0.5、未被 CerebrA 标注，左右各取最大连通域
    wm_mask = (wm > 0.5) & (L == 0)
    save("cerebral_white_matter_right", largest_cc(wm_mask & right_half))
    save("cerebral_white_matter_left", largest_cc(wm_mask & ~right_half))
    t2a = np.asarray(t2.dataobj).astype(np.float32)
    save("eye_right", eyeball(t2a, affine, +1))
    save("eye_left", eyeball(t2a, affine, -1))

    nib.save(t1, OUT / "mri.nii.gz")
    nib.save(t2, OUT / "extra_T2.nii.gz")
    nib.save(pd, OUT / "extra_PD.nii.gz")
    (OUT / "info.json").write_text(json.dumps({
        "primarySeq": "T1",
        "seqOrder": ["T1", "T2", "PD"],
        "desc": "标准脑 MRI 模板（MNI152）",
        "source": "MNI ICBM152 2009c 对称模板 © 1993–2004 Louis Collins, MNI, McGill University；"
                  "CerebrA 图谱（Manera et al., Sci Data 2020），CC0",
        "note": "群体平均模板，非单一个体",
    }, ensure_ascii=False, indent=1))
    print(f"{len(list(seg_dir.glob('*.nii.gz')))} 个结构 → {OUT}")


if __name__ == "__main__":
    main()

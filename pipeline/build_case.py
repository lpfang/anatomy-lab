"""把一例 TotalSegmentator 数据（ct.nii.gz + segmentations/*.nii.gz）转成网页可用的数据包。

输出目录 web/public/cases/<case_id>/：
  ct.i16.gz      int16 HU 体数据（x 变化最快，RAS 体素序）
  labels.u8.gz   uint8 标签体数据，同网格
  anatomy.glb    每个结构一个网格，节点名 = 结构 key，顶点坐标为 RAS 世界坐标(mm)
  meta.json      尺寸、间距、仿射矩阵、结构列表（中英文名、颜色、体积、质心、代表层面）

用法: .venv/bin/python pipeline/build_case.py data/raw/s0344 s0344
"""
import colorsys
import gzip
import hashlib
import json
import sys
from pathlib import Path

import fast_simplification
import nibabel as nib
import numpy as np
import trimesh
from scipy import ndimage
from skimage import measure

sys.path.insert(0, str(Path(__file__).parent))
import anatomy_names as AN  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent

# 常见器官使用教科书式配色，其余按系统色相微调
COLOR_OVERRIDES = {
    "liver": "#a0522d", "gallbladder": "#3cb371", "stomach": "#e3a869", "duodenum": "#d98c5f",
    "small_bowel": "#e8b07a", "colon": "#c49a6c", "esophagus": "#cf8a6a", "pancreas": "#f0c27b",
    "spleen": "#8e3b5a", "kidney_left": "#b5523b", "kidney_right": "#b5523b",
    "urinary_bladder": "#e8d36a", "prostate": "#c97b9e", "heart": "#c0392b", "aorta": "#e74c3c",
    "inferior_vena_cava": "#3b5bdb", "superior_vena_cava": "#3b5bdb",
    "portal_vein_and_splenic_vein": "#7048e8", "pulmonary_vein": "#e8590c",
    "trachea": "#9ad0ec", "thyroid_gland": "#9b59b6", "spinal_cord": "#f5d76e",
    "costal_cartilages": "#bfd8d2",
}
VEINS = ("vein", "vena")


def struct_color(key: str, system: str, idx: int) -> str:
    if key in COLOR_OVERRIDES:
        return COLOR_OVERRIDES[key]
    if system == "cardio" and any(v in key for v in VEINS):
        base = "#3b5bdb"
    elif system == "respiratory":
        base = ["#7fb3d5", "#85c1e9", "#5dade2", "#a9cce3", "#6ca6cd"][idx % 5]
        return base
    else:
        base = AN.SYSTEMS[system]["color"]
    r, g, b = (int(base[i:i + 2], 16) / 255 for i in (1, 3, 5))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    # 用 key 的哈希做稳定的小幅抖动，让相邻结构可区分
    j = int(hashlib.md5(key.encode()).hexdigest()[:4], 16) / 0xFFFF - 0.5
    l = min(0.85, max(0.25, l + j * 0.18))
    h = (h + j * 0.04) % 1
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    return "#%02x%02x%02x" % (int(r * 255), int(g * 255), int(b * 255))


def make_mesh(mask: np.ndarray, affine: np.ndarray, max_faces: int):
    """对单个结构的二值 mask 提取平滑表面，返回 RAS 世界坐标网格。"""
    idx = np.argwhere(mask)
    lo = np.maximum(idx.min(0) - 3, 0)
    hi = np.minimum(idx.max(0) + 4, mask.shape)
    sub = mask[lo[0]:hi[0], lo[1]:hi[1], lo[2]:hi[2]].astype(np.float32)
    sub = np.pad(sub, 1)
    sub = ndimage.gaussian_filter(sub, sigma=0.9)
    if sub.max() < 0.5:
        return None
    verts, faces, _, _ = measure.marching_cubes(sub, level=0.5)
    verts = verts - 1 + lo  # 回到原体素坐标
    if len(faces) > max_faces:
        verts, faces = fast_simplification.simplify(
            verts.astype(np.float32), faces.astype(np.int32),
            target_reduction=1 - max_faces / len(faces))
    world = nib.affines.apply_affine(affine, verts)
    m = trimesh.Trimesh(world, faces, process=True)
    trimesh.smoothing.filter_taubin(m, iterations=8)
    m.fix_normals()
    return m


STUDY_ZH = {"ct thorax-abdomen-pelvis": "胸腹盆 CT", "ct thorax": "胸部 CT", "ct abdomen-pelvis": "腹盆 CT",
            "ct thorax-neck": "颈胸 CT", "ct pelvis": "盆腔 CT", "ct abdomen": "腹部 CT", "ct neck": "颈部 CT",
            "ct polytrauma": "全身创伤 CT", "ct whole body": "全身 CT"}
LOC_ZH = {"abdomen": "腹部", "thorax": "胸部", "pelvis": "盆腔", "neck": "颈部", "head": "头部",
          "extremity": "四肢", "spine": "脊柱", "throat": "咽喉"}
PATHO_ZH = {"tumor": "肿瘤", "inflammation": "炎症", "trauma": "外伤", "vascular": "血管病变",
            "bleeding": "出血", "fracture": "骨折", "other": "其他病变"}


def mr_normalize(a: np.ndarray) -> np.ndarray:
    """MRI 信号无绝对单位：按 99.5 百分位归一化到 0–2000，与 CT 共用同一套 int16 存储与查找表。"""
    p995 = np.percentile(a[a > np.percentile(a, 50)], 99.5)
    return np.clip(a / p995 * 2000, 0, 3071)


def mr_presets(img: np.ndarray) -> list:
    inside = img[img > 150]
    p = {q: float(np.percentile(inside, q)) for q in (1, 20, 95, 99.5)}
    return [{"zh": "标准", "w": round(p[99.5] - p[1]), "l": round((p[99.5] + p[1]) / 2)},
            {"zh": "高对比", "w": round(p[95] - p[20]), "l": round((p[95] + p[20]) / 2)},
            {"zh": "全范围", "w": 2600, "l": 1300}]


def case_info(src: Path, modality: str) -> dict:
    """从数据集 meta.csv 读取病例信息（若存在）。CT 与 MRI 数据集的列不同。"""
    csv = src.parent / "meta.csv"
    if not csv.exists():
        return {}
    import pandas as pd
    df = pd.read_csv(csv, sep=";").set_index("image_id")
    if src.name not in df.index:
        return {}
    r = df.loc[src.name]
    sex = {"m": "男", "f": "女"}.get(r.get("gender"), "")
    age = f"{int(r.age)} 岁" if pd.notna(r.get("age")) else ""
    parts = [" ".join(x for x in (sex, age) if x)]
    info = {"sex": r.get("gender") if pd.notna(r.get("gender")) else None,
            "age": int(r.age) if pd.notna(r.get("age")) else None}
    if modality == "CT":
        parts.append(STUDY_ZH.get(r.study_type, r.study_type))
        p = r.get("pathology")
        if isinstance(p, str) and p not in ("no_pathology", "unclear"):
            loc = r.get("pathology_location", "")
            loc = LOC_ZH.get(loc, loc)
            parts.append(f"含{PATHO_ZH.get(p, p)}（{loc}，未标注）")
        info["studyType"] = r.study_type
    else:
        seq = str(r.get("scanning_sequence", ""))
        tesla = str(r.get("magnetic_field_strength", "")).replace("Not available", "").replace("nan", "")
        parts.append("腹部 MRI" + (f" · {float(tesla):g}T" if tesla else "") + (f" · {seq}" if seq not in ("unkown", "nan", "Not available") else ""))
    info["desc"] = " · ".join(x for x in parts if x)
    return info


def main(src: str, case_id: str):
    src = Path(src)
    out = ROOT / "web" / "public" / "cases" / case_id
    out.mkdir(parents=True, exist_ok=True)

    modality = "MR" if (src / "mri.nii.gz").exists() else "CT"
    ct_img = nib.as_closest_canonical(nib.load(src / ("mri.nii.gz" if modality == "MR" else "ct.nii.gz")))
    ct = np.asarray(ct_img.dataobj, dtype=np.float32)
    affine = ct_img.affine
    print(modality, ct.shape, ct_img.header.get_zooms())
    if modality == "MR":
        ct = mr_normalize(ct)
    # 可选：附加序列 extra_<名称>.nii.gz（如 T2），与主序列同网格
    extras = {}
    for f in sorted(src.glob("extra_*.nii.gz")):
        img = nib.as_closest_canonical(nib.load(f))
        assert np.allclose(img.affine, affine) and img.shape == ct.shape, f
        extras[f.name[6:-7]] = mr_normalize(np.asarray(img.dataobj, dtype=np.float32))
    info_override = json.loads((src / "info.json").read_text()) if (src / "info.json").exists() else {}

    labels = np.zeros(ct.shape, np.uint8)
    keys = []
    for f in sorted((src / "segmentations").glob("*.nii.gz")):
        key = f.name[:-7]
        seg = nib.as_closest_canonical(nib.load(f))
        assert np.allclose(seg.affine, affine)
        m = np.asarray(seg.dataobj) > 0
        if not m.any():
            continue
        keys.append(key)
        labels[m] = len(keys)
    print(len(keys), "structures")

    # 裁剪到人体范围（去掉空气和床板外的大片空白）
    body = ct > (-500 if modality == "CT" else 150)
    body = ndimage.binary_opening(body, iterations=2) | (labels > 0)
    lab, n = ndimage.label(body)
    sizes = ndimage.sum(body, lab, range(1, n + 1))
    body = lab == (np.argmax(sizes) + 1)
    body |= labels > 0
    idx = np.argwhere(body)
    lo = np.maximum(idx.min(0) - 4, 0)
    hi = np.minimum(idx.max(0) + 5, ct.shape)
    sl = tuple(slice(a, b) for a, b in zip(lo, hi))
    ct, labels = ct[sl], labels[sl]
    affine = affine.copy()
    affine[:3, 3] = nib.affines.apply_affine(affine, lo)
    dims = ct.shape
    spacing = [float(np.linalg.norm(affine[:3, i])) for i in range(3)]
    print("cropped", dims, spacing)

    hu = np.clip(np.round(ct), -1024, 3071).astype("<i2")
    with gzip.open(out / "image.i16.gz", "wb", compresslevel=6) as fh:
        fh.write(hu.transpose(2, 1, 0).tobytes())  # x 最快
    sequences = []
    for name, arr in extras.items():
        e = np.clip(np.round(arr[sl]), -1024, 3071).astype("<i2")
        with gzip.open(out / f"image_{name}.i16.gz", "wb", compresslevel=6) as fh:
            fh.write(e.transpose(2, 1, 0).tobytes())
        sequences.append({"id": name, "file": f"image_{name}.i16.gz", "presets": mr_presets(e)})
    with gzip.open(out / "labels.u8.gz", "wb", compresslevel=9) as fh:
        fh.write(labels.transpose(2, 1, 0).tobytes())

    scene = trimesh.Scene()
    structures = []
    voxel_ml = float(np.prod(spacing)) / 1000
    objs = ndimage.find_objects(labels)
    for i, key in enumerate(keys, start=1):
        info = AN.get(key)
        sl_i = objs[i - 1]
        mask_local = labels[sl_i] == i
        off = np.array([s.start for s in sl_i])
        nvox = int(mask_local.sum())
        com = np.array(ndimage.center_of_mass(mask_local)) + off
        # 每个方向上截面积最大的层面作为"代表层面"
        best = [int(np.argmax(mask_local.sum(axis=tuple(a for a in range(3) if a != ax)))) + int(off[ax])
                for ax in range(3)]
        full = np.zeros(dims, bool)
        full[sl_i] = mask_local
        max_faces = int(np.clip(nvox / 5, 3500 if info["system"] == "skeletal" else 2000, 24000))
        mesh = make_mesh(full, affine, max_faces)
        color = struct_color(key, info["system"], i)
        if mesh is not None:
            rgb = [int(color[k:k + 2], 16) for k in (1, 3, 5)]
            mesh.visual = trimesh.visual.ColorVisuals(mesh, face_colors=rgb + [255])
            scene.add_geometry(mesh, node_name=key, geom_name=key)
        structures.append({
            "id": i, "key": key, **info, "color": color,
            "volumeMl": round(nvox * voxel_ml, 1),
            "centroidVoxel": [round(float(c), 1) for c in com],
            "bestSlice": best,
            "bboxVoxel": [[int(s.start), int(s.stop - 1)] for s in sl_i],
            "hasMesh": mesh is not None,
            **({"opacity": 0.3} if key.startswith("cerebral_white_matter") else {}),
        })
        print(f"  {i:3d} {key:32s} {info['zh']:12s} faces={0 if mesh is None else len(mesh.faces)}")

    # 顶点颜色不需要（前端按结构上色），去掉以减小体积
    for g in scene.geometry.values():
        g.visual = trimesh.visual.ColorVisuals(g)
    scene.export(out / "anatomy.glb")

    if modality == "CT":
        presets = [{"zh": "软组织", "w": 400, "l": 40}, {"zh": "肝脏", "w": 160, "l": 60},
                   {"zh": "肺窗", "w": 1500, "l": -600}, {"zh": "骨窗", "w": 1800, "l": 400}]
        source = "TotalSegmentator dataset v2.0.1 (Wasserthal et al., Radiology: AI 2023), CC BY 4.0"
    else:
        presets = mr_presets(hu)
        source = "TotalSegmentator MRI dataset v3.0.0 (Wasserthal, Akinci D'Antonoli et al.), CC BY 4.0"
    if sequences:
        primary = info_override.get("primarySeq", "主序列")
        sequences.insert(0, {"id": primary, "file": "image.i16.gz", "presets": presets})
        order = info_override.get("seqOrder")
        if order:
            sequences.sort(key=lambda x: order.index(x["id"]) if x["id"] in order else len(order))
    source = info_override.get("source", source)
    presets = info_override.get("presets", presets)
    case = case_info(src, modality)
    for k in ("desc", "note"):
        if k in info_override:
            case[k] = info_override[k]
    meta = {
        "caseId": case_id,
        "modality": modality,
        "unit": "HU" if modality == "CT" else "信号",
        "presets": presets,
        "source": source,
        **({"sequences": sequences} if sequences else {}),
        "dims": list(map(int, dims)),
        "spacing": spacing,
        "affine": np.round(affine, 5).tolist(),
        "orientation": "RAS",
        "caseInfo": case,
        "systems": AN.SYSTEMS,
        "structures": structures,
    }
    (out / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1))
    for f in sorted(out.iterdir()):
        print(f"{f.name:16s} {f.stat().st_size / 1e6:6.1f} MB")
    update_index(meta)


def update_index(meta: dict):
    """维护 web/public/cases/index.json（病例列表，供前端切换）。"""
    p = ROOT / "web" / "public" / "cases" / "index.json"
    cases = json.loads(p.read_text()) if p.exists() else []
    entry = {"id": meta["caseId"], "modality": meta["modality"],
             "desc": meta["caseInfo"].get("desc", ""), "structures": len(meta["structures"])}
    old = next((c for c in cases if c["id"] == entry["id"]), {})
    if old.get("default"):
        entry["default"] = True  # 保留手工指定的默认病例
    cases = [c for c in cases if c["id"] != entry["id"]] + [entry]
    cases.sort(key=lambda c: (c["modality"], c["id"]))
    p.write_text(json.dumps(cases, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main(*sys.argv[1:3])

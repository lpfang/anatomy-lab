"""从 Zenodo 上的 TotalSegmentator 数据集压缩包中只下载指定病例（HTTP Range），无需下载整个压缩包。

用法:
  .venv/bin/python pipeline/fetch_case.py s0344          # CT 小子集（3.2 GB zip）
  .venv/bin/python pipeline/fetch_case.py --mri s0646    # MRI 数据集 v3（15 GB zip）
输出:
  CT : data/raw/<case>/ct.nii.gz + segmentations/, data/raw/meta.csv
  MRI: data/raw/mri/Totalsegmentator_dataset_v300/<case>/mri.nii.gz + segmentations/
"""
import sys
from pathlib import Path

from remotezip import RemoteZip

CT_URL = "https://zenodo.org/api/records/10047263/files/Totalsegmentator_dataset_small_v201.zip/content"
MR_URL = "https://zenodo.org/api/records/22688334/files/TotalsegmentatorMRI_dataset_v300.zip/content"
RAW = Path(__file__).resolve().parent.parent / "data" / "raw"


def main(case: str, mri: bool = False):
    url, out, prefix = (MR_URL, RAW / "mri", "Totalsegmentator_dataset_v300/") if mri else (CT_URL, RAW, "")
    out.mkdir(parents=True, exist_ok=True)
    with RemoteZip(url) as z:
        z.extract(f"{prefix}meta.csv", out)
        members = [i for i in z.infolist() if i.filename.startswith(f"{prefix}{case}/") and i.filename.endswith(".gz")]
        if not members:
            sys.exit(f"病例 {case} 不在小子集中")
        for i in members:
            z.extract(i, out)
        print(f"{case}: {len(members)} 个文件 → {out / prefix / case}")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if a != "--mri"]
    main(args[0] if args else "s0344", mri="--mri" in sys.argv)

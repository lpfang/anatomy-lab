"""TotalSegmentator 结构 → 中英文名称、所属系统、简介。

zh: 中文名（参照《人体解剖学》规范名词）
en: 英文解剖学名称
system: 系统分组 key，见 SYSTEMS
desc: 简短教学说明（影像要点），可为空
"""

SYSTEMS = {
    "skeletal":    {"zh": "骨骼系统",    "en": "Skeletal",        "color": "#e8dcc4"},
    "muscular":    {"zh": "肌肉系统",    "en": "Muscular",        "color": "#c0504d"},
    "cardio":      {"zh": "心血管系统",  "en": "Cardiovascular",  "color": "#d9363e"},
    "respiratory": {"zh": "呼吸系统",    "en": "Respiratory",     "color": "#7fb3d5"},
    "digestive":   {"zh": "消化系统",    "en": "Digestive",       "color": "#d4a24c"},
    "urogenital":  {"zh": "泌尿生殖系统", "en": "Urogenital",      "color": "#e6b800"},
    "endocrine":   {"zh": "内分泌系统",  "en": "Endocrine",       "color": "#9b59b6"},
    "nervous":     {"zh": "神经系统",    "en": "Nervous",         "color": "#f5d76e"},
}

_S = {
    # ---- 消化系统 ----
    "liver": ("肝", "Liver", "digestive",
              "人体最大的实质性器官，位于右上腹。CT 平扫呈均匀软组织密度（约 55–65 HU），门静脉期可见肝内血管分支。"),
    "gallbladder": ("胆囊", "Gallbladder", "digestive",
                    "位于肝下面的胆囊窝内，内含胆汁，CT 呈水样低密度（0–20 HU）。"),
    "stomach": ("胃", "Stomach", "digestive",
                "位于左上腹，形态随充盈程度变化；胃腔内常见气体或液体。"),
    "duodenum": ("十二指肠", "Duodenum", "digestive",
                 "小肠起始段，呈 C 形环绕胰头，分为上部、降部、水平部、升部。"),
    "small_bowel": ("小肠（空回肠）", "Small bowel", "digestive",
                    "空肠多位于左上腹，回肠多位于右下腹及盆腔。"),
    "colon": ("结肠", "Colon", "digestive",
              "包括升结肠、横结肠、降结肠和乙状结肠，肠腔内常含气体和粪便。"),
    "esophagus": ("食管", "Esophagus", "digestive",
                  "位于气管后方、脊柱前方，于后纵隔内下行，穿膈肌食管裂孔入腹。"),
    "pancreas": ("胰", "Pancreas", "digestive",
                 "腹膜后位器官，横卧于第 1–2 腰椎前方，分为胰头、胰颈、胰体、胰尾；胰头被十二指肠环绕。"),
    # ---- 泌尿生殖 ----
    "kidney_left": ("左肾", "Left kidney", "urogenital",
                    "腹膜后位，平第 12 胸椎至第 3 腰椎；左肾通常略高于右肾。"),
    "kidney_right": ("右肾", "Right kidney", "urogenital",
                     "腹膜后位，因肝的存在通常比左肾低约半个椎体。"),
    "kidney_cyst_left": ("左肾囊肿", "Left kidney cyst", "urogenital", "病变：肾内水样低密度灶。"),
    "kidney_cyst_right": ("右肾囊肿", "Right kidney cyst", "urogenital", "病变：肾内水样低密度灶。"),
    "urinary_bladder": ("膀胱", "Urinary bladder", "urogenital",
                        "位于盆腔前部、耻骨联合后方；充盈时内为尿液，呈水样密度。"),
    "prostate": ("前列腺", "Prostate", "urogenital",
                 "男性，位于膀胱颈下方、直肠前方，包绕尿道起始部。"),
    # ---- 内分泌 ----
    "adrenal_gland_left": ("左肾上腺", "Left adrenal gland", "endocrine",
                           "位于左肾上内侧，CT 上呈倒 V 或倒 Y 形细薄结构。"),
    "adrenal_gland_right": ("右肾上腺", "Right adrenal gland", "endocrine",
                            "位于右肾上极上方、下腔静脉后方，呈线状或倒 V 形。"),
    "thyroid_gland": ("甲状腺", "Thyroid gland", "endocrine",
                      "位于颈前部，气管两侧；因含碘，CT 平扫密度高于周围肌肉。"),
    # ---- 呼吸系统 ----
    "trachea": ("气管", "Trachea", "respiratory",
                "颈部至胸骨角平面分叉为左右主支气管，管腔内为气体（约 -1000 HU）。"),
    "lung_upper_lobe_left": ("左肺上叶", "Left upper lobe", "respiratory", "左肺由斜裂分为上、下两叶。"),
    "lung_lower_lobe_left": ("左肺下叶", "Left lower lobe", "respiratory", "位于斜裂后下方。"),
    "lung_upper_lobe_right": ("右肺上叶", "Right upper lobe", "respiratory", "右肺由斜裂和水平裂分为上、中、下三叶。"),
    "lung_left": ("左肺", "Left lung", "respiratory", "左肺较窄长，前缘有心切迹；分上、下两叶。"),
    "lung_right": ("右肺", "Right lung", "respiratory", "右肺较宽短，分上、中、下三叶。"),
    "lung_middle_lobe_right": ("右肺中叶", "Right middle lobe", "respiratory", "位于水平裂与斜裂之间，只有右肺有中叶。"),
    "lung_lower_lobe_right": ("右肺下叶", "Right lower lobe", "respiratory", "位于斜裂后下方。"),
    # ---- 心血管 ----
    "heart": ("心", "Heart", "cardio", "位于中纵隔，约 2/3 在正中线左侧。平扫时心腔与心肌密度相近。"),
    "atrial_appendage_left": ("左心耳", "Left atrial appendage", "cardio", "左心房向前突出的盲囊，是心房颤动时血栓的好发部位。"),
    "aorta": ("主动脉", "Aorta", "cardio", "包括升主动脉、主动脉弓、胸主动脉和腹主动脉，于第 4 腰椎水平分为左右髂总动脉。"),
    "brachiocephalic_trunk": ("头臂干", "Brachiocephalic trunk", "cardio", "主动脉弓的第一个分支，再分为右颈总动脉和右锁骨下动脉。"),
    "common_carotid_artery_left": ("左颈总动脉", "Left common carotid artery", "cardio", "直接发自主动脉弓。"),
    "common_carotid_artery_right": ("右颈总动脉", "Right common carotid artery", "cardio", "发自头臂干。"),
    "subclavian_artery_left": ("左锁骨下动脉", "Left subclavian artery", "cardio", "直接发自主动脉弓，是弓上第三个分支。"),
    "subclavian_artery_right": ("右锁骨下动脉", "Right subclavian artery", "cardio", "发自头臂干。"),
    "superior_vena_cava": ("上腔静脉", "Superior vena cava", "cardio", "由左右头臂静脉汇合而成，注入右心房。"),
    "inferior_vena_cava": ("下腔静脉", "Inferior vena cava", "cardio", "位于腹主动脉右侧，穿膈肌腔静脉孔注入右心房。"),
    "brachiocephalic_vein_left": ("左头臂静脉", "Left brachiocephalic vein", "cardio", "较长，斜跨主动脉弓三大分支前方。"),
    "brachiocephalic_vein_right": ("右头臂静脉", "Right brachiocephalic vein", "cardio", "较短，几乎垂直下行。"),
    "pulmonary_vein": ("肺静脉", "Pulmonary veins", "cardio", "将氧合血从肺送回左心房，通常左右各两支。"),
    "portal_vein_and_splenic_vein": ("门静脉及脾静脉", "Portal & splenic vein", "cardio",
                                     "肠系膜上静脉与脾静脉在胰颈后方汇合成门静脉，入肝门。"),
    "iliac_artery_left": ("左髂动脉", "Left iliac artery", "cardio", "腹主动脉的终末分支。"),
    "iliac_artery_right": ("右髂动脉", "Right iliac artery", "cardio", "腹主动脉的终末分支。"),
    "iliac_vena_left": ("左髂静脉", "Left iliac vein", "cardio", "左右髂总静脉在第 5 腰椎右前方汇合成下腔静脉。"),
    "iliac_vena_right": ("右髂静脉", "Right iliac vein", "cardio", ""),
    "spleen": ("脾", "Spleen", "cardio", "位于左季肋区，第 9–11 肋深面；属淋巴器官，这里归入循环系统。"),
    # ---- 神经 ----
    "brain": ("脑", "Brain", "nervous", ""),
    "spinal_cord": ("脊髓", "Spinal cord", "nervous", "位于椎管内，成人下端约平第 1 腰椎下缘（脊髓圆锥）。"),
    # ---- 肌肉 ----
    "autochthon_left": ("左竖脊肌", "Left erector spinae (autochthonous)", "muscular", "脊柱两侧的固有背肌群。"),
    "autochthon_right": ("右竖脊肌", "Right erector spinae (autochthonous)", "muscular", "脊柱两侧的固有背肌群。"),
    "iliopsoas_left": ("左髂腰肌", "Left iliopsoas", "muscular", "由腰大肌和髂肌组成，止于股骨小转子。"),
    "iliopsoas_right": ("右髂腰肌", "Right iliopsoas", "muscular", "由腰大肌和髂肌组成，止于股骨小转子。"),
    "gluteus_maximus_left": ("左臀大肌", "Left gluteus maximus", "muscular", "臀部最浅层、最大的肌肉。"),
    "gluteus_maximus_right": ("右臀大肌", "Right gluteus maximus", "muscular", "臀部最浅层、最大的肌肉。"),
    "gluteus_medius_left": ("左臀中肌", "Left gluteus medius", "muscular", "位于臀大肌深面的外上方。"),
    "gluteus_medius_right": ("右臀中肌", "Right gluteus medius", "muscular", "位于臀大肌深面的外上方。"),
    "gluteus_minimus_left": ("左臀小肌", "Left gluteus minimus", "muscular", "位于臀中肌深面。"),
    "gluteus_minimus_right": ("右臀小肌", "Right gluteus minimus", "muscular", "位于臀中肌深面。"),
    # ---- 骨骼 ----
    "skull": ("颅骨", "Skull", "skeletal", ""),
    "sternum": ("胸骨", "Sternum", "skeletal", "由胸骨柄、胸骨体和剑突组成。"),
    "costal_cartilages": ("肋软骨", "Costal cartilages", "skeletal", "连接肋骨前端与胸骨。"),
    "clavicula_left": ("左锁骨", "Left clavicle", "skeletal", ""),
    "clavicula_right": ("右锁骨", "Right clavicle", "skeletal", ""),
    "scapula_left": ("左肩胛骨", "Left scapula", "skeletal", ""),
    "scapula_right": ("右肩胛骨", "Right scapula", "skeletal", ""),
    "humerus_left": ("左肱骨", "Left humerus", "skeletal", ""),
    "humerus_right": ("右肱骨", "Right humerus", "skeletal", ""),
    "hip_left": ("左髋骨", "Left hip bone", "skeletal", "由髂骨、坐骨和耻骨融合而成。"),
    "hip_right": ("右髋骨", "Right hip bone", "skeletal", "由髂骨、坐骨和耻骨融合而成。"),
    "vertebrae": ("椎骨（整体）", "Vertebrae", "skeletal", "MRI 数据集将全部椎体作为一个结构标注。"),
    "intervertebral_discs": ("椎间盘", "Intervertebral discs", "skeletal",
                             "位于相邻椎体之间，由外周纤维环和中央髓核构成；T2 加权像上正常髓核呈高信号。"),
    "sacrum": ("骶骨", "Sacrum", "skeletal", "由 5 块骶椎融合而成。"),
    "femur_left": ("左股骨", "Left femur", "skeletal", ""),
    "femur_right": ("右股骨", "Right femur", "skeletal", ""),
}

for side_en, side_zh in (("left", "左"), ("right", "右")):
    for n in range(1, 13):
        _S[f"rib_{side_en}_{n}"] = (f"{side_zh}第{n}肋", f"{side_en.capitalize()} rib {n}", "skeletal", "")

_VERT = [("C", "颈", 7), ("T", "胸", 12), ("L", "腰", 5)]
for code, zh, cnt in _VERT:
    for n in range(1, cnt + 1):
        _S[f"vertebrae_{code}{n}"] = (f"第{n}{zh}椎（{code}{n}）", f"Vertebra {code}{n}", "skeletal", "")
_S["vertebrae_S1"] = ("第1骶椎（S1）", "Vertebra S1", "skeletal", "")
_S["vertebrae_T12"] = ("第12胸椎（T12）", "Vertebra T12", "skeletal", "胸腰交界；第 12 肋附着于此。")
_S["vertebrae_L4"] = ("第4腰椎（L4）", "Vertebra L4", "skeletal", "约平髂嵴最高点，腹主动脉多在此水平分叉。")


def get(name: str) -> dict:
    zh, en, system, desc = _S[name]
    return {"zh": zh, "en": en, "system": system, "desc": desc}

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


# ======================= 脑（CerebrA 图谱，DKT 分区） =======================
SYSTEMS.update({
    "frontal":    {"zh": "额叶",       "en": "Frontal lobe",        "color": "#e57373"},
    "parietal":   {"zh": "顶叶",       "en": "Parietal lobe",       "color": "#64b5f6"},
    "temporal":   {"zh": "颞叶",       "en": "Temporal lobe",       "color": "#81c784"},
    "occipital":  {"zh": "枕叶",       "en": "Occipital lobe",      "color": "#ffb74d"},
    "insula":     {"zh": "岛叶",       "en": "Insula",              "color": "#f06292"},
    "limbic":     {"zh": "边缘系统",   "en": "Limbic system",       "color": "#ba68c8"},
    "basal":      {"zh": "基底核与间脑", "en": "Basal ganglia & diencephalon", "color": "#4db6ac"},
    "ventricles": {"zh": "脑室系统",   "en": "Ventricular system",  "color": "#4fc3f7"},
    "hindbrain":  {"zh": "脑干与小脑", "en": "Brainstem & cerebellum", "color": "#a1887f"},
    "whitematter": {"zh": "白质与视路", "en": "White matter & visual pathway", "color": "#eceff1"},
    "orbit":      {"zh": "眼眶",       "en": "Orbit",               "color": "#fff176"},
})

# CerebrA 名称 → (key, 中文, 英文, 分组, 简介, 是否中线结构[合并左右])
BRAIN = {
    "Superior Frontal": ("superior_frontal", "额上回", "Superior frontal gyrus", "frontal", "位于额叶上部，内侧面包含辅助运动区。", False),
    "Rostral Middle Frontal": ("rostral_middle_frontal", "额中回前部", "Rostral middle frontal gyrus", "frontal", "背外侧前额叶皮质的主要部分，参与工作记忆与执行功能。", False),
    "Caudal Middle Frontal": ("caudal_middle_frontal", "额中回后部", "Caudal middle frontal gyrus", "frontal", "紧邻中央前回前方，含额叶眼区（控制眼球随意运动）。", False),
    "Pars Opercularis": ("pars_opercularis", "额下回岛盖部", "Pars opercularis", "frontal", "与三角部共同构成 Broca 区（优势半球，通常为左侧），损伤导致运动性失语。", False),
    "Pars Triangularis": ("pars_triangularis", "额下回三角部", "Pars triangularis", "frontal", "Broca 区的组成部分，位于岛盖部前方。", False),
    "Pars Orbitalis": ("pars_orbitalis", "额下回眶部", "Pars orbitalis", "frontal", "额下回最前下方的部分，邻接眶额皮质。", False),
    "Lateral Orbitofrontal": ("lateral_orbitofrontal", "眶额外侧皮质", "Lateral orbitofrontal cortex", "frontal", "位于眶顶上方，参与情绪调节与决策。", False),
    "Medial Orbitofrontal": ("medial_orbitofrontal", "眶额内侧皮质", "Medial orbitofrontal cortex", "frontal", "额叶底面内侧（直回附近），参与奖赏评估。", False),
    "Precentral": ("precentral", "中央前回", "Precentral gyrus", "frontal", "初级运动皮质（Brodmann 4 区），按“倒立小人”排列支配对侧躯体运动。位于中央沟前方。", False),
    "Paracentral": ("paracentral", "中央旁小叶", "Paracentral lobule", "frontal", "中央前、后回在大脑内侧面的延续，支配对侧下肢运动与感觉，并与排尿控制有关。", False),
    "Postcentral": ("postcentral", "中央后回", "Postcentral gyrus", "parietal", "初级躯体感觉皮质（Brodmann 3、1、2 区），位于中央沟后方。", False),
    "Superior Parietal": ("superior_parietal", "顶上小叶", "Superior parietal lobule", "parietal", "参与空间定位与感觉整合。", False),
    "Inferior Parietal": ("inferior_parietal", "顶下小叶（角回区）", "Inferior parietal lobule", "parietal", "含角回，与阅读、书写及计算有关。", False),
    "Supramarginal": ("supramarginal", "缘上回", "Supramarginal gyrus", "parietal", "环绕外侧沟后端，优势半球参与语言加工。", False),
    "Precuneus": ("precuneus", "楔前叶", "Precuneus", "parietal", "顶叶内侧面，默认模式网络的核心节点。", False),
    "Superior Temporal": ("superior_temporal", "颞上回", "Superior temporal gyrus", "temporal", "后部（优势半球）为 Wernicke 区，损伤导致感觉性失语。", False),
    "Transverse Temporal": ("transverse_temporal", "颞横回", "Transverse temporal gyrus (Heschl)", "temporal", "初级听觉皮质（Heschl 回），位于外侧沟深部、颞上回上面。", False),
    "Middle Temporal": ("middle_temporal", "颞中回", "Middle temporal gyrus", "temporal", "参与语义加工及视觉运动感知。", False),
    "Inferior temporal": ("inferior_temporal", "颞下回", "Inferior temporal gyrus", "temporal", "腹侧视觉通路的一部分，参与物体识别。", False),
    "Fusiform": ("fusiform", "梭状回", "Fusiform gyrus", "temporal", "颞叶底面，含面孔识别区。", False),
    "Cuneus": ("cuneus", "楔叶", "Cuneus", "occipital", "枕叶内侧面、距状沟上方，接受下方视野信息。", False),
    "Lingual": ("lingual", "舌回", "Lingual gyrus", "occipital", "枕叶内侧面、距状沟下方，接受上方视野信息。", False),
    "Pericalcarine": ("pericalcarine", "距状沟周围皮质", "Pericalcarine cortex", "occipital", "初级视觉皮质（V1，Brodmann 17 区），沿距状沟分布。", False),
    "Lateral Occipital": ("lateral_occipital", "枕外侧皮质", "Lateral occipital cortex", "occipital", "高级视觉皮质，参与形状与运动知觉。", False),
    "Insula": ("insula", "岛叶", "Insula", "insula", "藏于外侧沟深部，被额、顶、颞叶的岛盖覆盖；参与内感受、味觉与情绪。卒中早期 CT 上“岛带征”消失是重要征象。", False),
    "Rostral Anterior Cingulate": ("rostral_anterior_cingulate", "前扣带回（嘴侧）", "Rostral anterior cingulate", "limbic", "参与情绪调节。", False),
    "Caudal Anterior Cingulate": ("caudal_anterior_cingulate", "前扣带回（尾侧）", "Caudal anterior cingulate", "limbic", "参与冲突监测与认知控制。", False),
    "Posterior Cingulate": ("posterior_cingulate", "后扣带回", "Posterior cingulate", "limbic", "默认模式网络的核心节点。", False),
    "Isthmus Cingulate": ("isthmus_cingulate", "扣带回峡", "Isthmus of cingulate", "limbic", "扣带回绕胼胝体压部向下延续为海马旁回的狭窄部分。", False),
    "Parahippocampal": ("parahippocampal", "海马旁回", "Parahippocampal gyrus", "limbic", "位于海马内下方，参与场景记忆。", False),
    "Entorhinal": ("entorhinal", "内嗅皮质", "Entorhinal cortex", "limbic", "海马的主要输入门户；阿尔茨海默病最早受累的区域之一。", False),
    "Hippocampus": ("hippocampus", "海马", "Hippocampus", "limbic", "位于侧脑室下角底壁，负责情景记忆形成。冠状位上观察最好，萎缩是阿尔茨海默病的影像标志。", False),
    "Amygdala": ("amygdala", "杏仁体", "Amygdala", "limbic", "位于海马头前上方，参与恐惧与情绪记忆。", False),
    "Caudate": ("caudate", "尾状核", "Caudate nucleus", "basal", "呈 C 形紧贴侧脑室外侧壁；头部构成侧脑室前角的外侧壁。亨廷顿病时尾状核头萎缩。", False),
    "Putamen": ("putamen", "壳核", "Putamen", "basal", "与苍白球合称豆状核，位于内囊外侧；是高血压脑出血最常见的部位。", False),
    "Pallidum": ("pallidum", "苍白球", "Globus pallidus", "basal", "位于壳核内侧，基底核的主要输出核团之一。", False),
    "Accumbens Area": ("accumbens", "伏隔核", "Nucleus accumbens", "basal", "尾状核头与壳核前下方相连处，奖赏回路的核心。", False),
    "Thalamus": ("thalamus", "丘脑", "Thalamus", "basal", "位于第三脑室两侧，是感觉传入大脑皮质的主要中继站。内囊后肢位于其外侧。", False),
    "Ventral Diencephalon": ("ventral_dc", "腹侧间脑", "Ventral diencephalon", "basal", "包括下丘脑、底丘脑等结构。", False),
    "Basal Forebrain": ("basal_forebrain", "基底前脑", "Basal forebrain", "basal", "含 Meynert 基底核，是皮质胆碱能纤维的主要来源。", False),
    "Lateral Ventricle": ("lateral_ventricle", "侧脑室", "Lateral ventricle", "ventricles", "分为前角、体部、后角和下角，经室间孔与第三脑室相通。T1 呈低信号，T2 呈高信号。", False),
    "Inferior Lateral Ventricle": ("inferior_lateral_ventricle", "侧脑室下角", "Inferior (temporal) horn", "ventricles", "伸入颞叶，内侧壁为海马；下角扩大常提示海马萎缩或脑积水。", False),
    "Third Ventricle": ("third_ventricle", "第三脑室", "Third ventricle", "ventricles", "位于两侧丘脑之间的狭窄腔隙，经中脑导水管通第四脑室。", True),
    "Fourth Ventricle": ("fourth_ventricle", "第四脑室", "Fourth ventricle", "ventricles", "位于脑桥、延髓背侧与小脑之间。", True),
    "Brainstem": ("brainstem", "脑干", "Brainstem", "hindbrain", "由中脑、脑桥和延髓组成，含脑神经核与上下行传导束。", True),
    "Cerebellum Gray Matter": ("cerebellum_cortex", "小脑皮质", "Cerebellar cortex", "hindbrain", "小脑半球表面的灰质，协调同侧肢体运动。", False),
    "Cerebellum White Matter": ("cerebellum_white_matter", "小脑白质", "Cerebellar white matter", "hindbrain", "内含齿状核等小脑核。", False),
    "Vermal lobules I-V": ("vermis_1_5", "小脑蚓（I–V 小叶）", "Vermis lobules I–V", "hindbrain", "小脑蚓前叶部分，与躯干平衡有关。", True),
    "Vermal lobules VI-VII": ("vermis_6_7", "小脑蚓（VI–VII 小叶）", "Vermis lobules VI–VII", "hindbrain", "小脑蚓中部，参与眼球运动控制。", True),
    "Vermal lobules VIII-X": ("vermis_8_10", "小脑蚓（VIII–X 小叶）", "Vermis lobules VIII–X", "hindbrain", "小脑蚓后下部，包括小结，参与前庭平衡。", True),
    "Optic Chiasm": ("optic_chiasm", "视交叉与视束", "Optic chiasm & tracts", "whitematter", "视神经在鞍上池内交叉，鼻侧纤维交叉到对侧；垂体瘤压迫视交叉引起双颞侧偏盲。", True),
}
BRAIN_EXTRA = {
    "cerebral_white_matter": ("大脑白质", "Cerebral white matter", "whitematter", "由有髓神经纤维构成，包括内囊、胼胝体、半卵圆中心等。T1 上白质比灰质亮，T2 上则比灰质暗。"),
    "eye": ("眼球", "Eyeball", "orbit", "位于眼眶前部；玻璃体在 T1 上呈低信号，T2 上呈高信号。"),
}
for _cname, (_k, _zh, _en, _g, _d, _mid) in BRAIN.items():
    if _mid:
        _S[_k] = (_zh, _en, _g, _d)
    else:
        for _side_en, _side_zh in (("left", "左"), ("right", "右")):
            _S[f"{_k}_{_side_en}"] = (f"{_side_zh}{_zh}", f"{_side_en.capitalize()} {_en[0].lower() + _en[1:]}", _g, _d)
for _k, (_zh, _en, _g, _d) in BRAIN_EXTRA.items():
    for _side_en, _side_zh in (("left", "左"), ("right", "右")):
        _S[f"{_k}_{_side_en}"] = (f"{_side_zh}{_zh}", f"{_side_en.capitalize()} {_en[0].lower() + _en[1:]}", _g, _d)


# ======================= 头颈部（TotalSegmentator 头颈子任务） =======================
SYSTEMS["orbit"] = {"zh": "眼与耳", "en": "Eye & ear", "color": "#fff176"}
SYSTEMS.update({
    "sinus":   {"zh": "鼻腔与鼻窦", "en": "Nasal cavity & sinuses", "color": "#80deea"},
    "oral":    {"zh": "口腔与咽喉", "en": "Oral cavity, pharynx & larynx", "color": "#ffab91"},
})

def _bilat(key, zh, en, group, desc=""):
    for side_en, side_zh in (("left", "左"), ("right", "右")):
        _S[f"{key}_{side_en}"] = (f"{side_zh}{zh}", f"{side_en.capitalize()} {en}", group, desc)

_bilat("eye_lens", "晶状体", "lens", "orbit", "双凸透镜状，CT 上密度高于玻璃体；老年白内障时密度可增高。")
_bilat("optic_nerve", "视神经", "optic nerve", "orbit", "自眼球后极经视神经管入颅，在鞍上池形成视交叉。被四条直肌围成的肌锥包绕。")
_bilat("auditory_canal", "外耳道", "external auditory canal", "orbit", "外侧 1/3 为软骨部、内侧 2/3 为骨部，内端为鼓膜；CT 骨窗显示最佳。")
_bilat("lateral_rectus_muscle", "外直肌", "lateral rectus", "orbit", "使眼球外展，受展神经（VI）支配。")
_bilat("medial_rectus_muscle", "内直肌", "medial rectus", "orbit", "使眼球内收，受动眼神经（III）支配；是最粗的眼外肌。")
_bilat("superior_rectus_muscle", "上直肌", "superior rectus", "orbit", "使眼球上转，受动眼神经支配。")
_bilat("inferior_rectus_muscle", "下直肌", "inferior rectus", "orbit", "使眼球下转；眶底骨折时可嵌顿导致上视受限。")
_bilat("superior_oblique_muscle", "上斜肌", "superior oblique", "orbit", "经滑车反折，使眼球下转、内旋，受滑车神经（IV）支配。")
_bilat("inferior_oblique_muscle", "下斜肌", "inferior oblique", "orbit", "唯一起自眶底前部的眼外肌，使眼球上转、外旋。")
_bilat("levator_palpebrae_superioris", "上睑提肌", "levator palpebrae superioris", "orbit", "位于上直肌上方，提上睑；受损导致上睑下垂。")
_bilat("parotid_gland", "腮腺", "parotid gland", "digestive", "最大的唾液腺，位于下颌支后方、外耳道前下；面神经从腺体内穿过，将其分为浅、深两叶。")
_bilat("submandibular_gland", "下颌下腺", "submandibular gland", "digestive", "位于下颌下三角内，导管开口于舌下阜。")
_bilat("nasal_cavity", "鼻腔", "nasal cavity", "sinus", "被鼻中隔分为左右两半，外侧壁有上、中、下鼻甲。")
_bilat("zygomatic_arch", "颧弓", "zygomatic arch", "skeletal", "由颧骨颞突与颞骨颧突构成；颧弓骨折在横断位骨窗上容易辨认。")
_bilat("styloid_process", "茎突", "styloid process", "skeletal", "颞骨向前下方伸出的细长骨突；过长时可引起茎突综合征。")
_bilat("internal_carotid_artery", "颈内动脉", "internal carotid artery", "cardio", "在甲状软骨上缘平面由颈总动脉分出，经颈动脉管入颅，供应大脑前部和眼。")
_bilat("internal_jugular_vein", "颈内静脉", "internal jugular vein", "cardio", "自颈静脉孔出颅，与颈内动脉、迷走神经同行于颈动脉鞘内（静脉在外侧）。")
_bilat("sternocleidomastoid", "胸锁乳突肌", "sternocleidomastoid", "muscular", "颈部重要体表标志，将颈部分为颈前三角和颈外侧三角；单侧收缩使头转向对侧。")
_bilat("trapezius", "斜方肌", "trapezius", "muscular", "受副神经（XI）支配。")
_bilat("platysma", "颈阔肌", "platysma", "muscular", "位于颈部浅筋膜内的薄层皮肌。")
_bilat("levator_scapulae", "肩胛提肌", "levator scapulae", "muscular", "")
_bilat("anterior_scalene", "前斜角肌", "anterior scalene", "muscular", "前斜角肌前方有锁骨下静脉，后方（斜角肌间隙）有锁骨下动脉和臂丛通过。")
_bilat("middle_scalene", "中斜角肌", "middle scalene", "muscular", "")
_bilat("posterior_scalene", "后斜角肌", "posterior scalene", "muscular", "")
_bilat("sterno_thyroid", "胸骨甲状肌", "sternothyroid", "muscular", "舌骨下肌群之一。")
_bilat("thyrohyoid", "甲状舌骨肌", "thyrohyoid", "muscular", "舌骨下肌群之一。")
_bilat("prevertebral", "椎前肌", "prevertebral muscles", "muscular", "颈长肌、头长肌等，紧贴颈椎前方；咽后壁软组织增厚提示咽后脓肿或血肿。")

_S.update({
    "mandible": ("下颌骨", "Mandible", "skeletal", "面颅中唯一能活动的骨，经颞下颌关节与颞骨相连。"),
    "teeth_upper": ("上颌牙", "Upper teeth", "oral", "CT 上牙釉质密度最高，常产生放射状金属样伪影（尤其有补牙时）。"),
    "teeth_lower": ("下颌牙", "Lower teeth", "oral", ""),
    "hard_palate": ("硬腭", "Hard palate", "oral", "口腔顶的前 2/3，由上颌骨腭突和腭骨水平板构成，分隔口腔与鼻腔。"),
    "soft_palate": ("软腭", "Soft palate", "oral", "口腔顶的后 1/3，吞咽时上提封闭鼻咽。"),
    "nasopharynx": ("鼻咽", "Nasopharynx", "oral", "位于鼻腔后方，侧壁有咽鼓管咽口和咽隐窝——咽隐窝是鼻咽癌的好发部位。"),
    "oropharynx": ("口咽", "Oropharynx", "oral", "软腭至会厌上缘之间，含腭扁桃体与舌根。"),
    "hypopharynx": ("喉咽（下咽）", "Hypopharynx", "oral", "会厌上缘至环状软骨下缘，含梨状隐窝，向下续为食管。"),
    "larynx_air": ("喉腔", "Laryngeal airway", "oral", "喉内的气道部分，以声门为界分为声门上、声门和声门下区。"),
    "thyroid_cartilage": ("甲状软骨", "Thyroid cartilage", "oral", "喉软骨中最大者，前缘上部突出为喉结；成人常有不同程度钙化。"),
    "cricoid_cartilage": ("环状软骨", "Cricoid cartilage", "oral", "唯一完整的软骨环，约平第 6 颈椎，是喉与气管、咽与食管的分界。"),
    "hyoid": ("舌骨", "Hyoid bone", "oral", "不与其他骨直接相连的 U 形骨，约平第 3 颈椎。"),
    "sinus_maxillary": ("上颌窦", "Maxillary sinus", "sinus", "最大的鼻旁窦，开口于中鼻道；窦口高于窦底，故引流不畅、炎症多见。"),
    "sinus_frontal": ("额窦", "Frontal sinus", "sinus", "位于眉弓深面，左右常不对称；开口于中鼻道。"),
    "superior_pharyngeal_constrictor": ("咽上缩肌", "Superior pharyngeal constrictor", "muscular", ""),
    "middle_pharyngeal_constrictor": ("咽中缩肌", "Middle pharyngeal constrictor", "muscular", ""),
    "inferior_pharyngeal_constrictor": ("咽下缩肌", "Inferior pharyngeal constrictor", "muscular", ""),
    "brain": ("脑", "Brain", "nervous", "平扫 CT 上灰质（约 35–40 HU）略高于白质（约 25–30 HU），脑窗（W80/L40）下可区分。"),
    "skull": ("颅骨", "Skull", "skeletal", "骨窗下观察骨折与颅底孔道；颅骨内外板之间为板障。"),
})
for _n in range(1, 8):
    if _n == 1:
        _S["vertebrae_C1"] = ("寰椎（C1）", "Atlas (C1)", "skeletal", "没有椎体和棘突，由前后弓和侧块构成，与枕骨髁形成寰枕关节。")
    elif _n == 2:
        _S["vertebrae_C2"] = ("枢椎（C2）", "Axis (C2)", "skeletal", "椎体向上伸出齿突，与寰椎前弓构成寰枢正中关节，是头部旋转的主要部位。")

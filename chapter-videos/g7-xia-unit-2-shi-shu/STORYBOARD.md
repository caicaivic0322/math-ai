# 七年级下册 第二章 实数 — 故事板

**Format:** 1920×1080
**Audio:** oMLX TTS (Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit, voice: serena) voiceover
**VO direction:** 温暖大方的女数学老师，声线稳定统一，语气平和自然，整段保持同一种课堂讲解状态。语速中等偏慢，句与句之间顺畅承接，不要表演、不要夸张、不要突然提高音量。
**Style basis:** DESIGN.md — paper background `#f7f3e8`, ink foreground `#1f2a2c`, teal primary `#0d8b7d`, lemon accent `#f5c84b`, coral warning `#ef6a5b`, soft mint `#d8efe5`

## Global guardrails

- Use calm classroom pacing — reveal formulas and number-line points sequentially
- Transitions feel like turning a notebook page or sliding a soft marker sheet
- Keep captions, formulas, and number-line positions on screen long enough to follow
- Every scene has at least 2 depth layers (background texture + foreground content)
- No dense text walls, no harsh flashes, no dark sci-fi feel
- 实数分类使用卡片式布局，不要做成密集文字墙

## Asset Audit

本视频为纯数学教育内容，无外部捕获素材。所有视觉元素为代码生成的板书、公式、数轴和卡片。

| Asset | Type | Assign to Beat | Role |
|-------|------|---------------|------|
| 平方根卡片 | CSS 生成 | Scene 2 | 平方根与算术平方根对比 |
| 立方根卡片 | CSS 生成 | Scene 3 | 立方根概念 |
| 实数分类表 | CSS 生成 | Scene 4 | 有理数/无理数/实数关系 |
| 数轴标注 | SVG 内联 | Scene 5 | √5 估算区间 |
| 例题板书 | CSS 生成 | Scene 6, 7 | 例题步骤展示 |
| 易错点列表 | CSS 生成 | Scene 8 | 三个易错点 + 三步法 |
| 章节徽章 | CSS 生成 | Scene 1 | 第二章标识 |

---

## Scene Rhythm

slow-build → BUILD → hold → BUILD → PEAK(example1) → PEAK(example2) → breathe → resolve

---

### BEAT 1 — 章节导入 (0:00–~18s)

**VO:** "同学你好，这一节我们学习七年级下册第二章，实数。这一章先学习平方根、算术平方根和立方根，再认识无理数和实数，最后用数轴与估算来比较大小。学习主线是：想逆运算，分清根号，估位置，再比较。"

**Concept:** 温暖的课堂开场。画面像翻开一本干净的数学练习本，章节标题缓缓浮现。右侧三个学习阶段卡片依次出现，底部主线公式作为视觉锚点。

**Mood:** 平和、温暖、像课堂开场白。干净的练习本纸张质感。

**Visual:**
- 背景：淡米色纸张底色 `#f7f3e8`，叠加微弱的方格线纹理和两处柔光径向渐变（teal 左上、lemon 右下）
- 左上角：章节标签徽章"七年级下册 · 第二章"，teal 描边圆角 pill
- 中央偏左：大标题"实数"，带 lemon 高亮底色块"想逆运算 · 分清根号"
- 副标题引导语：学习主线概述
- 右侧面板：三张学习阶段小卡片（平方根与立方根 → 无理数与实数 → 数轴估算与比较），白色半透明圆角卡片带柔和阴影
- 底部：主线公式条"想逆运算 → 分清根号 → 估位置 → 再比较"，lemon 底色
- 装饰元素：右上角 √ 符号淡色水印，左下角数轴淡色水印

**Animation choreography:**
- 章节徽章 FLOATS in from top (y: -24→0, opacity 0→1, 0.45s)
- 大标题 SLIDES in from left (x: -60→0, opacity 0→1, 0.62s)
- 副标题 RISES (y: 34→0, opacity 0→1, 0.5s)
- 三张学习卡片 CASCADE in 错开 0.12s (x: 40→0, opacity 0→1)
- 主线公式条 FADES UP (y: 24→0, opacity 0→1, 0.44s)
- 背景装饰 √ 和数轴持续缓慢浮动（y: ±12px, sine.inOut, yoyo）

**Transition OUT:** 柔和翻页 — 画面向右滑出，新场景从左进入（velocity-matched slide）

**Depth layers:**
- BG: 方格纸纹理 + 径向柔光
- MG: 标题文字组、面板卡片
- FG: 主线公式条、装饰水印符号

---

### BEAT 2 — 平方根 (～18s–~48s)

**VO:** "先看平方根。求一个数的平方根，不是只背答案，而是反问：什么数平方后等于它。比如 7² = 49，(-7)² 也等于 49，所以 49 的平方根是 ±7。算术平方根只取非负的那个，记作 √49 = 7。注意，负数没有平方根，但 0 的平方根还是 0。"

**Concept:** 板书式讲解。左侧是"逆运算思维"图示，右侧逐步展示平方根的定义和例子。画面像老师在黑板上一笔一笔写出来。

**Mood:** 清晰的课堂讲解，板书逐行呈现。

**Visual:**
- 左上：知识点标签"知识点 1：平方根"
- 左侧大标题："平方根：反问什么数平方后等于它"
- 中央核心展示区（split layout）：
  - 左半：逆运算关系图 — "?² = 49" → "7² = 49, (-7)² = 49" → "±7"，每行用箭头连接
  - 右半：两个公式卡片
    - 卡片 1（mint 底色）："平方根：±√49 = ±7"
    - 卡片 2（teal 底色白字）："算术平方根：√49 = 7（只取非负）"
- 底部：提示条（coral 底色）"负数没有平方根；0 的平方根是 0"

**Animation choreography:**
- 标题和标签 SLIDE in from left
- 逆运算关系：?² = 49 先出现，然后 7² = 49 DRAWS 在下方（0.42s），接着 (-7)² = 49 DRAWS（0.42s），最后 ±7 PULSES 放大
- 公式卡片 CASCADE in 错开 0.12s (x: 32→0, opacity 0→1)
- 提示条 POPS in (y: 24→0, back.out ease)
- 每个公式出现时数字短暂 SCALE UP（1→1.08→1）

**Transition OUT:** 柔和滑出 — 内容向左缩进，新场景从右展开

**Depth layers:**
- BG: 方格纸纹理 + 柔光
- MG: 逆运算关系图区域、公式卡片
- FG: 提示条（浮动在底部）

---

### BEAT 3 — 立方根 (～48s–~70s)

**VO:** "再看立方根。若 x³ = a，那么 x 就叫做 a 的立方根，记作 ∛a。立方根和平方根不同，负数也有立方根。比如 (-3)³ = -27，所以 ∛(-27) = -3。做根号题时，先看题目问的是平方根、算术平方根，还是立方根。"

**Concept:** 与平方根形成对比。画面使用小方块（立方体暗示）作为装饰元素。核心是展示立方根与平方根的关键区别——负数可以开立方。

**Mood:** 清晰的对比讲解，方块元素增加空间感。

**Visual:**
- 左上：知识点标签"知识点 2：立方根"
- 标题："立方根：x³ = a → x = ∛a"
- Split layout：
  - 左半：立方运算关系 — "(-3)³ = -27" → "∛(-27) = -3"，用淡色方块堆叠暗示"立方"
  - 右半：对比卡片组
    - 卡片（lemon）："平方根：负数没有平方根"
    - 卡片（teal）："立方根：负数有立方根 ✓"
- 底部关键提示："先看题目问的是哪种根号"

**Animation choreography:**
- 方块装饰从左侧 CASCADE 飘入（3个小方块，stagger 0.15s，带微小旋转）
- 立方运算关系从左到右 DRAW（类似 SVG path drawing）
- 对比卡片上下 STACK，错开出现
- ∛ 符号出现时 SCALE BUMP（1→1.15→1，0.35s）
- 区别提示文字 TYPES ON 逐字出现（technique #7 typing effect）

**Transition OUT:** 快速翻页 wipe（mint 色带从右到左扫过）

**Depth layers:**
- BG: 方格纹理 + 柔光
- MG: 立方关系图、对比卡片
- FG: 浮动小方块装饰

---

### BEAT 4 — 实数分类 (～70s–~100s)

**VO:** "接着认识实数。有限小数和无限循环小数都是有理数；无限不循环小数叫做无理数。有理数和无理数统称实数。像 √2、π 通常是无理数，但 √9 = 3，是有理数，所以不是所有带根号的数都是无理数。"

**Concept:** 分类树状图展开。实数作为大树干，有理数和无理数作为两个分支。画面清晰展示数的分类体系。

**Mood:** 清晰、结构化，像教科书里的分类图动起来。

**Visual:**
- 左上：知识点标签"知识点 3：实数"
- 标题："有理数 + 无理数 = 实数"
- 中央：实数分类树状结构
  - 顶部根节点：大卡片"实数 ℝ"（lemon 底色，带阴影）
  - 左分支：卡片"有理数"（mint 底色）→ 下方两子卡片"有限小数""无限循环小数"
  - 右分支：卡片"无理数"（coral 浅底色）→ 下方子卡片"无限不循环小数"
  - 连接线用 SVG path（teal 描边）
- 底部特别提示卡片（带 ⚠ 图标）："不是所有带根号的数都是无理数！√9 = 3 是有理数"

**Animation choreography:**
- 实数根节点 SCALES in (0→1, back.out, 0.5s)
- 连接线 DRAW themselves（SVG stroke-dashoffset 动画，0.6s）
- 左分支卡片 SLIDE in from left，右分支从 right
- 子卡片依次 DROP in（y: -20→0, stagger 0.12s）
- 底部提示 POPS in with bounce（back.out 1.4）
- 根节点持续缓慢 PULSE（scale 1→1.02，yoyo）

**Transition OUT:** Wipe 过渡 — mint 色带扫过

**Depth layers:**
- BG: 方格纹理 + 柔光 + 淡色数轴水印
- MG: 分类树结构
- FG: 底部提示卡片

---

### BEAT 5 — 数轴估算 (～100s–~128s)

**VO:** "实数都可以在数轴上找到对应点。遇到 √5 这样的数，可以用平方关系估位置。因为 2² < 5 < 3²，所以 2 < √5 < 3。继续细分时，可以比较 2.2²、2.3² 这些平方，让位置越来越准确。"

**Concept:** 数轴从画面底部延展，√5 的位置从模糊区间逐步精确到具体位置。展示"夹逼"的思维过程。

**Mood:** 数学探索感——从模糊到精确的发现过程。

**Visual:**
- 左上：知识点标签"知识点 4：数轴估算"
- 标题："用平方关系给根号数定位"
- 中央大幅数轴（SVG 绘制）：
  - 数轴从左到右横跨画面，标注 0, 1, 2, 3, 4
  - 在 2 和 3 之间高亮一段区间（lemon 色带）
  - 区间内标注"2 < √5 < 3"
- 右侧/下方：逐步精确面板
  - Step 1: "2² = 4 < 5 < 9 = 3²"
  - Step 2: "2.2² = 4.84, 2.3² = 5.29"
  - Step 3: "2.2 < √5 < 2.3"
- 数轴上 √5 位置从模糊光斑逐渐收缩到精确点

**Animation choreography:**
- 数轴从左到右 DRAW（SVG line 动画，0.5s）
- 刻度标记依次 POP in（stagger 0.08s）
- 第一步不等式 TYPE ON
- 区间高亮 GLOW 出现（lemon，opacity 0→0.35）
- 第二步细分数值 TYPE ON
- √5 标记点从模糊光斑 SHRINK 到精确圆点（scale 3→1，0.6s）
- 数轴全程缓慢 BREATHE（y 轴微动 ±3px）

**Transition OUT:** 柔和溶解 + 新场景浮现

**Depth layers:**
- BG: 方格纸纹理
- MG: 数轴 + 标注
- FG: 不等式卡片、步骤面板

---

### BEAT 6 — 例题一：求根 (～128s–~155s)

**VO:** "看例题一：分别求 64 的算术平方根、64 的平方根以及 -27 的立方根。因为 8² = 64，且算术平方根取非负，所以 64 的算术平方根是 8。平方根要写两个结果，所以 64 的平方根是 ±8。因为 (-3)³ = -27，所以 -27 的立方根是 -3。"

**Concept:** 三栏并排展示三种根的计算过程。像考试答题卡一样清晰工整。

**Mood:** 课堂例题演示——每一步都写清楚。

**Visual:**
- 左上：标签"例题 1"
- 标题："求 64 的算术平方根、64 的平方根、-27 的立方根"
- 三栏并排卡片布局：
  - 左栏（teal 边框）："算术平方根" → "8² = 64" → "√64 = 8"
  - 中栏（lemon 边框）："平方根" → "(±8)² = 64" → "±√64 = ±8"
  - 右栏（coral 边框）："立方根" → "(-3)³ = -27" → "∛(-27) = -3"
- 每栏底部：答案醒目显示（大号粗体）
- 顶部连接线：三栏之间的轻微分隔

**Animation choreography:**
- 例题标题 SLIDES in from top
- 三栏卡片 CASCADE in from bottom（stagger 0.18s, y: 60→0）
- 每栏内部：逆运算等式先出现（0.3s），箭头连接（0.25s），答案 POPS in（scale 0→1, back.out）
- 答案出现时各自短暂 PULSE（对应颜色 glow）
- 三栏卡片持续微动（各自独立微小 y 轴浮动）

**Transition OUT:** 快速 wipe

**Depth layers:**
- BG: 方格纹理 + 柔光
- MG: 三栏卡片
- FG: 答案高亮

---

### BEAT 7 — 例题二：比较大小 (～155s–~185s)

**VO:** "看例题二：比较 √10 与 3.1 的大小。先估算 √10，因为 3² = 9，4² = 16，所以 3 < √10 < 4。继续缩小范围：3.1² = 9.61，3.2² = 10.24，所以 3.1 < √10 < 3.2。因此 √10 > 3.1。"

**Concept:** 数轴 + 夹逼计算双视角展示。上部是数轴视图，下部是逐步计算。展示"估位置再比较"的完整思维链。

**Mood:** 数学推理展示——从粗到细逐步逼近。

**Visual:**
- 左上：标签"例题 2"
- 标题："比较 √10 与 3.1 的大小"
- 上半部：数轴视图
  - 区间 3 到 4 放大显示
  - 标注 3.1 位置（固定圆点）
  - √10 位置区间高亮（3.1–3.2 之间，lemon 色带）
  - 箭头指向 √10 > 3.1
- 下半部：逐步计算面板（两行）
  - 行 1："3² = 9 < 10 < 16 = 4² → 3 < √10 < 4"
  - 行 2："3.1² = 9.61, 3.2² = 10.24 → 3.1 < √10 < 3.2"
- 底部结论条（lemon 底色）："∴ √10 > 3.1"

**Animation choreography:**
- 数轴 DRAW in（0.5s）
- 第一行不等式 TYPE ON 逐个出现
- 区间 3–4 高亮出现
- 第二行精确计算 TYPE ON
- 区间收缩到 3.1–3.2，√10 标记点定位
- 比较符号 > POPS（scale 0→1.2→1, back.out）
- 结论条 FADES UP with glow

**Transition OUT:** 柔和 dissolve to white flash → 总结场景

**Depth layers:**
- BG: 方格纹理 + 柔光
- MG: 数轴 + 计算面板
- FG: 结论条

---

### BEAT 8 — 易错点 + 总结 (～185s–~215s)

**VO:** "本章最容易错的地方有三个。第一，把平方根和算术平方根混成一个答案；第二，以为负数不能开任何根；第三，看到根号就直接说是无理数。做题时按三步来：先看根号类型，再想逆运算，最后用数轴或平方估位置。最后总结：平方根看'平方后等于谁'，立方根看'立方后等于谁'，实数比较大小要借助数轴和估算。学完这一章，你要能准确求根、判断有理数和无理数，并用区间估算比较根号数大小。现在回到软件里完成第二章单元小测，检查自己能不能把实数放到数轴上。"

**Concept:** 先警示后鼓励。三个易错点以红色警示卡片呈现，然后三步法用路线图展示，最后温暖收尾鼓励学生去练习。

**Mood:** 真诚的教师提醒 + 温暖的鼓励收尾。

**Visual:**
- 上半部左侧：标题"本章易错点"
- 三个易错点卡片（coral 浅底色，纵向排列）：
  - ① 混淆平方根和算术平方根
  - ② 以为负数不能开任何根
  - ③ 看到根号就直接说是无理数
- 上半部右侧：三步法横向流程卡片
  - 步骤 1：看根号类型 → 步骤 2：想逆运算 → 步骤 3：数轴/平方估位置
- 下半部：总结面板
  - 三个知识卡片并排：平方根 / 立方根 / 实数比较
  - 底部 CTA："回到软件完成第二章单元小测 ✓"
- 装饰：右上角 ∛ 水印，左下角 √ 水印

**Animation choreography:**
- 易错点卡片依次从左侧 SLIDE in（stagger 0.2s，带轻微 shake on enter）
- 三步法卡片从右侧 CASCADE in（stagger 0.15s）
- 步骤箭头 DRAW themselves 连接三步
- 总结卡片从底部 RISE up（stagger 0.12s）
- CTA 按钮 PULSE gently（scale 1→1.02，yoyo，持续）
- 装饰符号缓慢浮动

**Transition OUT:** 场景淡出到纸色（warm fade to #f7f3e8）

**Depth layers:**
- BG: 方格纹理 + 柔光 + 符号水印
- MG: 易错点列表、三步法、总结卡片
- FG: CTA 按钮

---

## Production Architecture

```
project/
├── index.html                    root — VO + scene orchestration
├── DESIGN.md                     brand reference
├── SCRIPT.md (script.md)         narration text
├── STORYBOARD.md                 THIS FILE — creative north star
├── alignment-report.json         timing validation (from build script)
├── sentence-timings.md           readable timing table
├── assets/
│   ├── narration.wav             TTS audio (from build script)
│   ├── sentence-timings.json     machine-readable timing
│   └── sentence-segments-*/      TTS segment cache
├── scripts/
│   └── build-sentence-aligned-video.mjs  source of truth generator
├── renders/
│   └── g7-xia-unit-2-shi-shu.mp4
└── hyperframes.json
```

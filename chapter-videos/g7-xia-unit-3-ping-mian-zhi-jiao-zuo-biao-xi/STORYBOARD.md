# 七年级下册 第三章 平面直角坐标系 — 故事板

**Format:** 1920×1080
**Audio:** oMLX TTS (Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit, voice: serena) voiceover
**VO direction:** 温暖大方的女数学老师，声线稳定统一，语气平和自然，整段保持同一种课堂讲解状态。语速中等偏慢，句与句之间顺畅承接，不要表演、不要夸张、不要突然提高音量。
**Style basis:** DESIGN.md — paper background `#f7f3e8`, ink foreground `#1f2a2c`, teal primary `#0d8b7d`, lemon accent `#f5c84b`, coral warning `#ef6a5b`, soft mint `#d8efe5`, axis blue `#4a7fb5`

## Global guardrails

- Use calm classroom pacing — reveal coordinate axes, grid lines, and points sequentially
- Transitions feel like turning a notebook page or sliding a soft marker sheet
- Keep captions, coordinate labels, and grid marks on screen long enough to follow
- Every scene has at least 2 depth layers (background texture + foreground content)
- No dense text walls, no harsh flashes, no dark sci-fi feel

## Asset Audit

| Asset | Type | Assign to Beat | Role |
|-------|------|---------------|------|
| 有序数对卡片 | CSS 卡片 | Scene 2 | (a,b) 定义 + 顺序对比 |
| 坐标系网格 | SVG 内联 | Scene 3, 4, 5, 6 | 直角坐标系基础结构 |
| 象限符号表 | CSS 四格 | Scene 4, 5 | 象限符号规律展示 |
| 坐标点标记 | SVG 内联 | Scene 5, 6 | 点的坐标定位 |
| 例题步骤卡 | CSS 步骤 | Scene 5, 6 | 例题步骤分解 |
| 易错点列表 | CSS 列表 | Scene 7 | 三个易错点 |
| 总结路线图 | CSS 四格 | Scene 8 | 四步知识回顾 |

---

## Scene Rhythm

intro → ordered pairs → coordinate plane → coordinates+signs → example1 → example2 → mistakes → summary

---

### BEAT 1 — 章节导入 (0:00–~8.5s)

**VO:** "同学你好，这一节我们学习七年级下册第三章，平面直角坐标系。这一章会把'用数来描述位置'这件事学清楚。先学有序数对——用一对数来确定一个位置；再认识平面直角坐标系——把有序数对放到网格里；最后学会用坐标来表示地理位置和简单图形。学习主线可以记成三句话：先读横轴再读纵轴，象限符号要记牢，坐标与位置一一对应。"

**Concept:** 干净的课堂开场。左侧章节标题 + 副标题，右侧三张学习阶段卡片 + 底部主线提示条。

**Mood:** 平和、温暖，像课堂开场白。

**Visual:**
- 背景：淡米色纸张底色 `#f7f3e8`，叠加方格线纹理 + 径向柔光
- 左上：章节标签"七年级下册 · 第三章"
- 中央：大标题"平面直角坐标系"，高亮"位置用数说"
- 副标题："用数来描述位置：有序数对 → 坐标系与点的坐标 → 坐标表示位置"
- 右侧面板：三张卡片（有序数对 / 坐标系 / 点的坐标）
- 底部：lemon 底色提示条"先读横轴再读纵轴 · 象限符号要记牢 · 坐标与位置一一对应"

**Animation:**
- kicker 渐入 (0.45s) → h1 滑入 (0.62s) → lead 弹入 (0.50s) → 面板卡片 cascade (0.66s stagger)
- 三张小卡片 + 底部提示条在 seg-2 时 fade in (stagger 0.14s)
- 装饰元素持续缓慢浮动

**Transition OUT:** Wipe 过渡 — mint → paper 渐变色带扫过

---

### BEAT 2 — 有序数对 (～8.7s–~27.1s)

**VO:** "先看有序数对。比如教室里的座位，第3排第5列能不能表示同一个位置？可以，但前提是大家约定好先说排后说列。这种有顺序的两个数 a 和 b 组成的数对，就叫做有序数对，记作 (a, b)。注意，有序数对的顺序非常重要，(3, 5) 和 (5, 3) 表示的是不同的位置。看电影时座位号、下棋时棋盘点位，都是有序数对的例子。"

**Concept:** 定义 + 示例展示。左侧定义卡片 + 右侧两个对比网格。

**Visual:**
- 左上："知识点 1：有序数对"
- 标题："有序数对 (a, b) — 顺序决定位置"
- 左侧定义面板：有序数对定义 + 强调 (3,5) ≠ (5,3)
- 右侧面板：两个并排 5×5 小网格，分别高亮 (3,5) 和 (5,3)
- 底部：lemon 底色示例条

**Animation:**
- 两张对比卡片 stagger 弹出 (0.42s stagger 0.12s)
- 对比公式滑入 (0.42s)
- 示例条弹入 (0.42s back.out)
- 底部内容随 seg-5 出现

**Transition OUT:** Wipe 过渡

---

### BEAT 3 — 平面直角坐标系 (～27.1s–~47.5s)

**VO:** "接下来认识平面直角坐标系。在平面内画两条互相垂直、原点重合的数轴，就组成了平面直角坐标系。水平的数轴称为 x 轴或横轴，取向右为正方向；竖直的数轴称为 y 轴或纵轴，取向上为正方向。两轴的交点 O 叫做原点。这两条轴把平面分成四个区域，从右上角开始按逆时针方向依次叫做第一象限、第二象限、第三象限、第四象限。"

**Concept:** 大幅 SVG 坐标系展示。左侧坐标系 + 右侧关键标注卡。

**Visual:**
- 左上："知识点 2：平面直角坐标系"
- 标题："两条垂直数轴组成坐标系"
- 左侧：SVG 坐标系（x 轴 / y 轴 / 原点 / 四象限背景色 / I II III IV 标注）
- 右侧面板：三个标注（x 轴说明 / y 轴说明 / 原点说明）+ 警告（坐标轴上的点不属于任何象限）

**Animation:**
- 坐标系 SVG 淡入缩放 (0.50s)
- 右侧标注卡渐入 (0.48s)
- 内容随 seg-6/7 时序出现

**Transition OUT:** Wipe 过渡

---

### BEAT 4 — 点的坐标与象限符号 (～47.5s–~69.7s)

**VO:** "点的坐标怎么确定呢？过点分别向 x 轴和 y 轴做垂线，在 x 轴上对应的数就是横坐标，在 y 轴上对应的数就是纵坐标。写坐标时，先写横坐标再写纵坐标，中间用逗号隔开，再加括号，记作 (x, y)。各个象限内点的坐标符号有规律。第一象限正正，即 (+, +)；第二象限负正，即 (-, +)；第三象限负负，即 (-, -)；第四象限正负，即 (+, -)。"

**Concept:** 左侧 SVG 展示点 A 定位过程 + 右侧象限符号四格表。

**Visual:**
- 左上："知识点 3：点的坐标与象限符号"
- 标题 + 引导语
- 左侧：SVG 坐标系，点 A(3,2) 带两条虚线垂线，点 B(-3,1) 辅助展示
- 右侧面板：象限符号四格表（第一象限 teal / 第二象限 lemon / 第三象限 coral 浅底 / 第四象限 mint）

**Animation:**
- SVG 淡入缩放 (0.50s)
- 象限表从右侧滑入 (0.44s back.out)
- 内容随 seg-8/9 时序出现

**Transition OUT:** Wipe 过渡

---

### BEAT 5 — 例题一：描点定象限 (～69.7s–~92.6s)

**VO:** "看例题一：在坐标系中描出点 A(2, 3)、B(-2, 1)、C(-1, -3)、D(3, -2)，并指出它们分别在第几象限。先看 A(2, 3)，横坐标 2 为正，纵坐标 3 为正，在第一象限。再看 B(-2, 1)，横负纵正，在第二象限。C(-1, -3)，横负纵负，在第三象限。D(3, -2)，横正纵负，在第四象限。做题时按先看横、再看纵、对照符号定象限的顺序来。"

**Concept:** SVG 坐标系中四色点 + 右侧答案行逐条出现。

**Visual:**
- 左上："例题 1"
- 标题 + 引导语
- 左侧：SVG 坐标系，四个点用不同颜色标记（A-teal / B-lemon / C-coral / D-axis blue）
- 右侧面板：四个答案行，逐行带 ✓ 标记

**Animation:**
- SVG 淡入缩放 (0.50s)
- 四个点依次弹出（每句对应一个点，0.35s）
- 答案面板渐入 (0.44s)
- 内容随 seg-10 到 seg-15 时序出现

**Transition OUT:** Wipe 过渡

---

### BEAT 6 — 例题二：由条件求坐标 (～92.6s–~123.1s)

**VO:** "看例题二：已知点 P 在 x 轴上方、y 轴左侧，且到 x 轴距离为 3，到 y 轴距离为 2，求点 P 的坐标。x 轴上方意味着纵坐标为正，y 轴左侧意味着横坐标为负，所以 P 在第二象限。到 x 轴距离为 3，说明纵坐标的绝对值是 3，所以纵坐标为 3；到 y 轴距离为 2，说明横坐标的绝对值是 2，所以横坐标为 -2。因此点 P 的坐标是 (-2, 3)。"

**Concept:** SVG 坐标系 + 分步骤推理。

**Visual:**
- 左上："例题 2"
- 标题 + 引导语
- 左侧：SVG 坐标系，第二象限高亮淡色背景，P 点红色，带虚线距离标注
- 右侧面板：两步推理步骤 + lemon 底色结论公式"P(-2, 3)"

**Animation:**
- SVG 淡入缩放 (0.50s)
- Step 1 滑入 (0.42s)
- Step 2 滑入 (0.42s)
- 结论弹入 (0.44s back.out)
- 内容随 seg-16 到 seg-18 时序出现

**Transition OUT:** Wipe 过渡

---

### BEAT 7 — 易错点 (～123.1s–~139.0s)

**VO:** "本章最容易错的地方有三个。第一，写坐标时把横纵顺序搞反。第二，搞错象限符号，特别是容易把第二和第四象限弄混。第三，分不清点到坐标轴的距离——到 x 轴的距离看纵坐标的绝对值，到 y 轴的距离看横坐标的绝对值。"

**Concept:** 三个易错点纵向排列 + 口诀框。

**Visual:**
- 左上："本章易错点"
- 标题 + 引导语
- 左侧：三个易错点纵向排列（白色卡片 + 黑色圆点数字）
- 右侧：警告框"口诀：正正一、负正二、负负三、正负四"

**Animation:**
- 三个易错点依次滑入 (0.42s stagger)
- 口诀框在 seg-21 时出现
- 内容随 seg-19 到 seg-21 时序出现

**Transition OUT:** Wipe 过渡

---

### BEAT 8 — 总结 (～139.0s–~182.5s)

**VO:** "最后总结：有序数对要注意顺序，坐标系要分清横轴纵轴和象限，点的坐标要先看横再看纵，象限符号要记清'正正一、负正二、负负三、正负四'。学完这一章，你要能在坐标系中准确描点和读坐标，能用坐标表示地理位置。现在回到软件里完成第三章单元小测，检查自己能不能把坐标读准、写准、画准。"

**Concept:** 四步知识路线图 + CTA。

**Visual:**
- 左上："练"标签
- 标题 + 鼓励语
- 中央：横向四步路线图卡片（有序数对 → 坐标系 → 点的坐标 → 象限符号）
- 背景装饰：左上角 (x,y) 淡色水印

**Animation:**
- 四张路线图卡片从底部 rise up (0.44s stagger 0.10s)
- 内容随 scene-8 时序出现

**Transition OUT:** 无（最终场景）

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
│   └── g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi.mp4
└── hyperframes.json
```

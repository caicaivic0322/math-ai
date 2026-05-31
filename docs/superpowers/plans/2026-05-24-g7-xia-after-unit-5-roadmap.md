# G7 Xia After Unit 5 Roadmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish 七年级下册 as a polished, video-backed learning track after 第五章 is complete.

**Architecture:** Treat existing curriculum slices in `src/content/curriculum` as the content source of truth, and treat `chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi` as the production template for chapter video packages. Add a small video metadata path in the app so completed renders can move from "视频占位" to playable lesson media without changing lesson-page routing.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Vitest, HyperFrames chapter-video workflow, local oMLX-compatible TTS, ffmpeg.

---

## Current Baseline

- 已完成课程数据：`src/content/curriculum/g7-xia-unit-1.ts` through `src/content/curriculum/g7-xia-unit-6.ts`
- 已完成视频包：`chapter-videos/g7-xia-unit-1-xiang-jiao-xian-yu-ping-xing-xian`, `chapter-videos/g7-xia-unit-2-shi-shu`, `chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi`
- 待补视频包：七下第 3 章、第 4 章、第 6 章
- 当前应用状态：课程页展示 `videoPlaceholder`，还没有真实 `<video>` 播放路径

## File Structure

- Create `docs/content-roadmap/g7-xia-video-production.md`: human-readable roadmap and status board for 七下视频制作.
- Modify `src/types/content.ts`: extend lesson video metadata with optional playable asset fields.
- Modify `src/components/content/VideoPlaceholderCard.tsx`: render a playable video when `src` exists; keep current placeholder state when it does not.
- Create `src/components/content/VideoPlaceholderCard.test.tsx`: render-to-static-markup tests for placeholder and playable states.
- Modify `src/content/curriculum/g7-xia-unit-3.ts`: attach video asset metadata after 第三章 render is staged.
- Modify `src/content/curriculum/g7-xia-unit-4.ts`: attach video asset metadata after 第四章 render is staged.
- Modify `src/content/curriculum/g7-xia-unit-5.ts`: attach video asset metadata for the completed 第五章 render.
- Modify `src/content/curriculum/g7-xia-unit-6.ts`: attach video asset metadata after 第六章 render is staged.
- Create `public/videos/chapter-videos/`: stable web-served copies of final MP4 files and poster images.
- Create `chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi/`: 第三章 HyperFrames video package.
- Create `chapter-videos/g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu/`: 第四章 HyperFrames video package.
- Create `chapter-videos/g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu/`: 第六章 HyperFrames video package.
- Modify `progress.md`: append execution progress as each chapter reaches final QA.
- Modify `task_plan.md`: replace the old completed difficulty-upgrade plan with this next production track or add a new section below it.

---

### Task 1: Create The 七下 Video Roadmap

**Files:**
- Create: `docs/content-roadmap/g7-xia-video-production.md`
- Modify: `task_plan.md`
- Modify: `progress.md`

- [ ] **Step 1: Create the roadmap directory**

Run:

```bash
mkdir -p docs/content-roadmap
```

Expected: command exits with status `0`.

- [ ] **Step 2: Write the roadmap document**

Create `docs/content-roadmap/g7-xia-video-production.md` with:

```markdown
# 七年级下册视频制作路线图

## 目标

把七年级下册从“课程数据完整”推进到“整册可观看、可练习、可验收”的学习闭环。

## 优先级

1. 补齐第 3 章《平面直角坐标系》视频包。
2. 补齐第 4 章《二元一次方程组》视频包。
3. 补齐第 6 章《数据的收集、整理与描述》视频包。
4. 将第 1、2、3、4、5、6 章最终 MP4 接入课程页。
5. 做七下整册 QA：课程页、例题页、小测、视频播放、移动端布局。

## 状态表

| 章节 | 课程数据 | 视频脚本 | 配音时间轴 | HyperFrames 验证 | 最终 MP4 | 接入课程页 |
| --- | --- | --- | --- | --- | --- | --- |
| 第 1 章 相交线与平行线 | 完成 | 完成 | 完成 | 待复核 | 待接入 | 未接入 |
| 第 2 章 实数 | 完成 | 完成 | 完成 | 待复核 | 待接入 | 未接入 |
| 第 3 章 平面直角坐标系 | 完成 | 未开始 | 未开始 | 未开始 | 未开始 | 未接入 |
| 第 4 章 二元一次方程组 | 完成 | 未开始 | 未开始 | 未开始 | 未开始 | 未接入 |
| 第 5 章 一元一次不等式与一元一次不等式组 | 完成 | 完成 | 完成 | 已有 render，需最终复核 | 已有 render，需定版 | 未接入 |
| 第 6 章 数据的收集、整理与描述 | 完成 | 未开始 | 未开始 | 未开始 | 未开始 | 未接入 |

## 验收标准

- 每章目录包含 `DESIGN.md`、`script.md`、`scripts/build-sentence-aligned-video.mjs`、`assets/narration.wav`、`assets/sentence-timings.json`、`sentence-timings.md`、`alignment-report.json`、`index.html`、`renders/<chapter>.mp4`。
- `alignment-report.json` 中所有布尔检查为 `true`。
- `audioVideoDurationDelta` 小于等于 `0.2`。
- `npx hyperframes lint` 通过。
- `npx hyperframes validate` 通过且无对比度警告。
- 抽帧 contact sheet 中每个采样点都有可见主板书、公式、图形或统计图。
- 课程页能播放已接入视频，未完成章节仍显示原占位卡。
```

- [ ] **Step 3: Update the working plan**

Append this section to `task_plan.md`:

```markdown

## 七下整册视频化与课程页接入计划

## 目标
- 以第五章已完成视频包为模板，补齐七下第 3、4、6 章视频。
- 把最终 MP4 接入课程页，保留未完成章节的占位展示。
- 完成七下整册学习路径验收。

## 阶段
- [pending] 建立七下视频制作路线图
- [pending] 扩展课程视频元数据与播放组件
- [pending] 接入第五章已完成视频
- [pending] 制作第三章视频包
- [pending] 制作第四章视频包
- [pending] 制作第六章视频包
- [pending] 接入第 1、2、3、4、6 章最终视频
- [pending] 七下整册回归测试、构建与人工 QA
```

- [ ] **Step 4: Update progress**

Append this entry to `progress.md`:

```markdown

## 2026-05-24
- 七下第五章视频包已完成到可作为模板的状态。
- 下一阶段目标：补齐七下第 3、4、6 章视频，并把七下视频接入课程页。
- 新增执行计划：`docs/superpowers/plans/2026-05-24-g7-xia-after-unit-5-roadmap.md`
```

- [ ] **Step 5: Review the docs diff**

Run:

```bash
git diff -- docs/content-roadmap/g7-xia-video-production.md task_plan.md progress.md
```

Expected: diff only contains the roadmap and status updates described above.

---

### Task 2: Add Playable Lesson Video Metadata

**Files:**
- Modify: `src/types/content.ts`
- Modify: `src/components/content/VideoPlaceholderCard.tsx`
- Create: `src/components/content/VideoPlaceholderCard.test.tsx`

- [ ] **Step 1: Write the failing component tests**

Create `src/components/content/VideoPlaceholderCard.test.tsx`:

```tsx
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { VideoPlaceholderCard } from "./VideoPlaceholderCard";

describe("VideoPlaceholderCard", () => {
  it("keeps the placeholder state when no video source exists", () => {
    const markup = renderToStaticMarkup(
      <VideoPlaceholderCard
        video={{
          title: "板书微课：坐标系里的读点和平移",
          durationLabel: "6 分钟",
          description: "把点的坐标和平移规律串起来。",
        }}
      />,
    );

    expect(markup).toContain("视频占位");
    expect(markup).not.toContain("<video");
  });

  it("renders a playable video when a source is available", () => {
    const markup = renderToStaticMarkup(
      <VideoPlaceholderCard
        video={{
          title: "板书微课：解不等式组的公共部分怎么看",
          durationLabel: "6 分钟",
          description: "用数轴对照不等式组的解集。",
          src: "/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.mp4",
          posterSrc: "/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.jpg",
          status: "rendered",
        }}
      />,
    );

    expect(markup).toContain("<video");
    expect(markup).toContain('controls=""');
    expect(markup).toContain(
      "/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.mp4",
    );
    expect(markup).toContain(
      "/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.jpg",
    );
    expect(markup).not.toContain("视频占位");
  });
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
npm test -- src/components/content/VideoPlaceholderCard.test.tsx
```

Expected: FAIL because `src`, `posterSrc`, and `status` are not yet in the type and the component does not render `<video>`.

- [ ] **Step 3: Extend the content type**

In `src/types/content.ts`, replace the existing `videoPlaceholder` shape with:

```ts
  videoPlaceholder?: {
    title: string;
    durationLabel: string;
    description: string;
    src?: string;
    posterSrc?: string;
    status?: "planned" | "rendered";
  };
```

- [ ] **Step 4: Render playable videos in the card**

Update `src/components/content/VideoPlaceholderCard.tsx` to:

```tsx
import type { KnowledgePointLesson } from "@/types/content";

import { Badge, Card } from "@/components/ui";

type VideoPlaceholderCardProps = {
  video: NonNullable<KnowledgePointLesson["videoPlaceholder"]>;
};

export function VideoPlaceholderCard({ video }: VideoPlaceholderCardProps) {
  const hasPlayableVideo = Boolean(video.src);

  return (
    <Card className="rounded-[1.75rem] border-dashed bg-[linear-gradient(135deg,color-mix(in_oklch,var(--color-primary-soft),white_35%)_0%,var(--color-surface)_100%)]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">板书微课</Badge>
            <Badge variant="neutral">{video.durationLabel}</Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">{video.title}</h3>
            <p className="max-w-2xl text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
              {video.description}
            </p>
          </div>
        </div>

        {hasPlayableVideo ? (
          <video
            className="aspect-video w-full shrink-0 rounded-[1.25rem] border border-[var(--color-border)] bg-black sm:w-56"
            controls
            poster={video.posterSrc}
            preload="metadata"
            src={video.src}
          />
        ) : (
          <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-[1.5rem] border border-[var(--color-primary)]/20 bg-[color-mix(in_oklch,var(--color-primary-soft),white_48%)] text-sm font-medium text-[var(--color-primary)] sm:w-44">
            视频占位
          </div>
        )}
      </div>
    </Card>
  );
}
```

- [ ] **Step 5: Run focused tests**

Run:

```bash
npm test -- src/components/content/VideoPlaceholderCard.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/types/content.ts src/components/content/VideoPlaceholderCard.tsx src/components/content/VideoPlaceholderCard.test.tsx
git commit -m "feat: support playable lesson videos"
```

Expected: commit succeeds when the repository is initialized. If this workspace has no `.git`, record the changed files in `progress.md` instead.

---

### Task 3: Stage And Connect The Completed Unit 5 Video

**Files:**
- Create: `public/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.mp4`
- Create: `public/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.jpg`
- Modify: `src/content/curriculum/g7-xia-unit-5.ts`

- [ ] **Step 1: Create the public video directory**

Run:

```bash
mkdir -p public/videos/chapter-videos
```

Expected: command exits with status `0`.

- [ ] **Step 2: Copy the current best Unit 5 render**

Run:

```bash
cp chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi/renders/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi-smooth-female-teacher-v2.mp4 public/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.mp4
```

Expected: `public/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.mp4` exists.

- [ ] **Step 3: Create the Unit 5 poster image**

Run:

```bash
ffmpeg -y -v error -ss 27 -i public/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.mp4 -frames:v 1 public/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.jpg
```

Expected: `public/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.jpg` exists.

- [ ] **Step 4: Add video metadata to both Unit 5 lessons**

In `src/content/curriculum/g7-xia-unit-5.ts`, update each `videoPlaceholder` in this chapter to include:

```ts
        src: "/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.mp4",
        posterSrc: "/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.jpg",
        status: "rendered",
```

- [ ] **Step 5: Verify typecheck and tests**

Run:

```bash
npm run typecheck
npm test -- src/components/content/VideoPlaceholderCard.test.tsx src/content/quiz-difficulty-upgrade.test.ts
```

Expected: both commands pass.

- [ ] **Step 6: Commit**

Run:

```bash
git add public/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.mp4 public/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.jpg src/content/curriculum/g7-xia-unit-5.ts
git commit -m "feat: connect grade 7 unit 5 lesson video"
```

Expected: commit succeeds when the repository is initialized. If this workspace has no `.git`, record the changed files in `progress.md` instead.

---

### Task 4: Produce Unit 3 Video Package

**Files:**
- Create: `chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi/DESIGN.md`
- Create: `chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi/script.md`
- Create: `chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi/scripts/build-sentence-aligned-video.mjs`
- Create: `chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi/index.html`
- Create: `chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi/renders/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi.mp4`
- Modify: `src/content/curriculum/g7-xia-unit-3.ts`

- [ ] **Step 1: Create the package from Unit 5 template**

Run:

```bash
mkdir -p chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi/assets chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi/renders chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi/scripts
cp chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi/DESIGN.md chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi/DESIGN.md
cp chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi/scripts/build-sentence-aligned-video.mjs chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi/scripts/build-sentence-aligned-video.mjs
```

Expected: the new Unit 3 directory has `DESIGN.md`, `assets`, `renders`, and `scripts`.

- [ ] **Step 2: Write the Unit 3 script**

Create `chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi/script.md` with a 5-6 minute narration that covers these exact beats:

```markdown
# 七年级下册 第三章 平面直角坐标系 学习视频脚本

## 旁白稿

同学你好，这一节我们学习七年级下册第三章，平面直角坐标系。

这一章的核心，是把“位置”变成两个有顺序的数。学习主线可以记成三句话：有序数对先横后纵，坐标系先找原点和两条轴，点的平移看横坐标和纵坐标分别怎样变。

先看有序数对。比如教室座位可以用第几列、第几排来表示，电影院座位可以用第几排、第几号来表示。这里最重要的是“有序”：先说哪个量，后说哪个量，不能随便交换。二逗号三和三逗号二，通常表示两个不同的位置。

在平面直角坐标系中，水平的数轴叫 x 轴，竖直的数轴叫 y 轴，两条轴的交点叫原点。点的坐标写成括号里的两个数，前一个是横坐标，后一个是纵坐标。读点时先看它离原点左右多少，再看上下多少。

看例题一：点 A 在原点右侧 2 个单位，上方 3 个单位，写出点 A 的坐标。右侧表示横坐标为 2，上方表示纵坐标为 3，所以 A 的坐标是左括号 2 逗号 3 右括号。

再看象限。第一象限横坐标和纵坐标都是正数；第二象限横坐标为负，纵坐标为正；第三象限两个坐标都是负数；第四象限横坐标为正，纵坐标为负。点在坐标轴上时，不属于任何一个象限。

点的平移也很有规律。向右平移，横坐标增加；向左平移，横坐标减少；向上平移，纵坐标增加；向下平移，纵坐标减少。左右只影响横坐标，上下只影响纵坐标。

看例题二：点 B 的坐标是左括号负 2 逗号 5 右括号，先向右平移 4 个单位，再向下平移 3 个单位。向右 4 个单位，横坐标从负 2 变成 2；向下 3 个单位，纵坐标从 5 变成 2，所以新点坐标是左括号 2 逗号 2 右括号。

本章最容易错的地方有三个。第一，把有序数对的两个数交换。第二，读点时先看纵坐标，导致坐标写反。第三，平移时把左右变化和上下变化混在一起。

最后总结：位置用有序数对表示，点的坐标先横后纵，左右平移改横坐标，上下平移改纵坐标。回到软件里完成第三章单元小测，检查自己能不能把位置读准、写准、移动准。

## 字幕分段

1. 这一节学习：七年级下册第三章，平面直角坐标系。
2. 核心：把位置变成两个有顺序的数。
3. 主线：有序数对、坐标系、点的平移。
4. 有序数对强调顺序不能交换。
5. (2, 3) 和 (3, 2) 通常表示不同位置。
6. 水平数轴叫 x 轴，竖直数轴叫 y 轴。
7. 两条轴的交点叫原点。
8. 坐标前一个是横坐标，后一个是纵坐标。
9. 读点时先看左右，再看上下。
10. 例题一：点 A 右 2、上 3。
11. A 的坐标是 (2, 3)。
12. 第一象限两个坐标都是正数。
13. 第二象限横负纵正。
14. 第三象限两个坐标都是负数。
15. 第四象限横正纵负。
16. 坐标轴上的点不属于任何象限。
17. 向右平移，横坐标增加。
18. 向左平移，横坐标减少。
19. 向上平移，纵坐标增加。
20. 向下平移，纵坐标减少。
21. 例题二：B(-2, 5) 右移 4，再下移 3。
22. 横坐标变为 2，纵坐标变为 2。
23. 新点坐标是 (2, 2)。
24. 易错点：两个数交换。
25. 易错点：坐标先后顺序写反。
26. 易错点：把左右变化和上下变化混在一起。
27. 总结：先横后纵，左右改横，上下改纵。
28. 回到软件里完成第三章单元小测。
```

- [ ] **Step 3: Update the generator constants**

In `chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi/scripts/build-sentence-aligned-video.mjs`, replace all Unit 5 IDs, titles, and narration arrays with Unit 3 values from Step 2. Set `speechProfile.id` to:

```js
"smooth-female-teacher-v3-unit-3"
```

- [ ] **Step 4: Generate assets and composition**

Run from the Unit 3 directory:

```bash
node scripts/build-sentence-aligned-video.mjs
npx hyperframes lint
npx hyperframes validate
npx hyperframes render --quality standard --workers 1 --output renders/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi.mp4
```

Expected: all commands pass and the MP4 exists.

- [ ] **Step 5: Create final QA frames**

Run from the Unit 3 directory:

```bash
mkdir -p renders/final-check-frames
find renders/final-check-frames -maxdepth 1 \( -name 'check-*.png' -o -name 'contact-sheet.png' \) -delete
i=1
for t in 2 25 50 75 100 125 150 175 200; do
  printf -v n '%02d' "$i"
  ffmpeg -y -v error -ss "$t" -i renders/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi.mp4 -frames:v 1 "renders/final-check-frames/check-$n.png"
  i=$((i+1))
done
ffmpeg -y -v error -framerate 1 -i renders/final-check-frames/check-%02d.png -vf "scale=640:-1,tile=3x3" -frames:v 1 renders/final-check-frames/contact-sheet.png
```

Expected: `renders/final-check-frames/contact-sheet.png` shows visible coordinate axes or point movement in every sampled frame.

- [ ] **Step 6: Stage Unit 3 public assets**

Run:

```bash
cp chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi/renders/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi.mp4 public/videos/chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi.mp4
ffmpeg -y -v error -ss 25 -i public/videos/chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi.mp4 -frames:v 1 public/videos/chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi.jpg
```

Expected: MP4 and poster exist in `public/videos/chapter-videos`.

- [ ] **Step 7: Connect Unit 3 metadata**

In both `videoPlaceholder` objects in `src/content/curriculum/g7-xia-unit-3.ts`, add:

```ts
        src: "/videos/chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi.mp4",
        posterSrc: "/videos/chapter-videos/g7-xia-unit-3-ping-mian-zhi-jiao-zuo-biao-xi.jpg",
        status: "rendered",
```

- [ ] **Step 8: Verify**

Run:

```bash
npm run typecheck
npm test -- src/content/quiz-difficulty-upgrade.test.ts src/components/content/VideoPlaceholderCard.test.tsx
```

Expected: both commands pass.

---

### Task 5: Produce Unit 4 Video Package

**Files:**
- Create: `chapter-videos/g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu/`
- Create: `chapter-videos/g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu/renders/g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu.mp4`
- Modify: `src/content/curriculum/g7-xia-unit-4.ts`

- [ ] **Step 1: Create the package from Unit 5 template**

Run:

```bash
mkdir -p chapter-videos/g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu/assets chapter-videos/g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu/renders chapter-videos/g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu/scripts
cp chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi/DESIGN.md chapter-videos/g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu/DESIGN.md
cp chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi/scripts/build-sentence-aligned-video.mjs chapter-videos/g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu/scripts/build-sentence-aligned-video.mjs
```

Expected: the new Unit 4 directory has the same production skeleton as Unit 5.

- [ ] **Step 2: Write `script.md` with this exact teaching spine**

Use this chapter structure in `chapter-videos/g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu/script.md`:

```markdown
# 七年级下册 第四章 二元一次方程组 学习视频脚本

## 旁白稿教学 spine

1. 开场：本章学习二元一次方程组。
2. 核心：两个未知数需要两个独立条件一起确定。
3. 二元一次方程：含两个未知数，未知数次数都是 1。
4. 方程组的解：同时满足两个方程的一对数。
5. 代入法：先用一个未知数表示另一个未知数，再代入另一个方程。
6. 例题一：由 x + y = 7 得 y = 7 - x，代入 2x - y = 5，求 x = 4、y = 3。
7. 加减法：系数相同或相反时，直接相加或相减消去一个未知数。
8. 例题二：x + y = 8，x - y = 2，两式相加得 x = 5，再求 y = 3。
9. 应用题：先设两个未知数，再找两个数量关系。
10. 易错点：只满足一个方程、回代漏写、单位和实际意义漏检。
11. 总结：方程组就是两个条件共同锁定一对数。

## 字幕分段要求

- 24 到 30 条字幕。
- 每条字幕只承载一个判断、一步运算或一个提醒。
- 必须包含 `x + y = 7`、`2x - y = 5`、`x + y = 8`、`x - y = 2` 四个表达式。
- 结尾字幕为：回到软件里完成第四章单元小测。
```

- [ ] **Step 3: Update generator constants**

In the Unit 4 generator, set:

```js
const chapterId = "g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu";
const chapterTitle = "七年级下册 第四章 二元一次方程组";
const speechProfile = {
  id: "smooth-female-teacher-v3-unit-4",
};
```

Preserve the Unit 5 generation contract: scene-level synthesis, trimmed speech units, loudness normalization, timed captions, and `alignment-report.json`.

- [ ] **Step 4: Generate, validate, and render**

Run from the Unit 4 directory:

```bash
node scripts/build-sentence-aligned-video.mjs
npx hyperframes lint
npx hyperframes validate
npx hyperframes render --quality standard --workers 1 --output renders/g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu.mp4
```

Expected: all commands pass and final MP4 exists.

- [ ] **Step 5: Stage and connect assets**

Run:

```bash
cp chapter-videos/g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu/renders/g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu.mp4 public/videos/chapter-videos/g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu.mp4
ffmpeg -y -v error -ss 25 -i public/videos/chapter-videos/g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu.mp4 -frames:v 1 public/videos/chapter-videos/g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu.jpg
```

In both `videoPlaceholder` objects in `src/content/curriculum/g7-xia-unit-4.ts`, add:

```ts
        src: "/videos/chapter-videos/g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu.mp4",
        posterSrc: "/videos/chapter-videos/g7-xia-unit-4-er-yuan-yi-ci-fang-cheng-zu.jpg",
        status: "rendered",
```

- [ ] **Step 6: Verify**

Run:

```bash
npm run typecheck
npm test -- src/content/quiz-difficulty-upgrade.test.ts src/components/content/VideoPlaceholderCard.test.tsx
```

Expected: both commands pass.

---

### Task 6: Produce Unit 6 Video Package

**Files:**
- Create: `chapter-videos/g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu/`
- Create: `chapter-videos/g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu/renders/g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu.mp4`
- Modify: `src/content/curriculum/g7-xia-unit-6.ts`

- [ ] **Step 1: Create the package from Unit 5 template**

Run:

```bash
mkdir -p chapter-videos/g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu/assets chapter-videos/g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu/renders chapter-videos/g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu/scripts
cp chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi/DESIGN.md chapter-videos/g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu/DESIGN.md
cp chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi/scripts/build-sentence-aligned-video.mjs chapter-videos/g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu/scripts/build-sentence-aligned-video.mjs
```

Expected: the new Unit 6 directory has the same production skeleton as Unit 5.

- [ ] **Step 2: Write `script.md` with this exact teaching spine**

Use this chapter structure in `chapter-videos/g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu/script.md`:

```markdown
# 七年级下册 第六章 数据的收集、整理与描述 学习视频脚本

## 旁白稿教学 spine

1. 开场：本章学习数据的收集、整理与描述。
2. 核心：统计不是只画图，而是从问题出发收集可靠数据。
3. 调查方式：全面调查适合对象少且需要准确的情况，抽样调查适合对象多且难以逐个调查的情况。
4. 样本代表性：样本偏了，结论也会偏。
5. 统计表：先统一分类、单位和口径。
6. 条形图：适合比较不同类别数量。
7. 折线图：适合观察随时间变化的趋势。
8. 扇形图：适合表示部分占整体的比例。
9. 例题一：篮球 12 人、足球 8 人、羽毛球 6 人，篮球最多，羽毛球最少，相差 6 人。
10. 例题二：降雨量从 8 毫米变成 2 毫米，减少 6 毫米，减少百分比为 75%。
11. 易错点：不看单位、不看总量、把趋势和比例混在一起。
12. 总结：问对问题、收好数据、选对图表、说清结论。

## 字幕分段要求

- 24 到 30 条字幕。
- 必须出现 `条形图`、`折线图`、`扇形图`、`75%`。
- 图表场景必须有一个条形图和一个折线图。
- 结尾字幕为：回到软件里完成第六章单元小测。
```

- [ ] **Step 3: Update generator constants**

In the Unit 6 generator, set:

```js
const chapterId = "g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu";
const chapterTitle = "七年级下册 第六章 数据的收集、整理与描述";
const speechProfile = {
  id: "smooth-female-teacher-v3-unit-6",
};
```

- [ ] **Step 4: Generate, validate, and render**

Run from the Unit 6 directory:

```bash
node scripts/build-sentence-aligned-video.mjs
npx hyperframes lint
npx hyperframes validate
npx hyperframes render --quality standard --workers 1 --output renders/g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu.mp4
```

Expected: all commands pass and final MP4 exists.

- [ ] **Step 5: Stage and connect assets**

Run:

```bash
cp chapter-videos/g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu/renders/g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu.mp4 public/videos/chapter-videos/g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu.mp4
ffmpeg -y -v error -ss 25 -i public/videos/chapter-videos/g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu.mp4 -frames:v 1 public/videos/chapter-videos/g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu.jpg
```

In both `videoPlaceholder` objects in `src/content/curriculum/g7-xia-unit-6.ts`, add:

```ts
        src: "/videos/chapter-videos/g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu.mp4",
        posterSrc: "/videos/chapter-videos/g7-xia-unit-6-shu-ju-de-shou-ji-zheng-li-yu-miao-shu.jpg",
        status: "rendered",
```

- [ ] **Step 6: Verify**

Run:

```bash
npm run typecheck
npm test -- src/content/quiz-difficulty-upgrade.test.ts src/components/content/VideoPlaceholderCard.test.tsx
```

Expected: both commands pass.

---

### Task 7: Final 七下 QA And Next-Stage Decision

**Files:**
- Modify: `progress.md`
- Modify: `docs/content-roadmap/g7-xia-video-production.md`

- [ ] **Step 1: Run full automated verification**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected: all commands pass.

- [ ] **Step 2: Start the local app**

Run:

```bash
npm run dev
```

Expected: Next.js dev server starts and prints a local URL, normally `http://localhost:3000`.

- [ ] **Step 3: Manual QA the 七下 catalog**

Open:

```text
http://localhost:3000/g7/xia/catalog
```

Check:

```markdown
- 第 1-6 章 all appear in order.
- 第 3、4、5、6 章 lessons open without runtime errors.
- 已接入视频 lessons show a playable video element.
- 未接入视频 lessons still show `视频占位`.
- 每章小测 still shows 10 questions.
- Question difficulty distribution remains 2 basic, 4 advanced, 4 challenge.
- Mobile viewport does not overlap video, lesson copy, or quiz controls.
```

- [ ] **Step 4: Update roadmap status**

In `docs/content-roadmap/g7-xia-video-production.md`, update the status table so each completed chapter row says:

```markdown
| 第 3 章 平面直角坐标系 | 完成 | 完成 | 完成 | 完成 | 完成 | 完成 |
| 第 4 章 二元一次方程组 | 完成 | 完成 | 完成 | 完成 | 完成 | 完成 |
| 第 5 章 一元一次不等式与一元一次不等式组 | 完成 | 完成 | 完成 | 完成 | 完成 | 完成 |
| 第 6 章 数据的收集、整理与描述 | 完成 | 完成 | 完成 | 完成 | 完成 | 完成 |
```

- [ ] **Step 5: Record completion**

Append to `progress.md`:

```markdown

## 2026-05-24
- 七年级下册第 3、4、5、6 章视频接入计划完成。
- 已运行：`npm run typecheck`、`npm test`、`npm run build`。
- 七下整册下一阶段建议：优先复核第 1、2 章视频接入，再开始八年级上册视频化。
```

- [ ] **Step 6: Commit final QA docs**

Run:

```bash
git add progress.md docs/content-roadmap/g7-xia-video-production.md
git commit -m "docs: record grade 7 lower volume video completion"
```

Expected: commit succeeds when the repository is initialized. If this workspace has no `.git`, leave the docs updated and note that commits are unavailable in this folder.

---

## Self-Review

**Spec coverage:** The plan starts from the completed 第五章 state, preserves the existing curriculum data, adds a route for real video playback, and sequences the remaining 七下 video work through 第 3、4、6 章 plus final QA.

**Placeholder scan:** No `TBD`, `TODO`, or open-ended implementation placeholders remain. Script tasks include concrete chapter spines and exact required terms.

**Type consistency:** The new optional fields are consistently named `src`, `posterSrc`, and `status` in `src/types/content.ts`, component tests, component rendering, and curriculum metadata tasks.

---

## Execution Options

Plan complete and saved to `docs/superpowers/plans/2026-05-24-g7-xia-after-unit-5-roadmap.md`. Two execution options:

**1. Subagent-Driven (recommended)** - dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - execute tasks in this session using executing-plans, batch execution with checkpoints

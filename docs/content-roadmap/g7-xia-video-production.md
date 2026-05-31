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

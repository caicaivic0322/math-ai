# Progress

## 2026-04-12
- 初始化本轮“习题整体提难”工作记录
- 目标锁定为：继续完善其他课程，并整体提高习题难度
- 已完成：
  - 使用技能：`brainstorming`、`planning-with-files`
  - 建立持久化计划文件
  - 新增章节：`g7-xia-unit-2`、`g8-shang-unit-2`、`g9-shang-unit-2`
  - 新增章节：`g7-xia-unit-3`
  - 新增章节：`g7-xia-unit-4`
  - 新增章节：`g7-xia-unit-5`
  - 新增章节：`g7-xia-unit-6`
  - 更新回归测试，使其自动覆盖全部已接入单元
- 进行中：
  - 继续沿七下向后补章节

## 2026-04-13
- 新增章节：`g8-shang-unit-3`、`g8-shang-unit-4`、`g8-shang-unit-5`
- 新增章节：`g9-shang-unit-3`、`g9-shang-unit-4`、`g9-shang-unit-5`
- 更新 `src/content/curriculum/index.ts` 与 `src/content/index.ts`，把新增章节全部接入聚合入口
- 运行 `src/content/quiz-difficulty-upgrade.test.ts`，确认课程切片总数提升到 20 且覆盖测试通过
- 正在进行：全量类型检查、测试与构建验证
- 新增章节：`g8-xia-unit-1`、`g8-xia-unit-2`、`g8-xia-unit-3`、`g8-xia-unit-4`、`g8-xia-unit-5`
- 新增章节：`g9-xia-unit-1`、`g9-xia-unit-2`、`g9-xia-unit-3`、`g9-xia-unit-4`
- 更新 `src/content/quiz-difficulty-upgrade.test.ts`，把覆盖目标提升到 29 个单元切片
- 再次更新 `src/content/curriculum/index.ts` 与 `src/content/index.ts`，把八下、九下章节全部接入
- 已完成：类型检查、全量测试与构建验证，确认新增册别接入无报错

## 2026-05-24
- 七下第五章视频包已完成到可作为模板的状态。
- 下一阶段目标：补齐七下第 3、4、6 章视频，并把七下视频接入课程页。
- 新增内容路线图：`docs/content-roadmap/g7-xia-video-production.md`
- 关联执行计划：`docs/superpowers/plans/2026-05-24-g7-xia-after-unit-5-roadmap.md`
- Task 2: Added playable lesson video metadata support in `src/types/content.ts`, `src/components/content/VideoPlaceholderCard.tsx`, and `src/components/content/VideoPlaceholderCard.test.tsx`.
- Commit fallback: workspace has no `.git`; recorded changes here instead of committing `feat: support playable lesson videos`.
- Task 3: Connected the completed Unit 5 lesson video to both 七下第五章 lessons.
- Changed files: `public/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.mp4`, `public/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.jpg`, `src/content/curriculum/g7-xia-unit-5.ts`.
- Commit fallback: workspace has no `.git`; recorded changes here instead of committing `feat: connect grade 7 unit 5 lesson video`.

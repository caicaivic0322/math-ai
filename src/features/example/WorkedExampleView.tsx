import type { KnowledgePointLesson, WorkedExample } from "@/types/content";

import {
  ContentSectionCard,
  RelatedContentItem,
  RelatedContentList,
} from "@/components/content";
import { Badge, Card } from "@/components/ui";

type WorkedExampleViewProps = {
  example: WorkedExample;
  relatedLessons?: KnowledgePointLesson[];
  relatedLessonItems?: RelatedContentItem[];
  className?: string;
};

export function WorkedExampleView({
  example,
  relatedLessons = [],
  relatedLessonItems,
  className,
}: WorkedExampleViewProps) {
  const lessonItems =
    relatedLessonItems ??
    relatedLessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      summary: lesson.summary,
      label: "相关知识点",
    }));

  return (
    <article className={className}>
      <div className="space-y-6">
        <Card
          variant="elevated"
          className="poster-panel animate-fade-up overflow-visible rounded-[2.4rem] border-[color-mix(in_oklch,var(--color-accent)_22%,var(--color-border))] bg-[linear-gradient(145deg,color-mix(in_oklch,var(--color-surface)_84%,white)_0%,color-mix(in_oklch,var(--color-accent)_18%,white)_68%,color-mix(in_oklch,var(--color-primary-soft)_20%,white)_100%)]"
        >
          <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr] lg:items-end">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary">典型例题</Badge>
                <Badge variant="neutral">{example.steps.length} 步拆解</Badge>
                <Badge variant="warning">{example.commonMistakes.length} 个易错点</Badge>
              </div>

              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-accent)]">
                  Worked Example
                </p>
                <h1 className="text-[clamp(2.2rem,4.3vw,4.5rem)] font-semibold tracking-[-0.06em]">
                  {example.title}
                </h1>
                <p className="max-w-3xl text-base leading-8 text-[var(--color-text-muted)]">
                  {example.summary}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="animate-pop-in rounded-[1.8rem] border border-[var(--color-border)] bg-white/84 p-5 shadow-[var(--shadow-sm)]">
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  解题节奏
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                  审题
                  <br />
                  拆步
                  <br />
                  回答
                </p>
              </div>
              <div className="animate-float translate-x-2 rounded-[1.8rem] bg-[var(--color-text)] p-5 text-[var(--color-primary-foreground)] shadow-[var(--shadow-md)]">
                <p className="text-sm uppercase tracking-[0.18em] text-white/68">
                  Score Tip
                </p>
                <p className="mt-3 text-lg font-semibold leading-8">
                  每一步都解释“为什么这样做”，更容易把方法学会。
                </p>
              </div>
            </div>
          </div>
        </Card>

        <ContentSectionCard
          className="animate-fade-up"
          eyebrow="审题"
          title="题目条件"
          description="先把题意翻译成数学关系，再进入运算步骤。"
          accent="primary"
        >
          <div className="rounded-[1.5rem] bg-[var(--color-background)] px-5 py-4 text-base leading-8 text-[var(--color-text)]">
            {example.problem}
          </div>
        </ContentSectionCard>

        <ContentSectionCard
          className="animate-fade-up"
          eyebrow="解题步骤"
          title="一步一步拆给你看"
          description="每一步都尽量说明“为什么这么做”，帮助学生形成方法感。"
        >
          <ol className="stagger-children space-y-4">
            {example.steps.map((step, index) => (
              <li key={step.id} className="flex gap-3 sm:gap-4">
                <div className="flex shrink-0 flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-primary-foreground)]">
                    {index + 1}
                  </div>
                  {index < example.steps.length - 1 ? (
                    <div className="mt-2 h-full min-h-10 w-px bg-[var(--color-border)]" />
                  ) : null}
                </div>

                <Card className="flex-1 rounded-[1.6rem] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-surface)_90%,white)_0%,color-mix(in_oklch,var(--color-primary-soft)_12%,white)_100%)]">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold tracking-[-0.02em]">{step.title}</h3>
                    <p className="text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
                      {step.content}
                    </p>
                  </div>
                </Card>
              </li>
            ))}
          </ol>
        </ContentSectionCard>

        <ContentSectionCard
          className="animate-fade-up"
          eyebrow="结论"
          title="最终答案"
          description="做完最后一步后，别忘了回到题目语境写完整答案。"
          accent="success"
        >
          <div className="rounded-[1.5rem] border border-[color-mix(in_oklch,var(--color-success),white_45%)] bg-[color-mix(in_oklch,var(--color-success),white_88%)] px-5 py-4">
            <p className="text-sm text-[var(--color-text-muted)]">答案</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text)]">
              {example.answer}
            </p>
          </div>
        </ContentSectionCard>

        <ContentSectionCard
          className="animate-fade-up"
          eyebrow="避坑"
          title="常见错误与失分提醒"
          description="考试里常错的地方单独拎出来，复习时优先看。"
          accent="warning"
        >
          <ul className="grid gap-3">
            {example.commonMistakes.map((mistake, index) => (
              <li
                key={`${mistake}-${index}`}
                className="rounded-[1.25rem] border border-[color-mix(in_oklch,var(--color-warning),white_42%)] bg-[color-mix(in_oklch,var(--color-warning),white_93%)] px-4 py-3 text-sm leading-7 text-[var(--color-text)]"
              >
                {mistake}
              </li>
            ))}
          </ul>
        </ContentSectionCard>

        <RelatedContentList
          title="回看这些知识点会更稳"
          items={lessonItems}
          emptyMessage="当前例题还没有配置关联知识点。"
          className="animate-fade-up rounded-[2rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-surface)_86%,white)_0%,color-mix(in_oklch,var(--color-primary-soft)_14%,white)_100%)] p-6 shadow-[var(--shadow-sm)]"
        />
      </div>
    </article>
  );
}

import type { KnowledgePointLesson, WorkedExample } from "@/types/content";

import {
  ContentBlockRenderer,
  ContentChecklist,
  ContentSectionCard,
  RelatedContentItem,
  RelatedContentList,
  VideoPlaceholderCard,
} from "@/components/content";
import { Badge, Card } from "@/components/ui";

type LessonContentViewProps = {
  lesson: KnowledgePointLesson;
  relatedExamples?: WorkedExample[];
  relatedExampleItems?: RelatedContentItem[];
  className?: string;
};

export function LessonContentView({
  lesson,
  relatedExamples = [],
  relatedExampleItems,
  className,
}: LessonContentViewProps) {
  const exampleItems =
    relatedExampleItems ??
    relatedExamples.map((example) => ({
      id: example.id,
      title: example.title,
      summary: example.summary,
      label: "关联例题",
    }));

  return (
    <article className={className}>
      <div className="space-y-6">
        <Card
          variant="elevated"
          className="poster-panel animate-fade-up overflow-visible rounded-[2.4rem] border-[color-mix(in_oklch,var(--color-primary)_18%,var(--color-border))] bg-[linear-gradient(140deg,color-mix(in_oklch,var(--color-surface)_82%,white)_0%,color-mix(in_oklch,var(--color-primary-soft)_48%,white)_70%,color-mix(in_oklch,var(--color-accent)_12%,white)_100%)]"
        >
          <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr] lg:items-end">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary">知识点精讲</Badge>
                <Badge variant="neutral">{lesson.learningObjectives.length} 个学习目标</Badge>
                <Badge variant="neutral">{lesson.keyRules.length} 条核心规则</Badge>
              </div>

              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">
                  Lesson Focus
                </p>
                <h1 className="text-[clamp(2.2rem,4.3vw,4.5rem)] font-semibold tracking-[-0.06em]">
                  {lesson.title}
                </h1>
                <p className="max-w-3xl text-base leading-8 text-[var(--color-text-muted)]">
                  {lesson.summary}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="animate-pop-in rounded-[1.8rem] border border-[var(--color-border)] bg-white/84 p-5 shadow-[var(--shadow-sm)]">
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  学习建议
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                  先看规则
                  <br />
                  再做例题
                </p>
              </div>
              <div className="animate-float translate-x-2 rounded-[1.8rem] bg-[var(--color-text)] p-5 text-[var(--color-primary-foreground)] shadow-[var(--shadow-md)]">
                <p className="text-sm uppercase tracking-[0.18em] text-white/68">
                  Memory Tip
                </p>
                <p className="mt-3 text-lg font-semibold leading-8">
                  用“概念 + 规则 + 易错点”三段式记忆，会更稳。
                </p>
              </div>
            </div>
          </div>
        </Card>

        <ContentSectionCard
          className="animate-fade-up"
          eyebrow="先明确本课目标"
          title="学完这一课，你要会什么"
          description="先带着目标学习，更容易抓住考试常考点。"
          accent="primary"
        >
          <ContentChecklist items={lesson.learningObjectives} tone="success" />
        </ContentSectionCard>

        <ContentSectionCard
          className="animate-fade-up"
          eyebrow="提分关键"
          title="本课核心规则"
          description="这些规则建议优先背熟，再配合例题做题。"
          accent="success"
        >
          <ContentChecklist items={lesson.keyRules} tone="primary" />
        </ContentSectionCard>

        {lesson.videoPlaceholder ? (
          <div className="animate-fade-up">
            <VideoPlaceholderCard video={lesson.videoPlaceholder} />
          </div>
        ) : null}

        <ContentSectionCard
          className="animate-fade-up"
          eyebrow="知识讲解"
          title="按知识块理解与记忆"
          description="内容采用短段落与方法卡片呈现，方便手机端逐段消化。"
        >
          <ContentBlockRenderer blocks={lesson.bodyBlocks} />
        </ContentSectionCard>

        <RelatedContentList
          title="学完可以立刻练的关联例题"
          items={exampleItems}
          emptyMessage="当前知识点还没有配置关联例题。"
          className="animate-fade-up rounded-[2rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-surface)_86%,white)_0%,color-mix(in_oklch,var(--color-accent)_10%,white)_100%)] p-6 shadow-[var(--shadow-sm)]"
        />
      </div>
    </article>
  );
}

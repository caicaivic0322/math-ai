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
            aria-label={video.title}
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

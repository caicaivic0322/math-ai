import Link from "next/link";

import { getPublishedGradeVolumeEntries } from "../lib/content";
import {
  getGradeLabel,
  getVolumeLabel,
  routePaths,
} from "../lib/routes";

const entryCards = getPublishedGradeVolumeEntries().map(({ grade, volume }) => ({
  grade: grade.id,
  volume: volume.id,
  href: routePaths.gradeVolume(grade.id, volume.id),
}));

export default function HomePage() {
  return (
    <main className="flex-1 pb-12">
      <section className="poster-panel paper-grid overflow-hidden rounded-[2.5rem] border border-[color-mix(in_oklch,var(--color-primary)_16%,var(--color-border))] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--color-surface)_86%,white)_0%,color-mix(in_oklch,var(--color-primary-soft)_40%,white)_55%,color-mix(in_oklch,var(--color-accent)_18%,white)_100%)] p-6 shadow-[var(--shadow-lg)] sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--color-text)] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary-foreground)]">
                Math Sprint
              </span>
              <span className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-sm text-[var(--color-text-muted)]">
                清爽明亮 · 学习卡片 · 青春海报感
              </span>
            </div>

            <h1 className="mt-6 max-w-4xl text-[clamp(2.8rem,6vw,5.8rem)] font-semibold leading-[0.93] tracking-[-0.06em] text-[var(--color-text)]">
              数学学习
              <span className="ml-2 inline-block -rotate-2 rounded-[1.4rem] bg-[var(--color-accent)] px-4 py-1 text-[var(--color-accent-foreground)] shadow-[var(--shadow-md)]">
                更轻快
              </span>
              <br />
              也更有冲劲
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-text-muted)] sm:text-lg">
              从教材目录直达知识点、例题和单元测验，把“学懂一章”做成一条干净、明亮、带节奏感的学习路径。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={routePaths.gradeVolume("g7", "shang")}
                className="rounded-full bg-[var(--color-text)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-[var(--shadow-md)] transition hover:-translate-y-0.5"
              >
                从七年级上册开始
              </Link>
              <span className="rounded-full border border-[var(--color-border)] bg-white/70 px-5 py-3 text-sm text-[var(--color-text-muted)]">
                人教版同步学习平台
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rotate-[-3deg] rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-5 shadow-[var(--shadow-md)]">
              <p className="text-sm text-[var(--color-primary)]">学习主线</p>
              <p className="mt-3 text-2xl font-semibold leading-tight">目录 → 知识点 → 例题 → 测验</p>
            </div>
            <div className="translate-x-3 rounded-[2rem] bg-[var(--color-text)] p-5 text-[var(--color-primary-foreground)] shadow-[var(--shadow-md)]">
              <p className="text-sm uppercase tracking-[0.2em] text-white/70">Current Focus</p>
              <p className="mt-3 text-3xl font-semibold">七年级上册</p>
              <p className="mt-2 text-sm leading-7 text-white/78">已经接入 4 个章节，可直接浏览目录、知识点、例题和测验结果页。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">Choose Your Track</p>
            <h2 className="mt-2 text-[clamp(1.8rem,3.2vw,3rem)] font-semibold tracking-[-0.05em]">
              选择年级与册次
            </h2>
          </div>
          <p className="hidden max-w-md text-sm leading-7 text-[var(--color-text-muted)] md:block">
            每个入口都保持同一套学习节奏，但页面信息会随章节内容逐步加深。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entryCards.map((card) => (
          <Link
            key={`${card.grade}-${card.volume}`}
            href={card.href}
            className="group poster-panel rounded-[2rem] border border-[color-mix(in_oklch,var(--color-border)_90%,var(--color-primary))] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-surface)_85%,white)_0%,color-mix(in_oklch,var(--color-primary-soft)_26%,white)_100%)] p-5 transition duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)]/50 hover:shadow-[var(--shadow-lg)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  年级
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                  {getGradeLabel(card.grade)}
                </h2>
              </div>
              <span className="rounded-full border border-[var(--color-primary)]/20 bg-white/80 px-3 py-1 text-sm font-medium text-[var(--color-primary)]">
                {getVolumeLabel(card.volume)}
              </span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-[var(--color-accent)]" />
              <span className="h-3 w-16 rounded-full bg-[color-mix(in_oklch,var(--color-primary)_20%,white)]" />
            </div>

            <p className="mt-5 max-w-xs text-sm leading-7 text-[var(--color-text-muted)]">
              进入该册教材入口，查看目录、章节学习中心和后续的单元内容。
            </p>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-text)]">立即进入</span>
              <span className="rounded-full bg-[var(--color-text)] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[var(--color-primary-foreground)]">
                Start
              </span>
            </div>
          </Link>
        ))}
        </div>
      </section>
    </main>
  );
}

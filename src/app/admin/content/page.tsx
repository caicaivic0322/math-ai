import Link from "next/link";

import { Card, EmptyState, SectionHeader } from "@/components/ui";
import { AdminContentClient } from "@/app/admin/content/AdminContentClient";
import { getCurriculumCoverageSummary } from "@/lib/content";
import {
  createJsonLearningContentRepository,
  createSqliteLearningContentRepository,
  searchSqliteAdminContent,
  getSqliteRecentWorkflowFeed,
  getSqliteContentWorkflowStatusSummary,
  listSqliteChapterSummaries,
  listSqliteLessonSummaries,
  listSqliteQuizQuestionSummaries,
  listSqliteQuizSummaries,
  listSqliteWorkedExampleSummaries,
  type SqliteContentEntityKind,
  type SqliteContentRecordStatus,
} from "@/lib/content-store";
import { resolveCurriculumContentSourceConfig } from "@/lib/content/source";
import { routePaths } from "@/lib/routes";

export const dynamic = "force-dynamic";

const WORKFLOW_PAGE_SIZE = 8;

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    workflowStatus?: string;
    workflowKind?: string;
    workflowPage?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const searchQuery = normalizeSearchQuery(resolvedSearchParams?.q);
  const workflowStatusFilter = parseWorkflowStatusFilter(resolvedSearchParams?.workflowStatus);
  const workflowKindFilter = parseWorkflowEntityKindFilter(resolvedSearchParams?.workflowKind);
  const workflowPage = parsePositiveInt(resolvedSearchParams?.workflowPage, 1);
  const workflowOffset = (workflowPage - 1) * WORKFLOW_PAGE_SIZE;
  const sourceConfig = resolveCurriculumContentSourceConfig();
  const jsonStoreSummary = createJsonLearningContentRepository().getSummary();
  const sqliteSummary = createSqliteLearningContentRepository().getSummary();
  const recentChapters = sqliteSummary.exists
    ? listSqliteChapterSummaries(undefined, { limit: 6, query: searchQuery })
    : [];
  const recentLessons = sqliteSummary.exists
    ? listSqliteLessonSummaries(undefined, { limit: 8, query: searchQuery })
    : [];
  const recentWorkedExamples = sqliteSummary.exists
    ? listSqliteWorkedExampleSummaries(undefined, { limit: 6, query: searchQuery })
    : [];
  const recentQuizzes = sqliteSummary.exists
    ? listSqliteQuizSummaries(undefined, { limit: 6, query: searchQuery })
    : [];
  const recentQuestions = sqliteSummary.exists
    ? listSqliteQuizQuestionSummaries(undefined, { limit: 8, query: searchQuery })
    : [];
  const workflowSummary = sqliteSummary.exists
    ? getSqliteContentWorkflowStatusSummary()
    : {
      totalCount: 0,
      draftCount: 0,
      publishedCount: 0,
      updatedAt: undefined,
      byEntityKind: [],
    };
  const workflowFeed = sqliteSummary.exists
    ? getSqliteRecentWorkflowFeed(undefined, {
      limit: WORKFLOW_PAGE_SIZE,
      offset: workflowOffset,
      status: workflowStatusFilter,
      entityKind: workflowKindFilter,
      query: searchQuery,
    })
    : {
      items: [],
      totalCount: 0,
      limit: WORKFLOW_PAGE_SIZE,
      offset: workflowOffset,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  const searchResults = sqliteSummary.exists && searchQuery
    ? searchSqliteAdminContent(undefined, {
      query: searchQuery,
      perEntityLimit: 4,
    })
    : undefined;
  const curriculumSummary = getCurriculumCoverageSummary();
  const summaryCards = [
    { label: "年级", value: curriculumSummary.gradeCount },
    { label: "册次", value: curriculumSummary.volumeCount },
    { label: "章节", value: curriculumSummary.chapterCount },
    { label: "课时", value: curriculumSummary.lessonCount },
    { label: "例题", value: curriculumSummary.workedExampleCount },
    { label: "测验题", value: curriculumSummary.questionCount },
  ];

  return (
    <main className="flex-1 pb-12">
      <section className="rounded-[2rem] border border-[color-mix(in_oklch,var(--color-primary)_16%,var(--color-border))] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--color-surface)_90%,white)_0%,color-mix(in_oklch,var(--color-primary-soft)_38%,white)_100%)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
        <SectionHeader
          eyebrow="Admin Console"
          title="内容仓储后台"
          description="查看当前课程内容源、JSON 仓储与 SQLite 状态，并从后台进入章节、课时、例题、测验和题目的数据库编辑链路。"
          action={(
            <div className="flex flex-wrap gap-3">
              <Link
                href={routePaths.home()}
                className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-sm text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                返回首页
              </Link>
              <Link
                href={routePaths.formulaStudio()}
                className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-sm text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                公式工作台
              </Link>
              <Link
                href={routePaths.adminIdentity()}
                className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-sm text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                身份设置
              </Link>
            </div>
          )}
        />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.label} className="rounded-[1.75rem]">
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              {card.label}
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">{card.value}</p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">当前前台可读取的课程内容规模</p>
          </Card>
        ))}
      </section>

      <section className="mt-8">
        <Card className="rounded-[2rem]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-primary)]">Admin Identity</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">后台身份入口</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                当前编辑者已升级为会话级身份，统一在独立页面维护，供所有 workflow 操作自动带入。
              </p>
            </div>
            <Link
              href={routePaths.adminIdentity()}
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-2 text-sm text-white transition hover:opacity-90"
            >
              打开身份设置
            </Link>
          </div>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <Card className="rounded-[2rem]">
          <div className="space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-primary)]">
                Active Source
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">当前内容源模式</h2>
            </div>

            <div className="space-y-3 rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4 text-sm leading-7">
              <p><strong>CURRICULUM_SOURCE_KIND：</strong>{sourceConfig.sourceKind}</p>
              <p><strong>数据库后端：</strong>{sourceConfig.databaseBackendKind}</p>
              <p><strong>课程快照：</strong>{sourceConfig.jsonPath}</p>
              <p><strong>JSON 仓储：</strong>{sourceConfig.contentStorePath}</p>
              <p><strong>SQLite 数据库：</strong>{sourceConfig.contentDatabasePath}</p>
              <p>
                <strong>当前数据库状态：</strong>
                {sourceConfig.databaseBackendKind === "sqlite"
                  ? (sqliteSummary.exists ? "SQLite 可用，可直接切到 database + sqlite" : "SQLite 尚未导入")
                  : (jsonStoreSummary.exists ? "JSON 仓储可用，可切到 database 模式读取" : "JSON 仓储尚未导入")}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-[2rem]">
          <div className="space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
                JSON Store
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">content-store 摘要</h2>
            </div>

            <div className="space-y-3 rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4 text-sm leading-7">
              <p><strong>状态：</strong>{jsonStoreSummary.exists ? "已写入" : "未写入"}</p>
              <p><strong>Schema：</strong>{jsonStoreSummary.schemaVersion}</p>
              <p><strong>导入时间：</strong>{jsonStoreSummary.importedAt ?? "尚未导入"}</p>
              <p><strong>来源快照：</strong>{jsonStoreSummary.sourceSnapshotPath ?? "尚未记录"}</p>
              <p><strong>章节 / 课时 / 题目：</strong>{jsonStoreSummary.chapterCount} / {jsonStoreSummary.lessonCount} / {jsonStoreSummary.questionCount}</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-[2rem]">
          <div className="space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-success)]">
                SQLite DB
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">SQLite 摘要</h2>
            </div>

            <div className="space-y-3 rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4 text-sm leading-7">
              <p><strong>状态：</strong>{sqliteSummary.exists ? "已写入" : "未写入"}</p>
              <p><strong>Schema：</strong>{sqliteSummary.schemaVersion}</p>
              <p><strong>导入时间：</strong>{sqliteSummary.importedAt ?? "尚未导入"}</p>
              <p><strong>来源快照：</strong>{sqliteSummary.sourceSnapshotPath ?? "尚未记录"}</p>
              <p><strong>章节 / 课时 / 题目：</strong>{sqliteSummary.chapterCount} / {sqliteSummary.lessonCount} / {sqliteSummary.questionCount}</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card className="rounded-[2rem]">
          <div className="space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-success)]">
                Workflow Summary
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">发布状态摘要</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                聚合章节、课时、例题、测验、题目的草稿与发布状态，便于快速判断后台发布进度。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.2rem] border border-[var(--color-border)] bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">总记录</p>
                <p className="mt-2 text-2xl font-semibold">{workflowSummary.totalCount}</p>
              </div>
              <div className="rounded-[1.2rem] border border-[var(--color-border)] bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">草稿</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-primary)]">{workflowSummary.draftCount}</p>
              </div>
              <div className="rounded-[1.2rem] border border-[var(--color-border)] bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">已发布</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-success)]">{workflowSummary.publishedCount}</p>
              </div>
            </div>

            <div className="space-y-2 rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4 text-sm">
              {workflowSummary.byEntityKind.map((bucket) => (
                <div key={bucket.entityKind} className="flex items-center justify-between gap-3">
                  <span className="text-[var(--color-text-muted)]">{getEntityKindLabel(bucket.entityKind)}</span>
                  <span className="text-[var(--color-text)]">
                    {bucket.publishedCount}
                    {" "}
                    已发布 /
                    {" "}
                    {bucket.draftCount}
                    {" "}
                    草稿
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              最近更新：
              {workflowSummary.updatedAt ? workflowSummary.updatedAt.slice(0, 19).replace("T", " ") : "暂无"}
            </p>
          </div>
        </Card>

        <Card className="rounded-[2rem]">
          <div className="space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
                Recent Changes
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">最近变更</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                展示最新内容操作记录，可直接跳到对应编辑页继续处理。
              </p>
            </div>

            <form action={routePaths.adminContent()} className="rounded-[1.2rem] border border-[var(--color-border)] bg-white px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="search"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="搜索标题、题干、章节名"
                  className="min-w-0 flex-1 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm outline-none transition focus:border-[var(--color-primary)]"
                />
                {workflowStatusFilter ? (
                  <input type="hidden" name="workflowStatus" value={workflowStatusFilter} />
                ) : null}
                {workflowKindFilter ? (
                  <input type="hidden" name="workflowKind" value={workflowKindFilter} />
                ) : null}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-2 text-sm text-white transition hover:opacity-90"
                  >
                    搜索
                  </button>
                  <Link
                    href={buildWorkflowFilterHref({})}
                    className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    清空
                  </Link>
                </div>
              </div>
            </form>

            <div className="space-y-3 rounded-[1.2rem] border border-[var(--color-border)] bg-white px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {createWorkflowStatusFilters(
                  workflowStatusFilter,
                  workflowKindFilter,
                  searchQuery,
                ).map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={getFilterChipClassName(item.active)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {createWorkflowEntityFilters(
                  workflowKindFilter,
                  workflowStatusFilter,
                  searchQuery,
                ).map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={getFilterChipClassName(item.active)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {workflowFeed.items.length > 0 ? (
              <div className="space-y-3">
                {workflowFeed.items.map((entry) => (
                  <Link
                    key={`${entry.entityKind}-${entry.entityId}-${entry.version}-${entry.changedAt}`}
                    href={resolveWorkflowEntryHref(entry)}
                    className="block rounded-[1.2rem] border border-[var(--color-border)] bg-white px-4 py-3 transition hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-md)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-[var(--color-primary)]">{getEntityKindLabel(entry.entityKind)}</p>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        v
                        {entry.version}
                        {" · "}
                        {entry.status === "published" ? "已发布" : "草稿"}
                      </span>
                    </div>
                    <h3 className="mt-1 line-clamp-1 text-base font-medium text-[var(--color-text)]">{entry.title}</h3>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      {entry.summary}
                      {" · "}
                      {entry.changedAt.slice(0, 19).replace("T", " ")}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      操作者 {entry.actor}
                      {entry.reason ? ` · ${entry.reason}` : ""}
                    </p>
                  </Link>
                ))}
                <div className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-[var(--color-border)] bg-white px-4 py-3 text-sm">
                  <span className="text-[var(--color-text-muted)]">
                    共
                    {" "}
                    {workflowFeed.totalCount}
                    {" "}
                    条，当前第
                    {" "}
                    {workflowPage}
                    {" "}
                    页
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={buildWorkflowFilterHref({
                        query: searchQuery,
                        status: workflowStatusFilter,
                        entityKind: workflowKindFilter,
                        page: Math.max(1, workflowPage - 1),
                      })}
                      className={getPaginationButtonClassName(!workflowFeed.hasPreviousPage)}
                      aria-disabled={!workflowFeed.hasPreviousPage}
                    >
                      上一页
                    </Link>
                    <Link
                      href={buildWorkflowFilterHref({
                        query: searchQuery,
                        status: workflowStatusFilter,
                        entityKind: workflowKindFilter,
                        page: workflowPage + 1,
                      })}
                      className={getPaginationButtonClassName(!workflowFeed.hasNextPage)}
                      aria-disabled={!workflowFeed.hasNextPage}
                    >
                      下一页
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="暂无变更记录"
                description={searchQuery
                  ? `没有匹配“${searchQuery}”的变更记录，请尝试更换关键字。`
                  : "先在任一内容编辑页执行保存、发布或回滚，这里会自动出现最新工作流记录。"}
              />
            )}
          </div>
        </Card>
      </section>

      {searchResults ? (
        <section className="mt-8">
          <Card className="rounded-[2rem]">
            <div className="space-y-5">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-primary)]">
                  Unified Search
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">统一搜索结果</h2>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                  关键字“{searchResults.query}”共命中 {searchResults.totalCount} 条结果，按实体类型分组展示。
                </p>
              </div>

              {searchResults.groups.length > 0 ? (
                <div className="space-y-6">
                  {searchResults.groups.map((group) => (
                    <div key={group.entityKind} className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold">{getEntityKindLabel(group.entityKind)}</h3>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          命中 {group.totalCount} 条
                        </p>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        {group.results.map((result) => (
                          <Link
                            key={`${result.entityKind}-${result.entityId}`}
                            href={resolveWorkflowEntryHref(result)}
                            className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4 transition hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-md)]"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={getWorkflowStatusBadgeClassName(result.workflowStatus)}>
                                {result.workflowStatus === "published" ? "已发布" : "草稿"}
                              </span>
                              <span className="rounded-full bg-[color-mix(in_oklch,var(--color-accent),white_90%)] px-3 py-1 text-xs text-[var(--color-accent)]">
                                v{result.workflowVersion}
                              </span>
                              {result.matchSources.map((source) => (
                                <span
                                  key={source}
                                  className="rounded-full bg-[color-mix(in_oklch,var(--color-primary),white_90%)] px-3 py-1 text-xs text-[var(--color-primary)]"
                                >
                                  命中{source}
                                </span>
                              ))}
                            </div>
                            <h4 className="mt-3 line-clamp-2 text-lg font-semibold">{result.title}</h4>
                            {result.subtitle ? (
                              <p className="mt-2 text-sm text-[var(--color-text-muted)]">{result.subtitle}</p>
                            ) : null}
                            {result.description ? (
                              <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--color-text-muted)]">
                                {result.description}
                              </p>
                            ) : null}
                            {result.latestActionSummary ? (
                              <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                                最近变更：{getWorkflowActionLabel(result.latestAction)} · {result.latestActionSummary}
                                {result.latestActionActor ? ` · ${result.latestActionActor}` : ""}
                                {result.latestActionReason ? ` · ${result.latestActionReason}` : ""}
                              </p>
                            ) : null}
                            <div className="mt-4 flex items-center justify-between text-sm">
                              <div className="space-y-1 text-[var(--color-text-muted)]">
                                <span className="block">更新于 {result.updatedAt.slice(0, 10)}</span>
                                <span className="block">
                                  最近操作者 {result.updatedBy ?? "未知"}
                                </span>
                                <span className="block">
                                  {result.lastPublishedAt
                                    ? `最近发布 ${result.lastPublishedAt.slice(0, 10)}`
                                    : "尚未发布"}
                                </span>
                                {result.importBatchId ? (
                                  <span className="block">导入批次 {result.importBatchId}</span>
                                ) : null}
                              </div>
                              <span className="font-medium text-[var(--color-primary)]">进入编辑</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="没有匹配的内容结果"
                  description={`关键字“${searchResults.query}”没有命中章节、课时、例题、测验或题目。`}
                />
              )}
            </div>
          </Card>
        </section>
      ) : null}

      <section className="mt-8">
        <AdminContentClient
          defaultSnapshotPath={sourceConfig.jsonPath}
          defaultStorePath={sourceConfig.contentStorePath}
          defaultDatabasePath={sourceConfig.contentDatabasePath}
          jsonStoreExists={jsonStoreSummary.exists}
          sqliteExists={sqliteSummary.exists}
          jsonStoreImportedAt={jsonStoreSummary.importedAt}
          sqliteImportedAt={sqliteSummary.importedAt}
        />
      </section>

      <section className="mt-8">
        {recentChapters.length > 0 ? (
          <Card className="rounded-[2rem]">
            <div className="space-y-5">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Chapter Editor
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">SQLite 章节编辑入口</h2>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                  第九阶段新增章节编辑，可先维护章节标题与摘要，随后再继续扩展结构化内容字段。
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {recentChapters.map((chapter) => (
                  <Link
                    key={`${chapter.gradeId}-${chapter.volumeId}-${chapter.id}`}
                    href={routePaths.adminContentChapter(
                      chapter.gradeId,
                      chapter.volumeId,
                      chapter.id,
                    )}
                    className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4 transition hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-md)]"
                  >
                    <p className="text-sm text-[var(--color-primary)]">
                      {chapter.gradeId} · {chapter.volumeId}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{chapter.title}</h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--color-text-muted)]">
                      {chapter.summary}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-text-muted)]">
                      <span>{chapter.lessonCount} 课时 / {chapter.workedExampleCount} 例题</span>
                      <span className="font-medium text-[var(--color-primary)]">进入编辑</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        ) : null}
      </section>

      <section className="mt-8">
        {recentQuizzes.length > 0 ? (
          <Card className="rounded-[2rem]">
            <div className="space-y-5">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Quiz Editor
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">SQLite 测验编辑入口</h2>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                  第十阶段新增测验编辑，可维护标题、测验说明和及格线。
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {recentQuizzes.map((quiz) => (
                  <Link
                    key={`${quiz.gradeId}-${quiz.volumeId}-${quiz.id}`}
                    href={routePaths.adminContentQuiz(quiz.gradeId, quiz.volumeId, quiz.id)}
                    className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4 transition hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-md)]"
                  >
                    <p className="text-sm text-[var(--color-primary)]">
                      {quiz.gradeId} · {quiz.volumeId}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{quiz.title}</h3>
                    <p className="mt-2 text-sm text-[var(--color-text-muted)]">{quiz.chapterTitle}</p>
                    <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-text-muted)]">
                      <span>{quiz.questionCount} 题 / 及格线 {quiz.passingScore}</span>
                      <span className="font-medium text-[var(--color-primary)]">进入编辑</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        ) : null}
      </section>

      <section className="mt-8">
        {recentLessons.length > 0 ? (
          <Card className="rounded-[2rem]">
            <div className="space-y-5">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-primary)]">
                  Lesson Editor
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">SQLite 课时编辑入口</h2>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                  先从数据库里挑一个课时进入编辑页，当前第八阶段先开放标题、摘要、学习目标和关键规则的写回。
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {recentLessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={routePaths.adminContentLesson(lesson.id)}
                    className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4 transition hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-md)]"
                  >
                    <p className="text-sm text-[var(--color-primary)]">
                      {lesson.gradeId} · {lesson.volumeId}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{lesson.title}</h3>
                    <p className="mt-2 text-sm text-[var(--color-text-muted)]">{lesson.chapterTitle}</p>
                    <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--color-text-muted)]">
                      {lesson.summary}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">更新于 {lesson.updatedAt.slice(0, 10)}</span>
                      <span className="font-medium text-[var(--color-primary)]">进入编辑</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        ) : (
          <EmptyState
            title="还没有可编辑的 SQLite 课时"
            description="请先把课程快照导入 SQLite 数据库，随后这里会显示可进入的课时编辑入口。"
            actions={(
              <Link
                href={routePaths.adminContent()}
                className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-text)]"
              >
                返回导入区
              </Link>
            )}
          />
        )}
      </section>

      <section className="mt-8">
        {recentWorkedExamples.length > 0 ? (
          <Card className="rounded-[2rem]">
            <div className="space-y-5">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-success)]">
                  Example Editor
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">SQLite 例题编辑入口</h2>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                  第九阶段同步开放例题编辑，可修改题目、解答、步骤和易错点并写回 SQLite。
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {recentWorkedExamples.map((example) => (
                  <Link
                    key={`${example.gradeId}-${example.volumeId}-${example.id}`}
                    href={routePaths.adminContentWorkedExample(
                      example.gradeId,
                      example.volumeId,
                      example.id,
                    )}
                    className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4 transition hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-md)]"
                  >
                    <p className="text-sm text-[var(--color-primary)]">
                      {example.gradeId} · {example.volumeId}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{example.title}</h3>
                    <p className="mt-2 text-sm text-[var(--color-text-muted)]">{example.chapterTitle}</p>
                    <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--color-text-muted)]">
                      {example.summary}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">更新于 {example.updatedAt.slice(0, 10)}</span>
                      <span className="font-medium text-[var(--color-primary)]">进入编辑</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        ) : null}
      </section>

      <section className="mt-8">
        {recentQuestions.length > 0 ? (
          <Card className="rounded-[2rem]">
            <div className="space-y-5">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-primary)]">
                  Question Editor
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">SQLite 题目编辑入口</h2>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                  第十阶段同步开放题目编辑，可修改题干、解析、关联内容和题型专属 JSON 配置。
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {recentQuestions.map((question) => (
                  <Link
                    key={`${question.gradeId}-${question.volumeId}-${question.id}`}
                    href={routePaths.adminContentQuizQuestion(
                      question.gradeId,
                      question.volumeId,
                      question.id,
                    )}
                    className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4 transition hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-md)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-[var(--color-primary)]">
                        {question.gradeId} · {question.volumeId}
                      </p>
                      <span className="rounded-full bg-[color-mix(in_oklch,var(--color-primary),white_88%)] px-3 py-1 text-xs text-[var(--color-primary)]">
                        {question.type}
                      </span>
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-lg font-semibold">{question.stem}</h3>
                    <p className="mt-2 text-sm text-[var(--color-text-muted)]">{question.chapterTitle}</p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">难度 {question.difficulty}</span>
                      <span className="font-medium text-[var(--color-primary)]">进入编辑</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        ) : null}
      </section>
    </main>
  );
}

function getEntityKindLabel(entityKind: SqliteContentEntityKind) {
  switch (entityKind) {
    case "chapter":
      return "章节";
    case "lesson":
      return "课时";
    case "worked-example":
      return "例题";
    case "quiz":
      return "测验";
    case "quiz-question":
      return "题目";
    default:
      return entityKind;
  }
}

function createWorkflowStatusFilters(
  activeStatus: SqliteContentRecordStatus | undefined,
  activeEntityKind: SqliteContentEntityKind | undefined,
  query: string | undefined,
) {
  const options: Array<{ label: string; status?: SqliteContentRecordStatus }> = [
    { label: "全部状态" },
    { label: "草稿", status: "draft" },
    { label: "已发布", status: "published" },
  ];

  return options.map((item) => ({
    label: item.label,
    active: activeStatus === item.status || (!activeStatus && !item.status),
    href: buildWorkflowFilterHref({
      query,
      status: item.status,
      entityKind: activeEntityKind,
    }),
  }));
}

function createWorkflowEntityFilters(
  activeEntityKind: SqliteContentEntityKind | undefined,
  activeStatus: SqliteContentRecordStatus | undefined,
  query: string | undefined,
) {
  const options: Array<{ label: string; entityKind?: SqliteContentEntityKind }> = [
    { label: "全部实体" },
    { label: "章节", entityKind: "chapter" },
    { label: "课时", entityKind: "lesson" },
    { label: "例题", entityKind: "worked-example" },
    { label: "测验", entityKind: "quiz" },
    { label: "题目", entityKind: "quiz-question" },
  ];

  return options.map((item) => ({
    label: item.label,
    active: activeEntityKind === item.entityKind || (!activeEntityKind && !item.entityKind),
    href: buildWorkflowFilterHref({
      query,
      status: activeStatus,
      entityKind: item.entityKind,
    }),
  }));
}

function buildWorkflowFilterHref(input: {
  query?: string;
  status?: SqliteContentRecordStatus;
  entityKind?: SqliteContentEntityKind;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (input.query) {
    params.set("q", input.query);
  }
  if (input.status) {
    params.set("workflowStatus", input.status);
  }
  if (input.entityKind) {
    params.set("workflowKind", input.entityKind);
  }
  if (input.page && input.page > 1) {
    params.set("workflowPage", String(input.page));
  }

  const query = params.toString();
  return query ? `${routePaths.adminContent()}?${query}` : routePaths.adminContent();
}

function getFilterChipClassName(active: boolean) {
  return [
    "rounded-full border px-3 py-1 text-xs transition",
    active
      ? "border-[var(--color-primary)] bg-[color-mix(in_oklch,var(--color-primary),white_88%)] text-[var(--color-primary)]"
      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
  ].join(" ");
}

function getPaginationButtonClassName(disabled: boolean) {
  return [
    "rounded-full border px-3 py-1 text-xs transition",
    disabled
      ? "pointer-events-none cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-muted)] opacity-50"
      : "border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
  ].join(" ");
}

function getWorkflowStatusBadgeClassName(status: SqliteContentRecordStatus) {
  return [
    "rounded-full px-3 py-1 text-xs",
    status === "published"
      ? "bg-[color-mix(in_oklch,var(--color-success),white_88%)] text-[var(--color-success)]"
      : "bg-[color-mix(in_oklch,var(--color-primary),white_88%)] text-[var(--color-primary)]",
  ].join(" ");
}

function getWorkflowActionLabel(action: string | undefined) {
  switch (action) {
    case "import":
      return "导入";
    case "update":
      return "更新";
    case "status-change":
      return "状态切换";
    case "rollback":
      return "回滚";
    default:
      return "变更";
  }
}

function parseWorkflowStatusFilter(value: string | undefined): SqliteContentRecordStatus | undefined {
  if (value === "draft" || value === "published") {
    return value;
  }

  return undefined;
}

function parseWorkflowEntityKindFilter(value: string | undefined): SqliteContentEntityKind | undefined {
  if (
    value === "chapter"
    || value === "lesson"
    || value === "worked-example"
    || value === "quiz"
    || value === "quiz-question"
  ) {
    return value;
  }

  return undefined;
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeSearchQuery(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function resolveWorkflowEntryHref(entry: {
  entityKind: SqliteContentEntityKind;
  entityId: string;
  gradeId?: string;
  volumeId?: string;
}) {
  switch (entry.entityKind) {
    case "chapter":
      return (entry.gradeId && entry.volumeId)
        ? routePaths.adminContentChapter(entry.gradeId, entry.volumeId, entry.entityId)
        : routePaths.adminContent();
    case "lesson":
      return routePaths.adminContentLesson(entry.entityId);
    case "worked-example":
      return (entry.gradeId && entry.volumeId)
        ? routePaths.adminContentWorkedExample(entry.gradeId, entry.volumeId, entry.entityId)
        : routePaths.adminContent();
    case "quiz":
      return (entry.gradeId && entry.volumeId)
        ? routePaths.adminContentQuiz(entry.gradeId, entry.volumeId, entry.entityId)
        : routePaths.adminContent();
    case "quiz-question":
      return (entry.gradeId && entry.volumeId)
        ? routePaths.adminContentQuizQuestion(entry.gradeId, entry.volumeId, entry.entityId)
        : routePaths.adminContent();
    default:
      return routePaths.adminContent();
  }
}

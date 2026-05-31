# Content And Storage Evolution

## Purpose

This document records the Phase 4 infrastructure direction for evolving the current math site from:

- local TypeScript curriculum files
- local JSON formula records
- local file-system generated assets

into a stack that can later support:

- CMS-backed curriculum editing
- question-bank persistence
- object-storage assets
- async rendering jobs

## Current State

### Content

- Curriculum content is still authored as local `src/content/curriculum/*.ts` slices.
- App routes do not read those files directly anymore.
- Route-facing helpers now go through a `CurriculumContentSource` abstraction.

### Formula Assets

- Formula rendering is handled by the backend RaTeX integration.
- Formula records are still persisted in local JSON for now.
- Access has been wrapped in a repository interface so the storage backend can be swapped later.

## New Abstractions

### Curriculum Content Source

Code:

- `src/lib/content/source.ts`
- `src/lib/content/index.ts`

Key idea:

- `source.ts` is now the single place that knows how to build a normalized curriculum snapshot.
- `index.ts` is a selector/helper layer that reads from the active content source.
- Today the active source is a static in-process source created from local curriculum slices.
- Later we can replace it with:
  - JSON file source
  - CMS fetch source
  - database-backed source

The app should continue importing from `src/lib/content/index.ts`, not from `src/content` directly.

### Formula Record Repository

Code:

- `src/lib/formula-records/repository.ts`

Key idea:

- the local JSON implementation remains the default
- access is now wrapped by `FormulaRecordRepository`
- `createJsonFormulaRecordRepository()` exposes the current implementation as a swappable adapter

Later this can be replaced by:

- Postgres repository
- Prisma repository
- service API adapter

### Storage Contracts

Code:

- `src/lib/storage/contracts.ts`

These types are not a full database schema. They are an application-facing contract for future persistence work:

- lesson record
- worked-example record
- quiz record
- quiz-question record
- formula asset pointer
- storage manifest

They provide a stable target for the next migration step without forcing an immediate database decision.

### Database-Ready Content Store

Code:

- `src/lib/content-store/repository.ts`
- `src/app/api/admin/content-import/route.ts`
- `src/app/admin/content/page.tsx`
- `scripts/import-curriculum-store.ts`

Key idea:

- `content-store.json` is now the local database-ready persistence shape for curriculum data.
- The store keeps normalized chapter, lesson, worked-example, quiz, and quiz-question records.
- The active curriculum source can now switch to `database` mode and rebuild the front-end snapshot from the local store.
- Import can be triggered either by CLI or by the admin API.

Current commands:

- `npm run export:curriculum-json`
- `npm run import:curriculum-store`
- `npm run import:curriculum-sqlite`

Current admin workflow:

- open `/admin/content`
- inspect the active source mode plus JSON / SQLite summaries
- import `curriculum.snapshot.json` into `content-store.json` or SQLite
- switch `CURRICULUM_SOURCE_KIND=database`
- set `CONTENT_DATABASE_BACKEND=json-store` or `CONTENT_DATABASE_BACKEND=sqlite`
- optionally override `CONTENT_DATABASE_PATH`

## Recommended Next Migration

### Step 1

- Keep local curriculum files as the authoring source
- Add JSON export/import tooling that produces the same snapshot shape as `CurriculumContentSource`

Status:

- done for JSON snapshots
- done for local database-ready store import

### Step 2

- Move formula records from local JSON to database tables
- Move generated SVG/PNG assets from local filesystem to object storage
- Keep hash-based deduplication unchanged

Status:

- content repository now has a real SQLite adapter
- admin import can write either JSON store or SQLite
- front-end read path can switch to SQLite-backed database mode

### Step 3

- Add admin editing workflows that update the SQLite content database
- Start with lesson-level metadata editing before expanding to chapter, example, and quiz editing

Status:

- lesson detail API is available at `/api/admin/content/lessons/[lessonId]`
- admin lesson editor page is available at `/admin/content/lessons/[lessonId]`
- current editable fields:
  - lesson title
  - lesson summary
  - learning objectives
  - key rules

### Step 4

- Expand admin editing from lessons to chapters and worked examples
- Use scoped database routes for chapter records because `chapter.id` can repeat across grades

Status:

- chapter detail API is available at `/api/admin/content/chapters/[gradeId]/[volumeId]/[chapterId]`
- worked example detail API is available at `/api/admin/content/worked-examples/[gradeId]/[volumeId]/[exampleId]`
- admin chapter editor page is available at `/admin/content/chapters/[gradeId]/[volumeId]/[chapterId]`
- admin worked example editor page is available at `/admin/content/worked-examples/[gradeId]/[volumeId]/[exampleId]`
- current editable fields:
  - chapter title
  - chapter summary
  - worked example title
  - worked example summary
  - worked example problem
  - worked example answer
  - worked example steps
  - worked example common mistakes

### Step 5

- Introduce question-bank persistence for:
  - quizzes
  - quiz questions
  - AI-generated explanations
  - formula bindings

Status:

- quiz detail API is available at `/api/admin/content/quizzes/[gradeId]/[volumeId]/[quizId]`
- quiz question detail API is available at `/api/admin/content/questions/[gradeId]/[volumeId]/[questionId]`
- admin quiz editor page is available at `/admin/content/quizzes/[gradeId]/[volumeId]/[quizId]`
- admin question editor page is available at `/admin/content/questions/[gradeId]/[volumeId]/[questionId]`
- current editable fields:
  - quiz title
  - quiz instructions
  - quiz passing score
  - question stem
  - question explanation
  - question related lessons
  - question related worked examples
  - question type-specific payload JSON

### Step 6

- Add admin/CMS workflows that write into the storage layer
- Keep front-end selectors stable by continuing to read through `lib/content`

Status:

- SQLite now stores workflow metadata plus append-only history for:
  - chapters
  - lessons
  - worked examples
  - quizzes
  - quiz questions
- import initializes each content record with an `import` history entry
- every content update appends a new versioned workflow entry
- admin workflow API is available at `/api/admin/content/workflow`
- admin editors now show a shared workflow panel with:
  - current status
  - current version
  - last published time
  - recent history
  - rollback action
- the current workflow model supports:
  - `draft`
  - `published`
  - `import`
  - `update`
  - `status-change`
  - `rollback`

## Guardrails

- Do not let route files import raw curriculum files directly.
- Do not let UI components depend on storage implementation details.
- Keep hash-based formula deduplication as a backend concern.
- Keep content-source replacement behind interfaces, not ad hoc conditionals spread across pages.

# Frontend Architecture Conventions

## Purpose

This document sets implementation boundaries for future subagents building the V1 junior high school math web app.

Assumptions:
- App will use Next.js App Router.
- Rendering strategy may mix static and server-rendered pages later, but V1 should optimize for simple content delivery.
- Content source is undecided; architecture should work with local mock content first and a CMS later.

## Component and Directory Conventions

Recommended top-level structure once implementation begins:

```text
app/
components/
features/
content/
lib/
types/
styles/
public/
docs/
```

### Directory responsibilities

#### `app/`

- Owns routes, layouts, loading states, and page composition only.
- Avoid business logic or raw content shaping directly inside route files.

#### `components/`

- Shared presentational UI pieces with no domain ownership.
- Examples: buttons, cards, section headers, content block renderers, score badges.

Suggested subfolders:

```text
components/ui/
components/layout/
components/content/
```

#### `features/`

- Owns domain-specific modules and page-level composition helpers.
- Split by business area rather than by generic technical type.

Suggested subfolders:

```text
features/curriculum/
features/lesson/
features/example/
features/quiz/
```

Each feature may contain:

- `components/`
- `helpers/`
- `types.ts`
- `constants.ts`

#### `content/`

- Stores mock curriculum content, content adapters, and future CMS mapping.
- Keep raw curriculum data separate from UI components.

Suggested subfolders:

```text
content/curriculum/
content/adapters/
```

#### `lib/`

- Cross-feature utilities only.
- Examples: slug helpers, score calculation helpers, formatting utilities.

#### `types/`

- Shared app-level TypeScript contracts.
- Only place truly cross-cutting types here; keep feature-local types inside the feature.

## Route File Convention

Use App Router folders that mirror curriculum structure closely.

Recommended route shape:

```text
app/
  page.tsx
  [grade]/
    [volume]/
      page.tsx
      catalog/
        page.tsx
        [chapterId]/
          page.tsx
          lessons/
            [lessonSlug]/
              page.tsx
          examples/
            [exampleSlug]/
              page.tsx
          quiz/
            page.tsx
            result/
              page.tsx
```

Conventions:

- Use dynamic params only for curriculum identifiers.
- Keep route folders semantic and shallow.
- Reserve route groups only if later design needs separate layout concerns.

## Component Convention

Recommended naming style:

- Shared UI: `PascalCase` components in singular form
- Domain components prefixed by area when ambiguity is likely

Examples:

- `GradeEntryCard`
- `UnitOverviewSection`
- `LessonContentRenderer`
- `WorkedExampleSteps`
- `QuizQuestionCard`
- `QuizResultSummary`

Guidelines:

- Prefer small composable components over large page-specific monoliths.
- Put quiz stateful logic in feature modules, not shared UI components.
- Keep content renderer components resilient to missing optional blocks.

## Content Model Placement

Future implementation should separate three layers:

1. Raw curriculum source
2. Normalized view model
3. UI rendering

This keeps content portability high if the app moves from static files to a CMS.

Suggested flow:

```text
content/curriculum/raw data
-> content/adapters/normalizers
-> features/* selectors/view-model builders
-> app routes and components
```

## Module Dependency Boundaries

The key rule is one-way dependency flow.

### Allowed dependency direction

- `app` -> `features` -> `components` / `content` / `lib`
- `features` -> `lib`
- `features` -> feature-local components
- `components` -> `lib`
- `content` -> `types`
- `lib` -> `types`

### Disallowed dependency direction

- `components` must not import from `app`
- Shared `components` must not import domain `features`
- `content` must not depend on UI components
- One feature should not reach into another feature's internals

### Future subagent ownership boundaries

- Curriculum agent:
  - owns curriculum structure, adapters, slugs, and lookup helpers
- Lesson/content agent:
  - owns lesson rendering, content block support, related-content wiring
- Example agent:
  - owns worked example display and step rendering
- Quiz agent:
  - owns quiz interaction, scoring, and result explanations
- Platform/UI agent:
  - owns layout, navigation shell, responsive styling, shared UI primitives

Use public entry files per feature later if collaboration gets busy:

```text
features/quiz/index.ts
features/lesson/index.ts
```

This helps prevent deep cross-feature imports.

## Recommended Implementation Order

### First wave

- Establish route skeleton for home, grade/volume, unit, lesson, example, quiz, and result pages.
- Define TypeScript content contracts and sample curriculum data for one unit slice.
- Build shared layout and mobile-first navigation primitives.
- Build lesson and worked example rendering for static content blocks.
- Build quiz flow with local state scoring and explanation-based result page.

Goal of first wave:
- Prove the full student journey from home -> learning -> quiz -> feedback.

### Second wave

- Expand curriculum coverage from one slice to all grades/volumes.
- Add richer content blocks such as formulas, highlighted tips, and board-style video placeholders.
- Introduce content loading abstraction so mock data can be replaced later.
- Improve discoverability with related lessons, related examples, and better unit landing summaries.
- Add quality layers such as empty states, basic error handling, and stronger SEO metadata.

Goal of second wave:
- Scale breadth and production readiness without changing core route or feature boundaries.

## Architecture Risks To Watch

- Overloading `app/` with business logic too early
- Mixing raw curriculum data with presentational formatting
- Letting quiz logic leak into generic components
- Choosing route params that are not stable across future content revisions

If these boundaries are kept early, multiple subagents can work in parallel with minimal merge conflict risk.

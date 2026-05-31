# Junior High Math Teaching Web App V1 Product Spec

## Scope

This document defines the V1 product structure for a web app focused on junior high school math teaching using the People's Education Press (人教版) curriculum.

Assumptions:
- Stack will be Next.js + TypeScript + Tailwind + App Router.
- Audience is student-first; teacher/admin workflows are out of scope for V1.
- Content is curated and mostly text + image, with optional short board-style video placeholders.
- Grades covered: 7, 8, 9.
- Each grade has two volumes: `shang` (上册) and `xia` (下册).

Out of scope for V1:
- User accounts and progress sync
- Teacher dashboards
- AI tutoring/chat
- Full video hosting workflow
- Rich analytics and gamification

## Product Goals

- Let students quickly enter their grade and volume from the home page.
- Organize learning around knowledge-point lessons, worked examples, and unit quizzes.
- Keep navigation simple on mobile and desktop.
- Show quiz score and explanation feedback immediately after submission.

## Page Map / Information Architecture

### Top-level pages

- Home
  - Grade 7 entry
  - Grade 8 entry
  - Grade 9 entry
- Grade + Volume landing
  - Unit list
  - Featured knowledge points
  - Continue-learning placeholder area
- Unit overview
  - Unit intro
  - Knowledge-point list
  - Worked examples list
  - Unit quiz entry
- Knowledge-point lesson
  - Concept explanation
  - Key formulas / rules
  - Example images / board notes
  - Related worked examples
  - Video placeholder
- Worked example detail
  - Problem statement
  - Step-by-step solution
  - Common mistakes
  - Related knowledge points
- Unit quiz
  - Quiz intro
  - Question list
  - Submit action
- Quiz result
  - Score
  - Per-question correctness
  - Explanation for each item
  - Suggested review links

### Recommended navigation depth

- Home -> Grade/Volume -> Catalog -> Unit -> Lesson / Example / Quiz
- Home -> Grade/Volume -> Featured lesson
- Quiz result should always link back to the originating unit.

## Route Naming Convention

Use lowercase, kebab-case URL segments for human-readable content IDs. Reserve short, stable structural segments for curriculum hierarchy.

### Primary route pattern

- `/`
- `/g7/shang`
- `/g7/xia`
- `/g8/shang`
- `/g8/xia`
- `/g9/shang`
- `/g9/xia`
- `/g7/shang/catalog`
- `/g7/shang/catalog/unit-1`
- `/g7/shang/catalog/unit-1/lessons/you-li-shu`
- `/g7/shang/catalog/unit-1/examples/you-li-shu-jia-jian-hun-he`
- `/g7/shang/catalog/unit-1/quiz`
- `/g7/shang/catalog/unit-1/quiz/result`

### Naming rules

- Grade segment: `g7`, `g8`, `g9`
- Volume segment: `shang`, `xia`
- Catalog segment: `catalog`
- Unit segment: `unit-{n}`
- Lesson detail segment: `lessons/{lesson-slug}`
- Example detail segment: `examples/{example-slug}`
- Quiz route: `quiz`
- Quiz result route: `quiz/result`

### Route notes

- Avoid exposing Chinese characters in route paths for V1; use pinyin or stable English slugs.
- Display labels in Chinese in the UI even when paths use pinyin/English slugs.
- Keep quiz result nested under the same unit path so context is preserved.

## Content Model Overview

V1 content can be managed as structured curriculum content, regardless of future storage choice.

### Core entities

#### Grade

- `id`: `g7 | g8 | g9`
- `label`: display name in Chinese
- `volumes`: list of volumes

#### Volume

- `id`: `shang | xia`
- `gradeId`
- `label`
- `units`

#### Unit

- `id`
- `gradeId`
- `volumeId`
- `slug`
- `title`
- `summary`
- `order`
- `coverImage` (optional)

#### Knowledge Point Lesson

- `id`
- `unitId`
- `slug`
- `title`
- `summary`
- `learningObjectives`
- `bodyBlocks` (text/image content blocks)
- `keyRules`
- `videoPlaceholder` (optional)
- `relatedExampleIds`
- `order`

#### Worked Example

- `id`
- `unitId`
- `slug`
- `title`
- `problem`
- `steps`
- `answer`
- `commonMistakes`
- `relatedLessonIds`
- `order`

#### Unit Quiz

- `id`
- `unitId`
- `title`
- `instructions`
- `questions`

#### Quiz Question

- `id`
- `quizId`
- `type` (single choice in V1 by default)
- `stem`
- `options`
- `correctAnswer`
- `explanation`
- `relatedLessonIds`

### Content modeling notes

- Prefer ordered arrays for lesson/example sequences.
- Body content should support mixed text and image blocks from the start.
- Video should be modeled as optional metadata, not required content.
- Quiz explanation is mandatory in V1 because result pages depend on it.

## Functional Notes By Page

### Home

- Shows grades 7, 8, 9 directly.
- Each grade card should expose both volumes without extra clicks where possible.

### Grade + Volume landing

- Lists units in reading order.
- Surfaces lesson and quiz entry points clearly for mobile users.

### Lesson / Example pages

- Keep content vertically scannable.
- Related links should stay within the same unit first.

### Quiz + Result

- Result page must show:
  - total score
  - correct / incorrect state per question
  - explanation per question
  - review links back to relevant lessons/examples

## Suggested V1 MVP Cut

- One complete curriculum slice should be enough to validate the architecture:
  - one grade
  - one volume
  - one unit
  - at least 2 lessons
  - at least 2 worked examples
  - one quiz with explanation data

This allows later agents to validate routing, rendering, and quiz feedback before scaling content breadth.

# JSON Content Source

## Purpose

Phase 5 adds a second curriculum source implementation so the app no longer depends only on in-repo TypeScript slices.

Current supported source kinds:

- `local-static`
- `json-file`

## Runtime Variables

- `CURRICULUM_SOURCE_KIND`
  - default: `local-static`
  - optional: `json-file`
- `CURRICULUM_JSON_PATH`
  - default: `data/curriculum.snapshot.json`
  - can be absolute or project-relative

## Export Command

Use the export command to generate a JSON snapshot from the current local curriculum files:

```bash
npm run export:curriculum-json
```

Optional custom output path:

```bash
npm run export:curriculum-json -- data/exports/curriculum.snapshot.json
```

## Local Verification

1. Export a snapshot:

```bash
npm run export:curriculum-json
```

2. Start the app with JSON source mode:

```bash
CURRICULUM_SOURCE_KIND=json-file npm run dev
```

3. If needed, point to a custom file:

```bash
CURRICULUM_SOURCE_KIND=json-file \
CURRICULUM_JSON_PATH=data/curriculum.snapshot.json \
npm run dev
```

## Why This Matters

- Makes curriculum loading replaceable before introducing CMS or database reads
- Allows export/import tooling to stabilize around one snapshot shape
- Reduces coupling between page code and authoring format

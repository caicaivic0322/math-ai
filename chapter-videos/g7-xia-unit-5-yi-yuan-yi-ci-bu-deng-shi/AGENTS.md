# Agent Notes

- Source of truth for narration timing is `scripts/build-sentence-aligned-video.mjs`.
- Run the script to regenerate `assets/narration.wav`, `assets/sentence-timings.json`, `sentence-timings.md`, `alignment-report.json`, and timed caption fields in `index.html`.
- The script uses the local oMLX OpenAI-compatible TTS endpoint and reads the local API key from `OMLX_API_KEY` or `~/.omlx/settings.json`.
- The current voice profile is `calm-detailed-teacher-v1`; it uses scene-level oMLX synthesis to keep one calm teaching emotion across each lesson segment.
- Project-wide SOP: `../VIDEO_GENERATION_WORKFLOW.md`.

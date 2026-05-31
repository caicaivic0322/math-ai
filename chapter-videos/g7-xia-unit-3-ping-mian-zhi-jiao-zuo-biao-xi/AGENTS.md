# Agent Notes

- Source of truth for this video is `scripts/build-sentence-aligned-video.mjs`.
- Run the script to regenerate `assets/narration.wav`, `assets/sentence-timings.json`, `sentence-timings.md`, `alignment-report.json`, and `index.html`.
- The script uses the local oMLX OpenAI-compatible TTS endpoint and reads the local API key from `OMLX_API_KEY` or `~/.omlx/settings.json`.
- The current warm female teacher voice profile is `warm-female-teacher-v3`; do not reuse older sentence segment audio after changing voice or sampling settings.
- Project-wide SOP: `../VIDEO_GENERATION_WORKFLOW.md`.

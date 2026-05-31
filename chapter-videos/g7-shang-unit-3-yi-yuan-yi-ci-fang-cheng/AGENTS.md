# Agent Notes

- Source of truth for this video is `scripts/build-sentence-aligned-video.mjs`.
- Run the script to regenerate `assets/narration.wav`, `assets/sentence-timings.json`, `sentence-timings.md`, `alignment-report.json`, and `index.html`.
- The script uses the local oMLX OpenAI-compatible TTS endpoint and reads the local API key from `OMLX_API_KEY` or `~/.omlx/settings.json`.
- The current smooth female teacher voice profile is `smooth-female-teacher-v2`; do not reuse older `sentence-segments` audio for final output.
- Project-wide SOP: `../VIDEO_GENERATION_WORKFLOW.md`.

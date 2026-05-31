# Chapter Video Generation Workflow

This project uses HyperFrames as the source of truth for chapter videos. Each chapter video should be generated from a script, not by hand-editing `index.html` after every failure.

## Core Contract

1. `scripts/build-sentence-aligned-video.mjs` is the source of truth for a chapter video.
2. Narration is split into natural speech units. Do not isolate very short transition sentences if that makes the voice sound choppy.
3. Each speech unit is synthesized as its own WAV segment, trimmed for boundary silence, then measured.
4. The measured WAV duration drives:
   - caption `data-start`
   - caption `data-duration`
   - scene start/end ranges
   - final `<audio>` duration
5. The final video must pass:
   - `npx hyperframes lint`
   - `npx hyperframes validate`
   - rendered frame contact-sheet review
6. Do not reuse old TTS segments after changing voice, instructions, speed, temperature, or sampling settings. Put a new `speechProfile.id` in the script so a fresh segment directory is used.

## Stable Teacher TTS Profile

Use local oMLX:

```bash
node scripts/build-sentence-aligned-video.mjs
```

For a clear, smooth female classroom voice, use:

- model: `Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit`
- voice: `serena`
- speed: around `1.12`
- temperature: around `0.58`
- top_k: around `45`
- top_p: around `0.92`
- repetition_penalty: around `1.05`
- instruction style: clear natural female math teacher voice; calm, warm, continuous classroom delivery; no performance, no sudden volume changes, no clipped short sentences

Avoid very low temperatures such as `0.16` for this model when the user asks for fluent teaching audio; it can make the voice sound stiff or unnatural. After concatenating speech-unit segments, normalize narration with `loudnorm=I=-20:LRA=5:TP=-1.5`.

## Required Outputs

Each chapter directory should contain:

- `DESIGN.md`: visual style and constraints
- `script.md`: human-readable narration and caption plan
- `scripts/build-sentence-aligned-video.mjs`: generator
- `assets/narration.wav`: final narration used by video
- `assets/sentence-timings.json`: machine-readable timing
- `sentence-timings.md`: readable sentence timing table
- `alignment-report.json`: machine-readable alignment checks
- `index.html`: generated HyperFrames composition
- `renders/<chapter>.mp4`: final video
- `renders/final-check-frames/contact-sheet.png`: visual QA sheet

## Generation Steps

From a chapter directory:

```bash
node scripts/build-sentence-aligned-video.mjs
npx hyperframes lint
npx hyperframes validate
npx hyperframes render --quality standard --workers 1 --output renders/<chapter>.mp4
```

Then extract review frames:

```bash
mkdir -p renders/final-check-frames
find renders/final-check-frames -maxdepth 1 \( -name 'check-*.png' -o -name 'contact-sheet.png' \) -delete
i=1
for t in 2 35 70 115 145 180 225 255 292; do
  printf -v n '%02d' "$i"
  ffmpeg -y -v error -ss "$t" -i renders/<chapter>.mp4 -frames:v 1 "renders/final-check-frames/check-$n.png"
  i=$((i+1))
done
ffmpeg -y -v error -framerate 1 -i renders/final-check-frames/check-%02d.png -vf "scale=640:-1,tile=3x3" -frames:v 1 renders/final-check-frames/contact-sheet.png
```

Adjust timestamps to match the new chapter duration and scene boundaries.

## QA Checklist

- Narration is steady, teacher-like, and does not swing emotionally between sentences.
- `alignment-report.json` says every check is true.
- `audioVideoDurationDelta` is no more than `0.2`.
- Contact sheet shows a visible main board or formula in every sampled scene.
- Captions match the spoken speech unit at that exact moment.
- No scene appears as caption-only unless that is explicitly intended.
- Do not ship if `validate` has contrast warnings.

## Common Failure Modes

- **Old unstable audio persists:** change `speechProfile.id` and regenerate.
- **Audio sounds choppy:** merge short transition sentences into one natural speech unit, use the female smooth profile, and trim segment boundary silence before measuring durations.
- **Caption-only frames:** scene visibility or timed clip ownership is wrong. Prefer one root composition with scene visibility controlled by the root timeline, while audio/captions use `data-start`.
- **Contrast warnings for hidden scenes:** hidden scenes must use `visibility: hidden`, not only `opacity: 0`.
- **Floating-point track overlaps:** trim non-final scene durations by `0.01s` when using timed scene clips.
- **TTS volume jumps:** normalize final narration with loudnorm and keep one stable sampling profile.

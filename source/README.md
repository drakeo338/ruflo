# RuFlo Explained — composition source

HyperFrames source for the animated explainer published at https://ruvnet.github.io/ruflo/.

- `BRIEF.md` → `STORYBOARD.md` → `frame.md` → `compositions/` is the full plan-to-pixels chain.
- `research/DESIGN-RESEARCH.md` is the research synthesis (skills, references, cognitum-media contracts, fact safety).
- Audio stems: `assets/voice/*.wav` (Kokoro TTS, voice am_michael), `assets/bgm/track_ext.wav` (MusicGen small).

Re-render (HyperFrames 0.8.97):

    npx hyperframes@0.8.97 lint && npx hyperframes@0.8.97 check
    npx hyperframes@0.8.97 render --quality high --crf 12 --output renders/master.mp4

Receipts for the published render live in `../media/receipt.job.json` (cognitum-media Job contract v0, locally issued, non-authoritative) and `../media/receipt.acceptance.json` (measured acceptance gates).

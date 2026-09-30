---
workflow: faceless-explainer
flow: automation
storyboard: no
message: "RuFlo turns your AI assistant into a workshop that plans, remembers, tests, and improves"
destination: web-embed
aspect: 1920x1080
language: en
audience: developers and technical builders starting with Claude, Codex, ChatGPT, or Grok
length: 90s
angle: concept
---

## Intent

A broadcast-level animated explainer of the article "RuFlo Explained: Build an AI Team
That Plans, Remembers, Tests, and Improves" (docs/ruflo-explained.md, rUv Cohen,
2026-09-07). The angle is the article's own framing: "a workshop, not another chatbot".
Premium, calm, technical, confident — broadcast craft, not a template slideshow.
Hosted on the ruvnet/ruflo GitHub Pages site.

## Assets

- public/chapters/ch01.jpg … ch14.jpg — the article's own chapter illustrations
  (docs/assets/ruflo-explained/); usable as background plates / Ken Burns layers.

## Customizations

- Research-driven motion language (deep-researcher lanes → research/DESIGN-RESEARCH.md).
- cognitum-media: emit a delivery-acceptance receipt modeled on Cognitum Media Factory's
  validation (duration exactness, black/frozen/silence checks, captions, checksums).
- Deliverables: 1080p master, web encode < 45 MB with faststart, poster, captions.vtt.

## Notes

- Autonomous run: the user asked for research → build → review → optimize → test →
  deploy with no interview; every unasked field below is a decision with a receipt.
- Decided (not user-stated): route faceless-explainer (article, no site capture);
  16:9 1080p30 (web embed / Pages); 90s (route sweet-spot ceiling; comparable
  media-factory sample is 120s); angle concept; no storyboard review pass.
- On-screen claims must come from the article only. Never show the retracted
  HNSW "150x–12,500x" or Flash Attention "2.49x–7.47x" figures.
- Voice/music: HeyGen not signed in → local Kokoro TTS + MusicGen from an isolated
  venv (/data/scratch/venvs/hf-audio).

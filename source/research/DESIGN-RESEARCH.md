# RuFlo Explained — Design Research (creative-director synthesis)

Project: `/data/scratch/videos/ruflo-explained` · 1920x1080 · 30 fps · ~90 s · faceless-explainer
Source of every on-screen claim: `/home/ruvultra/projects/ruflo/docs/ruflo-explained.md` (line refs `L##` below).
Inputs: four research lanes (skills, references, cognitum, content) + verification checks run while writing this file
(each check is tagged **[verified here]**). Research only: this file edits nothing in the project root.

---

## 1. Verdict summary

1. Build it with the installed HyperFrames skills (faceless-explainer route). No `npx skills` install adds anything this job needs.
2. Preset: **`broadside`**, remixed onto Cognitum's *broadcast-video* palette through `capture/extracted/tokens.json`. Tried here: it stays dark. `code-editorial` came out light-ground, so it is ruled out.
3. Motion follows `faceless-explainer/references/motion-language.md`: power3 long-tail settles, no overshoot, stillness over drift. It overrides the references lane where they conflict (see §5).
4. Narration trimmed to **203 words / 9 beats**, about 85 s of speech plus holds, landing near 90 s. Every card is a near-verbatim article fragment.
5. Correction to the skills lane: the registry does have a hub/network block (`constellation-hub`, `radial-surround`). Only the fan-out-then-converge topology (beat 6) must be built by hand.
6. `transition_in` accepts only `crossfade | blur-crossfade | push-slide | zoom-through | squeeze` (max 2.0 s). `whip-pan-cut` can only be a seam inside a frame.
7. Chapter plates are 1400x788. Show them as **framed insets at ≤100 %**, never upscaled to full bleed. Never use ch02 (its baked label reads "TOOLS", not "runtime").
8. Voice: Kokoro **`am_michael`** from the `/data/scratch/venvs/hf-audio` venv, where `kokoro_onnx 0.6.1` is installed [verified here]. MusicGen is **unverified**.
9. cognitum-media is a contract/control plane with every billable path disabled. The most we can produce is a *locally produced, schema-conformant* Job receipt plus a sidecar acceptance JSON. It carries no authority.
10. X/Twitter was unreachable (HTTP 402, nitter refused the connection), so no social examples are cited anywhere.

---

## 2. Frame preset + tokens

**Choice: `broadside`** (`~/.claude/skills/hyperframes-creative/frame-presets/broadside/FRAME.md`)
- It is the only one of the 13 presets whose *default* register is dark (softened from "only dark-ground preset": code-editorial has a navy register and editorial-forest uses green grounds; code-editorial's trial remix came out light-ground; editorial-forest's default was not trialled) [verified here]. It uses two surface registers (dark / accent), 1 px hairlines, mono uppercase chrome and a single accent. That restraint is the "premium, calm, technical" brief.
- Correction to the skills lane: it recommended hand-authoring a custom frame.md. The pipeline instead says pick a preset and let `build-frame.mjs` remix it with no hand-editing (SKILL.md L68–78). Follow the pipeline.

**Trial remix [verified here]** (scratch copies, not the project):
`research/frame-trial-broadside/frame.md` and `research/frame-trial-code-editorial/frame.md`
- broadside: `dark #111111→#030611, light #F0ECE5→#F7FBFF, accent #E85D26→#68E4FF`, `display/body Barlow→Inter`, self-check ✓.
- code-editorial: the ground stayed **light** (#F7FBFF canvas). With no `colorStats` there is no polarity inversion, so it is ruled out.

**Recommended `capture/extracted/tokens.json`** (write at Step 1; ORDER matters: cyan must come before gold so cyan becomes the accent):
```json
{ "title": "RuFlo Explained",
  "description": "Build an AI team that plans, remembers, tests, and improves — a workshop, not another chatbot.",
  "colors": ["#030611", "#F7FBFF", "#68E4FF", "#FFCB6B"],
  "fonts": [{"family":"Inter","weights":[400,500,600,700,800,900]},
            {"family":"JetBrains Mono","weights":[400,500]}] }
```
Token provenance (all verified in source files, nothing invented):
| Token | Hex / family | Source |
|---|---|---|
| canvas | `#030611` | `cognitum-media-factory/scripts/hyperframes/longformExplainer.ts` (the one shipped Cognitum broadcast video) |
| ink | `#F7FBFF` | same file |
| accent (cyan) | `#68E4FF` | same file (6 uses); also `0x68e4ff` in its Three.js motif |
| accent2 (gold) | `#FFCB6B` | same file. **Gold is in no static brand asset**; it is a video-only treatment |
| secondary text | `#BDC9DF` | same file (post-remix hand-fix, below) |
| display/body font | Inter | same file, `font-family: Inter, Arial, sans-serif` (L183) |
| mono font | JetBrains Mono | cognitum-one/website `index.html` / `index.css` (cognitum lane, grade A) |
| violet motif | `#746CFF` / `#9A7CFF` | longformExplainer.ts (`0x746cff`, `#9a7cff`). **Keep OUT of tokens.json**: by chroma it would compete for accent2. At most a worker-level motif colour; dropping it is better for restraint |

Palette decision (flagged, not silent): the website UI theme (`#0B0E13`/`#19D4E6`/`#26D968`, Outfit) and the shipped broadcast-video grade disagree. This file picks the **video grade** because it is the only palette that has actually been broadcast-rendered and passed acceptance gates. A human can override by swapping the four hexes and Outfit.

**Two remix artifacts to fix after `build-frame.mjs` exits 0.** These are the only hand edits and are allowed under SKILL.md L78.
1. `cream-muted` became `#FFCB6B`, which turns *all* secondary text gold and breaks the hierarchy. Set `cream-muted: "#BDC9DF"`. Keep gold for the one accent word or line per frame.
2. `IBM Plex Mono` was kept for label chrome. Swap it to `JetBrains Mono` (a Cognitum-sourced token), or accept it knowingly.
- Use **only the dark register**. Broadside's "orange" register would become a full cyan-ground frame; don't use it.
- `frame-worker-core.md` L79: every font needs a `.woff2` file shipped in `assets/fonts/`. Stage Inter and JetBrains Mono files before Step 5.

---

## 3. Narration (~90 s)

"Target s" are **planning targets**. `faceless-explainer/scripts/audio.mjs` sets the real frame durations from the TTS output. At 203 words, speech is about 84.6 s at 2.4 wps; the listed holds bring it to about 90–92 s. Per-beat word counts [verified here]: 25 / 24 / 30 / 14 / 23 / 32 / 11 / 18 / 26.

**Hook (first 3 s)** [critic add]: a mono kicker `RUFLO EXPLAINED` (article title, L1) sits in the top-left chrome from frame 0; the chat bubble is already mid-type at frame 0 (no fade-up from black); the pull-back starts by ~2.0 s so there is visible motion inside the first 3 s; VO's first word lands ≤1.0 s in. This names the brand ~10 s before beat 2 does.

| # | Target s | VO (final) | Article trace | On-screen card (≤6 words) |
|---|---|---|---|---|
| 1 | 0.0–11.0 | Most people meet AI through a chat window. Ask a question, get an answer, decide what's next. But real work rarely ends with one answer. | Intro L7, L9 | "Rarely ends with one answer" |
| 2 | 11.0–21.5 | A feature needs research, code, tests, a review, and a record of the decisions. So think of RuFlo as a workshop, not another chatbot. | L9, §1 heading L23 | "A workshop, not another chatbot" |
| 3 | 21.5–34.5 | Four pieces are easy to confuse. The model does the reasoning. A skill is a playbook. MCP lets an assistant discover and call tools. And the runtime performs the work. | §2 L44, L49–55; L17 ("model still does the reasoning"), L28 (playbook) | "Model · Skill · MCP · Runtime" |
| 4 | 34.5–41.5 (+1.6 s hold) | "I installed the skill" and "the MCP server is connected" are two different statements. | L57 (verbatim quote; "MCP" restored by critic) | "I installed the skill" / "The MCP server is connected" |
| 5 | 41.5–51.5 | RuFlo helps you plan and coordinate work, keep project memory, learn from what worked, build repeatable workflows, test software, and add security checks. | §3 title L63, bold heads L70–80 | chips: "Plan · Memory · Learn · Workflows · Test · Security" |
| 6 | 51.5–65.5 | Plan a task, then fan it out: research, build, and test in parallel. One coordinator resolves the findings into a single review, and the important findings are retained for the next session. | ch01 caption L26, L32, L40; "in parallel" is a paraphrase of L34/L318 ("running them together"), not verbatim; "single review" composites L26 "converges on review" + L32 "single recommendation" | "Fans out, converges on review" |
| 7 | 65.5–71.5 (+1.4 s hold) | More agents are not automatically cheaper. Measure cost per accepted result. | §12 heading L311, L322 | "Cost per accepted result" |
| 8 | 71.5–79.5 | And an agent saying "done" is not a test result. Verify tool discovery, permissions, and the actual output. | L78, L348 | "“Done” is not a test result" |
| 9 | 79.5–92.0 (lockup hold ≥2 s) | Start small. Install the RuFlo skill, pick one project and one acceptance test. Add the next capability only when you can name the problem it solves. | §4 L118, §15 L393, L399 | code: `npx skills add ruvnet/ruflo --skill ruflo` + mono sub-caption "If your assistant supports the Skills installer" (L115; L125 says it is not universal) → lockup "RuFlo" + `github.com/ruvnet/ruflo` (L397) + credit block (see end card below) |

**End card** [critic add] (beat 9 lockup, holds ≥2 s and <4 s or carries jitter):
- Wordmark "RuFlo" + `github.com/ruvnet/ruflo` (L397).
- Credit line, small mono: "By rUv Cohen · Cognitum.One" (byline L3).
- Disclosure line, small mono: "Synthetic narration · Illustrations AI-generated with Cognitum Media and fal" (colophon L403; our narration is Kokoro TTS, so it is also synthetic).
- Brand mark source [verified here]: the only RuFlo mark in the repo is `ruflo/src/nginx/static/logo.svg` (added in commit 29d52dfc2): hexagon stroke `#00d4ff`, dot `#7c3aed`, "Ru" `#00d4ff` / "Flo" `#7c3aed`, `system-ui` text. The violet is off-palette, so render it **monochrome** (ink `#F7FBFF` or cyan `#68E4FF`) in Inter, or use the hexagon glyph only. Mechanism stays `logo-brand-close`. Open decision; a human may prefer the original two-tone mark.

Notes
- `research/narration-draft.txt` is **superseded** by the table above; do not use it as SCRIPT source. Besides dropping `--skill ruflo`, it says "add real security checks" and "the next session doesn't start from zero", neither of which is in the article.
- Do not narrate `npx`. Show the **full** command on screen, including `--skill ruflo`; `research/narration-draft.txt` dropped that flag.
- TTS check: listen for how Kokoro pronounces "RuFlo" and "MCP". If "RuFlo" mispronounces, pass a phonetic respelling to TTS only (e.g. "Roo-flo"), never on screen. The correct pronunciation is unconfirmed; ask the author if unsure.
- Section 14 (federation) is **cut** from the 90 s version. It is the newest material, has no chapter art, and doesn't fit the concept arc.

**FORBIDDEN claims** (VO, cards, captions, alt text, page copy):
- `150x–12,500x` HNSW, `2.49x–7.47x` Flash Attention, or any speed-up multiplier. They are not in the article, and the repo marks them retracted/unverified; they still appear in CLAUDE.local.md and several skill descriptions, so never pull stats from there.
- "333 tools" without the article's caveat (L335). Simpler: don't show it at all. Also never "314 tools" (from CLAUDE.md, not the article).
- The §12 "30 min → ~15 min" example presented as a benchmark (L318–320 says it is an illustration).
- `ruflo@3.38.23` presented as current. If a pinned command appears, caption it "as tested, Sept 7 2026".
- A bare `npx ruflo` as the install CTA (in the article it only appears as a federation subcommand, L366–369).
- Federation, Seraphina, x.ruv.io or "cheapest model tier" claims (cut section).
- "`doctor --fix` repairs everything" (L346 says it prints suggestions).
- "Automatically safe" (L80, L100), "the model retrains itself" (L74), "RuFlo makes Claude capable" (L36).
- Any invented terminal output. Commands may be typed; output lines may not be fabricated.

---

## 4. Visual plan per beat

Registry ids below all appear in the saved catalog results (`research/catalog-*.json`) [verified here]. Critic re-check [verified here]: a full `npx hyperframes catalog --json` dump (hyperframes 0.8.97, 386 items) contains every cited id by **exact name**, which is stronger than `--query` ranking: `chat-message`, `pull-back-reveal`, `per-word-crossfade`, `titlecard-lockup`, `grid-card-assemble`, `separator`, `focus-blur-resolve`, `constellation-hub`, `radial-surround`, `svg-line-draw-loader`, `titlecard-calm`, `strikethrough-replace`, `code-terminal-run`, `logo-brand-close`, `vignette`, `grain-overlay`, `aurora-drift`, `dynamic-grid`, `whip-pan-cut`, `hw-arrow` (components) and `mk-specs-list`, `code-typing`, `whip-pan`, `hw-pipeline`, `code-particle-assemble` (blocks). The `lt-*` (11 items) and liquid-glass families exist too. Motion rule ids in §5 are all in `hyperframes-animation/rules-index.md`. Name each one as the frame's **`focal`** in STORYBOARD.md; Step 5 workers install and customise it (SKILL.md L128). Plates are already staged at `public/chapters/ch01..ch14.jpg` [verified here].

**Plate treatment (all beats):** framed inset, downscale only, with a 1 px hairline border and no upscale. **Size cap when captions are burned** [critic fix]: captions are burned into the composition (`faceless-explainer/SKILL.md` L154–168: `captions.mjs`, keep-out band passed to each worker). A native 1400x788 inset leaves only 76 px of the 864 px title-safe height for a two-line caption, so "native" and "captions stay out of insets" cannot both hold. Cap insets at **≤1152x648** (60 % frame width, 0.82x native), top-aligned inside title-safe, and STORYBOARD must respect the worker's caption keep-out band. Beat 7's ~55 % split (≈1056x594) already fits. Native 1400x788 is allowed only if captions are explicitly skipped. Full bleed would need a 1.371x upscale. Plates carry baked neon labels and hot pink/magenta that isn't in our palette, so treat them as documents inside the frame, never as backdrops under type. Bottom-20 % mean luma for ch01/12/13/14 is 7–15/255 [verified here]; a mean can hide a small neon label, so **verify visually before overlaying anything**. Never use **ch02** (baked "TOOLS" contradicts "runtime"). **ch14 belongs to §15**; §14 has no art.

| # | Focal (invented visual) | Plate | Registry ids | `transition_in` |
|---|---|---|---|---|
| 1 | One chat bubble answers on an empty dark field, then a single camera pull-back reveals it is one small answer in a large empty workspace. The card assembles word by word. | none | `chat-message`, `pull-back-reveal`, `per-word-crossfade` | none (cold open; opens from canvas, no black >1.5 s) |
| 2 | Five work items (research, code, tests, review, decisions) stack as a checklist, then resolve into the title lockup. | none | `mk-specs-list` (dark scheme), `titlecard-lockup` | `blur-crossfade` |
| 3 | Four cards (thin-line icon draws on + mono label + one-line body), each revealed on its spoken cue. | none (**no ch02**) | `grid-card-assemble` | `push-slide` LEFT |
| 4 | Two statements split by a vertical hairline, each focus-pulling in; a single "≠" settles last. | none | `separator` (vertical), `focus-blur-resolve` | `crossfade` |
| 5 | A RuFlo hub; six capability nodes brighten in narration order as connectors draw out. | none | `constellation-hub` (hub mechanism exists; this corrects the skills lane) | `zoom-through` (the film's one high-energy transition) |
| 6 | **Hand-built hero:** Plan node → three parallel nodes (Research / Build / Test) → Review node → memory store. Connectors draw at real length, then an internal zoom-through seam to the ch01 inset (it literally depicts this flow). | **ch01** inset (still < 4 s, see §9 freeze gate) | reuse `constellation-hub`'s connector technique + `svg-line-draw-loader` stroke timeline; motion rule `avatar-cloud-network` | `blur-crossfade` |
| 7 | Split layout: ch12 inset left (~55 %), kicker + headline right. | **ch12** inset | `titlecard-calm` | `push-slide` LEFT |
| 8 | "done" is struck through and replaced by "evidence" (L286: "the change plus evidence, not a message saying done"). ch13 inset settles beside it. | **ch13** inset | `strikethrough-replace` | `crossfade` |
| 9 | Terminal types the install command (**no fabricated output lines**; if `code-terminal-run` requires output, use `code-typing`), then the wordmark lockup holds still to the end. | none | `code-terminal-run` or `code-typing`, then `logo-brand-close` | `blur-crossfade` |

Global layers: `vignette` (pure CSS, static) on all frames. `grain-overlay`, `aurora-drift` and `dynamic-grid` are **optional and must pass a finiteness check first**; motion-language forbids `repeat`/`yoyo`/infinite loops. Default is no grain.
Skipped on purpose: the liquid-glass family (reads as consumer app chrome), `whip-pan`/`whip-pan-cut` as between-frame transitions (not valid `transition_in` values), `hw-arrow`/`hw-pipeline` (hand-drawn wobble is the wrong register), `lt-*` lower-thirds (built for naming people on footage), `code-particle-assemble` (a strong look, but it would be a second hero on top of beat 9's lockup).

---

## 5. Motion rules

**Doctrine (binding):** `faceless-explainer/references/motion-language.md`, the file workers actually read. Where the references lane disagrees, the pipeline wins:
- References lane said `power2.out` default. **Verified pipeline rule: `power3` long-tail default; `expo.out` for fast decisive arrivals.**
- References lane said `back.out(1.3–1.7)` for 1–2 hero beats. **Rejected: no overshoot anywhere**; the only exception is explicitly playful work, and this film isn't.
- References lane said 2.5D parallax camera pans. **Rejected as a default: prefer stillness.** One small push (≤1.05x) is allowed on the front half of a beat, with no second push.
- References lane said 3–6 % grain. **Off by default**; allowed only if static or finite.
- Aliveness during holds: **subtle low-amplitude jitter only** (rule `sine-wave-loop`, finite). No breathing and no drift.
- Reveal on the VO cue, in the back half of the beat: nothing is dumped in the first 25 %.
- Nothing infinite (`repeat`/`yoyo`), no `Math.random`/`Date.now`; any variation derives from element index.
- Cuts land at peak velocity with matched direction and speed on both sides (`cut-catalog.md`). Blur at a cut is about 10 px for text-scale subjects, and the same value on both sides.

**How STORYBOARD names motion:** by move and rule id, never by raw curve. Vocabulary for this film: `dynamic-content-sequencing` (per-word or per-card staggered reveal), `discrete-text-sequence` (in-place token swap, beat 8), `avatar-cloud-network` (hub + connectors, beats 5–6), `stat-bars-and-fills` (not used; no numbers are shown), `multi-phase-camera` (beat 1 pull-back only), `sine-wave-loop` (hold jitter), plus cut-catalog seams (zoom-through, cut-the-curve).

**What the worker maps to** (guidance from the references lane, fitted to doctrine, 30 fps):
| Move | Ease | Duration |
|---|---|---|
| Primary text / card entrance | `power3.out` | 0.6–0.8 s (18–24 f) |
| Micro chrome (chips, kickers, rules) | `power2.out`/`power3.out` | 0.2–0.4 s (6–12 f) |
| Decisive arrival (≠, strike line, lockup settle) | `expo.out` | 0.4–0.6 s |
| Exit (only when not handed to `transition_in`) | `power2.in` | 0.3–0.5 s |
| Hairline / connector draw | `power2.inOut` | 0.5–0.9 s per segment |
| Single camera move (beat 1 pull-back) | `power3.inOut` | 1.5–2.5 s, once |
- Stagger: use `amount` 0.5–0.8 s for groups of content-driven size (chips, cards, checklist rows); `each` 0.05–0.12 s for per-word reveals. Stagger spread must not exceed the element tween's duration.
- Concurrency: one hero move, plus at most two supporting moves at once. At most two animated properties per element (e.g. y + opacity).
- Holds: a pure type card (not redundant with VO) holds ≥1.2–1.5 s, at a pace of about 2.5–3 words/s. Captions follow the speech timing directly.
- Safe areas: primary text and captions inside the inner 80 % (title-safe, 1536x864), everything essential inside the inner 90 % (action-safe, 1728x972). Source: `hyperframes-studio/SKILL.md` L94–108 [verified here].

**Broadcast vs template checklist** (tick every frame):
- [ ] One idea per frame; one hero element; one accent (cyan), with gold used at most once per frame.
- [ ] One type family (Inter) plus mono chrome; 4–6 sizes; tabular numerals if any digit appears.
- [ ] Every element appears on its spoken cue, not all at t=0.
- [ ] No bounce, elastic, back.out, spin, rainbow gradient or particle burst for emphasis.
- [ ] Motion direction means something: connectors grow *from* their source, and nodes light in the order the VO names them.
- [ ] Holds are truly still (jitter at most). No full-frame still ≥4 s (the freeze gate).
- [ ] Plates are inset documents; no type sits over baked neon labels.
- [ ] Within-frame Scene seams are hard cuts on sentence boundaries (cut-catalog). Between-frame seams follow the §4 table: 8 seams (beat 1 has none) using 4 distinct `transition_in` types (blur-crossfade ×3, push-slide ×2, crossfade ×2, zoom-through ×1); `squeeze` is unused. Only one `zoom-through`.
- [ ] Beat 1 hook: brand kicker on screen from frame 0 and motion inside the first 3 s (§3).
- [ ] End card carries wordmark, URL, credit and the synthetic-media disclosure (§3).
- [ ] Hairlines and flat planes; no heavy drop shadows or glass.
- [ ] If a move doesn't help comprehension, cut it.

---

## 6. Audio

**Voice: Kokoro `am_michael` (male).**
- It is the pipeline's Kokoro default when the request names no voice (faceless-explainer SKILL.md L104; `media-use/audio/scripts/lib/tts.mjs` L68). The user named no voice or gender.
- It is curated for "Marketing / promo" (`media-use/audio/references/tts.md` L187), which fits a confident launch-style explainer.
- A test render already exists at `research/tts-test/michael.wav` (3.05 s, 24 kHz mono) [verified here]. The venv at `/data/scratch/venvs/hf-audio` has `kokoro_onnx 0.6.1` + `soundfile` [verified here]. The system Python does not, which is why `hyperframes doctor` reports Kokoro as missing.
- Alternates: `am_adam` (tutorial register), `af_heart` (the Kokoro default female voice). Record the choice with `prefs.mjs record --key voice`.
- Note: `npx hyperframes tts` is Kokoro-only. `OPENAI_API_KEY` doesn't route through it. HeyGen isn't signed in (BRIEF.md).

**BGM mood:** calm, minimal electronic ambient; about 90–100 BPM; no vocals; sparse synth pad with a soft pulse. A gentle lift across beats 5–6 (the capability map and fan-out), then resolving into beat 9. Sits about −31 LUFS under the voice (tts.md L21) and is ducked under the VO (`hyperframes-audio` voiceover carve). **MusicGen is unverified:** `transformers`/`torch` are in the venv but model weights and a working generation path were not tested. Fallback: `media-use resolve --type bgm`.

**Head and tail** [critic add]: BGM enters at t=0 (a silent head would trip `silencedetect d=2.5` in §9, and the cold open has no fade from black). VO starts ≤1.0 s in. At the end the music resolves with a short button or fade that finishes at or before the composition duration, under the lockup hold, so audio stays within ±1 frame of video. No hard-truncated music tail.

**SFX (≤5, subtle, all through `media-use resolve --type sfx`):**
1. Beat 5: soft tick per node brightening, about −30 dB relative to VO, with one shared sample.
2. Beat 6: low airy swell as the fan-out connectors draw.
3. Beat 8: one short pen-strike on the strikethrough.
4. Beat 9: a soft riser resolving into one low, warm hit on the lockup.
5. (Optional) Beat 1: a single UI "message sent" blip.

---

## 7. Skills

**Verdict: install nothing.** The installed `hyperframes`, `hyperframes-animation` (GSAP / Anime.js / Lottie adapters, 529 lines of GSAP docs), `hyperframes-creative`, `hyperframes-registry`, `faceless-explainer` and `media-use` skills cover this job.

Skip (duplicates or off-target; from the skills lane, read first-hand):
- `heygen-com/hyperframes@gsap`, `@animejs`, `@lottie`: same upstream as the installed `hyperframes-animation/adapters/*`.
- `greensock/gsap-skills@gsap-scrolltrigger`, `@gsap-react`: scroll/React framing doesn't apply to a paused, seek-safe timeline.
- `emilkowalski/skills@animation-vocabulary`: a naming glossary, not a build tool.

Optional **read-only** lookups (`skills use` prints the SKILL.md with no install):
```bash
npx -y skills use greensock/gsap-skills@gsap-plugins      # only if a GSAP plugin detail is missing from HF adapters
npx -y skills use pbakaus/impeccable@typeset              # unread (grade C): optional typography second opinion
npx -y skills use emilkowalski/skills@review-animations   # unread (grade C): optional post-render critique pass
```
`npx skills find --json` does not return JSON (`--json` applies to `add` only).
Optional upstream report: `npx hyperframes feedback --search-miss "animated network graph nodes edges" --wanted "fan-out/converge agent topology" --tier words`.

---

## 8. cognitum-media integration

**What it is:** `cognitum-one/cognitum-media` v0.1.0. It is 12 JSON Schemas plus an OpenAPI 3.1 contract, strict Rust types, and a Fal adapter whose only operation (`fal.video.generate`) is disabled and unit-tested as disabled (`v0_registry_cannot_submit_to_fal`). Its README says no production media profile is enabled and billable work returns `profile_disabled`.

**NOT integrable (say this plainly in any write-up):**
- No render or dispatch path.
- No gateway admission.
- No owner-bound Artifact issuance. `creative-workstation`'s `candidate.json` explicitly refuses to be a delivered Artifact.
- No HyperFrames adapter.
- This render does **not** "go through Cognitum Media".

**Receipt we will produce** (locally produced, labelled `"issuer": "local"`, non-authoritative):

A. `renders/receipt.job.json`: schema-conformant to `contracts/v0/schemas/job.schema.json` (template: `research/synthetic-ruflo-explained-job.json`).
- `contract_version` "0.1.0", `job_id`, `owner{tenant_id, owner_id}`, `profile_id` "video.hyperframes-explainer", `profile_version`, `idempotency_key`, `state` "delivered", `requested_deliverables` [video.master, video.web, video.poster, video.captions], `created_at_unix`/`updated_at_unix`.
- `artifacts[]`, one per deliverable: `artifact_id`, `owner`, `media_type` (`video/mp4`, `image/jpeg`, `text/vtt`), **real** `digest` "sha256:<hex>", `visibility`, `retention{policy_id, retain_until_unix, provider_delete_required}`, `cost{quoted_cost_micros:0, actual_cost_micros:0, currency:"USD"}`.
- `provenance{manifest_id, source_digests[sha256 of ruflo-explained.md + ch01/12/13 plates + narration wav + BGM], output_digest, provider_id "hyperframes-local", model_id "hyperframes@0.8.97", operation_id "hyperframes.render", operation_version, rights_references}`.
- `quote_digest`, `authorization_id` and `profile_id` are **local placeholders with no authority**; no dispatcher exists to issue them.

B. `renders/receipt.acceptance.json`: sidecar. The Job schema rejects unknown fields, so metrics cannot go inside it.
- Duration: composition vs ffprobe.
- Streams: codec, profile, pix_fmt, fps, w/h, audio sample rate/channels.
- blackdetect / freezedetect / silencedetect intervals, mean_volume, integrated LUFS, true peak, LRA.
- Caption cue count and transcribe-back WER.
- `hyperframes check` / `keyframes` results.
- sha256 of every file.
- Forbidden-claims grep result.
- Tool versions (hyperframes, ffmpeg 6.1.1, Kokoro voice id).

**Runnable validator [verified here]** (it passed the synthetic job and the repo's own fixture). Run from `research/cognitum-media-src`:
```bash
python3 -c "import json,jsonschema,os; s=json.load(open('contracts/v0/schemas/job.schema.json')); r=jsonschema.validators.RefResolver(base_uri='file://'+os.getcwd()+'/contracts/v0/schemas/', referrer=s); v=jsonschema.validators.validator_for(s)(s, resolver=r); e=[x.message for x in v.iter_errors(json.load(open('<receipt.job.json>')))]; print('OK' if not e else e)"
sha256sum renders/*.mp4 renders/*.jpg renders/*.vtt   # cross-check every digest in the receipt
```
**Caveat:** passing the schema proves nothing about the content; it accepted `sha256:deadbeef`. The evidence comes from the `sha256sum` cross-check and the acceptance sidecar. `scripts/validate-contracts.sh` only checks that files exist, that `jq -e` parses them, and some greps, so it is not a conformance test. Real conformance (`cargo test --workspace --all-targets --locked`) was not run.

---

## 9. Acceptance gates for the render

Patterned on media-factory `scripts/e2e-hyperframes.ts` (L535–553) [verified here], scaled to 1080p30.

| Gate | Pass condition | How |
|---|---|---|
| Duration | Total 88.0–94.0 s; ffprobe video duration within ±1 frame (33 ms) of the composition; audio within ±1 frame of video | `ffprobe -v error -show_entries format=duration:stream=duration` vs `npx hyperframes info` |
| Black | 0 intervals | `-vf blackdetect=d=1.5:pix_th=0.02` (the cold open fades in faster than 1.5 s) |
| Frozen | 0 intervals | `freezedetect=n=-48dB:d=4`. **No fully still stretch ≥4 s**: plate holds and the lockup stay under 4 s or carry jitter |
| Silence | No interval >4 s (fail); report any >2.5 s | `-af silencedetect=noise=-42dB:d=2.5` |
| Mean volume | −32…−12 dB | `volumedetect` |
| Loudness (web, this deliverable) | Integrated **−16 LUFS ±1**, true peak ≤ **−1.5 dBTP**, LRA ≤ 11 | `ffmpeg -af ebur128=peak=true` / two-pass `loudnorm`. Voice chain reference: media-factory `loudnorm=I=-18:TP=-2:LRA=7`; music about −31 LUFS under VO |
| Loudness (broadcast, not produced) | EBU R128 −23 LUFS / ATSC A/85 −24 LKFS | Documented for a future broadcast deliverable only |
| Captions | `captions.vtt` is valid WEBVTT; cues >0; monotonic; end ≤ duration; ≤2 lines; ≤42 chars/line; cue ≥1.0 s; ≤20 chars/s; burned captions stay out of plate insets | Parse and check the VTT; `npx hyperframes transcribe` on the final mix → **WER ≤10 %** vs SCRIPT |
| Composition | `npx hyperframes check` clean (the known ~1–4 px caption `text_box_overflow` false positive is OK); `npx hyperframes keyframes` pass | CLI |
| Content | 0 unreviewed hits for forbidden strings (§3) in STORYBOARD, frames, VTT and page copy | Forbidden-strings grep (command below the table; widened by critic: the old `33[34] tools` / `3\.38\.23 is` patterns missed "333 MCP tools" and any bare version). Every hit needs a human look: a pinned version is allowed only with its "as tested" caption |
| Master encode | H.264 High, `yuv420p`, 1920x1080, 30/1 CFR, AAC 48 kHz stereo, faststart | `-c:v libx264 -profile:v high -preset slow -crf 16 -pix_fmt yuv420p -r 30 -movflags +faststart -c:a aac -b:a 320k -ar 48000` |
| Web encode | **< 45 MB** (45 MB × 8 / 90 s ≈ 4.0 Mbps total budget), same stream spec | `-c:v libx264 -profile:v high -level 4.1 -preset slow -crf 21 -maxrate 3.5M -bufsize 7M -g 60 -keyint_min 60 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 160k -ar 48000 -ac 2` |
| Faststart | `moov` before `mdat` | `ffmpeg -v trace -i web.mp4 2>&1 \| grep -m2 -oE "type:'(moov\|mdat)'"` → moov first |
| Poster | 1920x1080 JPEG from the lockup frame | `ffmpeg -ss <t> -frames:v 1` |
| Pages | Publish only the web encode, poster and VTT. GitHub rejects files >100 MB, so never commit the master | size check |
| Receipt | Job receipt validates (§8) and every digest matches `sha256sum` | §8 commands |

Forbidden-strings grep (run over STORYBOARD.md, SCRIPT.md, `compositions/`, `index.html`, the VTT and page copy; never over `research/`, which quotes these strings on purpose):
```bash
grep -rniE '150x|12,?500|2\.49|7\.47|\b33[34]\b|\b314\b|3\.38\.23|npx ruflo( |$)|federation|seraphina|x\.ruv\.io|automatically safe|retrain|fifteen minutes|15 min' STORYBOARD.md SCRIPT.md compositions index.html *.vtt
```

Faster capture (optional): `npx @puppeteer/browsers install chrome-headless-shell`. Without it, rendering falls back to screenshot mode.

---

## 10. Unreachable sources / open risks

**Unreachable / not done**
- x.com returned HTTP 402 and nitter.net refused the connection, so **no X examples were retrieved**. None are cited. "Examples on X" from the request is **unmet**.
- Not verified: Linear "Details Matter" (2026-01-28) and the "Claude Design / Motion MCP launch videos" claim, both seen only in search summaries. Do not cite either.
- Listed but not read (grade C): skills `leonxlnx/taste-skill@*`, `pbakaus/impeccable@*`, `emilkowalski/skills@review-animations`/`@improve-animations`, `greensock/gsap-skills@gsap-timeline`/`-performance`/`-plugins`.
- Not fetched: the article's LinkedIn original. Its colophon mentions synthetic narration; no audio for it exists in `docs/assets/`.
- Not run: cognitum-media Rust conformance tests (`cargo test`).
- Not tested: GCP fal secrets (names only).
- `code-editorial` ruled out by the trial remix (light ground).

**Open risks**
1. **MusicGen availability** is unverified. BGM may need the media-use catalog fallback.
2. **Palette choice** (video grade vs website UI) and **"RuFlo" pronunciation** are decisions made here; a human may override either.
3. **Plate collisions:** the bottom-band luma check is statistical only. Look at each inset before overlaying anything. ch02 is banned.
4. **Freeze gate vs doctrine:** stillness is preferred, but ≥4 s of true stillness fails freezedetect. Keep holds under 4 s or add jitter.
5. **Beat 6 hero is hand-built:** it carries the most build risk. `constellation-hub`'s connector technique is the reference.
6. **Registry component contracts** (for example, whether `code-terminal-run` requires output lines, and whether `grain-overlay`/`dynamic-grid` use infinite keyframes) must be checked when installed at Step 5.
7. **Duration:** 203 words at an untested Kokoro pace could land from about 78 s (at 2.6 wps) to about 92 s. Adjust the holds rather than rewriting the VO.
8. **Tool count drift:** the article's 333 vs CLAUDE.md's 314. The number is omitted entirely.
9. **Fonts:** Inter and JetBrains Mono `.woff2` files must be staged in `assets/fonts/` before Step 5, or text silently falls back to a generic font.
10. **Brand mark** (critic): the only in-repo RuFlo mark (`ruflo/src/nginx/static/logo.svg`) is two-tone cyan/violet, which is off-palette. Mono rendering is a decision made here; a human may override.
11. **Inset size cap** (critic): ≤1152x648 insets make the baked plate labels smaller. Check legibility at 1080p. If an inset needs to be larger, skip captions for that frame explicitly instead of overlapping.
12. **End-card credit and disclosure wording** is traced to L3 and L403 but not yet approved by the author.
13. **`research/narration-draft.txt` is stale.** It sits outside this file's write scope and was left unchanged; use the §3 table as the only VO source.

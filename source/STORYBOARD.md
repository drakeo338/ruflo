---
format: 1920x1080
duration: 90s
message: "RuFlo turns your AI assistant into a workshop that plans, remembers, tests, and improves"
arc: concept-explainer with process
audience: developers and technical builders starting with Claude, Codex, ChatGPT, or Grok
mode: autonomous
music: calm minimal electronic ambient tech underscore, soft pulse, sparse synth pad, no vocals, gentle lift mid-film, resolves at the end
---

## Video direction

- **Palette (from frame.md, dark register only):** canvas `#030611` is every ground; ink `#F7FBFF` for primary type and node strokes; cream-muted `#BDC9DF` for secondary text, labels and inactive nodes; cyan accent `#68E4FF` is the ONE accent (active node, connector draw-on, the key word per frame); gold `#FFCB6B` at most once per frame and only for the single payoff word/line (frames 2, 7, 8, 9). Never use the broadside cyan-ground register. No purple/blue "AI" gradients, no bokeh.
- **Type:** display = Inter (lowercase heavy weights for hero words, per frame.md), body = Inter, chrome/kickers/labels = JetBrains Mono uppercase 0.14em. One family + mono chrome; tabular numerals if any digit appears.
- **Brand chrome (frame 1 only — decided after review):** a small mono kicker `RUFLO EXPLAINED` top-left and a mono index `01 / 09` top-right brand the hook from frame 0; frames 2–9 carry no corner chrome (their top-left layouts would collide), and the brand returns in frame 5's hub and frame 9's lockup. A static CSS vignette on every frame. No grain.
- **Motion grammar:** long-tail `power3` settles for every entrance, `expo.out` only for decisive arrivals (the "≠", the strike line, the lockup settle). No overshoot, no bounce/elastic/back. Every piece reveals when the voiceover names it (word timestamps below each frame's shots are the cue map); nothing is front-loaded. Connectors grow FROM their source toward their target. One camera move in the whole film (frame 1 pull-back). During holds: stillness, or subtle low-amplitude jitter (`sine-wave-loop`) on the one hero element — never breathing, never back-half drift.
- **Rhythm / held frames:** frames 4 and 7 are the deliberate breathers (sparse, near-still after their single reveal). Frame 6 is the climax (the most motion). Frame 9's wordmark lands at ~6.75s and the end card holds ~4 s clean after the final sentence (frame 9 extended past the VO for the end card).
- **Freeze gate:** no fully still stretch ≥ 4 s anywhere — any hold longer than ~3 s carries subtle jitter on its hero.
- **Plates:** the article illustrations (ch01, ch12, ch13) appear only as framed insets — 1 px cream-muted hairline border, ≤ 1152×648, downscale only, never full-bleed, never under type. No type overlaps a plate.
- **Caption band:** bottom ~17% is reserved for burned captions; all content plans into the top ~83%, centered heroes anchor near y ≈ 454.
- **Negative list:** slideshow (everything on screen by 25% then frozen) · screensaver (many elements floating independently) · lazy breathing · back-half pan/push · glass/liquid-glass chrome · drop shadows heavier than a hairline elevation · invented terminal output · any speed-up multiplier or tool count · emoji.

## Frame 1 — One answer is not the work

- scene: A single chat bubble answers on an empty dark field; one slow pull-back reveals it is a tiny answer inside a vast empty workspace
- voiceover: "Most people meet AI through a chat window. Ask a question, get an answer, decide what's next. But real work rarely ends with one answer."
- duration: 9.707s
- transition_in: cut
- status: outline
- src: compositions/frames/01-one-answer.html
- type: hook
- persuasion: Common-belief vs reality + Visceral metaphor (the lone bubble in an empty room)
- beat: Recognition + curiosity
- blueprint: zoom-out-workspace-reveal (Adapt)
- focal: a single chat exchange (question bubble + answer bubble) that becomes one tiny tile in a large empty workspace grid
- roles: chat exchange = foreground subject · faint hairline workspace grid of empty tiles = background (dim ~35%) · kicker "RUFLO EXPLAINED" + index "01 / 09" = supporting chrome
- sfx: click-soft

Adapt: keep the signature single continuous decelerating zoom-out; the "workspace" is an invented grid of empty task tiles, not a design tool.
Scene 1 (0.0–2.6s): frame opens TIGHT on the chat exchange, already mid-type at frame 0 (no fade from black): a question bubble "How do I add a safer login?" sits right, the answer bubble types its first line left — Centered, the exchange fills ~55% of frame. Kicker + index are on screen from frame 0. The pull-back BEGINS at ~1.8s (one continuous `multi-phase-camera` pull-back, `power3.inOut`).
Scene 2 (2.6–6.8s): as the VO says "ask a question, get an answer, decide what's next" the pull-back continues and decelerates; the chat exchange shrinks to one small tile and the surrounding empty tiles of the workspace grid resolve into view around it (layer-reveal of the grid, staggered outward from the chat tile — `center-outward-expansion`). Layered-depth: grid dim at back, chat tile crisp.
Scene 3 (6.8–9.7s): on "But" the camera has LOCKED (no further move). On "real work rarely ends with one answer" the headline `rarely ends with one answer` sets in the upper third via per-word staggered reveal (`dynamic-content-sequencing`), with "one answer" in cyan; the lone chat tile glows faintly cyan. Hold with subtle jitter on the headline only.

Cue map: Most@0.0 · chat window@2.2 · Ask@3.2 · answer@4.6 · decide@5.2 · But@6.9 · rarely@7.7 · one answer@8.8

narrativeRole: Opens the gap — the viewer's familiar mental model (chat = the whole job) is shown to be one small piece of a much larger space.
keyMessage: Real work needs more than a single answer.

## Frame 2 — A workshop, not another chatbot

- scene: Five work items (research, code, tests, review, decisions) stack as a checklist, then clear to the title lockup "a workshop, not another chatbot"
- voiceover: "A feature needs research, code, tests, a review, and a record of the decisions. So think of RuFlo as a workshop, not another chatbot."
- duration: 9.472s
- transition_in: blur-crossfade
- status: outline
- src: compositions/frames/02-workshop.html
- type: product_intro
- persuasion: Frame-then-fill (list the jobs, then name the place that holds them) + Coined framing
- beat: Clarity + orientation
- blueprint: grid-card-assemble (Adapt)
- focal: the title lockup "a workshop, not another chatbot" (after the checklist clears)
- roles: 5-row checklist (mono index + Inter label + hairline row rule) = foreground subject in Scenes 1–2 · title lockup = foreground subject in Scene 3 · hairline grid = background (dim ~30%) · chrome = supporting
- sfx: none

Adapt: keep the staggered-cascade assemble signature as a vertical list; the list then clears into a centered title (scale-swap handoff).
Scene 1 (0.0–1.0s): only the mono label `A FEATURE NEEDS` sets top-left of a left-aligned column (asymmetric 60/40, list on the left 60%).
Scene 2 (1.0–5.6s): the five rows reveal ONE AT A TIME exactly on their spoken word — `01 research` @1.0, `02 code` @1.8, `03 tests` @2.3, `04 review` @3.2, `05 decisions` @4.9 — each row a long-tail slide-up + fade (`dynamic-content-sequencing`), its hairline rule drawing left→right (`svg-path-draw`). Each row's mono index lights cyan as it lands, then settles to cream-muted.
Scene 3 (5.6–9.47s): on "So think of RuFlo" the list compresses and fades up-and-out while the title arrives at the same center (`scale-swap-transition`): mono kicker `RUFLO` (cyan) over a two-line lowercase heavy display title `a workshop,` / `not another chatbot.` — the word "workshop" in gold (the frame's one gold word) lands on "workshop"@7.1; "not another chatbot." reveals per-word from @7.8. Centered, title fills ~50% of frame width. Hold still.

Cue map: research@1.0 · code@1.8 · tests@2.3 · review@3.2 · decisions@4.9 · So@5.9 · RuFlo@6.4 · workshop@7.1 · not another chatbot@7.8

narrativeRole: Names the concept — the thesis lands by beat 2: RuFlo is the workshop that holds all those jobs.
keyMessage: RuFlo is a workshop for AI work, not another chatbot.

## Frame 3 — Four pieces

- scene: Four equal cards on one stage — Model, Skill, MCP, Runtime — each drawing its thin-line icon and one-line role exactly as it is spoken
- voiceover: "Four pieces are easy to confuse. The model does the reasoning. A skill is a playbook. MCP lets an assistant discover and call tools. And the runtime performs the work."
- duration: 12.181s
- transition_in: push-slide LEFT
- status: outline
- src: compositions/frames/03-four-pieces.html
- type: feature_showcase
- persuasion: Progressive disclosure + Numbered enumeration (rule of four, each on its cue)
- beat: Comprehension
- blueprint: grid-card-assemble (Reproduce)
- focal: a 4-up row of equal cards (Model · Skill · MCP · Runtime)
- roles: four cards = foreground subject (each: thin-line SVG icon, mono index 01–04, Inter heavy lowercase name, one-line cream-muted role) · section headline "four pieces, easy to confuse" = supporting · hairline baseline = background
- sfx: click-soft

Reproduce: staggered cascade of four tiles into a row, each on its own spoken cue.
Scene 1 (0.0–2.6s): headline `four pieces.` sets upper-left (per-word reveal), then `easy to confuse.` in cream-muted on "confuse"@1.9. Four empty hairline card outlines draw on in a 4-up row across the middle (`svg-path-draw`, left→right) — outlines only, no content yet. Four-up row spans ~85% of width, centered at y ≈ 470.
Scene 2 (2.6–4.5s): on "model"@2.8 card 1 fills: its icon (a simple brain-like node cluster) self-draws, name `model` lands, role `does the reasoning` fades in on "reasoning"@3.7. The active card's border turns cyan; others stay cream-muted.
Scene 3 (4.5–6.3s): on "skill"@4.7 card 2 fills — icon (an open playbook), name `skill`, role `is a playbook` @5.4. Cyan border moves to card 2; card 1 settles to ink.
Scene 4 (6.3–10.2s): on "MCP"@6.4 card 3 fills — icon (a plug with two tool nodes), name `mcp`, role `discover and call tools` @7.9. Cyan border on card 3.
Scene 5 (10.2–12.18s): on "runtime"@10.7 card 4 fills — icon (a gear/engine), name `runtime`, role `performs the work` @11.3. Cyan border on card 4. All four now read as a set; hold still.

Cue map: Four pieces@0.1 · confuse@1.9 · model@2.8 · reasoning@3.7 · skill@4.7 · playbook@5.4 · MCP@6.4 · tools@9.2 · runtime@10.7 · work@12.3

narrativeRole: Builds the vocabulary the rest of the film relies on, one piece per spoken cue.
keyMessage: Model, skill, MCP and runtime are four different things.

## Frame 4 — Two different statements

- scene: The same four-card stage recedes; two quoted statements sit either side of a vertical hairline, and a single "≠" settles between them
- voiceover: "'I installed the skill' and 'the MCP server is connected' are two different statements."
- duration: 5.867s
- transition_in: blur-crossfade
- status: outline
- src: compositions/frames/04-two-statements.html
- type: social_proof
- persuasion: Comparison of two options + Counterexample
- beat: Recognition + "aha"
- blueprint: comparison-split (Adapt)
- focal: two quoted statements split by a vertical hairline, with a "≠" between them
- roles: left statement "i installed the skill" + right statement "the mcp server is connected" = foreground subjects (equal weight) · vertical hairline separator = supporting · "≠" = the payoff mark (cyan) · faint ghost of the four-card row far back (dim ~15%, blurred) = background continuity
- sfx: none

Adapt: keep two equal-weight items entering from opposite wings; replace the book-open tilt with a flat focus-pull (depth-of-field resolve) to stay calm and typographic; the pill badge becomes a single "≠".
Scene 1 (0.0–1.9s): split-screen. The left statement `"i installed the skill"` enters from the left wing and focus-pulls sharp (`depth-of-field-blur`, blur → 0) on "installed"@0.1. The vertical hairline separator draws top→bottom down the center (`svg-path-draw`). Right half empty.
Scene 2 (1.9–4.4s): on "the MCP server"@2.2 the right statement `"the mcp server is connected"` enters from the right wing and focus-pulls sharp.
Scene 3 (4.4–5.87s): on "two different statements"@4.6 a cyan "≠" lands on the separator at center with a decisive `expo.out` arrival; small mono caption `TWO DIFFERENT STATEMENTS` sets under it. Hold still (breather frame).

Cue map: installed@0.1 · skill@1.2 · MCP server@2.4 · connected@3.5 · two different statements@4.6

narrativeRole: Grounds the four-pieces idea in the exact confusion people hit when setting it up.
keyMessage: Installing a skill is not the same as connecting the MCP server.

## Frame 5 — What it helps you do

- scene: A RuFlo hub at the center; six capability nodes (Plan, Memory, Learn, Workflows, Test, Security) brighten in the order they are spoken as connectors draw out from the hub
- voiceover: "RuFlo helps you plan and coordinate work, keep project memory, learn from what worked, build repeatable workflows, test software, and add security checks."
- duration: 10.539s
- transition_in: zoom-through
- status: outline
- src: compositions/frames/05-capabilities.html
- type: feature_showcase
- persuasion: Progressive disclosure + Frame-then-fill (hub first, then each capability on its cue)
- beat: Fascination + momentum
- blueprint: constellation-hub (Adapt)
- focal: a central RuFlo hub with six capability nodes on a ring
- roles: hub (hexagon outline + mono "RUFLO") = foreground subject · six nodes (circle + mono index + Inter label) = foreground, lit in spoken order · connectors hub→node = supporting · faint concentric hairline rings = background (dim ~25%)
- sfx: click-soft

Adapt: keep the nodes-on-a-ring-around-a-center signature and the resolve on the core; no orbit, no camera push — the ring is static and nodes light on cue.
Scene 1 (0.0–1.2s): on "RuFlo"@0.1 the hub hexagon self-draws at center (`svg-path-draw`) with mono `RUFLO` inside; faint concentric rings resolve behind it. Six node positions exist as dim cream-muted dots only. Centered; ring diameter ~60% of frame height, centered at y ≈ 454.
Scene 2 (1.2–10.0s): each capability node lights on its spoken word — `plan` @1.2, `memory` @4.0, `learn` @4.7, `workflows` @7.3, `test` @8.1, `security` @9.5 — its connector draws FROM the hub TO the node (`avatar-cloud-network` connector technique, `power2.inOut`), the node ring turns cyan as it lands, its label sets beside it, then settles to ink as the next one lights (only the newest node is cyan).
Scene 3 (10.0–10.54s): on "checks" all six nodes read ink, the hub turns cyan — the set resolves on the core. Hold still.

Cue map: RuFlo@0.1 · plan@1.2 · memory@4.0 · learn@4.7 · workflows@7.3 · test@8.1 · security@9.5 · checks@10.0

narrativeRole: Maps the capability surface around one hub, so the viewer sees breadth without a feature dump.
keyMessage: One workshop coordinates planning, memory, learning, workflows, testing and security.

## Frame 6 — Fan out, converge on review

- scene: Hand-built flow on one stage — Plan node splits into Research, Build and Test running side by side, which converge into a single Review node, then a memory store below keeps the findings; an inset of the article's workshop illustration settles beside it
- voiceover: "Plan a task, then fan it out: research, build, and test in parallel. One coordinator resolves the findings into a single review, and the important findings are retained for the next session."
- duration: 13.291s
- transition_in: blur-crossfade
- status: outline
- src: compositions/frames/06-fan-out.html
- type: feature_showcase
- persuasion: Demonstration (show the mechanism running) + Causal chain (plan → parallel work → review → memory)
- beat: "Aha" + momentum
- blueprint: compose
- focal: a left-to-right flow diagram: Plan → (Research · Build · Test in parallel) → Review → Memory
- roles: flow diagram = foreground subject (~65% of frame, left 70% column) · three parallel lanes with progress hairlines = foreground detail · memory store (stacked-disc glyph under Review) = supporting · ch01 inset = supporting document (right column, only in Scene 4) · faint dot grid = background (dim ~25%)
- sfx: whoosh-short

Compose: no blueprint has fan-out-then-converge; built from `svg-path-draw` connectors, `dynamic-content-sequencing` node reveals and `stat-bars-and-fills` for the three lane progress bars.
Scene 1 (0.0–1.4s): on "Plan a task"@0.1 the `plan` node (rounded rect, mono index 01) sets on the left at y ≈ 454 — asymmetric 70/30 layout, diagram in the left 70%.
Scene 2 (1.4–5.9s): on "fan it out"@1.4 three connectors branch FROM plan to three stacked lane nodes; each lane node lands on its word — `research` @2.5, `build` @3.6, `test` @4.2 — then on "in parallel"@4.7 a thin progress hairline under each lane fills left→right SIMULTANEOUSLY (the one moment three things move at once — it IS the idea) (`stat-bars-and-fills`), reaching 100% by ~5.9s.
Scene 3 (5.9–10.2s): on "One coordinator"@5.9 three connectors converge from the lanes into a single `review` node on the right (connectors draw from lanes toward review, `power2.inOut`); `review` lands in cyan on "single review"@8.9.
Scene 4 (10.2–13.29s): on "the important findings are retained"@10.5 a connector drops from review to a `memory` store glyph beneath it, which fills with three short mono ticks (findings) on "retained"@11.7; (ch01 inset removed after review — it duplicated the diagram and was on screen too briefly to read; review and memory are ghosted as dim targets from 0 s). Mono label `next session →` sets beside memory on "next session"@12.8. Hold still.

Cue map: Plan@0.1 · fan it out@1.4 · Research@2.5 · build@3.6 · test@4.2 · parallel@4.9 · coordinator@6.1 · single review@8.9 · important findings@10.5 · retained@11.7 · next session@12.8

narrativeRole: The mechanism frame — shows how a team of agents actually moves through a task and what persists afterwards.
keyMessage: Work fans out in parallel, converges on one review, and the useful findings are remembered.

## Frame 7 — Cost per accepted result

- scene: Split stage — the article's cost illustration inset on the left, a calm kicker and headline on the right: "Cost per accepted result"
- voiceover: "More agents are not automatically cheaper. Measure cost per accepted result."
- duration: 5.141s
- transition_in: push-slide LEFT
- status: outline
- src: compositions/frames/07-cost.html
- type: benefit_highlight
- persuasion: Common-belief vs reality + Distillation (compress the lesson to one measure)
- beat: Skepticism → resolve
- blueprint: titlecard-reveal (Adapt)
- asset_candidates: public/chapters/ch12.jpg — the article's cost-and-routing chapter illustration
- focal: the headline "cost per accepted result"
- roles: headline = foreground subject (right 45% column) · ch12 inset (≤ 1056×594, hairline border) = supporting document (left 55%) · kicker "MORE AGENTS ≠ AUTOMATICALLY CHEAPER" = supporting
- sfx: none

Adapt: keep the one-restrained-move calm title; the frame is a split with the plate as a document on the left.
Scene 1 (0.0–2.8s): the ch12 inset is already settled on the left (it arrives with the push-slide). On "More agents are not automatically cheaper"@0.1 the mono kicker `MORE AGENTS ≠ AUTOMATICALLY CHEAPER` sets top of the right column (per-word reveal, finishing on "cheaper"@2.3).
Scene 2 (2.8–5.14s): on "Measure"@2.9 the two-line lowercase heavy headline `cost per` / `accepted result` slides up + fades in (one restrained move, `power3.out`), with "accepted result" in gold on "accepted"@4.0. Hold still (breather frame).

Cue map: More agents@0.1 · cheaper@2.3 · Measure@2.9 · accepted result@4.0

narrativeRole: The caveat — more agents is not the goal; the right measure is.
keyMessage: Judge a team of agents by cost per accepted result.

## Frame 8 — "Done" is not a test result

- scene: The word "done" is struck through and replaced by "evidence"; the article's verification illustration settles beside it
- voiceover: "And an agent saying 'done' is not a test result. Verify tool discovery, permissions, and the actual output."
- duration: 7.616s
- transition_in: blur-crossfade
- status: outline
- src: compositions/frames/08-evidence.html
- type: branding
- persuasion: Before/after + Distillation (done → evidence)
- beat: Resolve + conviction
- blueprint: kinetic-type-beats (Adapt)
- asset_candidates: public/chapters/ch13.jpg — the article's verification chapter illustration
- focal: the hero word "done" struck through, replaced in place by "evidence"
- roles: hero word = foreground subject (left 55%, near full column width) · three-item verify checklist (tool discovery · permissions · actual output) = supporting, under the hero · ch13 inset (≤ 640×360, hairline border) = supporting document (right column) · chrome = supporting
- sfx: whoosh-short

Adapt: keep the in-place token swap signature (`discrete-text-sequence`); the swap is preceded by a drawn strikethrough.
Scene 1 (0.0–1.9s): on "an agent saying"@0.1 a quoted hero word `"done"` sets large (lowercase heavy display) in the left column, upper third; the ch13 inset settles in the right column.
Scene 2 (1.9–3.8s): on "not a test result"@1.9 a cyan strike line draws across "done" left→right (`css-marker-patterns` strike, `expo.out`), then on "result"@2.6 "done" hard-cuts in place to `evidence` in gold (`discrete-text-sequence`). Mono caption `NOT A TEST RESULT` under "done"; at the swap it hard-cuts to `THE CHANGE PLUS EVIDENCE`.
Scene 3 (3.8–7.62s): on "Verify"@3.8 a three-row checklist reveals under the hero, one row per spoken item — `tool discovery` @4.1, `permissions` @5.0, `actual output` @7.1 — each with a small cyan check glyph that draws on. Hold with subtle jitter on "evidence" only.

Cue map: agent saying@0.1 · done@1.2 · not a test result@1.9 · result@2.6 · Verify@3.8 · tool discovery@4.1 · permissions@5.0 · actual output@7.1

narrativeRole: The principle the viewer should keep — trust evidence, not a claim of completion.
keyMessage: Ask for evidence, not a message saying "done".

## Frame 9 — Start small

- scene: A terminal pill types the install command (no output lines), then the RuFlo wordmark locks up with the repo URL, credit and synthetic-media disclosure, and holds
- voiceover: "Start small. Install the RuFlo skill, pick one project and one acceptance test. Add the next capability only when you can name the problem it solves."
- duration: 14.361s
- transition_in: blur-crossfade
- status: outline
- src: compositions/frames/09-start-small.html
- type: cta
- persuasion: Generalization (from the whole film to one first step) + Callback (one task, like the hook's one answer)
- beat: Inspiration + resolve
- blueprint: prompt-type-submit-generate (Adapt)
- focal: a terminal pill typing `npx skills add ruvnet/ruflo --skill ruflo`, then the RuFlo wordmark lockup
- roles: terminal pill (hairline border, mono prompt `$`) = foreground subject in Scenes 1–2 · three small mono chips "one skill · one project · one acceptance test" = supporting · wordmark lockup (hexagon glyph + "RuFlo" in Inter, monochrome ink) = foreground subject in Scene 3 · URL `github.com/ruvnet/ruflo` (cyan mono), credit `BY RUV COHEN · COGNITUM.ONE` and disclosure `SYNTHETIC NARRATION · ILLUSTRATIONS AI-GENERATED` (cream-muted mono, small) = supporting
- sfx: riser, impact-bass-1

Adapt: keep the install-command end-card signature (the command types and holds with a caret, the clip never shows output); then resolve to the logo lockup (logo-assemble-lockup idea, one restrained settle).
Scene 1 (0.0–1.4s): on "Start small"@0.1 the headline `start small.` sets upper-left (per-word reveal); an empty terminal pill with a blinking caret (finite blink, not infinite) draws its hairline border in the upper-center.
Scene 2 (1.4–6.2s): on "install"@1.4 the command types into the pill character-by-character behind the caret (`discrete-text-sequence` + `context-sensitive-cursor`): `npx skills add ruvnet/ruflo --skill ruflo`, completing by ~3.3s; a small cream-muted mono sub-caption `IF YOUR ASSISTANT SUPPORTS THE SKILLS INSTALLER` sets under the pill. Three mono chips reveal under it on their words — `one skill` @2.7, `one project` @3.7, `one acceptance test` @4.8. NO output lines ever appear.
Scene 3 (6.2–10.26s): on "Add the next capability"@6.3 the headline, pill and chips compress up-and-out while the wordmark lockup settles at center (y ≈ 430) — hexagon glyph self-draws then "RuFlo" (monochrome ink, gold hairline underline as the frame's one gold element) with a decisive `expo.out` settle; URL `github.com/ruvnet/ruflo` in cyan mono below it @7.6; credit + disclosure lines in small cream-muted mono @8.6. Hold still to the end (≤ 4 s, subtle jitter on the wordmark only). This is the film's final frame: a gentle 0.4 s fade of all content to canvas at the very end is allowed.

Cue map: Start small@0.1 · install@1.4 · skill@2.7 · project@3.7 · acceptance test@4.8 · Add the next capability@6.3 · only when@7.6 · name the problem@8.6 · solves@10.1

narrativeRole: Lands the call to act — one skill, one project, one acceptance test — then the brand lockup.
keyMessage: Start with one useful task and add capability only when it earns its place.

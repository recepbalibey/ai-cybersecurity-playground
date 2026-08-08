# Design Rules - AI Cybersecurity Playground

Global design system for the AI Cybersecurity Playground.
These rules govern every screen. If something conflicts with these rules, the rules win.

The goal is a professional, calm, educational security platform - not a
"cyberpunk dashboard". Each screen answers **one question** and reveals
complexity gradually.

That said, this is a **hands-on laboratory**: strong holographic effects are
welcome whenever they *react to the user* (hover, pointer move, press, live
analysis). Effects must stay within the single accent color, must never make
text harder to read, and should switch off for "reduce motion" users. The
ratio to keep is: **rest = calm, react = alive**.

---

## 1. Core principle: one question per screen

Every module must answer a single question. Everything on the screen either
answers that question or is removed.

| Module | Question the screen answers |
|--------|----------------------------|
| AI SOC Analyst | "What happened in my security logs?" |
| AI Threat Hunting | "What threat am I looking for?" |
| AI Pentest Assistant | "How should I assess this target?" |
| Prompt Injection | "Can this AI application be manipulated?" |
| Jailbreak | "How robust is this model's safety behavior?" |
| Adversarial ML | "Can this AI model be fooled?" |
| AI Agent Security | "Can this AI agent safely perform actions?" |

**Dominant element.** Each screen has exactly one dominant visual element
(the incident investigation, the threat query input, the image comparison, …).
Everything else is supporting context.

---

## 2. Color system

Colors communicate **meaning**, not decoration.

- **Base** - one muted dark background (`#070a0f`), one surface (`#0d121d`).
- **Accent** - exactly one accent color (`#06b6d4` cyan) used for the primary
  action and active states. Never gradient fills, never rainbow.
- **Semantic colors only for meaning:**
  - Critical → rose/red
  - Warning → amber
  - Success → emerald
  - Information → cyan (the accent)

Rules:
- No bright purple. No blue-cyan gradients. No rainbow multi-color panels.
- No decorative colored borders on idle elements - use neutral borders
  (`slate-800` family).
- Color must be the *last* differentiator; combine it with shape/text/icon.

---

## 3. Typography

- **Sans** - Inter for all UI text.
- **Mono** - JetBrains Mono for logs, data, timestamps, and technical tokens.
  Mono is for *content that is read*, not decoration.
- Sizes: 15px base. Titles `text-base`-`text-xl`. Never shrink below 10px.
- Uppercase labels only in mono, `tracking-wider`, muted color, max 11px.
- Do not use ALL CAPS for body text.

---

## 4. Spacing & layout

- Prefer a **single main workspace** (~70%) plus one context column (~30%).
- Avoid 4-5 simultaneous panels. If you need 4 columns, combine or collapse
  into tabs / progressive disclosure.
- Standard spacing scale: 4 / 6 / 8 / 12 / 16 / 24 / 32 px.
- Vertical rhythm inside panels: `space-y-3` / `space-y-4`.
- One panel = one topic. Merge panels that share a topic.

---

## 5. Buttons & actions

- **Primary action** - solid accent background, dark text, `h-10`, one per screen.
- **Secondary action** - neutral border, transparent background.
- **Tertiary / text action** - no border, muted text.
- Height: `h-9` (compact), `h-10` (default), `h-11` (large).
- Radius: `rounded-md` (6px) for inputs and buttons; `rounded-lg` (8px) for panels.
- Icons in buttons: 16px, aligned 8px from the label.
- A screen has exactly **one** obvious primary action.

---

## 6. Icons

- Use only **Lucide** icons. No emojis anywhere.
- Consistent size and stroke: 16px icons at `strokeWidth={1.75}` for UI;
  18-20px for section headers.
- Icon meaning must be obvious; prefer well-known glyphs.
- Never use an icon as a standalone button without `aria-label` / `title`.

---

## 7. Cards & panels

Before adding a card ask: *"Does this information need separation?"*
If not, remove the card.

- No KPI-dashboard density. No "widget wall".
- Panels: `cyber-panel` style - muted surface, neutral border, `rounded-lg`.
- One accent border is allowed only to signal an *active* or *blocked* state.
- Do not surround every small component in a card; group related info in one panel.

---

## 8. Progressive disclosure

Do not show everything at once. Reveal in steps:

1. Primary input / action (the question).
2. Result visualization (what happened).
3. Explanation (why it happened / what it means).

Collapsible sections and tabs are preferred over simultaneous panels.

---

## 9. Animation rules

Animation communicates **state**, never decoration.

Allowed: AI processing, scanning, data flow, completion, threat detection.
Banned: floating objects, continuous decorative motion, glow that never stops.

- Processing → small spinner + muted "Working…" label.
- Completion → subtle highlight, no confetti.
- Animation duration 200-600ms, ease-out, no infinite loops except the
  scanning/progress indicator.

### 9a. Interactive (reaction) effects

While the user *is touching the screen*, stronger effects are intended:

- Sheen sweep + glow on primary buttons, lift + glow on interactive rows
  (`hover-lift`), slide-in arrows (`slide-arrow`), text glow
  (`hover-text-glow`), animated progress fills (`progress-fill`).
- **Holographic border** that circles a card while hovered (`holo-border`).
- **Tilt + cursor spotlight** on main cards (`HoloTilt`).
- **Cursor-following halo** behind the whole workspace (`CursorHalo`).
- **Electron orbit loader** (`electron`) replaces the plain spinner wherever
  an AI starts working - a glowing core with two electrons circling it.
- **Radar sweep** (`radar-sweep`) - a rotating conic beam + concentric
  detector rings that appear on live elements while streaming or on hover
  (`radar-live` / `radar-hover`); **sonar ping** (`sonar`) ripples outward
  twice from a live indicator.
- **Holo-reticle** (`holo-reticle`) - scope corner brackets + a horizontal
  tickline that snap onto the dominant input / element on hover.
- **Holo-glitch** (`holo-glitch`) - a subtle accent RGB-split text-shift on
  hover for key labels, kept inside the palette (no rainbow).
- **Glossary terms** (`HoloTerm`) - dashed-accent inline terms that float a
  holographic definition bubble while hovered; the student-facing quick-answer
  layer used inside reports.
- **Holographic gauge** (`HoloGauge`) - a radial arc that fills in with an
  animated count-up of the score, a rotating conic sweep while focused, and a
  hover-hand hovering _why this number matters_ note. Used for confidence /
  quality readouts so students learn what the metric means.
- **Cursor matrix** (`HoloMatrix`) - a canvas lattice behind hero banners or
  panel headers whose cells light up and ripple near the pointer and settle
  back when you leave; hidden at rest.

Rules for every reaction effect:

1. It only runs in response to a user action (hover / pointer / press),
   never on idle.
2. Content stays readable: effects are overlays, never full-opacity.
3. Every effect has a `prefers-reduced-motion` escape hatch.

---

## 10. States

Never show an empty screen.

- **Skeleton** - while loading (neutral shimmer panels).
- **Processing** - spinner + status label in the dominant area.
- **Empty** - one muted line explaining what to do next, plus the primary action.
- **Error** - one clear line with the reason and a retry action.

---

## 11. Data design

Design for realistic data:

- Long usernames, big log files, long vulnerability names, long prompts.
- **Truncation** - `truncate` / `line-clamp` with a `title` attribute for the full value.
- **Expandable** - long values open into a modal or expandable row.
- Never let text overflow its container; always provide an overflow strategy.

---

## 12. Onboarding

First visit only:

- One lightweight choice: learning path (AI for Cybersecurity vs Cybersecurity of AI).
- Then recommend labs. Never force a tutorial.

---

## 13. Scoreboard

A lightweight learning scoreboard:

- Labs completed, concepts learned, experiments performed.
- Present as a single progress line, e.g. "Completed 3/7 labs".
- No gamification overload - no streaks, no leaderboards.

---

## 14. Reference quality

The design should feel like a professional software product
(Linear, Vercel, Stripe, Notion) combined with a security laboratory
(CrowdStrike, Palo Alto, SentinelOne).

Final review checklist for every screen:

1. Can a student understand the purpose in 10 seconds?
2. Is there one obvious next action?
3. Is anything visually louder than the learning objective?
4. Can anything be removed?
5. Does it look like a professional platform, not an AI-generated dashboard?

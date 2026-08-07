# DESIGN_RULES.md - AI Cybersecurity Playground Design System

## Product Vision & Aesthetic Philosophy
The **AI Cybersecurity Playground** is a master's-level educational cyber defense platform. The UI is designed to feel like an operational, state-of-the-art **Security Operations Center (SOC) Command Center** (inspired by CrowdStrike Falcon, Palo Alto Cortex XSIAM, Linear.app, and Vercel Dashboard).

It strictly avoids generic AI SaaS cliches:
- NO excessive cards or random decorative gradients.
- NO purple/blue generic AI glow gradients.
- NO emojis anywhere in the interface.
- NO repetitive or meaningless KPI blocks.
- NO frivolous or distracting decorative animations.

Every pixel, icon, color, and motion serves an operational purpose.

---

## 1. Typography & Hierarchy

### Fonts
- **Primary Body & UI Sans**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`
- **Monospace Code, Logs & Telemetry**: `JetBrains Mono`, `Fira Code`, `Consolas`, `monospace`

### Font Sizes & Weights
| Token | Size / Line-Height | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `text-xs` | 11px / 16px | 400 (Regular) | `tracking-wider uppercase` | Labels, Badges, Micro-headers |
| `text-sm` | 13px / 20px | 400 / 500 (Medium) | `normal` | Secondary text, Log lines, Table cells |
| `text-base` | 14px / 22px | 500 (Medium) | `normal` | Body text, Buttons, Active items |
| `text-lg` | 16px / 24px | 600 (Semi-bold) | `-0.01em` | Card titles, Section headers |
| `text-xl` | 20px / 28px | 600 (Semi-bold) | `-0.02em` | Module headers, Primary metrics |
| `text-2xl` | 24px / 32px | 700 (Bold) | `-0.025em` | Top-level section titles |

---

## 2. Color Palette & Semantic Color Usage

Colors are strictly functional. Backgrounds remain deep dark neutrals; colors indicate operational states, threat severities, and AI activity states.

### Neutral Base (Dark Theme)
- `bg-cyber-base`: `#070a0f` (Deepest Charcoal/Black Background)
- `bg-cyber-surface`: `#0d121d` (Panel / Glass Card Background)
- `bg-cyber-surface-hover`: `#141c2c` (Hover State / Active Item Background)
- `border-cyber-border`: `#1e293b` (Subtle 1px Panel Border)
- `border-cyber-border-light`: `#334155` (Active / Focused Border)
- `text-cyber-muted`: `#64748b` (Secondary Metadata Text)
- `text-cyber-text`: `#e2e8f0` (Primary Readable Text)
- `text-cyber-heading`: `#f8fafc` (High Contrast Headings)

### Primary Accent & AI Telemetry
- `accent-cyan`: `#06b6d4` (Cyan-500) - AI Processing, Active Scanner, Telemetry Flow
- `accent-cyan-glow`: `rgba(6, 182, 212, 0.15)` - Subtle glow effect behind active AI stages

### Semantic Severity & Status Colors
- **Critical Severity**: Red `#ef4444` (`bg-red-950/40 border-red-500/50 text-red-400`)
- **High Severity**: Orange `#f97316` (`bg-orange-950/40 border-orange-500/50 text-orange-400`)
- **Medium Severity**: Amber `#f59e0b` (`bg-amber-950/40 border-amber-500/50 text-amber-400`)
- **Low Severity / Info**: Slate/Blue `#3b82f6` (`bg-blue-950/40 border-blue-500/50 text-blue-400`)
- **Online / Safe / Verification**: Emerald `#10b981` (`bg-emerald-950/40 border-emerald-500/50 text-emerald-400`)

---

## 3. Spacing & Grid System

- **Layout Container Gap**: `gap-4` (16px) or `gap-6` (24px) for major command center grid divisions.
- **Panel Padding**: `p-4` (16px) standard, `p-6` (24px) for full report views.
- **Micro-Gaps**: `gap-2` (8px) for badge lists, inline indicators, icon-text pairs.
- **Component Heights**:
  - Small Buttons / Inputs: `h-8` (32px)
  - Medium Buttons / Inputs: `h-10` (40px)
  - Log Terminals: Minimum height `min-h-[280px]` with custom scrollbars (`scrollbar-thin`).

---

## 4. Buttons, Cards & Component States

### Buttons
- **Primary Action (e.g. Start AI Analysis)**:
  - Height: `h-10` (40px)
  - Background: Cyan solid (`bg-cyan-600 hover:bg-cyan-500`) with subtle glow (`shadow-[0_0_15px_rgba(6,182,212,0.3)]`).
  - Text: `text-slate-950 font-semibold text-xs tracking-wider uppercase`.
- **Secondary Action (e.g. Load Demo Dataset)**:
  - Height: `h-8` (32px) or `h-9` (36px)
  - Background: `bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200`.
- **States**:
  - Focus: `outline-none ring-1 ring-cyan-500/50 ring-offset-1 ring-offset-slate-950`
  - Disabled: `opacity-50 cursor-not-allowed`

### Panels & Cards
- Glassmorphism structure: `bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-lg shadow-xl`
- Subtle grid texture backdrop applied via SVG pattern overlay.

---

## 5. Icons & Typography Rules
- **Icons**: Standardized Lucide React icons ONLY (`ShieldAlert`, `Terminal`, `Cpu`, `FileCode`, `Activity`, `CheckCircle2`, `AlertTriangle`, `Layers`, `Radio`, `Search`, etc.).
- **Emojis**: STRICTLY FORBIDDEN.

---

## 6. Animation Rules (Purposeful Motion)

Animations must explicitly answer *"Why is this moving?"*:

1. **AI Pulse Indicator**:
   - *Purpose*: Communicates live backend connection and AI model readiness.
   - *Implementation*: `animate-ping` on a 6px emerald dot inside an indicator badge.
2. **Scanner Beam Animation**:
   - *Purpose*: Visually indicates active line-by-line log ingestion and feature extraction.
   - *Implementation*: Smooth linear vertical scanline gradient translating across the log terminal.
3. **Stage Processing Timeline**:
   - *Purpose*: Demonstrates sequential AI reasoning steps (Stage 1 -> Stage 5).
   - *Implementation*: Step-by-step progress bar filling and glowing icon state changes.
4. **Interactive Teaching Overlay**:
   - *Purpose*: Provides master's level instructor guidance without cluttering standard operational views.
   - *Implementation*: Smooth fade-in drawer (`transition-all duration-200 ease-in-out`).

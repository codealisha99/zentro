# Zentro — Visual Design Direction

Product: a 1:1 WebRTC video call app. The call is the whole product — two
people, one link, zero middlemen. The visual identity should express that
architecture, not decorate it.

## Constraints

- Dark-first product (calls happen on dark video).
- No invented claims: visuals express the real mechanics (direct P2P,
  WebRTC data channels, local-only features). No fake stats or testimonials.
- Existing WebRTC behavior is sacred: no functional changes to
  `lib/signaling.ts`, `lib/webrtc.ts`, streams, or state flow.
- Same CSS variable names are kept (`--accent`, `--danger`, …) and re-priced
  so the whole app re-skins from one file.

---

## Direction 1 — "Straight Through" (chosen)

Technical / editorial schematic. Ink-black canvas, warm paper text,
signal-green connection accent, mono microcopy labels. The UI reads like a
well-made circuit diagram: hairline borders, uppercase mono captions, a
single green line that means "connected."

- Canvas: near-black ink `#0B0C0E`, surfaces `#111316` → `#17191D`
- Text: warm paper `#F4F1E8` at 100% / 62% / 40%
- Accent (connection): signal green `#00DC82` — reserved for live/linked state
- Danger (end call, errors): red `#E5484D`
- Primary actions: solid paper-white buttons on ink; not colored blocks
- Typography: Sora (display, tight tracking) / Inter (body) /
  JetBrains Mono (labels, room IDs, meters) — uppercase, letterspaced
- Signing motif: hairline dashed paths, corner ticks, `◍` status dots,
  schematic SVG of two devices wired directly with the relay server crossed out
- Motion: precise, short (≤350ms), dash-draw reveals; no blobs, no aurora

Why it wins: the product's differentiation *is* the direct path. The
design language should be the architecture diagram of the product itself.
It photographs well at both hero scale and control-bar scale, and green
"connected" reads instantly in a call UI.

## Direction 2 — Handset Modern (rejected)

Graphite + single violet accent, pill-heavy controls, neon-glass call bars.
Strong for a "premium gamer headset" vibe but starts from decoration, and
violet is now the default neon of AI landing pages — the identity would not
say anything zentro uniquely owns.

## Direction 3 — Ivory Editorial (rejected)

Light paper background, serif display, thin rules, photography-led.
Memorable and award-y, but a light-first landing collapsing into a
dark-first call UI is a jarring handoff for the product's core moment
(entering a room), and call grids on light chrome look washed out.

---

## Token map (same names, new values)

| token | value |
| --- | --- |
| `--bg` | `#0B0C0E` |
| `--surface` / `--surface-raised` / `--surface-hover` | `#111316` / `#181B1F` / `#1E2126` |
| `--accent` / `-bright` / `-deep` / `-soft` | `#00DC82` / `#41F29B` / `#00B569` / `rgba(0,220,130,.12)` |
| `--danger` / `-bright` | `#E5484D` / `#FF6169` |
| `--success` | `#00DC82` (alias of accent) |
| `--warning` | `#F5A524` |
| `--text-primary` | `#F4F1E8` (warm paper) |
| radius | sm 6 / md 10 / lg 14 / xl 20 (tighter, more technical) |

Reject violet everywhere; primary "Enter meeting" / "Start a call" buttons go
solid paper-white with ink text (invert on hover).

## Component rules

- Labels/meters/room IDs: JetBrains Mono, uppercase, `0.14em` tracking.
- Borders: hairline `rgba(paper, .08)`, focus rings signal green.
- Status language: green = live/connected, amber = waiting, red = off/failed.
- Landing hero visualization: inline SVG schematic — device A and device B
  joined by a solid green line; a dashed gray path through a "server" block
  is struck through. Dashes animate only under `prefers-reduced-motion: none`.
- Recording/REC indicator keeps red blink; speaking ring switches to green.

## QA bar

- Build passes, vitest 14/14, no regressions to VideoGrid callback-ref or
  AnimatePresence patterns.
- Desktop 1440 + true mobile 390 both routes captured; no horizontal
  overflow; reduced-motion CSS intact.

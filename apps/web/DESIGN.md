# Zentro Design System — Glass Noir

**Visual identity:** Rich and cinematic — more like a premium product than a hackathon demo.  
Competitors (Zoom, Meet, Teams) use flat-minimal. Glass Noir is differentiated.

---

## Color Tokens

All colors are defined as CSS custom properties in `app/globals.css`.

```css
/* Backgrounds */
--bg:             #0d0d12   /* Page background */
--surface:        #131520   /* Card / panel surface */
--surface-raised: #1a1d2e   /* Elevated element (input, button base) */

/* Borders */
--border:         rgba(255,255,255,0.07)   /* Default border */
--border-bright:  rgba(255,255,255,0.14)   /* Hover / focus border */

/* Accent (violet) */
--accent:         #7c3aed   /* Primary interactive color */
--accent-bright:  #8b5cf6   /* Hover state of accent */
--accent-glow:    rgba(124,58,237,0.35)   /* Shadow/glow behind accent buttons */

/* Danger (red) */
--danger:         #ef4444
--danger-glow:    rgba(239,68,68,0.35)

/* Text */
--text-primary:   #f0f0f8                     /* High emphasis */
--text-secondary: rgba(240,240,248,0.6)       /* Medium emphasis */
--text-muted:     rgba(240,240,248,0.35)      /* Low emphasis / labels */
```

**Never use hardcoded hex or rgba in components.** Reference tokens above.

---

## Border Radius Tokens

```css
--radius-sm: 6px    /* Tags, chips, tiny badges */
--radius-md: 10px   /* Buttons, inputs, small cards */
--radius-lg: 16px   /* Medium panels */
--radius-xl: 22px   /* Large panels, video containers */
```

Use `rounded-[var(--radius-*)]` in Tailwind or `border-radius: var(--radius-*)` inline.

---

## Typography

Font: **Plus Jakarta Sans** — loaded via `next/font/google` in `app/layout.tsx`.  
CSS variable: `--font-jakarta`. Applied via `font-sans` (extended in `tailwind.config.ts`).

| Role | Size | Weight | Color token |
|------|------|--------|-------------|
| Display | `text-3xl` | `font-bold` | `--text-primary` |
| Heading | `text-xl` | `font-semibold` | `--text-primary` |
| Body | `text-sm` | `font-normal` | `--text-primary` |
| Label | `text-xs` | `font-semibold` | `--text-muted` |
| Caption | `text-[10px]` | `font-medium` | `--text-muted` |
| Mono (timer) | `text-sm font-mono` | — | `--text-muted` |

---

## Gradient Border Pattern

A CSS `::before` pseudo-element creates a 1px gradient border on any element.  
Apply the `.gradient-border` class in `globals.css`.

```css
.gradient-border { position: relative; }
.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg,
    rgba(124,58,237,0.45),
    rgba(255,255,255,0.08),
    rgba(124,58,237,0.18)
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

**When to use:** Camera preview panels, control bar, PIP video frame, right-side form panels.  
**When not to use:** Individual buttons, inline chips, or elements that already have a visible border.

---

## Noise Texture

A subtle film-grain overlay is applied to the whole page via `body::before` in `globals.css`.  
Source: SVG `feTurbulence` data URI — zero network request.  
Opacity: `0.028` — barely visible, but adds tactile depth on high-DPI displays.

---

## Background Vignette

`components/BackgroundVignette.tsx` — shared component for both Lobby and Meeting phases.  
Two corner radial gradients using `rgba(124,58,237,…)` at top-left and bottom-right.  
No full-page blobs. No centered glows.

---

## Component Patterns

### ControlButton

```
w-11 h-11, rounded-[var(--radius-md)]
```

| State | Background | Border | Color |
|-------|-----------|--------|-------|
| Default / Active | `--surface-raised` | `--border-bright` | `--text-secondary` / `--text-primary` |
| Muted (audio/video off) | `rgba(239,68,68,0.15)` | `rgba(239,68,68,0.25)` | `#f87171` |
| Recording active | `rgba(245,158,11,0.15)` | `rgba(245,158,11,0.25)` | `#fbbf24` |

### End Call Button

`w-11 h-11, rounded-[var(--radius-md)]`  
Background: `--danger`, shadow: `0 0 20px -6px var(--danger-glow)`.

### Control Bar Container

`.gradient-border`, `rounded-[var(--radius-xl)]`, `backdrop-blur-xl`.  
Background: `rgba(19,21,32,0.85)`.  
Dividers: `w-px h-5`, `background: var(--border-bright)`.

### Name Chip (video overlay)

```tsx
style={{
  background: 'rgba(13,13,18,0.75)',
  backdropFilter: 'blur(12px)',
  border: '1px solid var(--border-bright)',
  color: 'var(--text-primary)',
}}
```

Position: `absolute bottom-3 left-3`, rounded `var(--radius-sm)`.

### Panel (Chat, Participants)

```
background: rgba(26,29,46,0.85)
border: 1px solid var(--border)
border-radius: var(--radius-xl)
backdrop-blur-xl
```

### Avatar Circle

```
background: rgba(124,58,237,0.2)
color: var(--accent-bright)
border-radius: 9999px (full)
```

### Input

```
background: var(--surface-raised)
border: 1px solid var(--border-bright)
border-radius: var(--radius-md)
```

Focus: `borderColor: 'var(--accent-bright)'`, `boxShadow: '0 0 0 3px rgba(139,92,246,0.12)'`

---

## Anti-Patterns

| ❌ Don't | ✅ Do instead |
|---------|-------------|
| `bg-indigo-600`, `text-fuchsia-400` | `bg-[var(--accent)]`, `text-[var(--accent-bright)]` |
| `rounded-full` on non-circular elements | `rounded-[var(--radius-md/lg/xl)]` |
| `bg-slate-900`, `bg-slate-800` | `bg-[var(--surface)]`, `bg-[var(--surface-raised)]` |
| Decorative blob divs (`blur-[140px]`) | `<BackgroundVignette />` |
| System font (no font class) | `font-sans` (Plus Jakarta Sans via `--font-jakarta`) |
| Hardcoded `#1a2235` in `border-*` | `var(--border)` or `var(--border-bright)` |
| `border border-white/10` | `border border-[var(--border-bright)]` or `.gradient-border` |

---

## Tailwind Extensions

`tailwind.config.ts` adds:

```typescript
fontFamily: { sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'] }
colors: {
  accent: { DEFAULT: '#7c3aed', bright: '#8b5cf6' },
  surface: { DEFAULT: '#131520', raised: '#1a1d2e' },
}
```

Use `bg-accent`, `text-accent-bright`, `bg-surface-raised` etc. in utility classes.

---

## Meeting vs Lobby Background

| Phase | Background |
|-------|-----------|
| Lobby | `#0d0d12` (standard base) |
| Meeting | `#080810` (deeper — more cinematic letterbox feel) |

# Kinau design system

A calm, product-first market. Products and prices are loud; everything else is quiet.
Whitespace, hairlines and tinted backdrops replace stacked cards.

## Tokens (all defined in `src/index.css` under `@theme`)

| Token | Value | Used for |
| --- | --- | --- |
| `paper` | `#F1F5F2` | page background |
| `paper-2` | `#E4EBE6` | image backdrops, hover fills, table headers, skeletons |
| `surface` | `#FFFFFF` | panels, dialogs, inputs |
| `line` | `#D3DBD6` | hairlines, input borders |
| `ink` / `ink-2` / `muted` | `#10231F` / `#3D524C` / `#5A6B64` | primary / secondary / caption text |
| `pine` | `#0F4A43` | brand: nav rail, footer, order summary, secondary solid buttons, focus ring |
| `marigold` | `#F2A900` | the single primary CTA per screen, hero accent |
| `crimson` | `#B3261E` | errors, destructive actions, low stock |
| `crimson-bright` | `#FFB4AB` | destructive text drawn on a pine surface |
| `sky` | `#14507A` | shipped status |
| `amber` | `#8A5A00` | pending status text on `marigold-soft` |
| `nav-h` | `4rem` | sticky Navbar height; pages that stick content under it offset by this token |

All text/background pairings meet WCAG AA (4.5:1 body, 3:1 large).

## Text on pine

`pine` is a deep brand green, so nothing on it is drawn in `ink`, `ink-2`, `muted` or
`crimson` — all four are darker than the surface and land between 0.6:1 and 1.8:1.
On pine use:

| Role | Token | Ratio on `pine` |
| --- | --- | --- |
| Headings, values, primary copy | `paper` | 9.2:1 |
| Supporting copy | `pine-soft` | 8.2:1 |
| Small supporting copy | `paper/75` · `paper/70` · `paper/65` | 5.9:1 · 5.4:1 · 4.9:1 |
| Large text only (24px, or 18.66px bold) | `paper/60` | 4.4:1 |
| Hairlines, dividers | `paper/20` · `paper/15` | decorative |
| Destructive action | `crimson-bright` | 5.9:1 |
| Focus ring, hero accent, the one primary CTA | `marigold` | 5.0:1 |

A pine surface must set its own text colour (usually `text-paper` on the container) so
children inherit the light scale. Reusable components that render on both surfaces take
an `onPine` flag, following `QuantityStepper`.

## Colour rules

- `marigold` is reserved for the single most important action on a screen. Never more than one marigold button per screen.
- `pine` is the brand colour. On a pine surface, draw focus rings in marigold.
- `crimson` only for errors, destructive actions and low stock.
- Status: pending = `amber` on `marigold-soft`; shipped = `sky` on `sky-soft`; delivered and paid = `pine` on `pine-soft`; cancelled = `crimson` on `crimson-soft`; unpaid = `muted` on `paper-2`. Source of truth: `statusStyles` / `paymentStyles` in `src/Components/vendor/types.ts`.

## Type

- `font-display` (Bricolage Grotesque) for headings, prices, big numerals.
- `font-sans` (Instrument Sans) for everything else.
- Both are loaded as variable fonts from Fontsource, so weights and widths are one file each.
- Neither covers Devanagari, so Nepali product names fall back to Noto Sans Devanagari (loaded for that reason only). It reads fine; Latin and Devanagari runs will not match perfectly. Keep Devanagari text on `font-sans`, never on `font-display`, so the mismatch stays confined to one line of text.
- Scale: 12 / 14 / 16 / 18 / 22 / 28 / 36 / 48. Body 16 on mobile, 15 on desktop, line-height 1.5.
- Headings line-height ~1.15, letter-spacing negative from 28px up.
- Sentence case everywhere. No tracked uppercase labels, no `capitalize` utility on UI strings.
- Prose capped at `max-w-prose` (~65 characters).
- `tabular-nums` on prices, tables and stats.

## Radius roles

- `rounded-control` (8px) — buttons, inputs, selects.
- `rounded-panel` (12px) — dialogs, order summary, list surfaces.
- `rounded-tile` (6px) — product image tiles.
- `rounded-full` — status badges and the cart count only.

## Surfaces and motion

- Resting surfaces use a 1px `line` border or no border. No `shadow-sm` on cards.
- `shadow-lift` (pine-tinted) is the one elevated shadow: dropdowns, dialogs, toasts only.
- Product tiles have no card at all: image on `paper-2`, text beneath.
- One orchestrated moment: landing hero mosaic fades and rises with a 60ms stagger.
- Responsive feedback only: cart count bump (200ms), dialog fade-in (150ms).
- No hover lifts, no scroll-triggered entrances. The app is wrapped in `<MotionConfig reducedMotion="user">` and a `prefers-reduced-motion` rule kills CSS animation.

## Primitives — `src/Components/ui/`

`Button` · `Input` · `Textarea` · `Field` · `Select` · `Dialog` (with a `sheet` variant) · `DropdownMenu` · `Checkbox` · `RadioGroup` · `StatusBadge` · `Price` · `QuantityStepper` · `Skeleton` · `EmptyState` · `PageHeader` · `Container` · `StatusPanel` · `Panel` · `RevenueChart` · `SegmentedControl` · `FilterBar` (`SearchField` · `ChipGroup` · `ResultMeta`)

Dashboard charts are inline SVG drawn with `currentColor` against `line`, `muted` and `pine`, so no hex values appear outside `src/index.css`.

Helpers: `cn()` in `src/lib/cn.ts`, money and date formatting in `src/lib/format.ts`.
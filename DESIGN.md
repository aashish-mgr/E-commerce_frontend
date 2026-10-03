# ShopEase design system

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
| `sky` | `#14507A` | shipped status |
| `amber` | `#8A5A00` | pending status text on `marigold-soft` |

All text/background pairings meet WCAG AA (4.5:1 body, 3:1 large).

## Colour rules

- `marigold` is reserved for the single most important action on a screen. Never more than one marigold button per screen.
- `pine` is the brand colour. On a pine surface, draw focus rings in marigold.
- `crimson` only for errors, destructive actions and low stock.
- Status: pending = `amber` on `marigold-soft`; shipped = `sky` on `sky-soft`; delivered and paid = `pine` on `pine-soft`; cancelled = `crimson` on `crimson-soft`; unpaid = `muted` on `paper-2`. Source of truth: `statusStyles` / `paymentStyles` in `src/Components/vendor/types.ts`.

## Type

- `font-display` (Bricolage Grotesque) for headings, prices, big numerals.
- `font-sans` (Instrument Sans) for everything else.
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
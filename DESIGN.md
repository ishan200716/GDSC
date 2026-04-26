# CommunityPulse Design System

## Brand & Style

This design system is engineered to evoke the feeling of a high-stakes intelligence hub. It bridges the gap between civic responsibility and advanced artificial intelligence, presenting data not just as information, but as actionable insight. The aesthetic is "Mission Control"—a near-future interface that feels authoritative, precise, and hyper-functional.

The visual style is a sophisticated blend of **Glassmorphism** and **High-Contrast Modernism**. It utilizes depth through translucency and light-emissive accents to prioritize information density without overwhelming the user. Every element is designed to feel like a high-precision instrument, utilizing thin strokes and microscopic details to signal accuracy and technical prowess.

## Colors

| Token Name | Hex Code |
| :--- | :--- |
| `background` | `#0f131f` |
| `on_background` | `#dfe2f3` |
| `surface` | `#0f131f` |
| `on_surface` | `#dfe2f3` |
| `surface_dim` | `#0f131f` |
| `surface_bright` | `#353946` |
| `surface_container_lowest` | `#0a0e1a` |
| `surface_container_low` | `#171b28` |
| `surface_container` | `#1b1f2c` |
| `surface_container_high` | `#262a37` |
| `surface_container_highest` | `#313442` |
| `on_surface_variant` | `#bacac7` |
| `inverse_surface` | `#dfe2f3` |
| `inverse_on_surface` | `#2c303d` |
| `surface_tint` | `#24ddd1` |
| `surface_variant` | `#313442` |
| `primary` | `#47f1e4` |
| `on_primary` | `#003733` |
| `primary_container` | `#00d4c8` |
| `on_primary_container` | `#005651` |
| `inverse_primary` | `#006a64` |
| `primary_fixed` | `#54faed` |
| `primary_fixed_dim` | `#24ddd1` |
| `on_primary_fixed` | `#00201e` |
| `on_primary_fixed_variant` | `#00504b` |
| `secondary` | `#d2bbff` |
| `on_secondary` | `#3f008e` |
| `secondary_container` | `#6001d1` |
| `on_secondary_container` | `#c9aeff` |
| `secondary_fixed` | `#eaddff` |
| `secondary_fixed_dim` | `#d2bbff` |
| `on_secondary_fixed` | `#25005a` |
| `on_secondary_fixed_variant` | `#5a00c6` |
| `tertiary` | `#ffcfc0` |
| `on_tertiary` | `#5d1900` |
| `tertiary_container` | `#ffa88b` |
| `on_tertiary_container` | `#8d2a00` |
| `tertiary_fixed` | `#ffdbd0` |
| `tertiary_fixed_dim` | `#ffb59d` |
| `on_tertiary_fixed` | `#390c00` |
| `on_tertiary_fixed_variant` | `#832600` |
| `error` | `#ffb4ab` |
| `on_error` | `#690005` |
| `error_container` | `#93000a` |
| `on_error_container` | `#ffdad6` |
| `outline` | `#849491` |
| `outline_variant` | `#3b4a48` |

## Typography

| Style Name | Font Family | Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `h1` | Space Grotesk | 48px | 700 | 1.1 | -0.02em |
| `h2` | Space Grotesk | 36px | 700 | 1.2 | -0.01em |
| `h3` | Space Grotesk | 28px | 600 | 1.3 | normal |
| `h4` | Space Grotesk | 20px | 600 | 1.4 | normal |
| `body-lg` | Inter | 18px | 400 | 1.6 | normal |
| `body-md` | Inter | 16px | 400 | 1.6 | normal |
| `body-sm` | Inter | 14px | 400 | 1.5 | normal |
| `label-caps`| Inter | 12px | 600 | 1.0 | 0.1em |
| `data-mono` | Space Grotesk | 14px | 500 | 1.0 | 0.05em |

## Spacing Scale

| Token Name | Value |
| :--- | :--- |
| `unit` | 4px |
| `xs` | 4px |
| `sm` | 8px |
| `md` | 16px |
| `gutter` | 20px |
| `lg` | 24px |
| `margin` | 32px |
| `xl` | 48px |

## Border Radius (Rounded)

| Token Name | Value |
| :--- | :--- |
| `sm` | 0.125rem (2px) |
| `DEFAULT` | 0.25rem (4px) |
| `md` | 0.375rem (6px) |
| `lg` | 0.5rem (8px) |
| `xl` | 0.75rem (12px) |
| `full` | 9999px |

## Glassmorphism & Depth

### Glass Cards (Backdrop Layers)
All primary containers use a "Glassmorphism" effect to simulate depth through translucency.
- **Background Blur**: `16px` (ranges from 12px to 20px)
- **Background Opacity**: 40-60% of the primary background color (`rgba(15, 19, 31, 0.5)`)
- **Border**: `1px solid rgba(240, 244, 255, 0.1)` (or `#F0F4FF` at 10% opacity)
- **Micro-dot grid**: Added as a background overlay for the header section (`#FFFFFF` at 3-5% opacity).

### Neon Glow (Shadows)
Elements are defined by 1px solid borders with a "Neon Glow" technique.
- **Outer Box-Shadow**: `0px` spread, `2px-4px` blur.
- Uses primary or secondary accent colors at low opacity.
- **Active Elevation**: When an element is focused or hovered, the border brightness increases, and the neon glow expands, simulating a light source being powered up.

### Gradients
Backgrounds should utilize smooth gradient meshes transitioning from the base navy (`#0f131f`) to muted violet (`#3f008e` / `#6001d1`) or teal tones (`#006a64` / `#00d4c8`) in the peripheries.

## Grids & Layout
- 12-column fluid grid for main dashboards.
- Layouts composed of "panels" mimicking a multi-monitor mission control setup.
- Gutters kept tight (20px).
- Larger margins (32px+) at the edges of the viewport to frame the content.

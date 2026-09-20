---
name: Structural Precision
colors:
  surface: '#f3fbfd'
  surface-dim: '#d3dbdd'
  surface-bright: '#f3fbfd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf5f7'
  surface-container: '#e7eff1'
  surface-container-high: '#e2eaec'
  surface-container-highest: '#dce4e6'
  on-surface: '#151d1f'
  on-surface-variant: '#46474a'
  inverse-surface: '#2a3233'
  inverse-on-surface: '#eaf2f4'
  outline: '#76777b'
  outline-variant: '#c6c6ca'
  surface-tint: '#5f5e5f'
  primary: '#010101'
  on-primary: '#ffffff'
  primary-container: '#1c1c1d'
  on-primary-container: '#858485'
  inverse-primary: '#c8c6c7'
  secondary: '#bb0416'
  on-secondary: '#ffffff'
  secondary-container: '#df2b2b'
  on-secondary-container: '#fffbff'
  tertiary: '#000202'
  on-tertiary: '#ffffff'
  tertiary-container: '#181d1f'
  on-tertiary-container: '#808587'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e3'
  primary-fixed-dim: '#c8c6c7'
  on-primary-fixed: '#1b1b1c'
  on-primary-fixed-variant: '#474647'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ac'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#93000e'
  tertiary-fixed: '#dfe3e5'
  tertiary-fixed-dim: '#c3c7c9'
  on-tertiary-fixed: '#181c1e'
  on-tertiary-fixed-variant: '#434749'
  background: '#f3fbfd'
  on-background: '#151d1f'
  surface-variant: '#dce4e6'
typography:
  headline-xl:
    fontFamily: Poppins
    fontSize: 64px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Poppins
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Poppins
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: 0em
  metric-display:
    fontFamily: Poppins
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
  body-lg:
    fontFamily: Poppins
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Poppins
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.08em
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 24px
  margin-desktop: 80px
  column-gap: 32px
  section-padding: 120px
---

## Brand & Style

The design system is engineered to evoke the rigorous authority of high-end structural engineering. The aesthetic is **Technical Minimalism**: a marriage of architectural precision and professional documentation. It targets B2B stakeholders who value robustness, transparency, and technical excellence.

The visual narrative is "The Blueprint in Action"—clean, grid-heavy layouts that feel like a premium digital white paper. This design system utilizes a structural approach with intentional whitespace, heavy dividers, and a strict adherence to a logic-driven hierarchy to ensure clarity in complex data presentation. The emotional response is one of stability, accuracy, and industrial sophistication.

## Colors

The palette is rooted in the raw materials of construction, now optimized for a high-performance **Light Mode** environment to mimic the clarity of professional physical schematics and white papers.

- **Nero (#1C1C1D)**: The primary anchor for the UI. In this light theme, it provides high-contrast definition for primary text, headers, and core structural containers, ensuring uncompromising authority. 
- **Construction Red (#E22D2D)**: Used sparingly and strategically for "Active States," critical metrics, and calls to action. 
- **Cement Grey (#E1E5E7)**: Acts as a subtle tertiary background and surface color, providing a soft technical canvas that differentiates content zones without the harshness of pure white.
- **Steel Grey (#ACB4B6)**: Handles secondary technical details, such as grid lines, dividers, and disabled states, ensuring a monochromatic depth that feels industrial and refined.

## Typography

The typographic system emphasizes geometric precision. **Poppins** is the workhorse for content, providing an architectural sans-serif aesthetic. Headlines leverage heavy weights and tight negative letter spacing to convey mass and strength.

**JetBrains Mono** is the technical secondary typeface, used for measurements, data labels, and process steps. To enhance the "plotted" look, all mono labels should be tracked out by at least 5%. For technical reports with high data density, use `body-md` for standard entries and `label-mono` for all quantitative values.

## Layout & Spacing

This design system utilizes a **Fixed Grid** philosophy to mirror a physical engineering document. 

- **Desktop (1440px):** A strict 12-column grid with 80px side margins and 32px gaps between columns.
- **Verticality:** Sections are separated by large 120px padding blocks to allow structural elements to breathe.
- **Dividers:** Horizontal and vertical rules in `Steel Grey` must be used to separate content zones, appearing as thin (1px) technical lines that align strictly to the grid columns.
- **Rhythm:** An 8px baseline grid governs all internal padding and element spacing, ensuring mathematical consistency. All component heights and margins should be multiples of 8px.

## Elevation & Depth

This design system rejects traditional soft shadows in favor of **Tonal Layering** and **Bold Outlines**. Depth is structural, not atmospheric.

- **Surfaces:** Containers are defined by 1px `Steel Grey` borders against the `Cement Grey` or white background. To highlight specific zones, use a slightly darker surface-container fill to create subtle separation.
- **Active State:** Only critical primary actions may use a "Hard Shadow"—a 2px offset with 0px blur in `Steel Grey` or `Construction Red`. This simulates a physical layer being pressed or raised.
- **Dividers:** Use 1px solid lines for secondary separation. For major structural breaks, use a heavy 4px rule in a contrasting neutral tone.

## Shapes

The shape language is strictly **Sharp (0px)**. All containers, buttons, inputs, and image frames must have 90-degree corners. This reflects the rigid nature of steel beams and architectural blueprints. Rounded corners are prohibited as they compromise the industrial and robust personality of the design system.

## Components

- **Action Buttons:** Use a solid `Nero` background with `Cement Grey` text for high visibility. The hover state must transition to `Construction Red` instantly with no easing to mimic a mechanical switch.
- **Technical Cards:** 1px `Steel Grey` border with 0px radius. Header areas inside cards should be demarcated by a 1px horizontal line and use `Label-Mono` for categories.
- **Input Fields:** Underline-only style. Use a 1px `Steel Grey` border-bottom. Labels use `Label-Mono` and float above the line. Error states change the border-bottom to 2px `Construction Red`.
- **Case Study Metrics:** Large `Metric-Display` text in `Construction Red` paired with a small `Label-Mono` description below it, separated by a thin 1px vertical line.
- **Lists & Data Tables:** No zebra striping. Use 1px `Steel Grey` horizontal dividers between all rows. Headers should be all-caps `Label-Mono` with a subtle surface-container background fill.
- **Flowchart Nodes:** Sharp boxes connected by 2px solid `Steel Grey` lines. Every node must include a mono-spaced step number (e.g., 01, 02) in the top-left corner.
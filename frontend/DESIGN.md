---
name: Structural Precision
colors:
  surface: '#f6fafc'
  surface-dim: '#d6dbdd'
  surface-bright: '#f6fafc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4f6'
  surface-container: '#eaeef0'
  surface-container-high: '#e5e9eb'
  surface-container-highest: '#dfe3e5'
  on-surface: '#181c1e'
  on-surface-variant: '#46474a'
  inverse-surface: '#2c3133'
  inverse-on-surface: '#edf1f3'
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
  tertiary: '#000101'
  on-tertiary: '#ffffff'
  tertiary-container: '#161d1f'
  on-tertiary-container: '#7d8587'
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
  tertiary-fixed: '#dce4e6'
  tertiary-fixed-dim: '#c0c8ca'
  on-tertiary-fixed: '#151d1f'
  on-tertiary-fixed-variant: '#40484a'
  background: '#f6fafc'
  on-background: '#181c1e'
  surface-variant: '#dfe3e5'
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
  headline-md:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Poppins
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Poppins
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  metric-display:
    fontFamily: Poppins
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Poppins
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
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

The visual narrative is "The Blueprint in Action"—clean, grid-heavy layouts that feel like a premium digital white paper. We utilize a structural approach with intentional whitespace, heavy dividers, and a strict adherence to a logic-driven hierarchy to ensure clarity in complex data presentation.

## Colors
The palette is rooted in the raw materials of construction. 
- **Nero (#1C1C1D)** serves as the primary anchor for all text, headers, and structural UI elements, providing uncompromising authority. 
- **Construction Red (#E22D2D)** is used sparingly and strategically for "Active States," critical metrics, and calls to action. 
- **Cement Grey (#E1E5E7)** is the foundational background, offering a softer, more professional alternative to pure white that mimics technical paper. 
- **Steel Grey (#ACB4B6)** handles the secondary technical details, such as grid lines, dividers, and disabled states, ensuring a monochromatic depth that feels industrial and refined.

## Typography
The typographic system emphasizes geometric precision and technical clarity through a unified typeface approach. **Poppins** is utilized for both headlines and body copy, providing a clean, architectural sans-serif aesthetic that feels both modern and engineered. Headlines leverage heavy weights and tight letter spacing to convey strength, while body text uses standard weights for maximum legibility in technical reports.

A secondary typeface, **JetBrains Mono**, is introduced for technical labels, measurements, and "Construction Process" steps to reinforce the engineering aesthetic. All headlines should utilize tight letter spacing, while mono-labels should be slightly tracked out for a "plotted" look.

## Layout & Spacing
This design system utilizes a **Fixed Grid** philosophy to mirror a physical engineering document. 
- **Desktop:** A strict 12-column grid with generous 80px margins and a 1440px max-width container. 
- **Verticality:** Sections are separated by large 120px padding blocks to allow the "structural" elements to breathe.
- **Dividers:** Horizontal and vertical rules in `Steel Grey` should be used to separate content zones, appearing as thin (1px) technical lines.
- **Rhythm:** An 8px baseline grid governs all internal padding and element spacing, ensuring mathematical consistency.

## Elevation & Depth
In line with the minimalist-structural style, this design system rejects traditional soft shadows. Depth is communicated through **Tonal Layering** and **Low-contrast Outlines**.

- **Surfaces:** Most "cards" are flush with the background, defined by 1px `Steel Grey` borders or subtle shifts in background tone (e.g., a card using a white fill against the `Cement Grey` page).
- **Active State:** Only the primary action elements may use a subtle, hard-edged shadow (2px offset, 0 blur) in `Nero` to simulate a "pressed" or "raised" physical blueprint layer.
- **Dividers:** Use 1px solid lines to create depth containers rather than blurs.

## Shapes
The shape language is strictly **Sharp (0px)**. All containers, buttons, and image frames must have 90-degree corners to reflect the rigid nature of steel beams and architectural blueprints. No rounded corners are permitted in this design system, as sharp edges reinforce the "Industrial/Robust" brand personality.

## Components
- **Technical Cards:** Defined by a 1px `Steel Grey` border, containing a top-aligned `Label-Mono` category and a bold `Headline-MD` title.
- **Action Buttons:** Solid `Nero` background with `White` Poppins Bold text. Hover state transitions to `Construction Red` instantly (no easing) for a mechanical feel.
- **Case Study Metrics:** Large `Metric-Display` text in `Construction Red` paired with a small `Label-Mono` description below it, separated by a thin vertical line.
- **Flowchart System:** A series of sharp boxes connected by 2px solid lines. Every node must include a mono-spaced step number (e.g., 01, 02) in the top left corner.
- **Inputs:** Underline-only style using `Nero` for the border-bottom, with `Label-Mono` floating labels to maintain the technical drawing aesthetic.
- **Dividers:** Heavy 4px `Nero` rules for primary section breaks; 1px `Steel Grey` for secondary content separation.
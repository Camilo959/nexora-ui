---
name: Nexora Engineering Interface
colors:
  surface: '#f9f9f8'
  surface-dim: '#dadad9'
  surface-bright: '#f9f9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f3'
  surface-container: '#eeeeed'
  surface-container-high: '#e8e8e7'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1f0'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#5f5e61'
  on-secondary: '#ffffff'
  secondary-container: '#e4e1e5'
  on-secondary-container: '#656467'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#e4e1e5'
  secondary-fixed-dim: '#c8c6c9'
  on-secondary-fixed: '#1b1b1e'
  on-secondary-fixed-variant: '#47464a'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f9f9f8'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  data-display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  data-display-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-base:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.06em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  sidebar-width: 64px
  gutter: 24px
  margin-page: 40px
  stack-compact: 8px
  stack-loose: 32px
---

## Brand & Style
The design system is a high-precision interface designed for technical professionals managing physical systems. The personality is authoritative, reliable, and "engineering-first." It avoids superficial decorative elements, opting instead for an aesthetic rooted in laboratory instrumentation and industrial data sheets.

The style is a synthesis of **Modernist Editorial** and **Technical Functionalism**. It leverages generous whitespace and asymmetric layouts to organize dense information, ensuring that critical data points remain the focal point. Visual interest is generated through precise alignment, varying typographic scales, and high-quality "micro-details" like thin borders and monospaced metadata labels.

## Colors
This design system uses a sophisticated light-mode palette that prioritizes legibility and structural clarity. 

- **Primary Accent:** Deep Emerald (#059669) is used exclusively for success states, active connections, and primary action triggers. It should be used sparingly to maintain its significance.
- **Surface Strategy:** Use Warm White (#FAFAF9) for the main canvas. Pure white is reserved for interactive cards or data entry zones to create a subtle layered effect without using shadows.
- **Graphite & Charcoal:** These deep neutrals are used for the sidebar, headers, or persistent navigational elements to ground the interface.
- **Functional Accents:** Amber (#f59e0b) and Red (#dc2626) provide high-visibility feedback for system warnings and critical failures, respectively.

## Typography
The typographic hierarchy is the primary engine of the design system. It utilizes **Inter** for all standard UI elements due to its exceptional clarity at small sizes. **JetBrains Mono** is introduced for technical metadata, sensor readings, and coordinate data to evoke the feeling of a precise engineering tool.

**Key Conventions:**
- **Primary Data:** Use `data-display-lg` for single, critical metrics (e.g., Temperature, PSI).
- **Metadata:** Use `label-caps` for section headers and field labels. This adds a structured, "blueprint" feel to the workspace.
- **Technical Readouts:** All fluctuating numeric data must use the monospaced font to prevent horizontal "jumping" as values change.

## Layout & Spacing
The layout follows a **structured asymmetric grid**. Instead of a traditional centered container, the interface utilizes a narrow, persistent left-hand sidebar (64px) for high-level navigation, with the remaining viewport dedicated to a fluid engineering workspace.

- **Asymmetry:** Group primary controls on the left or top-left, while leaving significant whitespace on the right for data visualization and secondary technical panels.
- **Dividers:** Use 1px borders in `Soft Gray` (#e7e5e4) instead of background shifts to define zones.
- **Modular Blocks:** Content should be organized into logical zones separated by wide gutters (24px+), allowing the user to scan the "operating environment" without cognitive overload.

## Elevation & Depth
This design system rejects traditional shadows and depth metaphors. Hierarchy is achieved through **Tonal Separation** and **Line Work**.

- **Flat Architecture:** Elements do not "float" above the surface. They are "etched" into or "seated" on the canvas.
- **Interactive Layers:** When an element is active (like a selected node), it is highlighted with a 1px `Primary Accent` border or a subtle fill change to `Soft Gray`.
- **Modals & Overlays:** Use a high-contrast `Graphite` border (1px) with no shadow to differentiate persistent overlays from the background canvas.

## Shapes
Shapes are strictly functional and geometric. We utilize a "Soft" roundedness profile (0.25rem / 4px) for buttons and inputs to provide a modern touch without appearing "friendly" or "consumer-grade."

- **Containers:** Square corners are preferred for large structural containers and dividers to maintain the architectural, grid-based feel.
- **Status Indicators:** Small circles (12px) are used for "heartbeat" status lights, providing a clear visual contrast to the mostly rectangular UI.

## Components

### Buttons & Actions
- **Primary:** Solid `Primary Accent` fill with white text. 4px radius. 
- **Secondary:** Transparent background with a 1px `Soft Gray` border and `Graphite` text.
- **Tertiary:** Text-only (Caps) with a subtle underline on hover. Used for auxiliary technical actions.

### Data Inputs
- **Fields:** 1px border (#e7e5e4) with a white background. On focus, the border changes to the `Primary Accent`.
- **Labels:** Always use `label-caps` typography positioned above the input field.

### Sidebar (The App Shell)
- **Visuals:** Deep `Graphite` background. Icons should be thin-stroke (1.5px) and monochrome.
- **Active State:** A vertical 3px bar of `Primary Accent` on the far left edge of the active icon.

### Technical Cards
- Cards do not have shadows. They use a 1px `Soft Gray` border. 
- **Header:** A thin 1px horizontal line separates the card title (in Mono) from the content.

### Status Indicators
- **Connected:** Pulsing Emerald circle + "LIVE" in Mono.
- **Standby:** Static Graphite circle.
- **Warning:** Static Amber circle + "ALRT" in Mono.
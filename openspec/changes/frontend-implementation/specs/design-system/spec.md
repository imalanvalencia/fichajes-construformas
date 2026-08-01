# Design System Specification

## Purpose

Construformas brand identity layer: TailwindCSS 4.x theme tokens, typography, and base UI components that enforce a consistent visual language across the application.

## Requirements

### Requirement: Brand Theme Configuration

The system SHALL configure TailwindCSS 4.x `@theme` with Construformas brand colors: Nero (#1A1A1A), Construction Red (#E63946), Cement Grey (#8D99AE), Steel Grey (#4A5568), and Background White (#F8F9FA).

#### Scenario: Theme colors render correctly

- GIVEN the application loads
- WHEN any component uses Construformas brand color classes
- THEN the rendered output matches the defined hex values

#### Scenario: Sharp corners applied globally

- GIVEN the theme is configured
- WHEN border-radius utilities are NOT explicitly overridden
- THEN all elements render with 0px border radius (sharp corners)

### Requirement: Typography System

The system SHALL load Poppins (headings, body) and JetBrains Mono (code, data) via Google Fonts and register them as Tailwind font-family utilities.

#### Scenario: Poppins renders for body text

- GIVEN the application loads
- WHEN any text element uses the default font family
- THEN the text renders in Poppins

#### Scenario: JetBrains Mono renders for code elements

- GIVEN a code or data display element
- WHEN the mono font utility is applied
- THEN the text renders in JetBrains Mono

### Requirement: Input Component

The system SHALL provide an underline-only input component with: transparent background, bottom border only (1px), no side borders, sharp corners, and focus state using Construction Red border.

#### Scenario: Default input renders with underline style

- GIVEN the input component is rendered
- WHEN the user views the input
- THEN only the bottom border is visible with Cement Grey color

#### Scenario: Focus state changes border color

- GIVEN the input is rendered
- WHEN the user clicks/focuses the input
- THEN the bottom border changes to Construction Red

### Requirement: Button Component

The system SHALL provide button variants: primary (Construction Red bg, white text), secondary (transparent, Cement Grey border, Nero text), and ghost (transparent, Nero text, no border).

#### Scenario: Primary button renders with brand color

- GIVEN a primary button is rendered
- WHEN the user views the button
- THEN the background is Construction Red and text is white

#### Scenario: Secondary button renders with border

- GIVEN a secondary button is rendered
- WHEN the user views the button
- THEN it has a Cement Grey border with transparent background

### Requirement: Card Component

The system SHALL provide a card component with white background, sharp corners (0px), and subtle shadow. Cards SHALL NOT have rounded corners.

#### Scenario: Card renders with correct styling

- GIVEN a card component is rendered
- WHEN the user views the card
- THEN it displays with white bg, 0px border-radius, and a subtle drop shadow

### Requirement: Status Badge Component

The system SHALL provide status badge components for displaying states: active (green), inactive (grey), pending (amber), error (red).

#### Scenario: Active badge renders green

- GIVEN a badge with status "active" is rendered
- WHEN the user views the badge
- THEN the background is green with appropriate text contrast

### Requirement: Metric Display Card

The system SHALL provide a metric display card that shows a label, numeric value, and optional trend indicator (up/down/neutral).

#### Scenario: Metric card displays value with label

- GIVEN a metric card is configured with label "Total Users" and value 42
- WHEN the metric card renders
- THEN the user sees "Total Users" as label and "42" as the prominent value

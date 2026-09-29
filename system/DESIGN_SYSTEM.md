# Enterprise Design System Documentation (v2.4)

## 1. Overview
The Enterprise Design System provides a standardized, accessible, and scalable UI foundation for the 250+ modules of the Institutional ERP Suite. It is constructed on a **strict 8px grid**, **WCAG AA accessibility standards**, and **Inter font typography**.

---

## 2. Design Tokens

### 2.1 Spacing & Grid System (8px Grid)
All layout padding, margins, gaps, and component heights strictly adhere to multiples of 8px.

| Token | Pixels | Usage |
| :--- | :--- | :--- |
| `spacing[1]` | 8px | Micro padding, icon gaps |
| `spacing[2]` | 16px | Input padding, small card gaps |
| `spacing[3]` | 24px | Container internal padding |
| `spacing[4]` | 32px | Section margins |
| `spacing[5]` | 40px | Component heights |
| `spacing[6]` | 48px | Standard touch target height |
| `spacing[8]` | 64px | Header heights |
| `spacing[12]` | 96px | Large layout gutters |

### 2.2 Typography Scale (Inter)
Typography strictly uses **Inter** with designated font weights (400, 500, 600, 700, 800) and sizes.

| Size Key | Font Size | Line Height | Application |
| :--- | :--- | :--- | :--- |
| `xs` | 12px | 16px | Badges, table headers, captions |
| `sm` | 14px | 20px | Body text, input labels, buttons |
| `base` | 16px | 24px | Primary text, lead paragraphs |
| `lg` | 20px | 28px | Card titles, section headers |
| `xl` | 24px | 32px | Page titles |
| `2xl` | 32px | 40px | Display headers |
| `3xl` | 40px | 48px | KPI Hero metrics |

### 2.3 Color Token Distribution
The color system follows the **60 - 30 - 10** design rule:
- **60% Neutral**: Backgrounds, page structural containers (`#F8FAFC` light / `#0F172A` dark).
- **30% Surface**: Cards, sidebars, navigation headers, modal dialogs (`#FFFFFF` light / `#1E293B` dark).
- **10% Accent**: Primary interactive buttons, active links, focused input borders (`#2563EB` blue / `#9333EA` purple).

#### Semantic Color Tokens
- **Primary**: `#2563EB` (Light) / `#9333EA` (Dark)
- **Success**: `#16A34A` (Green)
- **Warning**: `#D97706` (Amber)
- **Danger / Error**: `#DC2626` (Red/Rose)
- **Info**: `#0284C7` (Sky Blue)

---

## 3. Primitive Component Architecture

### 3.1 Button Primitive (`src/design-system/primitives/Button`)
- **Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`
- **Sizes**: `sm` (32px), `md` (40px), `lg` (48px)
- **Accessibility**: Minimum 44px touch target on `md`/`lg`, high-contrast keyboard focus ring (`ring-2 ring-brand-500 ring-offset-2`).

### 3.2 Checkbox Primitive (`src/design-system/primitives/Checkbox`)
- Custom checkmark icon with transition animations.
- Accessible `<label>` pairing with unique generated IDs.
- Focus ring and invalid state handling.

### 3.3 Alert Primitive (`src/design-system/primitives/Alert`)
- Semantic alerts (`info`, `success`, `warning`, `danger`).
- Dismissable close trigger with ARIA `role="alert"`.

### 3.4 Tag Primitive (`src/design-system/primitives/Tag`)
- Dismissable filter tags with keyboard accessibility.

# Enterprise Component Library Specifications

## 1. Overview
All presentation elements are constructed using primitive design system controls located in `src/design-system/primitives/` and `src/components/ui/`.

## 2. Primitive Catalog

| Component | Path | Key Features |
| :--- | :--- | :--- |
| **Button** | `src/components/ui/Button` | Primary, secondary, outline, ghost, danger variants; 44px touch targets. |
| **Input** | `src/components/ui/Input` | Accessible label, helper text, error handling, aria-invalid. |
| **Checkbox** | `src/design-system/primitives/Checkbox` | Custom checkmark, focus ring, WCAG label association. |
| **Tag** | `src/design-system/primitives/Tag` | Dismissable tags with variant styling. |
| **Alert** | `src/design-system/primitives/Alert` | Semantic alerts (`info`, `success`, `warning`, `danger`). |
| **Badge** | `src/components/ui/Badge` | Status badges with animated pulse indicators. |
| **Card** | `src/components/ui/Card` | Surface container with soft elevation shadows. |
| **Modal** | `src/components/ui/Modal` | Backdrop blur, focus trap, ESC listener, ARIA role="dialog". |

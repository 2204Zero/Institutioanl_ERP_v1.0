/**
 * Enterprise Design System - Spacing Tokens
 * Strict 8px grid system (8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 96).
 * Zero arbitrary or magic spacing pixel values.
 */

export const spacing = {
  0: '0px',
  1: '8px',   // 1 unit = 8px
  2: '16px',  // 2 units = 16px
  3: '24px',  // 3 units = 24px
  4: '32px',  // 4 units = 32px
  5: '40px',  // 5 units = 40px
  6: '48px',  // 6 units = 48px
  7: '56px',  // 7 units = 56px
  8: '64px',  // 8 units = 64px
  9: '72px',  // 9 units = 72px
  10: '80px', // 10 units = 80px
  12: '96px', // 12 units = 96px
} as const;

export const minTouchTarget = '44px'; // WCAG AA Touch Target Minimum

export type SpacingKey = keyof typeof spacing;

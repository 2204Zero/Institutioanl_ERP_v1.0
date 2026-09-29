/**
 * Enterprise Design System - Typography Tokens
 * Strict 100% Inter font family with standardized sizes and weights.
 * WCAG AA compliant contrast and line-height scale.
 */

export const fontFamilies = {
  sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
} as const;

export const fontSizes = {
  xs: { size: '12px', lineHeight: '16px', letterSpacing: '0px' },
  sm: { size: '14px', lineHeight: '20px', letterSpacing: '0px' },
  base: { size: '16px', lineHeight: '24px', letterSpacing: '-0.1px' },
  lg: { size: '20px', lineHeight: '28px', letterSpacing: '-0.2px' },
  xl: { size: '24px', lineHeight: '32px', letterSpacing: '-0.3px' },
  '2xl': { size: '32px', lineHeight: '40px', letterSpacing: '-0.5px' },
  '3xl': { size: '40px', lineHeight: '48px', letterSpacing: '-0.8px' },
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  black: 800,
} as const;

export type FontSizeKey = keyof typeof fontSizes;
export type FontWeightKey = keyof typeof fontWeights;

/**
 * Enterprise Design System - Z-Index & Breakpoint Tokens
 */

export const zIndex = {
  hide: -1,
  base: 0,
  dock: 10,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
  tooltip: 1700,
} as const;

export const breakpoints = {
  sm: '640px',   // Mobile Landscape / Small Tablet
  md: '768px',   // Tablet
  lg: '1024px',  // Laptop
  xl: '1280px',  // Desktop
  '2xl': '1536px',// Ultra Wide
} as const;

export type ZIndexKey = keyof typeof zIndex;
export type BreakpointKey = keyof typeof breakpoints;

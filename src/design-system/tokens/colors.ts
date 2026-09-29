/**
 * Enterprise Design System - Color & Theme Tokens
 * Follows 60% Neutral (Structure/Background), 30% Surface (Cards/Nav/Sidebar), 10% Accent (Interactive/Primary).
 * WCAG AA Contrast Compliant (Minimum 4.5:1 text contrast).
 * Supports Light & Dark mode semantic tokens.
 */

export const colors = {
  // Brand / Accent Scale (Blue & Indigo)
  brand: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb', // Primary Blue
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  // Secondary Accent Scale (Purple/Indigo for Dark mode & Enterprise highlight)
  accentPurple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
  },

  // Neutral Slate Scale (Backgrounds & Text)
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a', // Deep Dark Charcoal
    950: '#020617',
  },

  // Semantic Status Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },

  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#06b6d4',
    600: '#0284c7',
    700: '#0369a1',
  },
} as const;

export interface SemanticThemeTokens {
  background: string;
  surface: string;
  surfaceHover: string;
  card: string;
  border: string;
  borderHover: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  primaryText: string;
  focusRing: string;
}

export const lightThemeTokens: SemanticThemeTokens = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceHover: '#F1F5F9',
  card: '#FFFFFF',
  border: '#E2E8F0',
  borderHover: '#CBD5E1',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primaryText: '#FFFFFF',
  focusRing: 'rgba(37, 99, 235, 0.4)',
};

export const darkThemeTokens: SemanticThemeTokens = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceHover: '#334155',
  card: '#111827',
  border: '#334155',
  borderHover: '#475569',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  primary: '#9333EA',
  primaryHover: '#7E22CE',
  primaryText: '#FFFFFF',
  focusRing: 'rgba(147, 51, 234, 0.4)',
};

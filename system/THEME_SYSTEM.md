# Enterprise Theme System Documentation

## 1. Overview
The Theme System provides persistent **Light** and **Dark** themes with CSS variable bindings and zero flashing on initial load.

## 2. Color Palette Rules (60-30-10)
- **Light Theme**:
  - Background (60%): `#F8FAFC` (Light Slate)
  - Surface (30%): `#FFFFFF` (Pure White)
  - Primary Accent (10%): `#2563EB` (Enterprise Blue)
- **Dark Theme**:
  - Background (60%): `#0F172A` (Deep Slate Charcoal - Never pure black)
  - Surface (30%): `#1E293B` (Slate Surface)
  - Primary Accent (10%): `#9333EA` (Purple) & `#6366F1` (Indigo)

## 3. Hydration & OS Listening
`ThemeContext` listens for native OS `prefers-color-scheme` updates and syncs state to `localStorage.getItem('theme')`.

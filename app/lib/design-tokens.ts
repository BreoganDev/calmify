/**
 * Design Tokens System - Calmify
 * Sistema centralizado de valores de diseño para mantener consistencia visual
 */

// Spacing Scale (4px base)
export const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
} as const;

// Icon Sizes
export const iconSizes = {
  xs: 'h-3 w-3',    // 12px - decorativo
  sm: 'h-4 w-4',    // 16px - inline con texto
  md: 'h-5 w-5',    // 20px - botones pequeños
  lg: 'h-6 w-6',    // 24px - botones normales
  xl: 'h-8 w-8',    // 32px - botones grandes
  '2xl': 'h-10 w-10', // 40px - destacados
} as const;

// Typography Scale
export const typography = {
  xs: 'text-xs',      // 12px
  sm: 'text-sm',      // 14px
  base: 'text-base',  // 16px
  lg: 'text-lg',      // 18px
  xl: 'text-xl',      // 20px
  '2xl': 'text-2xl',  // 24px
  '3xl': 'text-3xl',  // 30px
  '4xl': 'text-4xl',  // 36px
} as const;

// Animation Durations
export const duration = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
} as const;

// Transition Classes
export const transitions = {
  all: 'transition-all duration-200 ease-in-out',
  colors: 'transition-colors duration-200 ease-in-out',
  transform: 'transition-transform duration-200 ease-in-out',
  opacity: 'transition-opacity duration-200 ease-in-out',
} as const;

// Border Radius
export const radius = {
  sm: 'rounded-sm',   // 2px
  md: 'rounded-md',   // 6px
  lg: 'rounded-lg',   // 8px
  xl: 'rounded-xl',   // 12px
  full: 'rounded-full',
} as const;

// Shadows
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
} as const;

// Color Semantic Names (usando variables CSS de shadcn)
export const colors = {
  // Primary actions
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  primaryGhost: 'hover:bg-primary/10 text-primary',

  // Secondary actions
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',

  // Destructive actions
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  destructiveGhost: 'hover:bg-destructive/10 text-destructive',

  // Muted/subtle elements
  muted: 'bg-muted text-muted-foreground',

  // Success states
  success: 'bg-green-500 text-white hover:bg-green-600',
  successGhost: 'hover:bg-green-50 dark:hover:bg-green-950 text-green-700 dark:text-green-400',

  // Warning states
  warning: 'bg-amber-500 text-white hover:bg-amber-600',
  warningGhost: 'hover:bg-amber-50 dark:hover:bg-amber-950 text-amber-700 dark:text-amber-400',

  // Info states
  info: 'bg-blue-500 text-white hover:bg-blue-600',
  infoGhost: 'hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-700 dark:text-blue-400',
} as const;

// Touch Target Sizes (mínimo 44x44px para accesibilidad)
export const touchTarget = {
  min: 'min-h-[44px] min-w-[44px]',
  comfortable: 'min-h-[48px] min-w-[48px]',
} as const;

// Focus Ring para accesibilidad
export const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2' as const;

// Grid Breakpoints consistentes
export const gridCols = {
  audio: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
  categories: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  playlists: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  admin: 'grid-cols-1 md:grid-cols-2 gap-6',
} as const;

// Gap consistente para grids
export const gridGap = {
  tight: 'gap-3',
  normal: 'gap-4',
  loose: 'gap-6',
} as const;

// Z-index scale
export const zIndex = {
  dropdown: 'z-50',
  modal: 'z-50',
  toast: 'z-[100]',
  audioPlayer: 'z-40',
  header: 'z-30',
} as const;

// Helper para combinar clases
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

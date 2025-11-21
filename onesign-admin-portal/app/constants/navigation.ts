/**
 * Navigation Constants
 * Configuration constants for navigation system
 */

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Z-index layers
export const Z_INDEX = {
  DROPDOWN: 50,
  MOBILE_SIDEBAR_BACKDROP: 40,
  MOBILE_SIDEBAR: 50,
  TOPBAR: 30,
  SIDEBAR: 20,
  CONTENT: 10,
} as const;

// Breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

// Language options
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', direction: 'ltr' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷', direction: 'rtl' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', direction: 'rtl' },
  { code: 'es', name: 'Español', flag: '🇪🇸', direction: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', direction: 'ltr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
] as const;

// User roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER_MANAGER: 'user_manager',
  SECURITY_ADMIN: 'security_admin',
  AUDITOR: 'auditor',
  DEVELOPER: 'developer',
  USER: 'user',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  CURRENT_TENANT_ID: 'currentTenantId',
} as const;

// Navigation settings
export const NAVIGATION_SETTINGS = {
  SIDEBAR_WIDTH_EXPANDED: 256, // w-64 in pixels
  SIDEBAR_WIDTH_COLLAPSED: 80, // w-20 in pixels
  TOPBAR_HEIGHT: 64, // h-16 in pixels
  SEARCH_DEBOUNCE_MS: 300,
  NOTIFICATION_POLL_INTERVAL_MS: 30000, // 30 seconds
  MAX_NOTIFICATIONS_DISPLAY: 10,
  MAX_BREADCRUMB_ITEMS: 5,
} as const;

// API endpoints (example)
export const API_ENDPOINTS = {
  NOTIFICATIONS: '/api/notifications',
  USER_PROFILE: '/api/user/profile',
  TENANTS: '/api/tenants',
  MENU_ITEMS: '/api/menu-items',
  SEARCH: '/api/search',
} as const;

// Default values
export const DEFAULTS = {
  THEME: THEMES.LIGHT,
  LANGUAGE: 'en',
  SIDEBAR_COLLAPSED: false,
  NOTIFICATION_TIMEOUT: 5000,
} as const;

// Badge colors
export const BADGE_COLORS = {
  NEW: 'bg-green-500 text-white',
  BETA: 'bg-blue-500 text-white',
  PRO: 'bg-purple-500 text-white',
  SOON: 'bg-gray-500 text-white',
  HOT: 'bg-red-500 text-white',
  COUNT: 'bg-red-500 text-white',
} as const;

// Icon sizes
export const ICON_SIZES = {
  XS: 12,
  SM: 16,
  MD: 20,
  LG: 24,
  XL: 32,
  '2XL': 48,
} as const;

// Menu item types
export const MENU_ITEM_TYPES = {
  LINK: 'link',
  BUTTON: 'button',
  DIVIDER: 'divider',
  HEADER: 'header',
} as const;

// Notification priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Export type helpers
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
export type Theme = typeof THEMES[keyof typeof THEMES];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type Language = typeof LANGUAGES[number];
export type BadgeColor = typeof BADGE_COLORS[keyof typeof BADGE_COLORS];
export type IconSize = typeof ICON_SIZES[keyof typeof ICON_SIZES];

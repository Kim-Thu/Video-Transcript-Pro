/**
 * Constants - Application-wide constants
 */

// Platform patterns for URL detection
export const PLATFORM_PATTERNS = {
  tiktok: [
    'tiktok.com',
    'vm.tiktok.com',
    'vt.tiktok.com',
  ],
  facebook: [
    'facebook.com',
    'fb.watch',
    'fb.com',
    'www.facebook.com',
  ],
  youtube: [
    'youtube.com',
    'youtu.be',
  ],
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 300000, // 5 minutes
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  history: 'transcript-history',
  settings: 'transcript-settings',
  theme: 'transcript-theme',
} as const;

// Validation
export const VALIDATION = {
  maxBatchUrls: 10,
  maxTranscriptLength: 100000,
  minUrlLength: 10,
} as const;

// UI Configuration
export const UI_CONFIG = {
  toastDuration: 3000,
  animationDuration: 300,
  debounceDelay: 300,
} as const;

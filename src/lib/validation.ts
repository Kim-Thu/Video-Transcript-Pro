/**
 * Validation Utilities
 * Single Responsibility: Only handles validation logic
 */

import type { Platform } from '@/types';
import { PLATFORM_PATTERNS, VALIDATION } from './constants';

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url || url.length < VALIDATION.minUrlLength) {
    return false;
  }
  
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Detect platform from URL
 */
export function detectPlatform(url: string): Platform | null {
  if (!url) return null;
  
  const normalizedUrl = url.toLowerCase();
  
  for (const [platform, patterns] of Object.entries(PLATFORM_PATTERNS)) {
    if (patterns.some(pattern => normalizedUrl.includes(pattern))) {
      return platform as Platform;
    }
  }
  
  return null;
}

/**
 * Validate video URL for supported platforms
 */
export function validateVideoUrl(url: string): {
  isValid: boolean;
  platform: Platform | null;
  error?: string;
} {
  if (!url.trim()) {
    return { isValid: false, platform: null, error: 'Vui lòng nhập link video' };
  }
  
  if (!isValidUrl(url)) {
    return { isValid: false, platform: null, error: 'Link không hợp lệ' };
  }
  
  const platform = detectPlatform(url);
  if (!platform) {
    return { isValid: false, platform: null, error: 'Chỉ hỗ trợ TikTok, Facebook và YouTube' };
  }
  
  return { isValid: true, platform };
}

/**
 * Validate batch URLs
 */
export function validateBatchUrls(urls: string[]): {
  valid: Array<{ url: string; platform: Platform }>;
  invalid: Array<{ url: string; error: string }>;
} {
  const valid: Array<{ url: string; platform: Platform }> = [];
  const invalid: Array<{ url: string; error: string }> = [];
  
  const uniqueUrls = [...new Set(urls.map(u => u.trim()).filter(Boolean))];
  
  if (uniqueUrls.length > VALIDATION.maxBatchUrls) {
    invalid.push({ 
      url: '', 
      error: `Tối đa ${VALIDATION.maxBatchUrls} link một lần` 
    });
    return { valid, invalid };
  }
  
  for (const url of uniqueUrls) {
    const result = validateVideoUrl(url);
    if (result.isValid && result.platform) {
      valid.push({ url, platform: result.platform });
    } else {
      invalid.push({ url, error: result.error || 'Link không hợp lệ' });
    }
  }
  
  return { valid, invalid };
}

/**
 * Sanitize URL - remove tracking params
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove common tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'ref'];
    trackingParams.forEach(param => parsed.searchParams.delete(param));
    return parsed.toString();
  } catch {
    return url;
  }
}

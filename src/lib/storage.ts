/**
 * Storage Service
 * Single Responsibility: Local storage operations with type safety
 */

import type { TranscriptItem } from '@/types';
import { isBrowser } from './browser';
import { STORAGE_KEYS } from './constants';

/**
 * Generic storage operations
 */
export class StorageService {
  private static isAvailable(): boolean {
    if (!isBrowser()) return false;
    
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
  
  static get<T>(key: string, defaultValue: T): T {
    if (!this.isAvailable()) return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }
  
  static set<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
  
  static remove(key: string): boolean {
    if (!this.isAvailable()) return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
  
  static clear(): boolean {
    if (!this.isAvailable()) return false;
    
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * History Service - Specialized storage for transcript history
 */
export class HistoryService {
  private static readonly KEY = STORAGE_KEYS.history;
  private static readonly MAX_ITEMS = 100;
  
  static getAll(): TranscriptItem[] {
    const items = StorageService.get<TranscriptItem[]>(this.KEY, []);
    
    // Parse dates
    return items.map(item => ({
      ...item,
      createdAt: new Date(item.createdAt),
      completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
    }));
  }
  
  static add(item: TranscriptItem): boolean {
    const items = this.getAll();
    const updated = [item, ...items].slice(0, this.MAX_ITEMS);
    return StorageService.set(this.KEY, updated);
  }
  
  static update(id: string, updates: Partial<TranscriptItem>): boolean {
    const items = this.getAll();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return false;
    
    items[index] = { ...items[index], ...updates };
    return StorageService.set(this.KEY, items);
  }
  
  static remove(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter(item => item.id !== id);
    return StorageService.set(this.KEY, filtered);
  }
  
  static clear(): boolean {
    return StorageService.remove(this.KEY);
  }
  
  static getById(id: string): TranscriptItem | undefined {
    return this.getAll().find(item => item.id === id);
  }
}

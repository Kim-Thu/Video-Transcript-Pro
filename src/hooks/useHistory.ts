'use client';

import { HistoryService } from '@/lib';
import type { TranscriptItem } from '@/types';
import { useCallback, useEffect, useState } from 'react';

/**
 * Custom hook for managing transcript history
 * Follows Single Responsibility: Only manages history state
 */
export function useHistory() {
  const [items, setItems] = useState<TranscriptItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load history on mount
  useEffect(() => {
    const loadedItems = HistoryService.getAll();
    setItems(loadedItems);
    setIsLoading(false);
  }, []);
  
  // Add item
  const addItem = useCallback((item: TranscriptItem) => {
    setItems(prev => [item, ...prev]);
    HistoryService.add(item);
  }, []);
  
  // Update item
  const updateItem = useCallback((id: string, updates: Partial<TranscriptItem>) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
    HistoryService.update(id, updates);
  }, []);
  
  // Remove item
  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    HistoryService.remove(id);
  }, []);
  
  // Clear all
  const clearAll = useCallback(() => {
    setItems([]);
    HistoryService.clear();
  }, []);
  
  // Get item by ID
  const getById = useCallback((id: string) => {
    return items.find(item => item.id === id);
  }, [items]);
  
  return {
    items,
    isLoading,
    addItem,
    updateItem,
    removeItem,
    clearAll,
    getById,
    count: items.length,
  };
}

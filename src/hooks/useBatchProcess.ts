'use client';

import { generateId, validateBatchUrls } from '@/lib';
import { apiClient } from '@/lib/api-client';
import type { TranscriptItem } from '@/types';
import { useCallback, useState } from 'react';

/**
 * Custom hook for batch processing
 */
export function useBatchProcess(
  onItemComplete?: (item: TranscriptItem) => void,
  onAllComplete?: () => void
) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<TranscriptItem[]>([]);
  const [apiKey, setApiKey] = useState(''); // Add API Key support for batch
  
  const processBatch = useCallback(async (urls: string[]) => {
    const { valid } = validateBatchUrls(urls);
    
    if (valid.length === 0) return;
    
    setIsProcessing(true);
    setProgress({ current: 0, total: valid.length });
    
    // 1. Initialize all items with PENDING status
    const initialItems: TranscriptItem[] = valid.map((v) => ({
      id: generateId(),
      videoInfo: {
        id: generateId(),
        url: v.url,
        platform: v.platform,
        title: `Đang chờ: ${v.url}...`,
      },
      status: 'pending',
      createdAt: new Date(),
    }));
    
    setResults(initialItems);
    
    let completedCount = 0;
    const CONCURRENCY_LIMIT = 2; // Process 2 videos at a time 
    
    const processItem = async (item: TranscriptItem) => {
      setResults((prev) => 
        prev.map((p) => 
          p.id === item.id 
            ? { ...p, status: 'processing', videoInfo: { ...p.videoInfo, title: `Đang xử lý: ${p.videoInfo.url}...` } } 
            : p
        )
      );

      let finalItem: TranscriptItem = { ...item };
      
      try {
        const infoRes = await apiClient.getVideoInfo({ url: item.videoInfo.url });
        
        if (infoRes.success && infoRes.data) {
           finalItem = {
             ...finalItem,
             videoInfo: {
               ...finalItem.videoInfo,
               title: infoRes.data.title,
               thumbnail: infoRes.data.thumbnail,
               duration: infoRes.data.duration,
               author: infoRes.data.author,
               description: infoRes.data.description,
               videoUrl: infoRes.data.videoUrl,
             }
           };
           setResults((prev) => prev.map((p) => p.id === item.id ? { ...p, videoInfo: finalItem.videoInfo } : p));
        }
        
        // Pass API Key here!
        const transRes = await apiClient.getTranscript({ url: item.videoInfo.url, apiKey });
        
        if (transRes.success && transRes.data) {
          finalItem.status = 'completed';
          finalItem.transcript = transRes.data.transcript;
          finalItem.completedAt = new Date();
        } else {
          finalItem.status = 'error';
          finalItem.error = transRes.error?.message || 'Không thể lấy transcript';
        }
        
      } catch (err) {
        finalItem.status = 'error';
        finalItem.error = err instanceof Error ? err.message : 'Lỗi hệ thống';
      }
      
      setResults((prev) => 
        prev.map((p) => p.id === item.id ? { ...finalItem } : p)
      );
      
      completedCount++;
      setProgress((prev) => ({ ...prev, current: completedCount }));
      
      if (finalItem.status === 'completed') {
        onItemComplete?.(finalItem);
      }
    };
    
    const queue = [...initialItems];
    const workers = [];
    
    for (let i = 0; i < CONCURRENCY_LIMIT; i++) {
        workers.push((async () => {
            while (queue.length > 0) {
                const item = queue.shift();
                if (item) {
                    await processItem(item);
                }
            }
        })());
    }
    
    await Promise.all(workers);
    
    setIsProcessing(false);
    onAllComplete?.();
  }, [onItemComplete, onAllComplete, apiKey]); // Add apiKey dependency
  
  const reset = useCallback(() => {
    setIsProcessing(false);
    setProgress({ current: 0, total: 0 });
    setResults([]);
  }, []);
  
  return {
    isProcessing,
    progress,
    results,
    processBatch,
    reset,
    apiKey,
    setApiKey,
    progressPercent: progress.total > 0 
      ? Math.round((progress.current / progress.total) * 100) 
      : 0,
  };
}

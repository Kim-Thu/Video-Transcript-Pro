'use client';

import { apiClient } from '@/lib/api-client';
import { generateId } from '@/lib/browser';
import { validateVideoUrl } from '@/lib/validation';
import type { Platform, TranscriptItem, TranscriptSegment, VideoInfo } from '@/types';
import { useCallback, useState } from 'react';

/**
 * Custom hook for transcript processing
 * Connects to real Flask backend API
 */
export function useTranscript(onComplete?: (item: TranscriptItem) => void) {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState(''); // Add apiKey state
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [segments, setSegments] = useState<TranscriptSegment[] | null>(null);
  const [tokenUsage, setTokenUsage] = useState<any | null>(null);
  
  // Clear error when URL changes
  const handleUrlChange = useCallback((value: string) => {
    setUrl(value);
    setError(null);
  }, []);
  
  // Clear all state
  const reset = useCallback(() => {
    setUrl('');
    setError(null);
    setVideoInfo(null);
    setTranscript(null);
    setSegments(null);
    setTokenUsage(null);
    setIsLoading(false);
    setIsProcessing(false);
  }, []);
  
  // Process single URL - calls real API
  const processUrl = useCallback(async () => {
    // Validate
    const validation = validateVideoUrl(url);
    if (!validation.isValid) {
      setError(validation.error || 'Link không hợp lệ');
      setVideoInfo(null);
      setTranscript(null);
      setSegments(null);
      setTokenUsage(null);
      setIsLoading(false);
      setIsProcessing(false);
      return;
    }
    
    const platform = validation.platform!;
    
    setIsLoading(true);
    setError(null);
    setVideoInfo(null);
    setTranscript(null);
    setSegments(null);
    setTokenUsage(null);
    
    try {
      // Step 1: Get video info from API
      const videoInfoResponse = await apiClient.getVideoInfo({ url });
      
      if (!videoInfoResponse.success || !videoInfoResponse.data) {
        throw new Error(videoInfoResponse.error?.message || 'Không thể lấy thông tin video');
      }
      
      const videoData = videoInfoResponse.data;
      const video: VideoInfo = {
        id: videoData.id,
        url,
        platform,
        title: videoData.title,
        description: videoData.description,
        thumbnail: videoData.thumbnail,
        duration: videoData.duration,
        author: videoData.author,
        videoUrl: videoData.videoUrl,
      };
      
      setVideoInfo(video);
      setIsLoading(false);
      
      // Step 2: Get transcript from API
      setIsProcessing(true);
      // Pass apiKey to API client if available
      const transcriptResponse = await apiClient.getTranscript({ url, apiKey });
      
      if (!transcriptResponse.success || !transcriptResponse.data) {
        throw new Error(transcriptResponse.error?.message || 'Không thể lấy transcript');
      }
      
      const transcriptText = transcriptResponse.data.transcript;
      const transcriptSegments = transcriptResponse.data.segments || null;
      const usage = transcriptResponse.data.tokenUsage;

      setTranscript(transcriptText);
      setSegments(transcriptSegments);
      setTokenUsage(usage);
      
      // Create history item
      const item: TranscriptItem = {
        id: generateId(),
        videoInfo: video,
        status: 'completed',
        transcript: transcriptText,
        segments: transcriptSegments || undefined,
        tokenUsage: usage,
        createdAt: new Date(),
        completedAt: new Date(),
      };
      
      onComplete?.(item);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      
      // Fallback to demo if API fails
      // console.warn('API failed, using demo data:', errorMessage);
      // await useDemoFallback(platform);
      
      // Instead, just show the error and stop
      setIsProcessing(false);
      setIsLoading(false);
      return;
      
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  }, [url, apiKey, onComplete]);
  
  // Demo fallback when API is not available
  const useDemoFallback = useCallback(async (platform: Platform) => {
    setIsLoading(true);
    setError(null);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockVideo: VideoInfo = {
      id: generateId(),
      url,
      platform,
      title: `Video từ ${platform === 'tiktok' ? 'TikTok' : 'Facebook'}`,
      thumbnail: `https://picsum.photos/seed/${generateId()}/640/360`,
      duration: Math.floor(Math.random() * 300) + 30,
      author: 'user_demo',
      videoUrl: url,
    };
    
    setVideoInfo(mockVideo);
    setIsLoading(false);
    
    // Simulate processing
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockTranscript = `⚠️ DEMO MODE - Backend chưa sẵn sàng

Đây là nội dung transcript mẫu được trích xuất từ video ${platform === 'tiktok' ? 'TikTok' : 'Facebook'}.

Để xem transcript thực, bạn cần:
1. Chạy backend Flask: cd backend && python app.py
2. Cài đặt dependencies:
   - pip install yt-dlp flask flask-cors
   - pip install openai-whisper (hoặc faster-whisper)
   - Cài ffmpeg từ ffmpeg.org

Video này nói về nhiều chủ đề thú vị và hữu ích. Nội dung được xử lý bằng công nghệ AI tiên tiến để chuyển đổi giọng nói thành văn bản một cách chính xác.`;
    
    setTranscript(mockTranscript);
    setSegments(null); // Demo mode has no segments
    setError('⚠️ Đang ở chế độ demo. Chạy backend để xem transcript thực.');
    
    const item: TranscriptItem = {
      id: generateId(),
      videoInfo: mockVideo,
      status: 'completed',
      transcript: mockTranscript,
      createdAt: new Date(),
      completedAt: new Date(),
    };
    
    onComplete?.(item);
    setIsProcessing(false);
  }, [url, onComplete]);
  
  // Load data from existing item
  const loadItem = useCallback((item: TranscriptItem) => {
    setUrl(item.videoInfo.url);
    setVideoInfo(item.videoInfo);
    setTranscript(item.transcript || null);
    setSegments(item.segments || null);
    setTokenUsage(item.tokenUsage || null);
    setError(null);
    setIsLoading(false);
    setIsProcessing(false);
  }, []);

  return {
    url,
    setUrl: handleUrlChange,
    apiKey,
    setApiKey,
    isLoading,
    isProcessing,
    error,
    videoInfo,
    transcript,
    segments,
    tokenUsage,
    processUrl,
    reset,
    loadItem,
    isReady: url.trim().length > 0,
    isBusy: isLoading || isProcessing,
  };
}


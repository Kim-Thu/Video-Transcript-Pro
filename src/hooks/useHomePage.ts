import type { TranscriptItem } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useBatchProcess } from './useBatchProcess';
import { useHistory } from './useHistory';
import { useTranscript } from './useTranscript';

export type TabType = 'single' | 'batch' | 'history';

export const useHomePage = () => {
  // --- States ---
  const [activeTab, setActiveTab] = useState<TabType>('single');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TranscriptItem | null>(null);
  const [apiKey, setApiKey] = useState<string>('');

  // Load key from storage on mount
  useState(() => {
    if (typeof window !== 'undefined') {
       const savedKey = localStorage.getItem('gemini_api_key');
       if (savedKey) setApiKey(savedKey);
    }
  });

  // Save key handler
  const handleSetApiKey = useCallback((key: string) => {
      setApiKey(key);
      if (typeof window !== 'undefined') {
          localStorage.setItem('gemini_api_key', key);
      }
  }, []);

  // --- Core Logic Hooks ---
  const history = useHistory();
  
  // Callback when single transcript is processed
  const transcript = useTranscript((item) => {
    history.addItem(item);
  });
  
  // Sync apiKey to transcript hook correctly
  // FIX: Must use the setter, not direct assignment
  if (transcript.setApiKey && transcript.apiKey !== apiKey) {
     transcript.setApiKey(apiKey);
  }
  
  // Callback for batch processing
  const batchProcess = useBatchProcess(
    (item) => history.addItem(item)
  );

  // Sync apiKey to batchProcess hook
  useEffect(() => {
    if (batchProcess.setApiKey && batchProcess.apiKey !== apiKey) {
        batchProcess.setApiKey(apiKey);
    }
  }, [apiKey, batchProcess]);

  // --- Handlers ---
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId as TabType);
  }, []);

  const handleViewTranscript = useCallback((item: TranscriptItem) => {
    // Load item data into Single Tab view
    transcript.loadItem(item);
    
    // Switch to Single Tab
    setActiveTab('single');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [transcript]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedItem(null);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    transcript.processUrl();
  }, [transcript]);

  const handleClearHistory = useCallback(() => {
    toast('Bạn có chắc muốn xóa tất cả lịch sử?', {
      action: {
        label: 'Xóa',
        onClick: () => {
          history.clearAll();
          toast.success('Đã xóa toàn bộ lịch sử');
        },
      },
      description: 'Hành động này không thể hoàn tác.',
      duration: 5000,
    });
  }, [history]);

  const handleDownloadVideo = useCallback(() => {
    if (!transcript.videoInfo?.videoUrl) return;
    
    // Logic download video trực tiếp qua API
    const videoUrl = encodeURIComponent(transcript.videoInfo.videoUrl);
    const rawTitle = transcript.videoInfo.title || 'video';
    const title = encodeURIComponent(rawTitle);
    const timestamp = Date.now();
    const downloadApiUrl = `http://localhost:5000/api/video/download?url=${videoUrl}&title=${title}&t=${timestamp}`;
    
    // DEBUG: Log URL
    console.log('=== DOWNLOAD VIDEO ===');
    console.log('Download URL:', downloadApiUrl);
    
    toast.success('Đang bắt đầu tải video...', {
      description: 'Quá trình tải có thể mất vài giây.',
      duration: 3000,
    });
    
    // Direct redirect - browser will download because of Content-Disposition: attachment header
    window.location.href = downloadApiUrl;
  }, [transcript.videoInfo]);

  return {
    // States
    activeTab,
    modalOpen,
    selectedItem,
    
    // Data Sources
    history,
    transcript,
    batchProcess,
    
    // Actions
    handleTabChange,
    handleViewTranscript,
    handleCloseModal,
    handleSubmit,
    handleClearHistory,
    handleDownloadVideo,
    apiKey,
    setApiKey: handleSetApiKey
  };
};

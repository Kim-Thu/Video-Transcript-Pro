'use client';

import { copyToClipboard, countWords, downloadTextFile } from '@/lib';
import type { TranscriptViewerProps } from '@/types';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge, Button, Card } from './ui';

/**
 * Transcript Viewer Component
 * Now detects and displays demo mode warning
 */
export const TranscriptViewer = ({
  transcript,
  videoTitle,
  onCopy,
  onDownload,
  className = '',
}: TranscriptViewerProps) => {
  const [copied, setCopied] = useState(false);

  // Detect if this is demo content
  const isDemo = useMemo(() => {
    return transcript.includes('DEMO MODE') ||
      transcript.includes('transcript mẫu') ||
      transcript.includes('download_failed') ||
      transcript.includes('Để sử dụng tính năng transcript thực');
  }, [transcript]);

  const wordCount = countWords(transcript);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(transcript);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      toast.success('Đã sao chép transcript!');
      onCopy?.();
    }
  }, [transcript, onCopy]);

  const handleDownload = useCallback(() => {
    const filename = videoTitle
      ? `transcript-${videoTitle.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.txt`
      : `transcript-${Date.now()}.txt`;

    downloadTextFile(transcript, filename);
    toast.success('Đang tải xuống file...');
    onDownload?.();
  }, [transcript, videoTitle, onDownload]);

  return (
    <Card className={`animate-fade-in ${className}`}>
      {/* Demo Mode Warning */}
      {isDemo && (
        <div className="mb-4 p-4 rounded-xl bg-warning/10 border border-warning/30">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-warning mb-1">Chế độ Demo</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Không thể tải hoặc xử lý video. Đây là nội dung mẫu.
                Hãy thử với một link TikTok/Facebook <strong>công khai, thực sự tồn tại</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDemo ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-2">
            <h3 className="font-semibold text-foreground">Transcript</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-400">{wordCount} từ</p>
              {isDemo && (
                <Badge variant="warning" size="sm">Demo</Badge>
              )}
              {!isDemo && (
                <Badge variant="success" size="sm">Live</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            leftIcon={
              copied ? (
                <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )
            }
          >
            {copied ? 'Đã copy!' : 'Copy'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownload}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
          >
            Tải xuống
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className={`rounded-xl p-4 max-h-96 overflow-y-auto ${isDemo ? 'bg-warning/5 border border-warning/10' : 'bg-secondary/50'}`}>
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {transcript}
        </p>
      </div>
    </Card>
  );
};

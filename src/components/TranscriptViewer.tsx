'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { copyToClipboard, countWords, downloadTextFile } from '@/lib';
import type { TranscriptViewerProps } from '@/types';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge, Button, Card } from './ui';

/**
 * Format seconds to MM:SS or HH:MM:SS format
 */
const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Transcript Viewer Component
 * Supports timestamp display with toggle
 */
export const TranscriptViewer = ({
  transcript,
  videoTitle,
  segments,
  onCopy,
  onDownload,
  className = '',
}: TranscriptViewerProps) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);

  // Detect if this is demo content
  const isDemo = useMemo(() => {
    return transcript.includes('DEMO MODE') ||
      transcript.includes('transcript mẫu') ||
      transcript.includes('download_failed') ||
      transcript.includes('Để sử dụng tính năng transcript thực');
  }, [transcript]);

  // Check if we have valid segments with timestamps
  const hasTimestamps = useMemo(() => {
    return segments && segments.length > 0;
  }, [segments]);

  const wordCount = countWords(transcript);

  const handleCopy = useCallback(async () => {
    // If showing timestamps, include them in the copy
    let textToCopy = transcript;
    if (showTimestamps && hasTimestamps && segments) {
      textToCopy = segments
        .map(seg => `[${formatTime(seg.start)}] ${seg.text}`)
        .join('\n');
    }

    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(t('transcript.copied'));
      onCopy?.();
    }
  }, [transcript, segments, showTimestamps, hasTimestamps, onCopy, t]);

  const handleDownload = useCallback(() => {
    // If showing timestamps, include them in the download
    let textToDownload = transcript;
    if (showTimestamps && hasTimestamps && segments) {
      textToDownload = segments
        .map(seg => `[${formatTime(seg.start)}] ${seg.text}`)
        .join('\n');
    }

    const filename = videoTitle
      ? `transcript-${videoTitle.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.txt`
      : `transcript-${Date.now()}.txt`;

    downloadTextFile(textToDownload, filename);
    toast.success(t('transcript.downloading'));
    onDownload?.();
  }, [transcript, segments, videoTitle, showTimestamps, hasTimestamps, onDownload, t]);

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
              <h4 className="font-semibold text-warning mb-1">{t('transcript.demo_mode')}</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                {t('transcript.demo_message')}
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
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-foreground">Transcript</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-secondary-text">{wordCount} {t('transcript.words')}</p>
              {isDemo && (
                <Badge variant="warning" size="sm">Demo</Badge>
              )}
              {!isDemo && (
                <Badge variant="success" size="sm">Live</Badge>
              )}
              {hasTimestamps && (
                <Badge variant="info" size="sm">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('transcript.timed')}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {/* Timestamp Toggle */}
          {hasTimestamps && (
            <Button
              variant={showTimestamps ? "primary" : "secondary"}
              size="sm"
              onClick={() => setShowTimestamps(!showTimestamps)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              {showTimestamps ? t('transcript.hide_time') : t('transcript.show_time')}
            </Button>
          )}

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
            {copied ? t('transcript.copied_btn') : 'Copy'}
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
            {t('transcript.download')}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className={`rounded-xl p-4 max-h-96 overflow-y-auto ${isDemo ? 'bg-warning/5 border border-warning/10' : 'bg-secondary/50'}`}>
        {showTimestamps && hasTimestamps && segments ? (
          // Timed segments view
          <div className="space-y-3">
            {segments.map((segment, index) => (
              <div
                key={index}
                className="flex gap-3 group hover:bg-primary/5 rounded-lg p-2 -m-2 transition-colors"
              >
                {/* Timestamp badge */}
                <div className="shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono font-medium">
                    {formatTime(segment.start)}
                  </span>
                </div>
                {/* Text content */}
                <p className="text-foreground leading-relaxed flex-1">
                  {segment.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          // Plain text view
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {transcript}
          </p>
        )}
      </div>
    </Card>
  );
};

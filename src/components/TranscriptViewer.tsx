'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { copyToClipboard, countWords, downloadTextFile } from '@/lib';
import type { TranscriptViewerProps } from '@/types';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge, Button, Card } from './ui';
import { CheckIcon, ClockIcon, CopyIcon, DocumentIcon, DownloadIcon, WarningIcon } from './ui/Icons';

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
              <WarningIcon className="w-4 h-4 text-warning" />
            </div>
            <div>
              <h4 className="font-semibold text-warning mb-1">{t('transcript.demo_mode')}</h4>
              <p className="text-sm text-secondary-text leading-relaxed">
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
            <DocumentIcon className="w-5 h-5" />
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
                  <ClockIcon className="w-3 h-3 mr-1" />
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
              leftIcon={<ClockIcon className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">
                {showTimestamps ? t('transcript.hide_time') : t('transcript.show_time')}
              </span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            leftIcon={
              copied ? (
                <CheckIcon className="w-4 h-4 text-success" />
              ) : (
                <CopyIcon className="w-4 h-4" />
              )
            }
          >
            <span className="hidden sm:inline">
              {copied ? t('transcript.copied_btn') : 'Copy'}
            </span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownload}
            leftIcon={<DownloadIcon className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">
              {t('transcript.download')}
            </span>
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

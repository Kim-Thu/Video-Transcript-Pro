'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { copyToClipboard, countWords, downloadTextFile } from '@/lib';
import type { TranscriptViewerProps } from '@/types';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge, Button, Card } from './ui';
import { CheckIcon, ClockIcon, CopyIcon, DocumentIcon, DownloadIcon, EditIcon, WarningIcon } from './ui/Icons';

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
 * Supports timestamp display with toggle and interactive editing
 */
export const TranscriptViewer = ({
  transcript,
  videoTitle,
  segments,
  onCopy,
  onDownload,
  onSegmentsChange,
  onTranscriptChange,
  className = '',
  tokenUsage,
}: TranscriptViewerProps) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editableSegments, setEditableSegments] = useState(segments || []);
  const [editableTranscript, setEditableTranscript] = useState(transcript);

  // Sync with props when not editing
  useMemo(() => {
    if (!isEditing) {
      setEditableSegments(segments || []);
      setEditableTranscript(transcript);
    }
  }, [segments, transcript, isEditing]);

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

  const wordCount = useMemo(() => {
    return isEditing
      ? countWords(hasTimestamps ? editableSegments.map(s => s.text).join(' ') : editableTranscript)
      : countWords(transcript);
  }, [isEditing, editableSegments, editableTranscript, transcript, hasTimestamps]);

  const handleCopy = useCallback(async () => {
    // If showing timestamps, include them in the copy
    let textToCopy = isEditing ? editableTranscript : transcript;

    if (showTimestamps && hasTimestamps) {
      const targetSegments = isEditing ? editableSegments : segments;
      if (targetSegments) {
        textToCopy = targetSegments
          .map(seg => `[${formatTime(seg.start)}] ${seg.text}`)
          .join('\n');
      }
    }

    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(t('transcript.copied'));
      onCopy?.();
    }
  }, [transcript, segments, editableTranscript, editableSegments, isEditing, showTimestamps, hasTimestamps, onCopy, t]);

  const handleDownload = useCallback(() => {
    // If showing timestamps, include them in the download
    let textToDownload = isEditing ? editableTranscript : transcript;

    if (showTimestamps && hasTimestamps) {
      const targetSegments = isEditing ? editableSegments : segments;
      if (targetSegments) {
        textToDownload = targetSegments
          .map(seg => `[${formatTime(seg.start)}] ${seg.text}`)
          .join('\n');
      }
    }

    const filename = videoTitle
      ? `transcript-${videoTitle.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.txt`
      : `transcript-${Date.now()}.txt`;

    downloadTextFile(textToDownload, filename);
    toast.success(t('transcript.downloading'));
    onDownload?.();
  }, [transcript, segments, editableTranscript, editableSegments, isEditing, videoTitle, showTimestamps, hasTimestamps, onDownload, t]);

  const handleSaveEdit = () => {
    if (hasTimestamps) {
      onSegmentsChange?.(editableSegments);
      // Sync transcript text too
      const newTranscript = editableSegments.map(s => s.text).join('\n');
      onTranscriptChange?.(newTranscript);
    } else {
      onTranscriptChange?.(editableTranscript);
    }
    setIsEditing(false);
    toast.success(t('common.saved') || 'Đã lưu thay đổi');
  };

  const handleCancelEdit = () => {
    setEditableSegments(segments || []);
    setEditableTranscript(transcript);
    setIsEditing(false);
  };

  const updateSegmentText = (index: number, newText: string) => {
    const newSegments = [...editableSegments];
    newSegments[index] = { ...newSegments[index], text: newText };
    setEditableSegments(newSegments);
  };

  return (
    <Card className={`animate-fade-in border-primary/20 bg-secondary/10 ${className}`}>
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
              {tokenUsage && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 cursor-help"
                  title={`Input: ${tokenUsage.prompt_tokens} | Output: ${tokenUsage.completion_tokens}`}
                >
                  ⚡ {tokenUsage.total_tokens}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap items-center">
          {/* Edit Mode Controls */}
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="text-secondary-text"
              >
                {t('common.cancel') || 'Hủy'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
                leftIcon={<CheckIcon className="w-4 h-4" />}
              >
                {t('common.save') || 'Lưu'}
              </Button>
            </>
          ) : (
            <>
              {/* Toggle Edit */}
              {!isDemo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  leftIcon={<EditIcon className="w-4 h-4" />}
                  title="Chỉnh sửa nội dung"
                />
              )}

              {/* Timestamp Toggle */}
              <Button
                variant={showTimestamps ? "primary" : "secondary"}
                size="sm"
                onClick={() => {
                  if (!hasTimestamps) {
                    toast.info(t('transcript.no_timestamps') || 'Transcript này không có dữ liệu thời gian.');
                    return;
                  }
                  setShowTimestamps(!showTimestamps);
                }}
                className={!hasTimestamps ? "opacity-50 cursor-not-allowed" : ""}
                leftIcon={<ClockIcon className="w-4 h-4" />}
                title={showTimestamps ? t('transcript.hide_time') : t('transcript.show_time')}
              />

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
                title={copied ? t('transcript.copied_btn') : 'Copy'}
              />

              <Button
                variant="primary"
                size="sm"
                onClick={handleDownload}
                leftIcon={<DownloadIcon className="w-4 h-4" />}
                title={t('transcript.download')}
              />
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className={`rounded-xl p-4 max-h-[500px] overflow-y-auto border transition-all duration-300 ${isEditing ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20' :
        isDemo ? 'bg-warning/5 border-warning/10' : 'bg-secondary/20 border-white/5'
        }`}>
        {showTimestamps && hasTimestamps ? (
          // Timed segments view (Normal or Edit)
          <div className="space-y-3">
            {(isEditing ? editableSegments : segments || []).map((segment, index) => (
              <div
                key={index}
                className={`flex gap-3 group rounded-xl p-2 -m-2 transition-colors ${isEditing ? 'hover:bg-primary/10' : 'hover:bg-primary/5'
                  }`}
              >
                {/* Timestamp badge */}
                <div className="shrink-0 pt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono font-medium border border-primary/20">
                    {formatTime(segment.start)}
                  </span>
                </div>

                {/* Text content or Input */}
                {isEditing ? (
                  <textarea
                    className="w-full bg-transparent text-foreground leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary/30 rounded px-2 py-1 border border-white/10 resize-none overflow-hidden"
                    value={segment.text}
                    onChange={(e) => updateSegmentText(index, e.target.value)}
                    rows={Math.max(1, Math.ceil(segment.text.length / 100))}
                    autoFocus={index === 0}
                  />
                ) : (
                  <p className="text-foreground leading-relaxed flex-1 py-1">
                    {segment.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Plain text view (Normal or Edit)
          isEditing ? (
            <textarea
              className="w-full h-80 bg-transparent text-foreground leading-relaxed focus:outline-none border-none resize-none"
              value={editableTranscript}
              onChange={(e) => setEditableTranscript(e.target.value)}
              placeholder="Chỉnh sửa nội dung tại đây..."
            />
          ) : (
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {transcript}
            </p>
          )
        )}
      </div>

      {isEditing && (
        <div className="mt-4 flex items-center gap-2 text-xs text-secondary-text">
          <Badge variant="info" size="sm">Editing</Badge>
          <span>Thay đổi của bạn sẽ được lưu cục bộ.</span>
        </div>
      )}
    </Card>
  );
};

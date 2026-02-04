'use client';

import { copyToClipboard, formatDuration } from '@/lib';
import type { VideoPreviewProps } from '@/types';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from './Modal';
import { PlatformBadge } from './PlatformBadge';
import { Button, Card } from './ui';
import { EyeIcon } from './ui/Icons';

/**
 * Video Preview Component
 */
export const VideoPreview = ({
  videoInfo,
  onDownload,
  showActions = true,
  layoutMode = 'horizontal',
  className = '',
}: VideoPreviewProps) => {
  const [imageError, setImageError] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const handleWatchVideo = useCallback(() => {
    if (videoInfo.videoUrl || videoInfo.url) {
      window.open(videoInfo.videoUrl || videoInfo.url, '_blank', 'noopener,noreferrer');
    }
  }, [videoInfo]);

  const handleCopyDescription = useCallback(async () => {
    if (videoInfo.description) {
      await copyToClipboard(videoInfo.description);
      toast.success('Đã sao chép caption!');
    }
  }, [videoInfo.description]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const isVertical = videoInfo.platform === 'tiktok';

  return (
    <>
      <Card className={`animate-fade-in ${className}`}>
        <div className={layoutMode === 'vertical' ? 'flex flex-col gap-4' : 'flex flex-col md:flex-row gap-6'}>
          {/* Thumbnail */}
          <div className={`relative w-full flex-shrink-0 ${layoutMode === 'vertical' ? '' : (isVertical ? 'md:w-56' : 'md:w-80')}`}>
            <div className={`relative rounded-xl overflow-hidden bg-black/40 border border-white/5 ${isVertical ? 'aspect-square' : 'aspect-video'} ${layoutMode === 'vertical' && !isVertical ? 'aspect-video' : ''}`}>
              {videoInfo.thumbnail && !imageError ? (
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title || 'Video thumbnail'}
                  className="w-full h-full object-contain"
                  onError={handleImageError}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Duration overlay */}
              {videoInfo.duration && (
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md font-medium pointer-events-none z-10">
                  {formatDuration(videoInfo.duration)}
                </span>
              )}

              {/* Actions Overlay */}
              {showActions && (
                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px] z-20">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleWatchVideo}
                    className="shadow-xl scale-90 hover:scale-105 transition-transform min-w-[80px]"
                  >
                    Xem
                  </Button>

                  {onDownload && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onDownload}
                      className="shadow-xl bg-white text-black hover:bg-gray-200 border-none scale-90 hover:scale-105 transition-transform min-w-[80px]"
                    >
                      Tải
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start gap-3">
              <PlatformBadge platform={videoInfo.platform} />
              {videoInfo.author && (
                <span className="text-sm text-gray-400">@{videoInfo.author}</span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-foreground line-clamp-2">
              {videoInfo.title || 'Video không có tiêu đề'}
            </h3>

            {videoInfo.description && (
              <div className="mt-2 relative rounded-lg bg-secondary/30 p-3 border border-white/5">
                <div className="flex gap-2 items-start">
                  <div className="flex-1 max-h-32 overflow-y-auto pr-2 text-sm text-gray-400 whitespace-pre-wrap scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {videoInfo.description}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => setIsDescriptionOpen(true)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Xem toàn bộ caption"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCopyDescription}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Sao chép caption"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Modal
        isOpen={isDescriptionOpen}
        onClose={() => setIsDescriptionOpen(false)}
        title="Thông điệp / Caption"
        size="lg"
      >
        <div className="max-h-[60vh] overflow-y-auto pr-2 whitespace-pre-wrap text-foreground leading-relaxed">
          {videoInfo.description}
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={handleCopyDescription}>
            Sao chép
          </Button>
        </div>
      </Modal>
    </>
  );
};

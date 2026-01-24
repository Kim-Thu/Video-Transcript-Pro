'use client';

import { formatRelativeTime, truncateText } from '@/lib';
import type { HistoryTableProps } from '@/types';
import React, { useCallback } from 'react';
import { PlatformBadge } from './PlatformBadge';
import { StatusBadge } from './StatusBadge';
import { Button } from './ui';

interface HistoryTableRowProps {
  item: HistoryTableProps['items'][0];
  onViewTranscript: HistoryTableProps['onViewTranscript'];
  onDelete: HistoryTableProps['onDelete'];
  onRetry?: HistoryTableProps['onRetry'];
  showDelete?: boolean;
}

export const HistoryTableRow = React.memo(({ item, onViewTranscript, onDelete, onRetry, showDelete = true }: HistoryTableRowProps) => {
  const handleView = useCallback(() => {
    onViewTranscript(item);
  }, [item, onViewTranscript]);

  const handleDelete = useCallback(() => {
    onDelete(item.id);
  }, [item.id, onDelete]);

  const handleRetry = useCallback(() => {
    onRetry?.(item);
  }, [item, onRetry]);

  return (
    <tr>
      <td>
        <div className="flex items-center gap-3">
          {item.videoInfo.thumbnail ? (
            <img
              src={item.videoInfo.thumbnail}
              alt=""
              className="w-16 h-10 object-cover rounded-lg"
              loading="lazy"
            />
          ) : (
            <div className="w-16 h-10 bg-secondary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate max-w-xs">
              {truncateText(item.videoInfo.title || item.videoInfo.url, 40)}
            </p>
            {item.videoInfo.author && (
              <p className="text-xs text-gray-400">@{item.videoInfo.author}</p>
            )}
          </div>
        </div>
      </td>
      <td>
        <PlatformBadge platform={item.videoInfo.platform} />
      </td>
      <td>
        <StatusBadge status={item.status} />
      </td>
      <td>
        <span className="text-sm text-gray-400">
          {formatRelativeTime(item.createdAt)}
        </span>
      </td>
      <td>
        <div className="flex items-center justify-end gap-2">
          {item.status === 'completed' && (
            <Button variant="secondary" size="sm" onClick={handleView}>
              Xem
            </Button>
          )}
          {item.status === 'error' && onRetry && (
            <Button variant="secondary" size="sm" onClick={handleRetry}>
              Thử lại
            </Button>
          )}
          {showDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-error hover:bg-error/10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
});

HistoryTableRow.displayName = 'HistoryTableRow';

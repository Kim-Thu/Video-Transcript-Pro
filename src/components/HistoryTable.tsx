'use client';

import type { HistoryTableProps } from '@/types';
import { HistoryTableRow } from './HistoryTableRow';
import { Card, EmptyState } from './ui';

export const HistoryTable = ({
  items,
  onViewTranscript,
  onDelete,
  onRetry,
  className = '',
  showDelete = true,
}: HistoryTableProps) => {
  // Empty state
  if (items.length === 0) {
    return (
      <Card className={className}>
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Chưa có lịch sử"
          description="Các video bạn đã xử lý sẽ xuất hiện ở đây"
        />
      </Card>
    );
  }

  return (
    <div className={`table-container ${className}`}>
      <table className="custom-table">
        <thead>
          <tr>
            <th>Video</th>
            <th>Nền tảng</th>
            <th>Trạng thái</th>
            <th>Thời gian</th>
            <th className="text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <HistoryTableRow
              key={item.id}
              item={item}
              onViewTranscript={onViewTranscript}
              onDelete={onDelete}
              onRetry={onRetry}
              showDelete={showDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

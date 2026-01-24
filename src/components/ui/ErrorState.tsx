'use client';

import type { ErrorStateProps } from '@/types';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Đã xảy ra lỗi',
  message,
  onRetry,
  className = '',
}: ErrorStateProps) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center text-error">
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
};

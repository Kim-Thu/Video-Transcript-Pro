'use client';

import type { LoadingSpinnerProps } from '@/types';

/**
 * Loading Spinner Component
 */
export const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  className = '',
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  
  const colorClasses = {
    primary: 'border-primary',
    white: 'border-white',
    accent: 'border-accent',
  };
  
  return (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-t-transparent ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

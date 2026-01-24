'use client';

import type { BadgeProps } from '@/types';

/**
 * Reusable Badge Component
 */
export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) => {
  const variantClasses = {
    default: 'bg-primary/20 text-primary border border-primary/30',
    tiktok: 'badge-tiktok',
    facebook: 'badge-facebook',
    youtube: 'badge-youtube',
    success: 'badge-success',
    warning: 'badge-processing',
    error: 'badge-error',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span className={`badge ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};

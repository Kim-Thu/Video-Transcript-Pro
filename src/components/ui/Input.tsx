'use client';

import type { InputProps } from '@/types';

/**
 * Reusable Input Component
 */
export const Input = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  leftIcon,
  rightIcon,
  onClear,
  className = '',
}: InputProps) => {
  const hasValue = value.length > 0;

  return (
    <div className={`relative ${className} ${error ? 'pb-6' : ''}`}>
      {leftIcon && (
        <div className="absolute left-4 top-[26px] -translate-y-1/2 text-secondary-text">
          {leftIcon}
        </div>
      )}

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          input-field w-full
          ${leftIcon ? 'pl-12' : ''}
          ${rightIcon || (onClear && hasValue) ? 'pr-12' : ''}
          ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}
        `}
      />

      {onClear && hasValue && !rightIcon && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-4 top-[26px] -translate-y-1/2 text-secondary-text hover:text-foreground transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {rightIcon && (
        <div className="absolute right-4 top-[26px] -translate-y-1/2 text-secondary-text">
          {rightIcon}
        </div>
      )}

      {error && (
        <p className="absolute bottom-0 left-0 text-sm text-error truncate w-full" title={error}>{error}</p>
      )}
    </div>
  );
};

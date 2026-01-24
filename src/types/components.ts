import type { ReactNode } from 'react';
import type { Platform, TranscriptItem, VideoInfo } from './entities';

/**
 * Common Component Props
 */
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Loading Spinner Props
 */
export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'accent';
}

/**
 * Button Props
 */
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Input Props
 */
export interface InputProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClear?: () => void;
}

/**
 * Badge Props
 */
export interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'tiktok' | 'facebook' | 'youtube' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

/**
 * Card Props
 */
export interface CardProps extends BaseComponentProps {
  hover?: boolean;
  glow?: 'primary' | 'accent';
  padding?: 'sm' | 'md' | 'lg';
}

/**
 * Modal Props
 */
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Video Preview Props
 */
export interface VideoPreviewProps extends BaseComponentProps {
  videoInfo: VideoInfo;
  onDownload?: () => void;
  showActions?: boolean;
  layoutMode?: 'horizontal' | 'vertical';
}

import type { TranscriptSegment } from './api';

/**
 * Transcript Viewer Props
 */
export interface TranscriptViewerProps extends BaseComponentProps {
  transcript: string;
  videoTitle?: string;
  segments?: TranscriptSegment[];
  onCopy?: () => void;
  onDownload?: () => void;
}

/**
 * Batch Input Props
 */
export interface BatchInputProps extends BaseComponentProps {
  onSubmit: (urls: string[]) => void;
  isProcessing?: boolean;
  maxUrls?: number;
}

/**
 * History Table Props
 */
export interface HistoryTableProps extends BaseComponentProps {
  items: TranscriptItem[];
  onViewTranscript: (item: TranscriptItem) => void;
  onDelete: (id: string) => void;
  onRetry?: (item: TranscriptItem) => void;
  showDelete?: boolean;
}

/**
 * Tab Props
 */
export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: number;
}

export interface TabsProps extends BaseComponentProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

/**
 * Platform Badge Props
 */
export interface PlatformBadgeProps extends BaseComponentProps {
  platform: Platform;
  showIcon?: boolean;
}

/**
 * Empty State Props
 */
export interface EmptyStateProps extends BaseComponentProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * Error State Props
 */
export interface ErrorStateProps extends BaseComponentProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

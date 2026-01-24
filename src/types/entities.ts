/**
 * Platform Types and Constants
 */
export const SUPPORTED_PLATFORMS = ['tiktok', 'facebook', 'youtube'] as const;
export type Platform = (typeof SUPPORTED_PLATFORMS)[number];

/**
 * Transcript Status
 */
export const TRANSCRIPT_STATUSES = ['pending', 'processing', 'completed', 'error'] as const;
export type TranscriptStatus = (typeof TRANSCRIPT_STATUSES)[number];

/**
 * Base Entity Interface - for internal entities with tracking
 */
export interface BaseEntity {
  readonly id: string;
  readonly createdAt: Date;
  updatedAt?: Date;
}

/**
 * Video Information - External data from API
 */
export interface VideoInfo {
  readonly id: string;
  readonly url: string;
  readonly platform: Platform;
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  author?: string;
  videoUrl?: string;
}

/**
 * Transcript Segment (for timestamped transcripts)
 */
export interface TranscriptSegment {
  readonly start: number;
  readonly end: number;
  readonly text: string;
}

/**
 * Transcript Item (History Record) - Internal entity
 */
export interface TranscriptItem extends BaseEntity {
  readonly videoInfo: VideoInfo;
  status: TranscriptStatus;
  transcript?: string;
  segments?: TranscriptSegment[];
  error?: string;
  completedAt?: Date;
}

/**
 * Batch Process Item
 */
export interface BatchProcessItem {
  readonly url: string;
  status: TranscriptStatus;
  transcript?: string;
  error?: string;
}

/**
 * Factory functions for creating entities
 */
export function createVideoInfo(
  url: string,
  platform: Platform,
  overrides?: Partial<Omit<VideoInfo, 'id' | 'url' | 'platform'>>
): VideoInfo {
  return {
    id: generateEntityId(),
    url,
    platform,
    ...overrides,
  };
}

export function createTranscriptItem(
  videoInfo: VideoInfo,
  status: TranscriptStatus = 'pending'
): TranscriptItem {
  return {
    id: generateEntityId(),
    videoInfo,
    status,
    createdAt: new Date(),
  };
}

/**
 * Generate unique ID
 */
function generateEntityId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

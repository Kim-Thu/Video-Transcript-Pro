/**
 * Generic API Response Contract
 */
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ApiError;
  readonly timestamp?: string;
}

/**
 * API Error Structure
 */
export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

/**
 * Video Info API Response
 */
export interface VideoInfoResponse {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly thumbnail: string;
  readonly duration: number;
  readonly author: string;
  readonly videoUrl: string;
  readonly platform: string;
}

/**
 * Transcript API Response
 */
export interface TranscriptResponse {
  readonly transcript: string;
  readonly segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  readonly language?: string;
  readonly confidence?: number;
}

/**
 * Pagination Response
 */
export interface PaginatedResponse<T> {
  readonly items: T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

/**
 * Request Contracts
 */
export interface VideoInfoRequest {
  readonly url: string;
}

export interface TranscriptRequest {
  readonly url: string;
  readonly language?: string;
  readonly apiKey?: string; // Add this
}

export interface BatchTranscriptRequest {
  readonly urls: string[];
  readonly language?: string;
}

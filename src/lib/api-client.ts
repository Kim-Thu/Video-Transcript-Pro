/**
 * API Client Service
 * Single Responsibility: HTTP communication with backend
 */

import type {
    ApiResponse,
    TranscriptRequest,
    TranscriptResponse,
    VideoInfoRequest,
    VideoInfoResponse,
} from '@/types';
import { API_CONFIG } from './constants';

/**
 * HTTP Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API Client with retry logic
 */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  
  constructor(config?: { baseUrl?: string; timeout?: number }) {
    this.baseUrl = config?.baseUrl || API_CONFIG.baseUrl;
    this.timeout = config?.timeout || API_CONFIG.timeout;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: errorData.message || `Request failed with status ${response.status}`,
          },
        };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: { code: 'TIMEOUT', message: 'Request timed out' },
          };
        }
        
        return {
          success: false,
          error: { code: 'NETWORK_ERROR', message: error.message },
        };
      }
      
      return {
        success: false,
        error: { code: 'UNKNOWN', message: 'An unknown error occurred' },
      };
    }
  }
  
  private async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
  
  /**
   * Get video information
   */
  async getVideoInfo(request: VideoInfoRequest): Promise<ApiResponse<VideoInfoResponse>> {
    return this.post<VideoInfoResponse>('/video/info', request);
  }
  
  /**
   * Get transcript
   */
  async getTranscript(request: TranscriptRequest): Promise<ApiResponse<TranscriptResponse>> {
    return this.post<TranscriptResponse>('/transcript', request);
  }
  
  /**
   * Download video (returns blob)
   */
  async downloadVideo(url: string): Promise<Blob | null> {
    try {
      const response = await fetch(`${this.baseUrl}/video/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) return null;
      return await response.blob();
    } catch {
      return null;
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient();

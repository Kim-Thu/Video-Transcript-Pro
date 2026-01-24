'use client';

import { validateBatchUrls, VALIDATION } from '@/lib';
import type { BatchInputProps } from '@/types';
import { useCallback, useState } from 'react';
import { Button, Card } from './ui';

/**
 * Batch Input Component
 */
export const BatchInput = ({
  onSubmit,
  isProcessing = false,
  maxUrls = VALIDATION.maxBatchUrls,
  className = '',
}: BatchInputProps) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = useCallback(() => {
    setError(null);
    
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
    
    if (lines.length === 0) {
      setError('Vui lòng nhập ít nhất một link');
      return;
    }
    
    const { valid, invalid } = validateBatchUrls(lines);
    
    if (invalid.length > 0 && valid.length === 0) {
      setError(invalid[0].error || 'Tất cả link không hợp lệ');
      return;
    }
    
    if (valid.length > maxUrls) {
      setError(`Tối đa ${maxUrls} link một lần`);
      return;
    }
    
    onSubmit(valid.map(v => v.url));
  }, [text, maxUrls, onSubmit]);
  
  const handleClear = useCallback(() => {
    setText('');
    setError(null);
  }, []);
  
  const lineCount = text.split('\n').filter(line => line.trim()).length;
  
  return (
    <Card className={`animate-fade-in ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Xử lý hàng loạt</h3>
            <p className="text-sm text-gray-400">
              Nhập nhiều link video, mỗi link một dòng
            </p>
          </div>
          <span className="badge bg-primary/20 text-primary">
            {lineCount} / {maxUrls} link
          </span>
        </div>
        
        {/* Textarea */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError(null);
            }}
            placeholder={`https://www.tiktok.com/@user/video/123456789\nhttps://www.facebook.com/watch?v=123456789\nhttps://vm.tiktok.com/XXXXXXXXX`}
            disabled={isProcessing}
            rows={6}
            className={`
              input-field w-full resize-none font-mono text-sm
              ${error ? 'border-error focus:border-error' : ''}
            `}
          />
          
          {text && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isProcessing}
              className="absolute top-3 right-3 text-gray-400 hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Error */}
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-xl flex items-center gap-2 text-error">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={handleClear}
            disabled={isProcessing || !text}
          >
            Xóa
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isProcessing || lineCount === 0}
            loading={isProcessing}
            leftIcon={
              !isProcessing && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )
            }
          >
            {isProcessing ? 'Đang xử lý...' : `Xử lý ${lineCount} video`}
          </Button>
        </div>
      </div>
    </Card>
  );
};

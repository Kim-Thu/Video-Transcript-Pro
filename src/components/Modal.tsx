'use client';

import type { ModalProps } from '@/types';
import React, { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal Component
 */
export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className = '',
}: ModalProps) => {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    }, [onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return createPortal(
        <div
            className="modal-overlay animate-fade-in"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            style={{ zIndex: 9999 }} // Ensure it's on top of everything
        >
            <div className={`modal-content w-full ${sizeClasses[size]} ${className}`}>
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <h2 id="modal-title" className="text-lg font-semibold text-foreground">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-foreground transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

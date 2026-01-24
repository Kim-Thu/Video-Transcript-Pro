'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { FC } from 'react';

interface ApiKeyInputProps {
    apiKey: string;
    onChange: (key: string) => void;
}

export const ApiKeyInput: FC<ApiKeyInputProps> = ({ apiKey, onChange }) => {
    const { t } = useLanguage();

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="shrink-0 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                {t('single.apiKeyLabel')}
            </span>
            <input
                type="password"
                className="bg-transparent border-b border-border outline-none text-foreground w-full max-w-sm focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                placeholder={t('single.apiKeyPlaceholder')}
                value={apiKey || ''}
                onChange={(e) => onChange(e.target.value)}
            />
            <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline whitespace-nowrap">
                {t('single.getKey')}
            </a>
        </div>
    );
};

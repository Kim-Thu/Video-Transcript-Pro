'use client';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ReactNode } from 'react';

export const Providers = ({ children }: { children: ReactNode }) => {
    return (
        <LanguageProvider>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </LanguageProvider>
    );
};

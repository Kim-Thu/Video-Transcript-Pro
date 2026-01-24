'use client';

import { en } from '@/locales/en';
import { vi } from '@/locales/vi';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Language = 'vi' | 'en';
type Dictionary = typeof vi;

// Helper type to access nested keys
type NestedKeyOf<ObjectType extends object> = {
    [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)];

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: NestedKeyOf<Dictionary>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('vi');

    // Load saved preference
    useEffect(() => {
        const saved = localStorage.getItem('language') as Language;
        if (saved && (saved === 'vi' || saved === 'en')) {
            setLanguage(saved);
        }
    }, []);

    const changeLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: NestedKeyOf<Dictionary>): string => {
        const dict = language === 'vi' ? vi : en;
        const keys = key.split('.');

        let result: any = dict;
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k as keyof typeof result];
            } else {
                return key; // Fallback to key if not found
            }
        }

        return result as string;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

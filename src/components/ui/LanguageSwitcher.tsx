'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './Button';

export const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();

    const toggle = () => {
        setLanguage(language === 'vi' ? 'en' : 'vi');
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="!p-2 min-w-[32px] font-bold text-foreground/80 hover:text-foreground"
            aria-label="Change Language"
        >
            {language.toUpperCase()}
        </Button>
    );
};

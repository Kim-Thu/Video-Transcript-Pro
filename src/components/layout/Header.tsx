'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { FacebookIcon, TikTokIcon, YouTubeIcon } from '../ui/Icons';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { ThemeToggle } from '../ui/ThemeToggle';

export const Header = () => {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 glass border-b border-border transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-bold text-gradient">{t('header.title')}</div>
              <p className="text-xs text-muted-foreground">{t('header.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Platform Icons - Uniform size */}
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 border border-[#ee1d52]">
                <TikTokIcon className="w-4 h-4 text-[#ee1d52]" />
                <span className="text-xs font-medium text-[#ee1d52]">TikTok</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877f2]/10 border border-[#1877f2]/50">
                <FacebookIcon className="w-4 h-4 text-[#1877f2]" />
                <span className="text-xs font-medium text-[#1877f2]">Facebook</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff0000]/10 border border-[#ff0000]/50">
                <YouTubeIcon className="w-4 h-4 text-[#ff0000]" />
                <span className="text-xs font-medium text-[#ff0000]">YouTube</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 pl-2 md:pl-4">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

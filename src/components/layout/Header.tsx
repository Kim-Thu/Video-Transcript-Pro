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

          <div className="flex items-center gap-4">
            {/* Platform Badges (Hidden on mobile to save space) */}
            <div className="hidden md:flex items-center gap-2">
              <span className="badge badge-tiktok">
                <TikTokIcon className="w-3 h-3 mr-1" />
                TikTok
              </span>
              <span className="badge badge-facebook">
                <FacebookIcon className="w-3 h-3 mr-1" />
                Facebook
              </span>
              <span className="badge badge-youtube">
                <YouTubeIcon className="w-3 h-3 mr-1" />
                YouTube
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 pl-4">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

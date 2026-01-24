'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border mt-16 py-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground text-sm">
        <p>{t('footer.copyright')}</p>
      </div>
    </footer>
  );
};

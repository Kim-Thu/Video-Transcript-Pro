'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        <span className="text-gradient">{t('hero.title_start')}</span>
        <br />
        <span className="text-foreground">{t('hero.title_end')}</span>
      </h1>
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
        {t('hero.subtitle')}
      </p>
    </section>
  );
};

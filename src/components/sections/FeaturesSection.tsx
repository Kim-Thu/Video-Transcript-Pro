'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { BoltIcon, CheckIcon, ListIcon } from '../ui/Icons';
import { FeatureCard } from './FeatureCard';

export const FeaturesSection = () => {
  const { t } = useLanguage();

  return (
    <section className="mt-16 grid md:grid-cols-3 gap-6">
      <FeatureCard
        icon={<BoltIcon />}
        title={t('features.fast.title')}
        description={t('features.fast.desc')}
        gradient="from-primary/20 to-accent/20"
        iconColor="text-primary"
      />
      <FeatureCard
        icon={<ListIcon />}
        title={t('features.accurate.title')}
        description={t('features.accurate.desc')}
        gradient="from-accent/20 to-success/20"
        iconColor="text-accent"
      />
      <FeatureCard
        icon={<CheckIcon />}
        title={t('features.export.title')}
        description={t('features.export.desc')}
        gradient="from-success/20 to-primary/20"
        iconColor="text-success"
      />
    </section>
  );
};

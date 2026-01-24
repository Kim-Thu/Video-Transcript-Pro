'use client';

import { FeaturesSection, HeroSection, Tabs, TranscriptModal } from '@/components';
import { HistoryIcon, LinkIcon, ListIcon } from '@/components/ui/Icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { BatchTabContent } from '@/features/home/components/BatchTabContent';
import { HistoryTabContent } from '@/features/home/components/HistoryTabContent';
import { SingleTabContent } from '@/features/home/components/SingleTabContent';
import { useHomePage } from '@/hooks';
import { TabItem } from '@/types';
import { useMemo } from 'react';

export default function HomePage() {
  const logic = useHomePage();
  const { t } = useLanguage();

  // UI Configuration (Tabs with Icons)
  const tabs: TabItem[] = useMemo(() => [
    { id: 'single', label: t('tabs.single'), icon: <LinkIcon /> },
    { id: 'batch', label: t('tabs.batch'), icon: <ListIcon /> },
    { id: 'history', label: t('tabs.history'), icon: <HistoryIcon />, badge: logic.history.count },
  ], [logic.history.count, t]);

  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <HeroSection />

        <div className="mb-8">
          <Tabs
            tabs={tabs}
            activeTab={logic.activeTab}
            onChange={logic.handleTabChange}
            className="max-w-xl mx-auto"
          />
        </div>

        <div className="space-y-6">
          {/* Single Tab */}
          {logic.activeTab === 'single' && (
            <SingleTabContent
              transcript={logic.transcript}
              apiKey={logic.apiKey}
              onApiKeyChange={logic.setApiKey}
              onDownloadVideo={logic.handleDownloadVideo}
            />
          )}

          {/* Batch Tab */}
          {logic.activeTab === 'batch' && (
            <BatchTabContent
              batchProcess={logic.batchProcess}
              onViewTranscript={logic.handleViewTranscript}
            />
          )}

          {/* History Tab */}
          {logic.activeTab === 'history' && (
            <HistoryTabContent
              history={logic.history}
              onClearHistory={logic.handleClearHistory}
              onViewTranscript={logic.handleViewTranscript}
            />
          )}
        </div>

        <FeaturesSection />
      </main>

      {logic.selectedItem && (
        <TranscriptModal
          isOpen={logic.modalOpen}
          onClose={logic.handleCloseModal}
          transcript={logic.selectedItem.transcript || ''}
          videoTitle={logic.selectedItem.videoInfo.title}
        />
      )}
    </>
  );
}

'use client';

import { BatchInput } from '@/components/BatchInput';
import { HistoryTable } from '@/components/HistoryTable';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranscriptItem } from '@/types';

interface BatchProcessState {
    processBatch: (urls: string[]) => void;
    isProcessing: boolean;
    results: TranscriptItem[];
    progress: {
        current: number;
        total: number;
    };
}

interface BatchTabContentProps {
    batchProcess: BatchProcessState;
    onViewTranscript: (item: TranscriptItem) => void;
}

export const BatchTabContent = ({
    batchProcess,
    onViewTranscript
}: BatchTabContentProps) => {
    const { t } = useLanguage();

    return (
        <div className="space-y-6 animate-fade-in">
            <BatchInput
                onSubmit={batchProcess.processBatch}
                isProcessing={batchProcess.isProcessing}
            />

            {(batchProcess.results.length > 0 || batchProcess.isProcessing) && (
                <div className="animate-fade-in border-t border-border pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            {t('batch.progress')}
                            <span className="text-sm font-normal text-muted-foreground">
                                ({batchProcess.progress.current}/{batchProcess.progress.total})
                            </span>
                        </h3>
                    </div>

                    <HistoryTable
                        items={batchProcess.results}
                        onViewTranscript={onViewTranscript}
                        onDelete={() => { }}
                        showDelete={false}
                    />
                </div>
            )}
        </div>
    );
};

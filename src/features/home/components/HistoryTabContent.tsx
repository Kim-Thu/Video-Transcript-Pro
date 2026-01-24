'use client';

import { HistoryTable } from '@/components/HistoryTable';
import { Button } from '@/components/ui/Button';
import { TrashIcon } from '@/components/ui/Icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranscriptItem } from '@/types';

interface HistoryState {
    items: TranscriptItem[];
    count: number;
    removeItem: (id: string) => void;
}

interface HistoryTabContentProps {
    history: HistoryState;
    onViewTranscript: (item: TranscriptItem) => void;
    onClearHistory: () => void;
}
export const HistoryTabContent = ({
    history,
    onViewTranscript,
    onClearHistory
}: HistoryTabContentProps) => {
    const { t } = useLanguage();

    return (
        <div className="animate-fade-in">
            {history.count > 0 && (
                <div className="flex justify-end mb-4">
                    <Button variant="danger" size="sm" onClick={onClearHistory}>
                        <span className="flex items-center gap-2">
                            <TrashIcon /> {t('common.deleteAll')}
                        </span>
                    </Button>
                </div>
            )}
            <HistoryTable
                items={history.items}
                onViewTranscript={onViewTranscript}
                onDelete={history.removeItem}
            />
        </div>
    );
};

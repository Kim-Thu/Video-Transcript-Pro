import { TranscriptViewerSkeleton } from '@/components/skeletons/TranscriptViewerSkeleton';
import { VideoPreviewSkeleton } from '@/components/skeletons/VideoPreviewSkeleton';
import { TranscriptViewer } from '@/components/TranscriptViewer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BoltIcon } from '@/components/ui/Icons';
import { Input } from '@/components/ui/Input';
import { VideoPreview } from '@/components/VideoPreview';
import { useLanguage } from '@/contexts/LanguageContext';
import { FC, FormEvent } from 'react';
import { ApiKeyInput } from './ApiKeyInput';
import { TranscriptError } from './TranscriptError';

import { TranscriptSegment } from '@/types';

interface TranscriptState {
    url: string;
    setUrl: (url: string) => void;
    isBusy: boolean;
    isLoading: boolean;
    isProcessing: boolean;
    isReady: boolean;
    error: string | null;
    videoInfo: any | null;
    transcript: string | null;
    segments?: TranscriptSegment[] | null;
    processUrl: () => void;
}

interface SingleTabContentProps {
    transcript: TranscriptState;
    apiKey: string;
    onApiKeyChange: (key: string) => void;
    onDownloadVideo: () => void;
}

export const SingleTabContent: FC<SingleTabContentProps> = ({
    transcript,
    apiKey,
    onApiKeyChange,
    onDownloadVideo
}) => {
    const { t } = useLanguage();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        transcript.processUrl();
    };

    return (
        <div className="animate-fade-in">
            <Card className="mb-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                value={transcript.url}
                                onChange={transcript.setUrl}
                                placeholder={t('single.placeholder')}
                                disabled={transcript.isBusy}
                                error={transcript.error || undefined}
                                onClear={() => transcript.setUrl('')}
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={transcript.isBusy || !transcript.isReady}
                            loading={transcript.isBusy}
                            leftIcon={!transcript.isBusy && <BoltIcon />}
                            className="min-w-[160px]"
                        >
                            {transcript.isLoading ? t('common.loading') :
                                transcript.isProcessing ? t('common.processing') : t('single.button')}
                        </Button>
                    </div>

                    <ApiKeyInput apiKey={apiKey} onChange={onApiKeyChange} />
                </form>
            </Card>

            {transcript.isLoading && <VideoPreviewSkeleton />}

            {(transcript.videoInfo || transcript.transcript || transcript.isProcessing) && !transcript.isLoading && (
                <div className={`grid grid-cols-1 ${transcript.videoInfo ? 'lg:grid-cols-12 gap-6' : 'gap-6'}`}>

                    {/* Left Column: Video Info */}
                    {transcript.videoInfo && (
                        <div className="lg:col-span-5 xl:col-span-4 order-2 lg:order-1">
                            <div className="sticky top-6">
                                <VideoPreview
                                    videoInfo={transcript.videoInfo}
                                    onDownload={onDownloadVideo}
                                    layoutMode="vertical"
                                    className="h-full shadow-lg border-opacity-50"
                                />
                            </div>
                        </div>
                    )}

                    {/* Right Column: Transcript or Error */}
                    <div className="lg:col-span-7 xl:col-span-8 order-1 lg:order-2">
                        {transcript.error ? (
                            <TranscriptError message={transcript.error} />
                        ) : transcript.isProcessing && !transcript.transcript ? (
                            <div className="animate-pulse space-y-4">
                                <TranscriptViewerSkeleton />
                                <p className="text-center text-muted-foreground animate-pulse">{t('single.progress_analyzing')}</p>
                            </div>
                        ) : transcript.transcript ? (
                            <TranscriptViewer
                                transcript={transcript.transcript}
                                videoTitle={transcript.videoInfo?.title}
                                segments={transcript.segments || undefined}
                                className="h-full shadow-lg border-opacity-50"
                            />
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

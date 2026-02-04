import { TranscriptSegment } from '@/types';
import { Modal } from './Modal';
import { TranscriptViewer } from './TranscriptViewer';

interface TranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transcript: string;
  videoTitle?: string;
  segments?: TranscriptSegment[];
}

export const TranscriptModal = ({
  isOpen,
  onClose,
  transcript,
  videoTitle,
  segments
}: TranscriptModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={videoTitle || 'Transcript'} size="lg">
      <TranscriptViewer
        transcript={transcript}
        videoTitle={videoTitle}
        segments={segments}
      />
    </Modal>
  );
};

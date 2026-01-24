'use client';

import { Modal } from './Modal';
import { Button } from './ui';

export const TranscriptModal = ({ isOpen, onClose, transcript, videoTitle }: { 
  isOpen: boolean; 
  onClose: () => void; 
  transcript: string; 
  videoTitle?: string; 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={videoTitle || 'Transcript'} size="lg">
      <div className="bg-secondary/50 rounded-xl p-4 max-h-96 overflow-y-auto">
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {transcript}
        </p>
      </div>
      <div className="flex justify-end mt-4">
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </Modal>
  );
};

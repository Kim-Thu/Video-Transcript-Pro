from abc import ABC, abstractmethod
from typing import Optional, List, Tuple
from models.domain import VideoMetadata, TranscriptSegment, AIResponse

class IMediaDownloader(ABC):
    @abstractmethod
    def download_video(self, url: str, output_path: str) -> Optional[str]:
        """Download video to local path. Returns actual path or None."""
        pass

    @abstractmethod
    def extract_audio(self, video_path: str, output_path: str) -> bool:
        """Extract audio from video. Returns success boolean."""
        pass
        
    @abstractmethod
    def download_subtitles_only(self, url: str, output_base_path: str) -> List[str]:
        """Download only subtitles without the video file. Returns list of paths."""
        pass

    @abstractmethod
    def get_subtitles(self, file_base_path: str) -> List[str]:
        """Get list of subtitle files associated with the video."""
        pass

class IAIService(ABC):
    @abstractmethod
    def transcribe_audio(self, audio_path: str, api_key: str) -> AIResponse:
        """Transcribe audio file to text."""
        pass

    @abstractmethod
    def translate_text(self, text: str, target_lang: str, api_key: str) -> AIResponse:
        """Translate text to target language."""
        pass

class ISubtitleParser(ABC):
    @abstractmethod
    def parse(self, file_path: str) -> Optional[str]:
        """Parse subtitle file and return clean text."""
        pass
    
    @abstractmethod
    def parse_with_timestamps(self, file_path: str) -> Tuple[str, List[TranscriptSegment]]:
        """Parse subtitle file and return (clean text, list of timed segments)."""
        pass

from dataclasses import dataclass, field
from typing import Optional, List
from enum import Enum
import datetime

class TranscriptSource(Enum):
    OFFICIAL_SUBTITLE = "official_subtitle"
    TRANSLATED_SUBTITLE = "translated_subtitle_by_gemini"
    REFINED_SUBTITLE = "refined_subtitle_by_gemini"
    AI_TRANSCRIPTION = "ai_transcription"
    FALLBACK_TRANSCRIPTION = "fallback_transcription"

@dataclass
class TranscriptSegment:
    """Represents a single segment of transcript with timing information"""
    start: float  # Start time in seconds
    end: float    # End time in seconds
    text: str     # The transcript text for this segment

@dataclass
class VideoMetadata:
    id: str
    url: str
    platform: str
    title: Optional[str] = None
    duration: Optional[int] = None

@dataclass
class ProcessingResult:
    transcript: str
    source: str
    segments: List[TranscriptSegment] = field(default_factory=list)
    is_demo: bool = False
    language: str = "vi"
    confidence: float = 1.0

@dataclass
class ProcessingRequest:
    url: str
    api_key: Optional[str] = None
    request_id: str = ""
    force_transcribe: bool = False

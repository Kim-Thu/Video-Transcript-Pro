import os
import uuid
from typing import Optional
from models.domain import ProcessingRequest, ProcessingResult, TranscriptSource
from services.base import IMediaDownloader, IAIService, ISubtitleParser
from services.impl.media_service import YtDlpMediaService
from services.impl.ai_service import GeminiAIService
from services.impl.subtitle_service import VTTSubtitleParser
from config import DOWNLOAD_DIR
from utils.helpers import detect_platform

class TranscriptWorkflow:
    def __init__(self):
        # In a real DI framework, these would be injected.
        # For now, we instantiate them here (Composition Root).
        self.downloader: IMediaDownloader = YtDlpMediaService()
        self.ai_service: IAIService = GeminiAIService()
        self.parser: ISubtitleParser = VTTSubtitleParser()

    def process(self, request: ProcessingRequest) -> ProcessingResult:
        video_id = str(uuid.uuid4())
        video_path = os.path.join(DOWNLOAD_DIR, f'{video_id}.mp4')
        audio_path = os.path.join(DOWNLOAD_DIR, f'{video_id}.wav')
        
        platform = detect_platform(request.url)
        print(f"[{video_id}] Starting workflow for {platform}: {request.url}")

        downloaded_path = None
        
        try:
            # 1. Download
            downloaded_path = self.downloader.download_video(request.url, video_path)
            if not downloaded_path:
                 raise Exception(f"Download failed for {request.url}")

            # 2. Check for Subtitles
            # Logic: 
            # - IF YouTube AND has Vietnamese Sub -> Use it directly (Efficiency)
            # - IF Foreign Sub -> Translate
            # - ELSE (No sub or unreliable sub) -> Transcribe Audio
            
            # Find candidate subtitles
            base_name = os.path.splitext(downloaded_path)[0]
            subs = self.downloader.get_subtitles(base_name)
            
            vietnamese_sub_path = next((s for s in subs if any(c in s.lower() for c in [
                '.vi.', '.vie.', '.vi-', '.vie-',  # Standard patterns
                '_vi_', '_vie_', '_vi-', '_vie-',  # Underscore patterns
                'vi_vn', 'vie_vn', 'vi-vn',        # Locale patterns (e.g., vi_VN.vtt)
                '.vietnamese.',                     # Full name pattern
            ])), None)
            foreign_sub_path = next((s for s in subs if s != vietnamese_sub_path), None) if subs else None
            
            final_transcript = None
            source_type = TranscriptSource.AI_TRANSCRIPTION
            skip_foreign_translation = False  # Flag to force audio transcription
            
            # Strategy Decision
            if vietnamese_sub_path:
                # TRUST Vietnamese Subtitles from ALL platforms (TikTok, Facebook, YouTube)
                # This saves Gemini tokens and is faster
                print(f"[{video_id}] Found Vietnamese Subtitle on {platform}. Using it directly.")
                final_transcript = self.parser.parse(vietnamese_sub_path)
                source_type = TranscriptSource.OFFICIAL_SUBTITLE
            
            # If no Vietnamese sub, try Foreign Sub Translation
            if not final_transcript and foreign_sub_path:
                print(f"[{video_id}] Found Foreign Subtitle: {os.path.basename(foreign_sub_path)}")
                raw_text = self.parser.parse(foreign_sub_path)
                if raw_text:
                    print(f"[{video_id}] Translating foreign subtitle...")
                    final_transcript = self.ai_service.translate_text(raw_text, 'Vietnamese', request.api_key)
                    source_type = TranscriptSource.TRANSLATED_SUBTITLE
            
            # 3. Fallback to Audio Transcription
            if not final_transcript:
                print(f"[{video_id}] No usable subtitle. Extracting and Transcribing Audio...")
                if self.downloader.extract_audio(downloaded_path, audio_path):
                     final_transcript = self.ai_service.transcribe_audio(audio_path, request.api_key)
                     source_type = TranscriptSource.AI_TRANSCRIPTION
                else:
                     raise Exception("Audio extraction failed")

            return ProcessingResult(
                transcript=final_transcript or "",
                source=source_type.value,
                is_demo=False
            )

        finally:
            # Cleanup
            self._cleanup(downloaded_path, audio_path, subs if 'subs' in locals() else [])

    def _cleanup(self, video_path, audio_path, subs):
        try:
            if video_path and os.path.exists(video_path): os.remove(video_path)
            if audio_path and os.path.exists(audio_path): os.remove(audio_path)
            for s in subs:
                if os.path.exists(s): os.remove(s)
        except Exception:
            pass

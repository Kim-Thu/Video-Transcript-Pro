import os
import uuid
from typing import Optional, List
from models.domain import ProcessingRequest, ProcessingResult, TranscriptSource, TranscriptSegment
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
            print(f"[{video_id}] Downloading video...")
            downloaded_path = self.downloader.download_video(request.url, video_path)
            if not downloaded_path:
                 print(f"[{video_id}] Download failed (downloader returned None)")
                 raise Exception(f"Download failed for {request.url}")
            print(f"[{video_id}] Download successful: {downloaded_path}")

            # 2. Check for Subtitles
            base_name = os.path.splitext(downloaded_path)[0]
            subs = self.downloader.get_subtitles(base_name)
            print(f"[{video_id}] Found subtitles: {subs}")
            
            vietnamese_sub_path = next((s for s in subs if any(c in s.lower() for c in [
                '.vi.', '.vie.', '.vi-', '.vie-',  # Standard patterns
                '_vi_', '_vie_', '_vi-', '_vie-',  # Underscore patterns
                'vi_vn', 'vie_vn', 'vi-vn',        # Locale patterns (e.g., vi_VN.vtt)
                '.vietnamese.',                     # Full name pattern
            ])), None)
            foreign_sub_path = next((s for s in subs if s != vietnamese_sub_path), None) if subs else None
            
            final_transcript = None
            final_segments: List[TranscriptSegment] = []
            source_type = TranscriptSource.AI_TRANSCRIPTION
            
            # Strategy Decision
            if vietnamese_sub_path:
                print(f"[{video_id}] Found Vietnamese Subtitle on {platform}. Using it directly.")
                final_transcript, final_segments = self.parser.parse_with_timestamps(vietnamese_sub_path)
                source_type = TranscriptSource.OFFICIAL_SUBTITLE
            
            # If no Vietnamese sub, try Foreign Sub Translation
            if not final_transcript and foreign_sub_path:
                print(f"[{video_id}] Found Foreign Subtitle: {os.path.basename(foreign_sub_path)}")
                raw_text, foreign_segments = self.parser.parse_with_timestamps(foreign_sub_path)
                if raw_text:
                    print(f"[{video_id}] Translating foreign subtitle...")
                    final_transcript = self.ai_service.translate_text(raw_text, 'Vietnamese', request.api_key)
                    # Note: Translated segments lose individual timing if we don't translate segment by segment
                    # For now, we reuse original timings with translated text if possible, but translate_text does bulk translation
                    # So we might lose segment alignment. Strategy: Keep foreign segments timing, but text is difficult.
                    # Currently GeminiAIService.translate_text returns full text.
                    # If we want segments, we should translate segments individually or use a smart mapping.
                    # For MVP: Keep foreign segments logic separate or just return full text.
                    # Let's just return full translated text and valid segments if we can map them, otherwise empty segments.
                    # To keep it simple: if translated, we don't support segments yet unless we rewrite translate logic.
                    final_segments = [] 
                    source_type = TranscriptSource.TRANSLATED_SUBTITLE
            
            # 3. Fallback to Audio Transcription
            if not final_transcript:
                print(f"[{video_id}] No usable subtitle. Extracting and Transcribing Audio...")
                if self.downloader.extract_audio(downloaded_path, audio_path):
                     print(f"[{video_id}] Audio extracted. Calling AI Service...")
                     final_transcript = self.ai_service.transcribe_audio(audio_path, request.api_key)
                     source_type = TranscriptSource.AI_TRANSCRIPTION
                     final_segments = []
                else:
                     print(f"[{video_id}] Audio extraction failed")
                     raise Exception("Audio extraction failed")

            return ProcessingResult(
                transcript=final_transcript or "",
                source=source_type.value,
                segments=final_segments,
                is_demo=False
            )

        except Exception as e:
            print(f"❌ [{video_id}] Workflow Failed: {str(e)}")
            import traceback
            traceback.print_exc()
            raise e
        finally:
            self._cleanup(downloaded_path, audio_path, subs if 'subs' in locals() else [])

    def _cleanup(self, video_path, audio_path, subs):
        try:
            if video_path and os.path.exists(video_path): os.remove(video_path)
            if audio_path and os.path.exists(audio_path): os.remove(audio_path)
            for s in subs:
                if os.path.exists(s): os.remove(s)
        except Exception:
            pass

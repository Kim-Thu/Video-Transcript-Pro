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
                '.vi.', '.vie.', '.vi-', '.vie-', '.vn.', '.vn-',  # Standard patterns
                '_vi_', '_vie_', '_vi-', '_vie_', '_vn_', '_vn-',  # Underscore patterns
                'vi_vn', 'vie_vn', 'vi-vn', 'vn_vn', 'vn-vn',      # Locale patterns
                '.vietnamese.', '.tiengviet.',                     # Full name patterns
            ])), None)
            foreign_sub_path = next((s for s in subs if s != vietnamese_sub_path), None) if subs else None
            
            final_transcript = None
            final_segments: List[TranscriptSegment] = []
            source_type = TranscriptSource.AI_TRANSCRIPTION
            token_usage = None
            
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
                    ai_res = self.ai_service.translate_text(raw_text, 'Vietnamese', request.api_key)
                    final_transcript = ai_res.text
                    token_usage = ai_res.usage
                    
                    # Note: Translated segments lose individual timing if we don't translate segment by segment
                    # For now, we reuse original timings with translated text if possible
                    # But translate_text full body might lose alignment.
                    # For MVP: Keep foreign segments logic separate or just return full text.
                    # Let's just return full translated text.
                    final_segments = [] 
                    source_type = TranscriptSource.TRANSLATED_SUBTITLE
            
            # 3. Fallback to Audio Transcription
            if not final_transcript:
                print(f"[{video_id}] No usable subtitle. Extracting and Transcribing Audio...")
                if self.downloader.extract_audio(downloaded_path, audio_path):
                     print(f"[{video_id}] Audio extracted. Calling AI Service...")
                     ai_res = self.ai_service.transcribe_audio(audio_path, request.api_key)
                     
                     token_usage = ai_res.usage
                     ai_text = ai_res.text
                     source_type = TranscriptSource.AI_TRANSCRIPTION
                     
                     # Try to parse VTT from AI response
                     try:
                        parsed_text, parsed_segments = self.parser.parse_content(ai_text)
                        if parsed_segments:
                            final_transcript = parsed_text
                            final_segments = parsed_segments
                            print(f"[{video_id}] AI returned VTT with {len(parsed_segments)} segments.")
                        else:
                            # Fallback: AI might have returned plain text
                            final_transcript = ai_text
                            final_segments = []
                            print(f"[{video_id}] AI returned text without valid VTT segments.")
                     except Exception as e:
                        print(f"[{video_id}] Failed to parse AI VTT: {e}")
                        final_transcript = ai_text
                        final_segments = []
                else:
                     print(f"[{video_id}] Audio extraction failed")
                     raise Exception("Audio extraction failed")

            return ProcessingResult(
                transcript=final_transcript or "",
                source=source_type.value,
                segments=final_segments,
                is_demo=False,
                token_usage=token_usage
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

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
        # Use a sub_base path for subtitle search
        sub_base = os.path.join(DOWNLOAD_DIR, f'sub_{video_id}')
        video_path = os.path.join(DOWNLOAD_DIR, f'{video_id}.mp4')
        audio_path = os.path.join(DOWNLOAD_DIR, f'{video_id}.wav')
        
        platform = detect_platform(request.url)
        downloaded_path = None
        subs = []
        
        try:
            print(f"[{video_id}] Quick scanning for subtitles...")
            subs = self.downloader.download_subtitles_only(request.url, sub_base)
            
            if subs:
                print(f"[{video_id}] Found {len(subs)} subtitle files: {[os.path.basename(s) for s in subs]}")
            
            # Priority 1: Vietnamese (Official or Auto-generated)
            # Match strictly for Vietnamese tags
            vietnamese_sub_path = next((s for s in subs if any(tag in os.path.basename(s).lower() for tag in [
                '.vi.', '.vie.', '.vi-', '.vie-', '.vn.', '.vn-',
                'vi_vn', 'vie_vn', 'vi-vn', 'vn_vn', 'vn-vn',
                '.vietnamese.', '.tiengviet.'
            ]) or os.path.basename(s).lower().endswith('.vi.vtt')), None)
            
            # Priority 2: English (Best for translation fallback)
            english_sub_path = next((s for s in subs if any(c in s.lower() for c in [
                '.en.', '.eng.', '.en-', '.eng-', '.us.', '.gb.',
                'en_us', 'en_gb', '.english.'
            ])), None)
            
            foreign_sub_path = english_sub_path or (next((s for s in subs if s != vietnamese_sub_path), None) if subs else None)
            
            final_transcript = None
            final_segments: List[TranscriptSegment] = []
            source_type = TranscriptSource.AI_TRANSCRIPTION
            token_usage = None
            
            if vietnamese_sub_path:
                print(f"[{video_id}] Found Vietnamese subtitle (FAST): {os.path.basename(vietnamese_sub_path)}")
                final_transcript, final_segments = self.parser.parse_with_timestamps(vietnamese_sub_path)
                if final_transcript:
                    source_type = TranscriptSource.OFFICIAL_SUBTITLE
            
            # If no Vietnamese but has Foreign sub, translate (FAST-ish)
            if not final_transcript and foreign_sub_path:
                print(f"[{video_id}] Found foreign subtitle for translation (FAST): {os.path.basename(foreign_sub_path)}")
                raw_text, _ = self.parser.parse_with_timestamps(foreign_sub_path)
                if raw_text:
                    print(f"[{video_id}] Translating foreign subtitle...")
                    ai_res = self.ai_service.translate_text(raw_text, 'Vietnamese', request.api_key)
                    final_transcript = ai_res.text
                    token_usage = ai_res.usage
                    source_type = TranscriptSource.TRANSLATED_SUBTITLE

            # --- PHASE 2: Fallback to Download & AI (SLOWER) ---
            if not final_transcript:
                print(f"[{video_id}] No usable subtitle found. Downloading audio for AI transcription...")
                downloaded_path = self.downloader.download_video(request.url, video_path)
                if not downloaded_path:
                    raise Exception(f"Download failed for {request.url}")
                
                if self.downloader.extract_audio(downloaded_path, audio_path):
                    print(f"[{video_id}] Calling AI for transcription...")
                    ai_res = self.ai_service.transcribe_audio(audio_path, request.api_key)
                    
                    token_usage = ai_res.usage
                    ai_text = ai_res.text
                    source_type = TranscriptSource.AI_TRANSCRIPTION
                    
                    try:
                        parsed_text, parsed_segments = self.parser.parse_content(ai_text)
                        if parsed_segments:
                            final_transcript = parsed_text
                            final_segments = parsed_segments
                        else:
                            final_transcript = ai_text
                    except Exception as e:
                        print(f"[{video_id}] Failed to parse AI VTT: {e}")
                        final_transcript = ai_text
                else:
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
            raise e
        finally:
            self._cleanup(downloaded_path, audio_path, subs)

    def _cleanup(self, video_path, audio_path, subs):
        try:
            if video_path and os.path.exists(video_path): os.remove(video_path)
            if audio_path and os.path.exists(audio_path): os.remove(audio_path)
            if subs:
                for s in subs:
                    if os.path.exists(s): os.remove(s)
        except Exception:
            pass

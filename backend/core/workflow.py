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


        downloaded_path = None
        
        try:
            # 1. OPTIMIZATION: Try to get subtitles first WITHOUT downloading anything to disk
            
            # Fetch content directly to memory
            sub_content, sub_lang = self.downloader.get_transcript_content(request.url)
            
            # If we found subtitles, we don't need the video yet
            final_transcript = None
            final_segments: List[TranscriptSegment] = []
            source_type = TranscriptSource.AI_TRANSCRIPTION
            token_usage = None
            
            if sub_content:
                print(f"✅ Found direct subtitle content (Lang: {sub_lang})")
                
                # Check if we need to translate (e.g. if we got English but want Vietnamese?)
                # For now, just parse what we got.
                # Note: get_transcript_content ensures we get VTT format if possible, but raw content might be slightly different depending on source
                
                # Parse the VTT content
                final_transcript, final_segments = self.parser.parse_content(sub_content)
                source_type = TranscriptSource.OFFICIAL_SUBTITLE
                
                # If it's English and valid, maybe we want to translate? 
                # (User logic: "get link chép nội dung thôi") -> Let's keep it simple: return what we found.
                # If the user wants translation, that's a separate feature request usually, but 
                # previously logic did translate foreign subs.
                
                # Let's reinstate simple translation if it's NOT Vietnamese
                # We can check lang code
                if sub_lang and not sub_lang.startswith('vi'):
                     # It's foreign, let's translate using AI
                     if final_transcript:
                         print("Translating foreign subtitle to Vietnamese...")
                         try:
                             # We translate the full text for context
                             ai_res = self.ai_service.translate_text(final_transcript, 'Vietnamese', request.api_key)
                             final_transcript = ai_res.text
                             token_usage = ai_res.usage
                             final_segments = [] # Segments might not align perfectly after translation unless we translate segment by segment
                             source_type = TranscriptSource.TRANSLATED_SUBTITLE
                         except Exception as e:
                             print(f"Translation failed: {e}")
                             # Fallback to original


            # 2. Fallback: If no usable subtitles found, download video and transcribe
            if not final_transcript:
                downloaded_path = self.downloader.download_video(request.url, video_path)
                if not downloaded_path:
                    raise Exception(f"Download failed for {request.url}")
                
                if self.downloader.extract_audio(downloaded_path, audio_path):
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
                            final_segments = []
                     except Exception as e:
                        print(f"[{video_id}] Failed to parse AI VTT: {e}")
                        final_transcript = ai_text
                        final_segments = []
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

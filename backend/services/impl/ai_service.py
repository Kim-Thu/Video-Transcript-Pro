import os
import time
import google.generativeai as genai
from services.base import IAIService
from config import GEMINI_API_KEY
import warnings

# Suppress the 2026 deprecation warnings
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

class GeminiAIService(IAIService):
    def __init__(self, default_key: str = None):
        self.default_key = default_key or GEMINI_API_KEY

    def _get_configured_model(self, api_key: str, model_name: str = "gemini-1.5-flash"):
        key = api_key or self.default_key
        if not key:
            raise ValueError("API Key is required for Gemini Service")
        
        genai.configure(api_key=key)
        
        # Fallback strategy for models if one fails (not fully implemented here but structured for it)
        return genai.GenerativeModel(model_name)

    def transcribe_audio(self, audio_path: str, api_key: str) -> str:
        key = api_key or self.default_key
        if not key:
            return "Error: No API Key provided."

        try:
            print(f"🚀 [Gemini] Uploading audio: {os.path.basename(audio_path)}")
            genai.configure(api_key=key)
            audio_file = genai.upload_file(path=audio_path)
            
            # Wait for processing
            while audio_file.state.name == "PROCESSING":
                time.sleep(1)
                audio_file = genai.get_file(audio_file.name)

            if audio_file.state.name == "FAILED":
                raise ValueError("Gemini failed to process audio file.")

            print("✨ [Gemini] Generating transcript...")
            
            # Model selection strategy
            model_names = [
                "gemini-3-flash-preview", 
                "gemini-flash-latest", 
                "gemini-2.0-flash-exp",
                "gemini-1.5-flash"
            ]
            
            response = None
            last_err = None
            
            prompt = """
Hãy tạo transcript tiếng Việt cho file audio này dưới định dạng WebVTT chuẩn.
Yêu cầu bắt buộc:
1. Bắt đầu bằng dòng WEBVTT
2. Có timestamp chính xác cho từng câu nói (dạng MM:SS.mmm hoặc HH:MM:SS.mmm).
3. Chia nhỏ các câu để dễ theo dõi.
4. Chỉ output nội dung VTT, không thêm bất kỳ lời dẫn nào khác.

Ví dụ format:
WEBVTT

00:00:01.000 --> 00:00:05.000
Xin chào tất cả mọi người.

00:00:05.500 --> 00:00:10.000
Hôm nay chúng ta sẽ nói về...
"""

            for m_name in model_names:
                try:
                    model = genai.GenerativeModel(m_name)
                    response = model.generate_content([prompt, audio_file])

                    break
                except Exception as e:
                    last_err = e
                    continue
            
            if not response:
                raise last_err

            return response.text.strip()

        except Exception as e:
            print(f"❌ [Gemini Transcribe Error]: {e}")
            return f"Error: {str(e)}"

    def translate_text(self, text: str, target_lang: str, api_key: str) -> str:
        key = api_key or self.default_key
        if not key:
            return text

        try:
            genai.configure(api_key=key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            prompt = f"Translate this transcript to {target_lang} naturally. Output ONLY the translation:\n\n{text}"
            
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"❌ [Gemini Translate Error]: {e}")
            return text

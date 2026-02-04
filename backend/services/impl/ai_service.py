import os
import time
import google.generativeai as genai
from services.base import IAIService
from config import GEMINI_API_KEY
from models.domain import AIResponse
import warnings

# Suppress warnings
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
        return genai.GenerativeModel(model_name)

    def transcribe_audio(self, audio_path: str, api_key: str) -> AIResponse:
        key = api_key or self.default_key
        if not key:
            return AIResponse(text="Error: No API Key provided.")

        try:

            genai.configure(api_key=key)
            audio_file = genai.upload_file(path=audio_path)
            
            # Wait for processing
            while audio_file.state.name == "PROCESSING":
                time.sleep(1)
                audio_file = genai.get_file(audio_file.name)

            if audio_file.state.name == "FAILED":
                raise ValueError("Gemini failed to process audio file.")


            
            # Model selection strategy
            model_names = [
                "gemini-3-flash-preview", 
                "gemini-flash-latest", 
                "gemini-2.0-flash-exp",
                "gemini-1.5-flash"
            ]
            
            response = None
            last_err = None
            
            # Plain Text Prompt
            # Plain Text Prompt - Verbatim Transcription
            prompt = """
            Hãy nghe kỹ file âm thanh và thực hiện chép lời (transcribe) chính xác từng từ theo NGÔN NGỮ GỐC của video (Tiếng Việt, Anh, Hàn, Trung...).
            
            YÊU CẦU BẮT BUỘC:
            1. KHÔNG DỊCH sang ngôn ngữ khác. Video nói tiếng gì ghi tiếng đó.
            2. Trình bày kết quả dưới dạng WebVTT format (Subtitle) để có timestamp.
            3. Không thêm lời dẫn, không thêm chú thích (Gốc/Dịch).
            
            Ví dụ định dạng mong muốn:
            WEBVTT

            00:00:00.000 --> 00:00:05.000
            Xin chào mọi người, hôm nay chúng ta sẽ bắt đầu.

            00:00:05.000 --> 00:00:10.000
            Hello everyone, today we will start.
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

            # Extract Token Usage
            usage = None
            if hasattr(response, 'usage_metadata'):
                usage = {
                    'prompt_tokens': response.usage_metadata.prompt_token_count,
                    'completion_tokens': response.usage_metadata.candidates_token_count,
                    'total_tokens': response.usage_metadata.total_token_count
                }

            return AIResponse(text=response.text.strip(), usage=usage)

        except Exception as e:
            print(f"❌ [Gemini Transcribe Error]: {e}")
            return AIResponse(text=f"Error: {str(e)}")

    def translate_text(self, text: str, target_lang: str, api_key: str) -> AIResponse:
        key = api_key or self.default_key
        if not key:
            return AIResponse(text=text)

        try:
            genai.configure(api_key=key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            prompt = f"Translate this transcript to {target_lang} naturally. Output ONLY the translation:\n\n{text}"
            
            response = model.generate_content(prompt)
            
            usage = None
            if hasattr(response, 'usage_metadata'):
                usage = {
                    'prompt_tokens': response.usage_metadata.prompt_token_count,
                    'completion_tokens': response.usage_metadata.candidates_token_count,
                    'total_tokens': response.usage_metadata.total_token_count
                }
                
            return AIResponse(text=response.text.strip(), usage=usage)
        except Exception as e:
            print(f"❌ [Gemini Translate Error]: {e}", flush=True)
            return AIResponse(text=text)

import os
import time
import google.generativeai as genai
from config import GEMINI_API_KEY
import subprocess

def transcribe_with_whisper_local(audio_path, model_size="base"):
    """Fallback to local Whisper if Gemini fails or no key provided"""
    try:
        import whisper
        print(f"Loading local Whisper model ({model_size})...")
        model = whisper.load_model(model_size)
        result = model.transcribe(audio_path)
        return result["text"].strip()
    except Exception as e:
        print(f"Local Whisper Error: {e}")
        return f"Error: {e}"

import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

def transcribe_audio(audio_path, api_key=None):
    """
    Transcribe audio using Google Gemini Flash 1.5 (Fast & Accurate)
    Fallback to Whisper Local if API key is missing.
    """
    
    # Use provided key or fallback to env var
    final_key = api_key or GEMINI_API_KEY
    
    if not final_key:
        print("⚠️ No GEMINI_API_KEY provided. Falling back to local Whisper (base).")
        return transcribe_with_whisper_local(audio_path, "base")

    print(f"🔑 Using Gemini API Key: {final_key[:5]}...{final_key[-4:] if len(final_key) > 8 else ''}")

    try:
        print("🚀 Uploading audio to Gemini Flash...")
        genai.configure(api_key=final_key)
        
        # Upload the file
        audio_file = genai.upload_file(path=audio_path)
        
        # Wait for processing
        print("⏳ Waiting for audio processing...")
        while audio_file.state.name == "PROCESSING":
            time.sleep(1)
            audio_file = genai.get_file(audio_file.name)

        if audio_file.state.name == "FAILED":
            raise ValueError("Gemini failed to process audio file.")

        print("✨ Generating transcript with Gemini Flash...")
        
        # Try multiple model names to ensure compatibility with latest API (2026+)
        # Prioritize v3 and v2.5 models as seen in your screenshot
        model_names = [
            "gemini-3-flash-preview", 
            "gemini-flash-latest", 
            "gemini-2.5-flash-latest",
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash"
        ]
        
        response = None
        last_error = None
        
        prompt = "Hãy nghe thật kỹ và tạo transcript tiếng Việt chi tiết, chính xác từng từ cho file âm thanh này. Tuyệt đối không tóm tắt, không thêm lời dẫn, chỉ ghi lại lời thoại."

        for m_name in model_names:
            try:
                print(f"👉 Trying model: {m_name}")
                model = genai.GenerativeModel(m_name)
                response = model.generate_content([prompt, audio_file])
                break # Success
            except Exception as e:
                print(f"⚠️ Model {m_name} failed: {e}")
                last_error = e
        
        if not response:
             raise last_error

        return response.text.strip()

    except Exception as e:
        print(f"❌ Gemini Error: {e}")
        import traceback
        traceback.print_exc()
        
        # CRITICAL CHANGE: If user PROVIDED a key, DO NOT FALLBACK to Whisper (which is bad).
        # Return the error so user knows Gemini didn't run.
        return f"⚠️ Lỗi xử lý Gemini: {str(e)}\n(Model không được hỗ trợ hoặc Key chưa kích hoạt)"

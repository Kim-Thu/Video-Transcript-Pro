import google.generativeai as genai
from config import GEMINI_API_KEY
import os

def translate_text(text, target_lang='Vietnamese', api_key=None):
    """
    Translate text using Gemini Flash 1.5.
    Returns translated text or original text if failed.
    """
    final_key = api_key or GEMINI_API_KEY
    if not final_key:
        print("⚠️ No API Key for translation. Returning original text.")
        return text

    try:
        genai.configure(api_key=final_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
        Translate the following text into {target_lang} naturally and accurately.
        Maintain the original meaning and tone.
        Only return the translated text.
        
        Original Text:
        {text[:5000]} 
        ... (and the rest)
        """
        # Note: Sending huge text might hit token limits, but for short videos usually fine.
        # Better: just send the text directly.
        
        prompt = f"Translate this transcript to {target_lang} naturally. Output ONLY the translation:\n\n{text}"
        
        response = model.generate_content(prompt)
        print(f"✅ Translated text to {target_lang}")
        return response.text.strip()
        
    except Exception as e:
        print(f"❌ Translation failed: {e}")
        return text # Fallback to original

def fix_vietnamese_transcript(text, api_key=None):
    """
    Use Gemini to fix spelling and grammar of a raw Vietnamese transcript.
    """
    final_key = api_key or GEMINI_API_KEY
    if not final_key:
        return text

    try:
        genai.configure(api_key=final_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
        Bạn là biên tập viên chuyên nghiệp. Dưới đây là transcript thô (có thể bị sai chính tả/sai âm).
        Nhiệm vụ:
        1. Sửa lỗi chính tả, lỗi sai âm (ví dụ: "mơ nám" -> "mờ nám", "thực dụng" -> "thông dụng/bấm độn" tùy ngữ cảnh).
        2. Thêm dấu câu, ngắt đoạn hợp lý.
        3. GIỮ NGUYÊN Ý NGHĨA. KHÔNG THÊM LỜI BÌNH.
        4. Output: Chỉ trả về văn bản đã sửa.
        
        Văn bản gốc:
        {text[:5000]}
        """
        
        response = model.generate_content(prompt)
        print(f"✅ Refined Vietnamese transcript with Gemini")
        return response.text.strip()
        
    except Exception as e:
        print(f"❌ Refinement failed: {e}")
        return text

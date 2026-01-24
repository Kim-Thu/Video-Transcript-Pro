import subprocess
import os

def extract_audio(video_path, audio_path):
    """Extract audio from video using ffmpeg"""
    try:
        # Check if video file exists
        if not os.path.exists(video_path):
            print(f"Error extracting audio: Video file not found: {video_path}")
            return False

        # Remove existing audio file
        if os.path.exists(audio_path):
            try:
                os.remove(audio_path)
            except:
                pass

        result = subprocess.run([
            'ffmpeg',
            '-i', video_path,
            '-vn', # No video
            '-acodec', 'pcm_s16le',
            '-ar', '16000', # 16kHz
            '-ac', '1', # Mono
            '-y', # Overwrite
            audio_path
        ], capture_output=True, text=True, timeout=120)
        
        if result.returncode != 0:
            print(f"FFmpeg Error: {result.stderr}")
            return False
            
        return os.path.exists(audio_path)
    except Exception as e:
        print(f"Error extracting audio: {e}")
        return False

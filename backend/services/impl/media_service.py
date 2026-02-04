import os
import glob
import re
import subprocess
from typing import Optional
import yt_dlp
from services.base import IMediaDownloader
from utils.helpers import normalize_url

class YtDlpMediaService(IMediaDownloader):
    def download_subtitles_only(self, url: str, output_base_path: str) -> list[str]:
        url = normalize_url(url)
        user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        
        ydl_opts = {
            'skip_download': True,
            'outtmpl': output_base_path,
            'writesubtitles': True,
            'writeautomaticsub': True,
            'subtitlesformat': 'vtt',
            'subtitleslangs': ['vi.*', 'en.*', 'all', '-live_chat'],
            'quiet': True,
            'no_warnings': True,
            'nocheckcertificate': True,
            'http_headers': {
                'User-Agent': user_agent,
                'Referer': 'https://www.youtube.com/'
            }
        }
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.extract_info(url, download=True)
            return self.get_subtitles(output_base_path)
        except Exception as e:
            print(f"Subtitle Only Download Error: {e}")
            return []

    def download_video(self, url: str, output_path: str) -> Optional[str]:
        url = normalize_url(url)
        user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        if 'douyin.com' in url:
            user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

        ydl_opts = {
            # Prefer audio-only if possible to save bandwidth/time for transcription
            'format': 'bestaudio/best',
            'outtmpl': output_path,
            'noplaylist': True,
            'ignoreerrors': True,
            'quiet': True,
            'no_warnings': True,
            'nocheckcertificate': True,
            'geo_bypass': True,
            'http_headers': {
                'User-Agent': user_agent,
                'Referer': 'https://www.tiktok.com/' if 'tiktok.com' in url else 'https://www.douyin.com/' if 'douyin.com' in url else 'https://www.google.com/'
            }
        }

        try:
            # Cleanup existing
            if os.path.exists(output_path):
                try: os.remove(output_path)
                except: pass


            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.extract_info(url, download=True)

            if os.path.exists(output_path):
                return output_path
            
            # Check fallbacks (sometimes bestaudio saves as .m4a, .webm, etc)
            base_name = output_path.rsplit('.', 1)[0]
            candidates = [
                output_path + '.mp4', output_path + '.mkv', output_path + '.webm', output_path + '.m4a',
                base_name + '.mp4', base_name + '.mkv', base_name + '.webm', base_name + '.m4a'
            ]
            
            for candidate in candidates:
                if os.path.exists(candidate):
                    return candidate
            
            return None
        except Exception as e:
            print(f"Download Error: {e}")
            return None

    def extract_audio(self, video_path: str, output_path: str) -> bool:
        # Re-implementing extract_audio here to be self-contained
        try:
            if os.path.exists(output_path):
                # If it's already a wav, fine. If it's the audio file we downloaded, we still need to convert to 16k mono for Gemini/AI
                pass
                
            command = [
                'ffmpeg', '-i', video_path,
                '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1',
                '-y', output_path
            ]
            
            # Suppress output unless error
            subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return os.path.exists(output_path)
        except Exception as e:
            print(f"Extract Audio Error: {e}")
            return False

    def get_subtitles(self, file_base_path: str) -> list[str]:
        try:
            # Glob search for any VTT file that starts with this base path
            pattern = f"{glob.escape(file_base_path)}*.vtt"
            return glob.glob(pattern)
        except Exception:
            return []

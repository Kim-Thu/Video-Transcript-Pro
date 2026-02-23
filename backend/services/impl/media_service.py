import os
import glob
import re
import subprocess
from typing import Optional
import yt_dlp
from config import get_cookie_opts
from services.base import IMediaDownloader
from services.downloader import normalize_url

class YtDlpMediaService(IMediaDownloader):
    def download_video(self, url: str, output_path: str) -> Optional[str]:
        url = normalize_url(url)
        user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        if 'douyin.com' in url:
            user_agent = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'

        ydl_opts = {
            'format': 'bestvideo+bestaudio/best',
            'outtmpl': output_path,
            'noplaylist': True,
            'ignoreerrors': True,
            'writesubtitles': False,
            'writeautomaticsub': False,
            'subtitlesformat': 'vtt',
            'subtitleslangs': ['vi*', 'en*'],
            'quiet': True,
            'no_warnings': True,
            'http_headers': {
                'User-Agent': user_agent,
                'Referer': 'https://www.douyin.com/' if 'douyin.com' in url else None
            }
        }
        ydl_opts.update(get_cookie_opts())

        try:
            # Cleanup existing
            if os.path.exists(output_path):
                try: os.remove(output_path)
                except: pass


            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.extract_info(url, download=True)

            if os.path.exists(output_path):
                return output_path
            
            # Check fallbacks
            base_name = output_path.rsplit('.', 1)[0]
            candidates = [
                output_path + '.mp4', output_path + '.mkv', output_path + '.webm',
                base_name + '.mp4', base_name + '.mkv', base_name + '.webm'
            ]
            
            for candidate in candidates:
                if os.path.exists(candidate):
                    return candidate
            
            return None
        except Exception as e:
            print(f"Download Error: {e}")
            return None

    def download_subtitles_only(self, url: str, output_base_path: str) -> bool:
        """Download subtitles only without the video."""
        url = normalize_url(url)
        user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        
        ydl_opts = {
            'skip_download': True,
            'outtmpl': output_base_path,
            'writesubtitles': True,
            'writeautomaticsub': True,
            'subtitlesformat': 'vtt',
            'subtitleslangs': ['vi.*', 'en.*'],
            'quiet': True,
            'no_warnings': True,
            'ignoreerrors': True,
        }
        ydl_opts.update(get_cookie_opts())
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.extract_info(url, download=True)
            
            # Check if any .vtt files were created
            subs = self.get_subtitles(output_base_path)
            return len(subs) > 0
        except Exception as e:
            print(f"Sub Download Error: {e}")
            return False

    def extract_audio(self, video_path: str, output_path: str) -> bool:
        # Re-implementing extract_audio here to be self-contained
        try:
            if os.path.exists(output_path):
                return True
                
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
            safe_base_name = glob.escape(file_base_path)
            # Find all VTT files matching the base name
            return glob.glob(f"{safe_base_name}*.vtt")
        except Exception:
            return []

    def get_transcript_content(self, url: str) -> tuple[Optional[str], Optional[str]]:
        import requests
        url = normalize_url(url)
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'writesubtitles': True,
            'writeautomaticsub': True,
            'skip_download': True,
        }
        ydl_opts.update(get_cookie_opts())
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                # Priority: Manual Vietnamese -> Manual English -> Auto Vietnamese -> Auto English
                subtitles = info.get('subtitles', {})
                auto_subs = info.get('automatic_captions', {})
                
                candidates = []
                
                # Helper to collect candidates
                def add_candidates(source_dict, tag_prefix):
                    for lang, subs_list in source_dict.items():
                        for sub in subs_list:
                            if sub.get('ext') == 'vtt': # Only accept VTT to ensure parser compatibility
                                candidates.append({
                                    'lang': lang,
                                    'url': sub['url'],
                                    'is_auto': False if source_dict is subtitles else True
                                })

                add_candidates(subtitles, 'manual')
                add_candidates(auto_subs, 'auto')

                # Sort/Select logic
                # 1. Manual Vietnamese (vi, vi-VN, ...)
                best_match = next((c for c in candidates if not c['is_auto'] and c['lang'].startswith('vi')), None)
                
                # 2. Key English (Manual)
                if not best_match:
                    best_match = next((c for c in candidates if not c['is_auto'] and c['lang'].startswith('en')), None)
                    
                # 3. Auto Vietnamese
                if not best_match:
                    best_match = next((c for c in candidates if c['is_auto'] and c['lang'].startswith('vi')), None)
                    
                # 4. Auto English
                if not best_match:
                    best_match = next((c for c in candidates if c['is_auto'] and c['lang'].startswith('en')), None)
                    
                if best_match:
                    # Download content
                    print(f"Fetching transcript content: {best_match['lang']} (Auto: {best_match['is_auto']})")
                    response = requests.get(best_match['url'])
                    response.raise_for_status()
                    return response.text, best_match['lang']
                    
            return None, None
            
        except Exception as e:
            print(f"Error fetching transcript content: {e}")
            return None, None

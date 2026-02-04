import os
import yt_dlp
from config import DOWNLOAD_DIR
from utils.helpers import normalize_url

def get_video_info(url):
    """Get video information using yt-dlp"""
    url = normalize_url(url)
    # Use Chrome UA for Douyin as mobile sometimes triggers "Fresh cookies" more
    user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    if 'douyin.com' in url:
        user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

    ydl_opts = {
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
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            return {
                'title': info.get('title'),
                'description': info.get('description'),
                'duration': info.get('duration'),
                'author': info.get('uploader'),
                'videoUrl': info.get('webpage_url', url), # Original URL
                'thumbnail': info.get('thumbnail'),
                'platform': info.get('extractor_key', 'unknown').lower()
            }
    except Exception as e:
        print(f"Error fetching info: {e}")
        return None

def download_video_to_file(url, output_path):
    """
    Download video from URL directly to a specific path using yt-dlp.
    Returns the absolute path of the downloaded file or None.
    """
    url = normalize_url(url)
    # Cấu hình các tùy chọn cho yt-dlp
    user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    if 'douyin.com' in url:
        user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

    ydl_opts = {
        'format': 'bestvideo+bestaudio/best',
        'outtmpl': output_path,
        'noplaylist': True,
        'ignoreerrors': True,
        'writesubtitles': True,       # Tải phụ đề thủ công
        'writeautomaticsub': True,    # Tải phụ đề tự động (auto-generated)
        'subtitlesformat': 'vtt',     # Định dạng VTT
        'subtitleslangs': ['all', '-live_chat'], # Lấy tất cả ngôn ngữ
        'quiet': True,
        'no_warnings': True,
        'nocheckcertificate': True,
        'geo_bypass': True,
        'prefer_free_formats': True,
        'youtube_include_dash_manifest': False,
        'http_headers': {
            'User-Agent': user_agent,
            'Referer': 'https://www.tiktok.com/' if 'tiktok.com' in url else 'https://www.douyin.com/' if 'douyin.com' in url else 'https://www.google.com/'
        }
    }

    try:
        # Clean up existing file
        if os.path.exists(output_path):
            try:
                os.remove(output_path)
            except:
                pass
                

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.extract_info(url, download=True)
            
        # Verify download
        if os.path.exists(output_path):
            return output_path
        
        # Check fallback extensions
        base_name = output_path.rsplit('.', 1)[0]
        candidates = [
            output_path + '.mp4', 
            output_path + '.mkv',
            output_path + '.webm',
            base_name + '.mp4',
            base_name + '.mkv', 
            base_name + '.webm'
        ]
        
        for candidate in candidates:
            if os.path.exists(candidate):

                return candidate
        
        return None
            
    except Exception as e:
        print(f"Download error: {e}")
        return None

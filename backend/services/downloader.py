import os
import re
import yt_dlp
from config import DOWNLOAD_DIR, get_cookie_opts


def normalize_url(url):
    """
    Normalize video URLs for yt-dlp compatibility.
    - Convert TikTok /photo/ to /video/ (same content ID)
    - Strip unnecessary tracking parameters
    """
    # TikTok: /photo/ → /video/ (yt-dlp only supports /video/ URLs)
    if 'tiktok.com' in url:
        url = re.sub(r'/photo/', '/video/', url)
        # Clean tracking params
        url = re.sub(r'[?&](is_from_webapp|sender_device|web_id)=[^&]*', '', url)
        url = url.rstrip('?&')

    return url

def get_video_info(url):
    """Get video information using yt-dlp"""
    url = normalize_url(url)
    # Use Mobile UA for Douyin to bypass some checks
    user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    if 'douyin.com' in url:
        user_agent = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'

    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'http_headers': {
            'User-Agent': user_agent,
            'Referer': 'https://www.douyin.com/' if 'douyin.com' in url else None
        }
    }
    ydl_opts.update(get_cookie_opts())
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
    user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    if 'douyin.com' in url:
        user_agent = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'

    ydl_opts = {
        'format': 'bestvideo+bestaudio/best',
        'outtmpl': output_path,
        'noplaylist': True,
        'ignoreerrors': True,
        'writesubtitles': True,       # Tải phụ đề thủ công
        'writeautomaticsub': True,    # Tải phụ đề tự động (auto-generated)
        'subtitlesformat': 'vtt',     # Định dạng VTT
        'subtitleslangs': ['vi.*', 'en.*'], # Lấy tất cả ngôn ngữ
        'quiet': True,
        'no_warnings': True,
        'http_headers': {
            'User-Agent': user_agent,
            'Referer': 'https://www.douyin.com/' if 'douyin.com' in url else None
        }
    }
    ydl_opts.update(get_cookie_opts())

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

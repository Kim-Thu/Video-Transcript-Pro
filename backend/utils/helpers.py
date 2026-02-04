import re
import urllib.parse
import uuid

def detect_platform(url):
    """Detect platform from URL"""
    if 'tiktok.com' in url:
        return 'tiktok'
    elif 'facebook.com' in url or 'fb.watch' in url:
        return 'facebook'
    elif 'youtube.com' in url or 'youtu.be' in url:
        return 'youtube'
    elif 'douyin.com' in url:
        return 'douyin'
    return 'unknown'

def normalize_url(url):
    """Normalize URL to a format that yt-dlp prefers"""
    if not url:
        return url
        
    # Handle Douyin share links: m.douyin.com/share/video/ID -> www.douyin.com/video/ID
    if 'douyin.com' in url:
        # Case 1: /share/video/ID
        if '/share/video/' in url:
            match = re.search(r'/share/video/(\d+)', url)
            if match:
                video_id = match.group(1)
                return f"https://www.douyin.com/video/{video_id}"
        
        # Case 2: ?modal_id=ID or similar query params
        if 'modal_id=' in url:
            match = re.search(r'modal_id=(\d+)', url)
            if match:
                video_id = match.group(1)
                return f"https://www.douyin.com/video/{video_id}"
            
    return url

import unicodedata

def sanitize_filename(title):
    """Sanitize title to be safe for filenames (slug format)"""
    if not title:
        return f"video_{str(uuid.uuid4())[:8]}"
        
    # Decode URL-encoded title if needed
    decoded_title = urllib.parse.unquote(title)
    
    # Normalize unicode characters (remove accents)
    nfkd_form = unicodedata.normalize('NFKD', decoded_title)
    no_accents = "".join([c for c in nfkd_form if not unicodedata.combining(c)])
    
    # Lowercase and replace spaces/special chars with hyphens
    slug = re.sub(r'[^a-zA-Z0-9]', '-', no_accents.lower())
    
    # Remove multiple hyphens
    slug = re.sub(r'-+', '-', slug).strip('-')
    
    # Fallback if empty after sanitization
    if not slug:
        return f"video_{str(uuid.uuid4())[:8]}"
        
    return slug[:100]

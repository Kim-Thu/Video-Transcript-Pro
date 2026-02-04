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
        
    # Handle Douyin
    if 'douyin.com' in url:
        # Clean query params but keep modal_id if it's there
        if 'modal_id=' in url:
            match = re.search(r'modal_id=(\d+)', url)
            if match:
                video_id = match.group(1)
                return f"https://www.douyin.com/video/{video_id}"
        
        # Handle share links
        if '/share/video/' in url:
            match = re.search(r'/share/video/(\d+)', url)
            if match:
                video_id = match.group(1)
                return f"https://www.douyin.com/video/{video_id}"

    # Handle TikTok
    if 'tiktok.com' in url:
        # Standardize tiktok domains
        url = url.replace('vt.tiktok.com', 'www.tiktok.com')
        url = url.replace('vm.tiktok.com', 'www.tiktok.com')
        url = url.replace('m.tiktok.com', 'www.tiktok.com')
        
        # Remove tracking params (query string)
        if '?' in url:
            url = url.split('?')[0]
            
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

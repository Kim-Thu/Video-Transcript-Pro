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
    return 'unknown'

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

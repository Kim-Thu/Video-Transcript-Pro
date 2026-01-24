import yt_dlp
import sys
import os
import json
import subprocess

def get_transcript(url, use_browser_cookies=False, browser="chrome"):
    """
    Attempts to fetch specific implementation for Facebook transcript.
    """
    print(f"Processing URL: {url}")
    
    # 1. Configuration for yt-dlp
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'writesubtitles': True,
        'writeautomaticsub': True,
        'subtitleslangs': ['all'],
        'skip_download': True,  # We only want metadata/subs first
        'outtmpl': 'downloads/%(id)s.%(ext)s',
    }
    
    if use_browser_cookies:
        print(f"Using cookies from {browser}...")
        ydl_opts['cookiesfrombrowser'] = (browser, )

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Check for subtitles
            subs = info.get('subtitles', {})
            auto_subs = info.get('automatic_captions', {})
            
            has_subs = len(subs) > 0
            has_auto = len(auto_subs) > 0
            
            print("\n--- Result ---")
            print(f"Title: {info.get('title')}")
            print(f"Manual Subtitles: {list(subs.keys()) if has_subs else 'None'}")
            print(f"Auto Captions: {list(auto_subs.keys()) if has_auto else 'None'}")
            
            if has_subs or has_auto:
                # If available, we can download safely
                print("\nDownloading subtitles...")
                # Update opts to actual download subs
                ydl_opts['skip_download'] = True # Still don't need video if we just want subs?
                # Actually yt-dlp needs to 'download' to write the sub file, but skip_download=True skips the VIDEO.
                # It WILL write the subs if writesubtitles is True.
                
                with yt_dlp.YoutubeDL(ydl_opts) as ydl_down:
                    ydl_down.download([url])
                
                print("Subtitles downloaded to 'downloads/' folder.")
                return True
            else:
                print("\nNo transcripts available from Facebook directly.")
                return False

    except Exception as e:
        print(f"\nError fetching from Facebook: {e}")
        if "Unsupported URL" in str(e) and not use_browser_cookies:
             print("Tip: Try enabling browser cookies to access private/share links.")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python get_facebook_transcript.py <url> [--cookies]")
        sys.exit(1)
        
    url = sys.argv[1]
    use_cookies = "--cookies" in sys.argv
    
    success = get_transcript(url, use_browser_cookies=use_cookies)
    
    if not success:
        print("\nFallback suggestion: use Whisper (already installed) to generate transcript.")

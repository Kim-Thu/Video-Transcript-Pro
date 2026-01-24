import os
import re

def parse_vtt(file_path):
    """Parse VTT file and return clean text. Optimized for auto-generated captions."""
    if not os.path.exists(file_path):
        return None
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        text = []
        seen = set()
        
        import html

        for line in lines:
            line = line.strip()
            # Bỏ qua header, timestamp, empty lines, comments
            if not line: continue
            if line.startswith('WEBVTT'): continue
            if line.startswith('NOTE'): continue
            if '-->' in line: continue # Timestamps
            
            # Filter out metadata lines often found in YouTube/Auto-captions
            if line.startswith('Kind:') or line.startswith('Language:'): continue
            
            # Decode HTML entities (e.g., &gt; -> >)
            line = html.unescape(line)
            
            # Remove simple HTML tags often found in VTT (e.g., <c>, <i>, <b>)
            clean_line = re.sub(r'<[^>]+>', '', line)
            
            # Remove leading ">> " or "-" which denote speaker changes
            clean_line = re.sub(r'^[>\-\s]+', '', clean_line)
            
            # Deduplication: TikTok/YouTube auto-generated subs often duplicate lines for "paint-on" effect
            # We ignore exact duplicates
            if clean_line and clean_line not in seen:
                text.append(clean_line)
                seen.add(clean_line)
                
        return '\n'.join(text)
    except Exception as e:
        print(f"Error parsing VTT: {e}")
        return None

def is_english_text(text):
    """Simple heuristic to check if text is English"""
    if not text: return False
    # Top common English words
    common_words = {'the', 'and', 'to', 'of', 'a', 'in', 'is', 'you', 'that', 'it', 'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'I'}
    
    # Get first 500 chars to check
    sample = text[:1000].lower()
    words = re.findall(r'\b\w+\b', sample)
    if not words: return False
    
    match_count = sum(1 for w in words if w in common_words)
    # If > 15% of words are common English words, it's likely English
    return (match_count / len(words)) > 0.15

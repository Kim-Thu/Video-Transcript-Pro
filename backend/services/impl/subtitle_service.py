import os
import re
import html
from services.base import ISubtitleParser

class VTTSubtitleParser(ISubtitleParser):
    def parse(self, file_path: str) -> str:
        if not os.path.exists(file_path):
            return ""
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            text = []
            seen = set()
            
            for line in lines:
                line = line.strip()
                if not line: continue
                if line.startswith('WEBVTT'): continue
                if line.startswith('NOTE'): continue
                if '-->' in line: continue 
                
                # Metadata filtering
                if line.startswith('Kind:') or line.startswith('Language:'): continue
                
                # Decoding and Cleaning
                line = html.unescape(line)
                clean_line = re.sub(r'<[^>]+>', '', line)
                clean_line = re.sub(r'^[>\-\s]+', '', clean_line)
                
                if clean_line and clean_line not in seen:
                    text.append(clean_line)
                    seen.add(clean_line)
                    
            return '\n'.join(text)
        except Exception as e:
            print(f"VTT Parse Error: {e}")
            return ""

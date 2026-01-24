import os
import re
import html
from typing import List, Tuple, Optional
from services.base import ISubtitleParser
from models.domain import TranscriptSegment

class VTTSubtitleParser(ISubtitleParser):
    """VTT/WebVTT Subtitle Parser with timestamp support"""
    
    def _parse_timestamp(self, timestamp_str: str) -> float:
        """Convert VTT timestamp to seconds (e.g., '00:01:23.456' -> 83.456)"""
        try:
            # Handle both HH:MM:SS.mmm and MM:SS.mmm formats
            parts = timestamp_str.strip().split(':')
            if len(parts) == 3:
                hours, minutes, seconds = parts
            elif len(parts) == 2:
                hours = '0'
                minutes, seconds = parts
            else:
                return 0.0
            
            # Handle seconds with milliseconds
            if '.' in seconds:
                sec, ms = seconds.split('.')
            else:
                sec = seconds
                ms = '0'
            
            total_seconds = (
                int(hours) * 3600 + 
                int(minutes) * 60 + 
                int(sec) + 
                int(ms.ljust(3, '0')[:3]) / 1000
            )
            return total_seconds
        except Exception:
            return 0.0
    
    def _clean_text(self, text: str) -> str:
        """Clean subtitle text by removing HTML tags and artifacts"""
        # Decode HTML entities
        text = html.unescape(text)
        # Remove HTML tags like <c>, </c>, <b>, etc.
        text = re.sub(r'<[^>]+>', '', text)
        # Remove speaker change indicators
        text = re.sub(r'^[>\-\s]+', '', text)
        return text.strip()

    def parse_with_timestamps(self, file_path: str) -> Tuple[str, List[TranscriptSegment]]:
        """Parse VTT file and return (full text, list of timed segments)"""
        if not os.path.exists(file_path):
            return "", []
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            segments: List[TranscriptSegment] = []
            seen_texts = set()
            
            # Split into blocks (cues)
            # VTT format: timestamp line followed by text lines, separated by blank lines
            blocks = re.split(r'\n\s*\n', content)
            
            for block in blocks:
                lines = block.strip().split('\n')
                if not lines:
                    continue
                
                # Skip header and metadata
                if lines[0].startswith('WEBVTT'):
                    continue
                if lines[0].startswith('NOTE'):
                    continue
                if lines[0].startswith('Kind:') or lines[0].startswith('Language:'):
                    continue
                
                # Look for timestamp line
                timestamp_line = None
                text_lines = []
                
                for line in lines:
                    if '-->' in line:
                        timestamp_line = line
                    elif timestamp_line and line.strip():
                        # Skip cue identifiers (numeric lines before timestamp)
                        if not line.strip().isdigit():
                            text_lines.append(line)
                
                if timestamp_line and text_lines:
                    # Parse timestamps
                    match = re.match(r'([\d:.]+)\s*-->\s*([\d:.]+)', timestamp_line)
                    if match:
                        start_time = self._parse_timestamp(match.group(1))
                        end_time = self._parse_timestamp(match.group(2))
                        
                        # Join and clean text
                        raw_text = ' '.join(text_lines)
                        clean_text = self._clean_text(raw_text)
                        
                        # Avoid duplicates
                        if clean_text and clean_text not in seen_texts:
                            seen_texts.add(clean_text)
                            segments.append(TranscriptSegment(
                                start=start_time,
                                end=end_time,
                                text=clean_text
                            ))
            
            # Build full transcript text
            full_text = '\n'.join(seg.text for seg in segments)
            
            return full_text, segments
            
        except Exception as e:
            print(f"VTT Parse Error: {e}")
            return "", []

    def parse(self, file_path: str) -> Optional[str]:
        """Parse VTT file and return clean text only (backward compatible)"""
        text, _ = self.parse_with_timestamps(file_path)
        return text if text else None

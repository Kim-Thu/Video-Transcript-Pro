from flask import Blueprint, request, jsonify, send_file
import os
import uuid
from config import DOWNLOAD_DIR
from services.downloader import get_video_info, download_video_to_file
from utils.helpers import detect_platform, sanitize_filename

video_bp = Blueprint('video', __name__)

@video_bp.route('/info', methods=['POST'])
def get_video_info_endpoint():
    data = request.get_json()
    url = data.get('url')
    
    if not url:
        return jsonify({'success': False, 'error': 'URL is required'}), 400
        
    info = get_video_info(url)
    if not info:
         return jsonify({
             'success': False, 
             'error': 'Không thể lấy thông tin video. Link có thể không đúng format, bị chặn, hoặc là video riêng tư.'
         }), 400
         
    return jsonify({'success': True, 'data': info})

@video_bp.route('/download', methods=['GET', 'POST'])
def download_video_endpoint():
    # Handle both GET (browser direct) and POST
    if request.method == 'POST':
        data = request.get_json()
        url = data.get('url', '').strip()
        title = data.get('title', 'video').strip()
    else:
        url = request.args.get('url', '').strip()
        title = request.args.get('title', 'video').strip()
        
    if not url:
        return jsonify({'success': False, 'error': {'code': 'MISSING_URL', 'message': 'URL is required'}}), 400



    # Generate unique temp path
    video_id = str(uuid.uuid4())
    temp_filename = f'dl_{video_id}.mp4'
    temp_path = os.path.join(DOWNLOAD_DIR, temp_filename)
    
    # Sanitize title for final filename
    safe_title = sanitize_filename(title)
    final_filename = f"{safe_title}.mp4"
    
    try:
        downloaded_path = download_video_to_file(url, temp_path)
        
        if downloaded_path and os.path.exists(downloaded_path):

            return send_file(
                downloaded_path,
                as_attachment=True,
                download_name=final_filename,
                mimetype='video/mp4'
            )
        else:
            print("[DOWNLOAD] Failed: File not found after download")
            return jsonify({'success': False, 'error': {'code': 'DOWNLOAD_FAILED', 'message': 'File not found'}}), 500
            
    except Exception as e:
        print(f"[DOWNLOAD] Exception: {e}")
        return jsonify({'success': False, 'error': {'code': 'ERROR', 'message': str(e)}}), 500

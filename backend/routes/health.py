from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__)

@health_bp.route('/', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok', 
        'engine': 'yt_dlp_lib',
        'refactored': True
    })

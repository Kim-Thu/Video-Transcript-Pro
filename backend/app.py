from flask import Flask
from flask_cors import CORS
from config import PORT, DEBUG
from routes.video import video_bp
from routes.transcript import transcript_bp
from routes.health import health_bp
from routes.health import health_bp
import warnings

# Suppress deprecation warnings
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Register Blueprints
app.register_blueprint(video_bp, url_prefix='/api/video')
app.register_blueprint(transcript_bp, url_prefix='/api/transcript')
app.register_blueprint(health_bp, url_prefix='/api/health')

if __name__ == '__main__':
    print("Video Transcript API Server (Refactored Modular Structure)")
    print(f"API available at http://localhost:{PORT}")
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)

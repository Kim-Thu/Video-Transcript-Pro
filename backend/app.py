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
    from config import COOKIES_FROM_BROWSER, COOKIES_FILE, refresh_cookies
    import os
    print("Video Transcript API Server (Refactored Modular Structure)")
    print(f"API available at http://localhost:{PORT}")

    # Auto-refresh cookies on startup
    refresh_cookies()

    # Show cookie status
    if COOKIES_FROM_BROWSER:
        print(f"🍪 Cookies: from browser '{COOKIES_FROM_BROWSER}'")
    elif os.path.exists(COOKIES_FILE):
        import time as _t
        age_h = (_t.time() - os.path.getmtime(COOKIES_FILE)) / 3600
        print(f"🍪 Cookies: from file cookies.txt ({age_h:.1f}h old)")
    else:
        print("⚠️  No cookies configured! Age-restricted videos will fail.")

    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)

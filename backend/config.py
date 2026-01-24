import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Base directory of the backend
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Directory for downloaded files
DOWNLOAD_DIR = os.path.join(BASE_DIR, 'downloads')
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# Server Config
PORT = 5000
DEBUG = True

# AI Config
# Get this key from https://aistudio.google.com/ (It's free)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

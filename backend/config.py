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

# Cookie Config for yt-dlp (needed for age-restricted/login-required videos)
# Option 1: Set browser name: edge, firefox, brave, chromium, safari, opera
#            NOTE: "chrome" does NOT work on Windows (DPAPI encryption issue)
# Option 2: Place a cookies.txt (Netscape format) in the backend folder
# Option 3: Auto-refresh using rookiepy (pip install rookiepy) — requires Admin on Windows
# Leave COOKIES_FROM_BROWSER empty to use auto-refresh or cookies.txt file
COOKIES_FROM_BROWSER = os.environ.get("COOKIES_FROM_BROWSER", "")
COOKIES_FILE = os.path.join(BASE_DIR, "cookies.txt")
COOKIES_BROWSER_SOURCE = os.environ.get("COOKIES_BROWSER_SOURCE", "edge")  # Browser for auto-refresh
COOKIES_MAX_AGE_HOURS = int(os.environ.get("COOKIES_MAX_AGE_HOURS", "24"))  # Refresh if older than this

def refresh_cookies(force=False):
    """
    Auto-refresh cookies.txt from browser using rookiepy.
    Only refreshes if file is missing or older than COOKIES_MAX_AGE_HOURS.
    Returns True if cookies are available (fresh or existing).
    """
    import time as _time

    # Skip if COOKIES_FROM_BROWSER is set (user prefers direct browser integration)
    if COOKIES_FROM_BROWSER:
        return True

    # Check if refresh is needed
    if not force and os.path.exists(COOKIES_FILE):
        file_age_hours = (_time.time() - os.path.getmtime(COOKIES_FILE)) / 3600
        if file_age_hours < COOKIES_MAX_AGE_HOURS:
            return True  # File is fresh enough

    # Try auto-refresh with rookiepy
    try:
        import rookiepy
    except ImportError:
        if os.path.exists(COOKIES_FILE):
            print("⚠️  rookiepy not installed, using existing cookies.txt")
            return True
        print("⚠️  rookiepy not installed. Run: pip install rookiepy")
        return False

    browser = COOKIES_BROWSER_SOURCE
    domains = [".tiktok.com", ".youtube.com", ".facebook.com", ".douyin.com"]

    browser_funcs = {
        "chrome": rookiepy.chrome,
        "edge": rookiepy.edge,
        "firefox": rookiepy.firefox,
        "brave": rookiepy.brave,
    }

    func = browser_funcs.get(browser.lower())
    if not func:
        print(f"⚠️  Unknown browser '{browser}' for cookie refresh")
        return os.path.exists(COOKIES_FILE)

    try:
        all_cookies = func(domains)

        if not all_cookies:
            print(f"⚠️  No cookies found in {browser} for {domains}")
            return os.path.exists(COOKIES_FILE)

        # Write cookies.txt in Netscape format
        with open(COOKIES_FILE, "w", encoding="utf-8") as f:
            f.write("# Netscape HTTP Cookie File\n")
            f.write(f"# Auto-exported from {browser} by rookiepy at {_time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")

            count = 0
            for cookie in all_cookies:
                name = cookie.get("name", "")
                value = cookie.get("value", "")
                if not name or not value:
                    continue

                domain = cookie.get("domain", "")
                path = cookie.get("path", "/")
                expires = int(cookie.get("expires", 0))
                secure = "TRUE" if cookie.get("secure", False) else "FALSE"
                sub = "TRUE" if domain.startswith(".") else "FALSE"

                f.write(f"{domain}\t{sub}\t{path}\t{secure}\t{expires}\t{name}\t{value}\n")
                count += 1

        print(f"🍪 Auto-refreshed {count} cookies from {browser} → cookies.txt")
        return count > 0

    except Exception as e:
        err_msg = str(e).lower()
        if "admin" in err_msg or "appbound" in err_msg:
            if os.path.exists(COOKIES_FILE):
                file_age = (_time.time() - os.path.getmtime(COOKIES_FILE)) / 3600
                print(f"⚠️  Cookie refresh needs Admin rights, using existing cookies.txt ({file_age:.0f}h old)")
                return True
            else:
                print("❌ Cookie refresh needs Admin rights. Run once as Admin:")
                print(f"   python export_cookies.py {browser}")
                return False
        else:
            print(f"⚠️  Cookie refresh failed: {e}")
            return os.path.exists(COOKIES_FILE)


def get_cookie_opts():
    """Build yt-dlp cookie options dict. Prefers browser > file."""
    opts = {}
    if COOKIES_FROM_BROWSER:
        opts['cookiesfrombrowser'] = (COOKIES_FROM_BROWSER,)
    elif os.path.exists(COOKIES_FILE):
        opts['cookiefile'] = COOKIES_FILE
    return opts

# 🎬 Video Transcript Pro

A powerful web application to extract transcripts (subtitles) from **TikTok**, **Facebook**, and **YouTube** videos quickly and accurately.

![Video Transcript Pro](https://via.placeholder.com/800x400?text=Video+Transcript+Pro)

## ✨ Features

- 🚀 **Lightning Fast** - Powered by Gemini AI for transcription in seconds
- 🌐 **Multi-Platform** - Supports TikTok, Facebook, and YouTube
- 📦 **Batch Processing** - Process multiple video links at once
- 🌍 **Multilingual UI** - Vietnamese & English interface
- 🌙 **Dark/Light Mode** - Customize your viewing experience
- 📋 **Copy & Download** - Export transcripts easily
- 📜 **History** - Keep track of processed transcripts

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **TypeScript**
- **TailwindCSS**
- **Sonner** (Toast notifications)

### Backend
- **Flask** (Python)
- **yt-dlp** (Video/Subtitle download)
- **Google Gemini AI** (Transcription & Translation)
- **FFmpeg** (Audio extraction)

## 📋 System Requirements

### Option A: Traditional Setup
- **Node.js** >= 18
- **Python** >= 3.9
- **FFmpeg** (installed and added to PATH)

### Option B: Docker Setup
- **Docker** >= 20.0
- **Docker Compose** >= 2.0

## 🚀 Installation Guide

### 1. Clone the repository

```bash
git clone https://github.com/Kim-Thu/Video-Transcript-Pro.git
cd Video-Transcript-Pro
```

### 2. Setup Frontend

```bash
# Install dependencies
npm install

# Copy environment example file
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:3000`

### 3. Setup Backend

```bash
cd backend

# Create virtual environment (recommended)
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment example file
cp .env.example .env

# (Optional) Add your Gemini API Key to .env
# Or you can enter it directly in the app UI

# Start server
python app.py
```

Backend will run at: `http://localhost:5000`

### 4. 🐳 Docker Deployment (Alternative)

Run both frontend and backend with a single command using Docker:

```bash
# Build and start all services
docker-compose up -d

# Or build with fresh images
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Services will be available at:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

**Configure Gemini API Key for Docker:**
```bash
# Option 1: Set environment variable before running
GEMINI_API_KEY=your_key_here docker-compose up -d

# Option 2: Create a .env file in root directory
echo "GEMINI_API_KEY=your_key_here" > .env
docker-compose up -d
```

## ⚙️ Configuration

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (`backend/.env`)

```env
PORT=5000
DEBUG=True
GEMINI_API_KEY=your_gemini_api_key_here  # Optional
```

## 🔑 Getting a Gemini API Key (Free)

1. Visit: https://aistudio.google.com/
2. Sign in with your Google account
3. Create a new API Key
4. Copy the key and paste it into the `.env` file or enter it directly in the app UI

## 📖 Usage Guide

### Single Video Processing
1. Paste a TikTok/Facebook/YouTube video link into the input field
2. (Optional) Enter your Gemini API Key if not configured
3. Click **"Get Transcript"**
4. Wait for processing and view the result
5. Copy or Download the transcript

### Batch Processing
1. Switch to the **"Batch"** tab
2. Paste multiple links (one per line)
3. Click **"Process Batch"**
4. Monitor progress and view results

## 🏗️ Project Structure

```
Video-Transcript-Pro/
├── src/                    # Frontend source code
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── contexts/          # React contexts (Theme, Language)
│   ├── features/          # Feature-based components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── locales/           # i18n translations
│   └── types/             # TypeScript types
├── backend/               # Backend source code
│   ├── core/              # Core workflow logic
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   └── Dockerfile         # Backend Docker image
├── public/                # Static assets
├── Dockerfile             # Frontend Docker image
├── docker-compose.yml     # Docker orchestration
└── README.md              # This file
```

## 🤝 Contributing

Contributions are welcome! Feel free to submit Pull Requests or create Issues for bug reports and feature requests.

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Kim Thu** - [@Kim-Thu](https://github.com/Kim-Thu)

---

⭐ If you find this project useful, please give it a star!

# Video Transcript Pro - Backend

Backend API cho ứng dụng Video Transcript Pro.

## Yêu cầu

- Python 3.8+
- FFmpeg (để xử lý audio/video)
- yt-dlp (để download video)
- Whisper (để transcribe audio)

## Cài đặt

### 1. Cài đặt FFmpeg

**Windows:**
- Download từ https://ffmpeg.org/download.html
- Thêm vào PATH

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

### 2. Cài đặt Python dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Chạy server

```bash
python app.py
```

Server sẽ chạy tại http://localhost:5000

## API Endpoints

### Health Check
```
GET /api/health
```

### Lấy thông tin video
```
POST /api/video/info
Body: { "url": "https://..." }
```

### Lấy transcript
```
POST /api/transcript
Body: { "url": "https://..." }
```

### Download video
```
POST /api/video/download
Body: { "url": "https://..." }
```

### Xử lý hàng loạt
```
POST /api/batch/transcript
Body: { "urls": ["https://...", "https://..."] }
```

## Lưu ý

- Đảm bảo FFmpeg đã được cài đặt và có trong PATH
- Whisper model sẽ được download tự động lần đầu tiên
- Các video sẽ được lưu tạm trong thư mục temp và tự động xóa

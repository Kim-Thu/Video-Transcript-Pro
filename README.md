# 🎬 Video Transcript Pro

Ứng dụng trích xuất transcript (phụ đề) từ video **TikTok**, **Facebook**, và **YouTube** một cách nhanh chóng và chính xác.

![Video Transcript Pro](https://via.placeholder.com/800x400?text=Video+Transcript+Pro)

## ✨ Tính năng

- � **Xử lý nhanh** - Sử dụng AI Gemini để transcript trong vài giây
- 🌐 **Đa nền tảng** - Hỗ trợ TikTok, Facebook, YouTube
- � **Xử lý hàng loạt** - Nhập nhiều link cùng lúc
- 🌍 **Đa ngôn ngữ** - Giao diện Tiếng Việt & English
- 🌙 **Dark/Light Mode** - Tùy chỉnh giao diện theo ý thích
- � **Copy & Download** - Xuất transcript dễ dàng
- � **Lịch sử** - Lưu trữ các transcript đã xử lý

## 🛠️ Công nghệ sử dụng

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

## � Yêu cầu hệ thống

- **Node.js** >= 18
- **Python** >= 3.9
- **FFmpeg** (cài đặt và thêm vào PATH)

## 🚀 Hướng dẫn cài đặt

### 1. Clone repository

```bash
git clone https://github.com/Kim-Thu/Video-Transcript-Pro.git
cd Video-Transcript-Pro
```

### 2. Cài đặt Frontend

```bash
# Cài đặt dependencies
npm install

# Copy file env mẫu
cp .env.example .env.local

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

### 3. Cài đặt Backend

```bash
cd backend

# Tạo virtual environment (khuyến nghị)
python -m venv .venv

# Kích hoạt virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Copy file env mẫu
cp .env.example .env

# (Optional) Thêm Gemini API Key vào .env
# Hoặc có thể nhập trực tiếp trên giao diện

# Chạy server
python app.py
```

Backend sẽ chạy tại: `http://localhost:5000`

## ⚙️ Cấu hình

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

## 🔑 Lấy Gemini API Key (Miễn phí)

1. Truy cập: https://aistudio.google.com/
2. Đăng nhập bằng tài khoản Google
3. Tạo API Key mới
4. Copy key và dán vào file `.env` hoặc nhập trực tiếp trên giao diện ứng dụng

## � Hướng dẫn sử dụng

### Xử lý đơn lẻ
1. Dán link video TikTok/Facebook/YouTube vào ô input
2. (Optional) Nhập Gemini API Key nếu chưa cấu hình
3. Nhấn **"Lấy Transcript"**
4. Chờ xử lý và xem kết quả
5. Copy hoặc Download transcript

### Xử lý hàng loạt
1. Chuyển sang tab **"Hàng loạt"**
2. Dán nhiều link (mỗi dòng một link)
3. Nhấn **"Xử lý hàng loạt"**
4. Theo dõi tiến độ và xem kết quả

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Hãy tạo Pull Request hoặc Issue nếu bạn có ý tưởng cải thiện.

## � License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👨‍💻 Tác giả

**Kim Thu** - [@Kim-Thu](https://github.com/Kim-Thu)

---

⭐ Nếu thấy hữu ích, hãy cho repo một star nhé!

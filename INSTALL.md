# Hướng Dẫn Cài Đặt và Chạy Dự Án KPDL

## Yêu Cầu Hệ Thống

### Backend
- Python 3.9+
- pip (Python package manager)

### Frontend
- Node.js 18+
- npm 8+

### Docker (tùy chọn)
- Docker Desktop hoặc Docker Engine

---

## Cách 1: Chạy Thủ Công (Khuyên dùng)

### Bước 1: Clone dự án
```bash
git clone <repository-url>
cd KPDL
```

### Bước 2: Cài đặt Backend
```bash
cd backend
pip install -r requirements.txt
```

### Bước 3: Cài đặt Frontend
```bash
cd ../frontend
npm install
```

### Bước 4: Chạy ứng dụng

**Terminal 1 - Backend:**
```bash
cd backend
python3 app.py
```
Backend sẽ chạy tại: http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend sẽ chạy tại: http://localhost:3000

---

## Cách 2: Dùng Script Tự Động

### macOS / Linux:
```bash
chmod +x run.sh
./run.sh
```

### Windows:
```cmd
run.bat
```

---

## Cách 3: Dùng Docker

### Build và chạy:
```bash
docker-compose up --build
```

Lần đầu sẽ mất 15-30 phút để build. Các lần sau nhanh hơn nhờ cache.

### Dừng:
```bash
docker-compose down
```

---

## Truy Cập Ứng Dụng

| Dịch vụ | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

## Cấu Trúc Thư Mục

```
KPDL/
├── backend/                # API Server (FastAPI)
│   ├── app.py              # Main application
│   ├── preprocessing.py    # Data preprocessing
│   ├── kmeans_engine.py    # K-means algorithm
│   ├── conclusion_engine.py # Auto conclusions
│   └── requirements.txt    # Python dependencies
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── styles/         # CSS styles
│   └── package.json        # Node dependencies
├── data/                   # Sample data files
├── docker-compose.yml      # Docker configuration
├── run.sh                  # macOS/Linux startup script
└── run.bat                 # Windows startup script
```

---

## Hướng Dẫn Sử Dụng

1. **Tải lên file dữ liệu** (CSV hoặc Excel)
2. **Chọn sheet** (nếu file Excel có nhiều bảng)
3. **Chọn các cột** cần phân tích
4. **Chạy K-Means** (tự động hoặc chọn K thủ công)
5. **Xem kết quả** và tải báo cáo CSV

---

## Xử Lý Lỗi Thường Gặp

### Port đã bị sử dụng
```bash
# Kiểm tra và kill process trên port 8000
lsof -i :8000
kill -9 <PID>

# Hoặc port 3000
lsof -i :3000
kill -9 <PID>
```

### Lỗi npm install
```bash
# Xóa cache và cài lại
rm -rf node_modules package-lock.json
npm install
```

### Lỗi pip install
```bash
# Tạo virtual environment
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

---

## Liên Hệ

Nếu gặp vấn đề, vui lòng tạo Issue trên repository hoặc liên hệ tác giả.

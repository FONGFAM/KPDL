# KPDL - K-means Processing & Data Learning

**Hệ thống tối thiểu tập trung vào lõi công nghệ**: Upload dữ liệu → Tiền xử lý → K-means → Sinh kết luận tự động.

## 📁 Cấu trúc project

```
KPDL/
├── backend/              # FastAPI server
│   ├── app.py           # Main FastAPI app
│   ├── preprocessing.py  # Data cleaning & preprocessing
│   ├── kmeans_engine.py  # K-means logic
│   ├── conclusion_engine.py  # Auto conclusion generator
│   └── requirements.txt
├── frontend/            # React app
│   ├── src/
│   ├── public/
│   └── package.json
├── data/                # Sample data
│   └── Book1.xlsx
└── README.md
```

## 🚀 Setup & Run

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend sẽ chạy tại http://localhost:8000

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend sẽ chạy tại http://localhost:3000

## 📊 API Endpoints

- `POST /upload` - Upload file CSV/XLSX
- `POST /preprocess` - Tiền xử lý dữ liệu
- `POST /kmeans` - Chạy K-means clustering
- `GET /conclusion` - Lấy kết luận tự động

## 🔧 Tech Stack

**Backend**: FastAPI, Pandas, Scikit-learn
**Frontend**: React, Recharts, TailwindCSS

## 🛠️ Quy trình thực hiện

Bước 1: Tải & Tiền Xử Lý Dữ Liệu
└─ Upload CSV/XLSX → Làm sạch → Mã hóa dữ liệu phân loại → Chuẩn hóa

Bước 2: Tự Động Chọn K Tối Ưu (auto_select_k)
└─ Thử K từ 2 đến 8
└─ Tính Silhouette Score cho mỗi K
└─ Chọn K có điểm cao nhất

Bước 3: Huấn Luyện K-means (fit)
└─ Khởi tạo K tâm cụm ngẫu nhiên
└─ Lặp:
├─ Gán mỗi điểm vào cụm gần nhất
└─ Cập nhật tâm cụm = trung bình các điểm trong cụm
└─ Tính toán chỉ số đánh giá

Bước 4: Trực Quan Hóa & Phân Tích
└─ Sử dụng PCA giảm chiều dữ liệu xuống 2D
└─ Hiển thị điểm dữ liệu & tâm cụm
└─ Tính thống kê từng cụm


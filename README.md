# 📊 KPDL - Khai Phá Dữ Liệu với K-Means Clustering

**Hệ thống phân tích và phân cụm sinh viên** dựa trên dữ liệu khảo sát thói quen ăn uống, sử dụng thuật toán K-Means Clustering và kết nối trực tiếp với SQL Server Data Warehouse.

![Tech Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?style=flat&logo=microsoft-sql-server&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)

---

## ✨ Tính Năng Chính

- 🗄️ **Kết nối SQL Server DW** - Load dữ liệu trực tiếp từ Data Warehouse
- 🔄 **Tiền xử lý tự động** - Làm sạch, chuẩn hóa, mã hóa dữ liệu
- 📈 **K-Means Clustering** - Tự động chọn K tối ưu hoặc tùy chọn
- 📊 **Báo cáo trực quan** - Phân tích chi tiết từng nhóm sinh viên
- 💾 **Lưu kết quả về DW** - Export clustering results về SQL Server

---

## 🖥️ Demo

### Flow 4 Bước:
```
1️⃣ Kết nối DW → 2️⃣ Tiền xử lý → 3️⃣ K-Means → 4️⃣ Báo cáo Phân tích
```

### Kết Quả Mẫu (K=3):
| Nhóm | Tỷ lệ | Mô tả |
|------|-------|-------|
| 🟢 Lối sống lành mạnh | 42.4% | Ăn uống cân đối, quan tâm dinh dưỡng |
| 🟡 Vận động cao, ăn chưa điều độ | 29.6% | Tập thể dục nhiều nhưng ít rau quả |
| 🔴 Lối sống thụ động | 28.0% | Ít vận động, phụ thuộc người khác nấu |

---

## 📁 Cấu Trúc Project

```
KPDL/
├── backend/                    # FastAPI Server
│   ├── app.py                  # Main API endpoints
│   ├── preprocessing.py        # Data cleaning & preprocessing
│   ├── kmeans_engine.py        # K-Means algorithm
│   ├── conclusion_engine.py    # Auto conclusion generator
│   ├── db_connector.py         # SQL Server DW connection
│   └── requirements.txt
│
├── frontend/                   # React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── DWConnectorComponent.js   # DW connection UI
│   │   │   ├── PreprocessComponent.js    # Preprocessing UI
│   │   │   ├── KMeansComponent.js        # K-Means config UI
│   │   │   └── AnalysisComponent.js      # Report & Charts
│   │   ├── services/api.js               # API client
│   │   ├── styles/main.css               # Styling
│   │   └── App.js
│   └── package.json
│
├── INSTALLATION.md             # Hướng dẫn cài đặt chi tiết
└── README.md
```

---

## 🚀 Quick Start

### Yêu Cầu
- Python 3.9+
- Node.js 18+
- SQL Server (hoặc Azure SQL Edge via Docker)
- ODBC Driver 18 for SQL Server

### 1. Clone & Setup

```bash
git clone <repository-url>
cd KPDL
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

### 4. Truy cập
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📡 API Endpoints

### Data Source
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/dw/test-connection` | Test kết nối SQL Server |
| POST | `/dw/views` | Lấy danh sách views/tables |
| POST | `/dw/load` | Load dữ liệu từ view |
| POST | `/dw/save-clusters` | Lưu kết quả về DW |

### Processing
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/upload` | Upload file CSV/XLSX |
| POST | `/preprocess` | Tiền xử lý dữ liệu |
| POST | `/kmeans` | Chạy K-Means clustering |
| GET | `/conclusion` | Lấy kết luận tự động |
| GET | `/export` | Export kết quả |

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Recharts, CSS3 |
| **Backend** | FastAPI, Python 3.11 |
| **Data Processing** | Pandas, Scikit-learn, NumPy |
| **Database** | SQL Server / Azure SQL Edge |
| **Connection** | pyodbc, ODBC Driver 18 |

---

## 📊 Quy Trình Phân Tích

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. KẾT NỐI DW  │ ──▶ │ 2. TIỀN XỬ LÝ  │ ──▶ │   3. K-MEANS    │
│                 │     │                 │     │                 │
│ • Connect SQL   │     │ • Làm sạch      │     │ • Auto K        │
│ • Chọn View     │     │ • Chuẩn hóa     │     │ • Fit model     │
│ • Load data     │     │ • Mã hóa        │     │ • Tính metrics  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                        ┌───────────────────────────────┘
                        ▼
              ┌─────────────────┐
              │  4. PHÂN TÍCH   │
              │                 │
              │ • Báo cáo       │
              │ • Biểu đồ PCA   │
              │ • Kết luận      │
              │ • Lưu về DW     │
              └─────────────────┘
```

---

## 📝 Database Schema

### Input View: `vw_KMeans_Input`
Chứa dữ liệu khảo sát sinh viên với các trường:
- `respondentID` - ID sinh viên
- Các biến về thói quen ăn uống, dinh dưỡng, vận động

### Output Table: `Fact_Clustering_Result`
```sql
CREATE TABLE Fact_Clustering_Result (
    id INT IDENTITY(1,1) PRIMARY KEY,
    respondentID INT,
    cluster_id INT,
    created_at DATETIME DEFAULT GETDATE()
);
```

---

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

Distributed under the MIT License.

---

## 👤 Author

**KPDL Team** - Phân tích dữ liệu sinh viên với K-Means Clustering

---

*Được xây dựng với ❤️ sử dụng FastAPI, React và SQL Server*

# 🛠️ Hướng Dẫn Cài Đặt KPDL

Hướng dẫn chi tiết để cài đặt và chạy hệ thống KPDL trên máy local.

---

## 📋 Yêu Cầu Hệ Thống

| Thành phần | Phiên bản tối thiểu |
|------------|---------------------|
| Python | 3.9+ |
| Node.js | 18+ |
| npm | 9+ |
| SQL Server | 2019+ hoặc Azure SQL Edge |
| ODBC Driver | 18 for SQL Server |

---

## 🐳 Cách 1: Sử Dụng Docker (Khuyến nghị)

### Bước 1: Cài đặt Docker
Tải và cài đặt Docker Desktop từ https://www.docker.com/products/docker-desktop

### Bước 2: Chạy SQL Server với Docker
```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=Password.1" \
    -p 1433:1433 --name sqlserver \
    -d mcr.microsoft.com/azure-sql-edge
```

### Bước 3: Clone project
```bash
git clone <repository-url>
cd KPDL
```

### Bước 4: Chạy Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

### Bước 5: Chạy Frontend
```bash
cd frontend
npm install
npm start
```

---

## 💻 Cách 2: Cài Đặt Manual

### 1. Cài đặt Python

**Windows:**
```bash
# Tải Python từ https://www.python.org/downloads/
# Hoặc dùng winget:
winget install Python.Python.3.11
```

**macOS:**
```bash
brew install python@3.11
```

**Linux:**
```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip
```

### 2. Cài đặt Node.js

**Tất cả OS:**
```bash
# Dùng nvm (khuyến nghị)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**Hoặc tải trực tiếp:** https://nodejs.org/

### 3. Cài đặt ODBC Driver 18

**Windows:**
```bash
# Tải từ Microsoft
# https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server
```

**macOS:**
```bash
brew tap microsoft/mssql-release https://github.com/Microsoft/homebrew-mssql-release
brew update
HOMEBREW_ACCEPT_EULA=Y brew install msodbcsql18
```

**Linux (Ubuntu/Debian):**
```bash
curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
curl https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/prod.list | sudo tee /etc/apt/sources.list.d/mssql-release.list
sudo apt update
sudo ACCEPT_EULA=Y apt install msodbcsql18
```

### 4. Cài đặt SQL Server

**Option A: Azure SQL Edge (Docker)**
```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=Password.1" \
    -p 1433:1433 --name sqlserver \
    -d mcr.microsoft.com/azure-sql-edge
```

**Option B: SQL Server Express**
- Tải từ https://www.microsoft.com/en-us/sql-server/sql-server-downloads

---

## 🗄️ Thiết Lập Database

### 1. Kết nối SQL Server
Sử dụng Azure Data Studio hoặc SSMS để kết nối:
- Server: `localhost`
- Authentication: SQL Server Authentication
- Username: `SA`
- Password: `Password.1`

### 2. Tạo Database
```sql
CREATE DATABASE StudentEatingDW;
GO
```

### 3. Tạo View cho K-Means
```sql
USE StudentEatingDW;
GO

-- Tạo view chứa dữ liệu đầu vào cho K-Means
CREATE VIEW vw_KMeans_Input AS
SELECT 
    respondentID,
    -- Thêm các cột cần phân tích
    ...
FROM YourSourceTable;
GO
```

### 4. Tạo bảng lưu kết quả
```sql
CREATE TABLE Fact_Clustering_Result (
    id INT IDENTITY(1,1) PRIMARY KEY,
    respondentID INT NOT NULL,
    cluster_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO
```

---

## 🚀 Chạy Ứng Dụng

### Terminal 1: Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm start
```

### Truy cập
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

---

## ⚙️ Cấu Hình

### Connection String (Backend)
File: `frontend/src/components/DWConnectorComponent.js`

```javascript
const DEFAULT_CONNECTION = 'DRIVER={ODBC Driver 18 for SQL Server};SERVER=localhost;DATABASE=StudentEatingDW;UID=SA;PWD=Password.1;TrustServerCertificate=yes';
```

Thay đổi các giá trị:
- `SERVER`: Địa chỉ SQL Server
- `DATABASE`: Tên database
- `UID`: Username
- `PWD`: Password

### API URL (Frontend)
File: `frontend/src/services/api.js`

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

---

## 🔧 Troubleshooting

### Lỗi "ODBC Driver not found"
```bash
# Kiểm tra driver đã cài
odbcinst -q -d

# Nếu chưa có, cài lại ODBC Driver 18
```

### Lỗi kết nối SQL Server
```bash
# Kiểm tra SQL Server đang chạy
docker ps

# Restart container
docker restart sqlserver
```

### Lỗi "Port already in use"
```bash
# Kill process đang dùng port
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Lỗi npm install
```bash
# Clear cache và reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 📦 Dependencies

### Backend (requirements.txt)
```
fastapi>=0.100.0
uvicorn>=0.23.0
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
pyodbc>=5.0.0
openpyxl>=3.1.0
python-multipart>=0.0.6
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "axios": "^1.5.0",
    "recharts": "^2.8.0"
  }
}
```

---

## ✅ Kiểm Tra Cài Đặt

Sau khi cài đặt xong, kiểm tra:

1. **Backend API**: Mở http://localhost:8000/docs - phải thấy Swagger UI
2. **Frontend**: Mở http://localhost:3000 - phải thấy giao diện KPDL
3. **Database**: Kết nối DW từ ứng dụng và load được dữ liệu

---

## 🆘 Hỗ Trợ

Nếu gặp vấn đề, tạo issue trên GitHub hoặc liên hệ team phát triển.

---

*Cập nhật lần cuối: Tháng 1/2026*

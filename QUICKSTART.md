# 🚀 KPDL - Quick Start Guide

## Prerequisites

- Python 3.8+
- Node.js 14+ & npm
- macOS/Linux/Windows

---

## 📦 Backend Setup (Python/FastAPI)

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Backend Server

```bash
python app.py
```

Backend will start at `http://localhost:8000`

### Verify Backend API

- Open browser: `http://localhost:8000/docs`
- You'll see Swagger UI documentation for all APIs

---

## 🎨 Frontend Setup (React)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure API URL (Optional)

Edit `.env` file:

```
REACT_APP_API_URL=http://localhost:8000
```

### 3. Run Frontend Development Server

```bash
npm start
```

Frontend will start at `http://localhost:3000`

---

## 📊 How to Use

1. **Upload Data**: Select your CSV/XLSX file
2. **Select Columns**: Choose which columns to analyze
3. **Preprocess**: Clean & normalize data
4. **Run K-Means**: Let the system find optimal clusters or choose K manually
5. **View Results**: See visualizations, statistics, and auto-generated conclusions

---

## 📋 API Endpoints

| Endpoint      | Method | Purpose                                |
| ------------- | ------ | -------------------------------------- |
| `/upload`     | POST   | Upload CSV/XLSX file                   |
| `/preprocess` | POST   | Preprocess data (clean, encode, scale) |
| `/kmeans`     | POST   | Run K-means clustering                 |
| `/conclusion` | GET    | Generate auto conclusions              |
| `/reset`      | GET    | Reset all state                        |

### Example: Upload Data

```bash
curl -X POST \
  -F "file=@Book1.xlsx" \
  http://localhost:8000/upload
```

---

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
python test_backend.py
```

---

## 📁 Project Structure

```
KPDL/
├── backend/
│   ├── app.py                 # FastAPI main app
│   ├── preprocessing.py        # Data preprocessing
│   ├── kmeans_engine.py        # K-means logic
│   ├── conclusion_engine.py    # Auto-conclusion generator
│   ├── requirements.txt
│   └── test_backend.py
│
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── services/           # API service
│   │   ├── styles/             # CSS
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── .env
│
├── data/
│   └── Book1.xlsx              # Sample dataset
│
└── README.md
```

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Make sure port 8000 is free
lsof -i :8000

# Or use different port
python app.py --port 8001
```

### Frontend won't connect to backend

- Check `.env` file has correct `REACT_APP_API_URL`
- Make sure backend is running on that URL
- Check browser console for CORS errors

### Data upload fails

- Ensure file is CSV or XLSX format
- Check file has at least 2 columns
- Try with sample data: `Book1.xlsx`

---

## 🎓 What Each Step Does

### Upload

- Reads CSV/XLSX file
- Shows column info and preview
- Detects data types

### Preprocess

- Handles missing values (median for numeric, mode for categorical)
- Encodes categorical variables
- Standardizes all features (critical for K-means)

### K-Means

- Auto-selects optimal K using Silhouette Score
- Or allows manual K selection
- Fits model and calculates metrics

### Results

- **PCA Visualization**: 2D scatter plot of clusters
- **Statistics**: Mean, std dev per cluster per feature
- **Auto Conclusions**: ML-generated insights about each cluster

---

## 📊 Technical Stack

### Backend

- **Framework**: FastAPI (high performance)
- **ML**: Scikit-learn (K-means, PCA, preprocessing)
- **Data**: Pandas (data manipulation)
- **Server**: Uvicorn (ASGI server)

### Frontend

- **Framework**: React 18
- **Visualization**: Recharts (PCA scatter charts)
- **HTTP**: Axios (API calls)
- **Styling**: Pure CSS (no framework overhead)

---

## 🔒 Security Notes

- No authentication (for minimal system)
- CORS enabled for all origins (development only)
- Backend state is session-based (no persistence)
- Reset endpoint clears state after analysis

---

## 🚢 Production Deployment

### Backend

```bash
# Use production-grade ASGI server
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app
```

### Frontend

```bash
# Build optimized bundle
npm run build

# Serve with nginx or other web server
```

---

## 📝 License

MIT License - Feel free to use and modify

---

## 💡 Tips

- Start with small datasets (< 1000 rows) for quick testing
- Use numeric features for best K-means results
- Auto-K usually works well, but manual K helps understand data better
- Conclusions are rule-based, not AI-generated (for simplicity & interpretability)

Happy clustering! 🎉

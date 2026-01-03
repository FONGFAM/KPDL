from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import io
import json
import uuid
import numpy as np
import pandas as pd

from preprocessing import DataPreprocessor
from kmeans_engine import KMeansEngine
from conclusion_engine import ConclusionEngine

# ==================== CONSTANTS ====================
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB max file size

# Custom JSON encoder for numpy/pandas types
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.integer, np.floating)):
            if np.isnan(obj) or np.isinf(obj):
                return None
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif pd.isna(obj):
            return None
        return super().default(obj)

app = FastAPI(title="KPDL - K-means Processing & Data Learning")

# Enable CORS for React frontend - Restricted to localhost only
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite default port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== SESSION STORAGE ====================
# Session-based storage for multi-user support
sessions = {}

def get_session(session_id: str) -> dict:
    """Get or create a session by ID"""
    if session_id not in sessions:
        sessions[session_id] = {
            "df": None,
            "X_processed": None,
            "preprocessor": None,
            "kmeans_engine": None,
            "cluster_stats": None,
            "selected_columns": None
        }
    return sessions[session_id]

def clear_session(session_id: str):
    """Clear a specific session"""
    if session_id in sessions:
        del sessions[session_id]

# ==================== MODELS ====================
class PreprocessRequest(BaseModel):
    selected_columns: Optional[List[str]] = None

class KMeansRequest(BaseModel):
    k: Optional[int] = None
    auto_k: bool = False

# ==================== ENDPOINTS ====================

@app.get("/")
def read_root():
    return {"message": "KPDL API ready"}

@app.get("/session")
def create_session():
    """Create a new session and return session ID"""
    session_id = str(uuid.uuid4())
    get_session(session_id)  # Initialize empty session
    return {"session_id": session_id}

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """Upload CSV or XLSX file"""
    try:
        # Generate session ID if not provided
        session_id = x_session_id or str(uuid.uuid4())
        state = get_session(session_id)
        
        content = await file.read()
        filename = file.filename
        
        # Validate file size
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        # Validate file extension
        if not filename.lower().endswith(('.csv', '.xlsx', '.xls')):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only CSV and Excel files are supported."
            )
        
        preprocessor = DataPreprocessor()
        
        # Store file content for reloading with different sheet
        state["file_content"] = content
        state["filename"] = filename
        
        df, error = preprocessor.load_file(content, filename)
        
        if error:
            raise HTTPException(status_code=400, detail=error)
        
        state["df"] = df
        state["preprocessor"] = preprocessor
        
        # Get column info
        column_info = preprocessor.get_column_info(df)
        
        # Convert to JSON string with custom encoder, then parse back to dict
        result = {
            "status": "success",
            "session_id": session_id,
            "filename": filename,
            "data": column_info,
            "has_sheets": len(preprocessor.get_sheet_names()) > 1
        }
        result_json = json.loads(json.dumps(result, cls=NumpyEncoder))
        return JSONResponse(content=result_json)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/select-sheet")
def select_sheet(
    sheet_name: str,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """Select a specific sheet from uploaded Excel file"""
    try:
        session_id = x_session_id or "default"
        state = get_session(session_id)
        
        if not state.get("file_content"):
            raise HTTPException(status_code=400, detail="No file uploaded")
        
        content = state["file_content"]
        filename = state["filename"]
        
        if not filename.lower().endswith(('.xlsx', '.xls')):
            raise HTTPException(status_code=400, detail="Sheet selection only available for Excel files")
        
        preprocessor = DataPreprocessor()
        df, error = preprocessor.load_file(content, filename, sheet_name=sheet_name)
        
        if error:
            raise HTTPException(status_code=400, detail=error)
        
        state["df"] = df
        state["preprocessor"] = preprocessor
        state["X_processed"] = None  # Reset processed data
        
        column_info = preprocessor.get_column_info(df)
        
        result = {
            "status": "success",
            "sheet_name": sheet_name,
            "data": column_info
        }
        result_json = json.loads(json.dumps(result, cls=NumpyEncoder))
        return JSONResponse(content=result_json)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/preprocess")
def preprocess_data(
    request: PreprocessRequest,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """Preprocess data: clean, encode, scale"""
    try:
        session_id = x_session_id or "default"
        state = get_session(session_id)
        
        if state["df"] is None:
            raise HTTPException(status_code=400, detail="No data uploaded")
        
        preprocessor = state["preprocessor"]
        df = state["df"]
        
        # Get processed data
        df_work = preprocessor.get_processed_df(df, request.selected_columns)
        X_processed, result = preprocessor.preprocess(df, request.selected_columns)
        
        if X_processed is None:
            raise HTTPException(status_code=400, detail=result["error"])
        
        state["X_processed"] = X_processed
        state["selected_columns"] = request.selected_columns or df.columns.tolist()
        
        return {
            "status": "success",
            "processed_data": result
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/kmeans")
def run_kmeans(
    request: KMeansRequest,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """Run K-means clustering"""
    try:
        session_id = x_session_id or "default"
        state = get_session(session_id)
        
        if state["X_processed"] is None:
            raise HTTPException(status_code=400, detail="Data not preprocessed")
        
        X = state["X_processed"]
        kmeans_engine = KMeansEngine()
        
        # Auto-select K or use provided K
        if request.auto_k:
            k, scores = kmeans_engine.auto_select_k(X)
            k_info = {"method": "auto", "selected_k": k, "scores": scores}
        else:
            k = request.k or 3
            k_info = {"method": "manual", "selected_k": k}
        
        # Fit model
        fit_result = kmeans_engine.fit(X, k)
        
        # Get clustering results
        clustering_results = kmeans_engine.get_results()
        
        # Get cluster statistics
        feature_names = state["selected_columns"]
        cluster_stats = kmeans_engine.get_cluster_statistics(X, feature_names)
        
        state["kmeans_engine"] = kmeans_engine
        state["cluster_stats"] = cluster_stats
        
        return {
            "status": "success",
            "k_info": k_info,
            "fit_info": fit_result,
            "clustering": clustering_results,
            "statistics": cluster_stats
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conclusion")
def get_conclusion(
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """Generate automatic conclusions"""
    try:
        session_id = x_session_id or "default"
        state = get_session(session_id)
        
        if state["cluster_stats"] is None:
            raise HTTPException(status_code=400, detail="Clustering not performed")
        
        feature_names = state["selected_columns"]
        cluster_stats = state["cluster_stats"]
        
        # Get metrics from kmeans_engine if available
        metrics = {}
        if state.get("kmeans_engine"):
            kmeans_engine = state["kmeans_engine"]
            metrics = {
                "silhouette": kmeans_engine.silhouette or 0,
                "davies_bouldin": kmeans_engine.db_index or 0,
                "k": len(cluster_stats)
            }
        
        # Generate conclusions with metrics
        conclusion_engine = ConclusionEngine(feature_names, cluster_stats, metrics)
        conclusions = conclusion_engine.get_all_conclusions()
        
        return {
            "status": "success",
            "conclusions": conclusions
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/export")
def export_results(
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """Export clustering results as JSON for CSV conversion"""
    try:
        session_id = x_session_id or "default"
        state = get_session(session_id)
        
        if state["cluster_stats"] is None:
            raise HTTPException(status_code=400, detail="Clustering not performed")
        
        # Prepare export data
        export_data = {
            "clusters": [],
            "summary": {}
        }
        
        for cluster_id, stats in state["cluster_stats"].items():
            cluster_data = {
                "cluster_id": cluster_id,
                "size": stats["size"],
                "percentage": stats["percentage"],
                "features": stats["features"],
                "mean": stats["mean"],
                "std": stats["std"]
            }
            export_data["clusters"].append(cluster_data)
        
        if state["kmeans_engine"]:
            export_data["summary"] = {
                "silhouette_score": state["kmeans_engine"].silhouette,
                "davies_bouldin_index": state["kmeans_engine"].db_index,
                "n_clusters": len(state["cluster_stats"])
            }
        
        result_json = json.loads(json.dumps(export_data, cls=NumpyEncoder))
        return JSONResponse(content=result_json)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reset")
def reset_state(
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """Reset session state"""
    session_id = x_session_id or "default"
    clear_session(session_id)
    return {"status": "reset successful", "session_id": session_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

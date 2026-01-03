import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
import io
import json

class DataPreprocessor:
    def __init__(self):
        self.scaler = None
        self.encoders = {}
        self.numeric_columns = []
        self.original_shape = None
        self.processed_columns = []
        self.file_content = None
        self.filename = None
        self.sheet_names = []

    def load_file(self, file_content, filename, sheet_name=None):
        """Load CSV or XLSX file, optionally selecting a specific sheet"""
        try:
            self.file_content = file_content
            self.filename = filename
            
            if filename.endswith('.csv'):
                df = pd.read_csv(io.BytesIO(file_content))
                self.sheet_names = []
            else:  # .xlsx
                # Get sheet names
                xlsx = pd.ExcelFile(io.BytesIO(file_content))
                self.sheet_names = xlsx.sheet_names
                
                # Load specific sheet or first sheet
                if sheet_name and sheet_name in self.sheet_names:
                    df = pd.read_excel(io.BytesIO(file_content), sheet_name=sheet_name)
                else:
                    df = pd.read_excel(io.BytesIO(file_content), sheet_name=0)
            
            self.original_shape = df.shape
            return df, None
        except Exception as e:
            return None, str(e)

    def get_sheet_names(self):
        """Get list of sheet names for Excel files"""
        return self.sheet_names

    def get_sheets_info(self, file_content, filename):
        """Get info about all sheets in an Excel file"""
        if not filename.endswith(('.xlsx', '.xls')):
            return []
        
        try:
            xlsx = pd.ExcelFile(io.BytesIO(file_content))
            sheets_info = []
            for sheet_name in xlsx.sheet_names:
                df = xlsx.parse(sheet_name)
                sheets_info.append({
                    "name": sheet_name,
                    "rows": df.shape[0],
                    "columns": df.shape[1],
                    "column_names": df.columns.tolist()[:5]  # First 5 columns
                })
            return sheets_info
        except Exception as e:
            return []

    def get_column_info(self, df):
        """Get column names, types, and preview"""
        columns = []
        for col in df.columns:
            col_info = {
                "name": col,
                "type": str(df[col].dtype),
                "non_null_count": int(df[col].notna().sum()),
                "null_count": int(df[col].isna().sum()),
                "unique_values": int(df[col].nunique())
            }
            columns.append(col_info)
        
        # Clean preview: replace NaN with None for JSON serialization
        preview_df = df.head(5).fillna("N/A")
        preview = preview_df.to_dict('records')
        
        return {
            "shape": list(self.original_shape),
            "columns": columns,
            "preview": preview,
            "sheets": self.sheet_names
        }

    def preprocess(self, df, selected_columns=None):
        """
        Tiền xử lý dữ liệu:
        1. Chọn cột
        2. Xử lý missing values
        3. Encode categorical
        4. Scale
        """
        try:
            # Chọn cột cần dùng
            if selected_columns:
                df_work = df[selected_columns].copy()
            else:
                df_work = df.copy()

            # Xử lý missing values
            for col in df_work.columns:
                if df_work[col].dtype == 'object':
                    # Categorical: fill với mode
                    mode_val = df_work[col].mode()
                    if len(mode_val) > 0:
                        df_work[col] = df_work[col].fillna(mode_val[0])
                else:
                    # Numeric: fill với median
                    median_val = df_work[col].median()
                    df_work[col] = df_work[col].fillna(median_val)

            # Separate numeric and categorical
            numeric_cols = df_work.select_dtypes(include=['number']).columns.tolist()
            categorical_cols = df_work.select_dtypes(include=['object']).columns.tolist()

            # Encode categorical columns
            for col in categorical_cols:
                if col in df_work.columns:
                    le = LabelEncoder()
                    df_work[col] = le.fit_transform(df_work[col].astype(str))
                    self.encoders[col] = le

            # Scale all features
            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(df_work)
            
            self.numeric_columns = df_work.columns.tolist()
            self.processed_columns = self.numeric_columns

            return X_scaled, {
                "processed_shape": list(X_scaled.shape),
                "columns": self.numeric_columns,
                "status": "success"
            }

        except Exception as e:
            return None, {"error": str(e), "status": "failed"}

    def get_processed_df(self, df, selected_columns=None):
        """Get processed dataframe for visualization"""
        if selected_columns:
            df_work = df[selected_columns].copy()
        else:
            df_work = df.copy()

        # Fill missing
        for col in df_work.columns:
            if df_work[col].dtype == 'object':
                mode_val = df_work[col].mode()
                if len(mode_val) > 0:
                    df_work[col] = df_work[col].fillna(mode_val[0])
            else:
                median_val = df_work[col].median()
                df_work[col] = df_work[col].fillna(median_val)

        # Encode categorical
        for col in df_work.select_dtypes(include=['object']).columns:
            le = LabelEncoder()
            df_work[col] = le.fit_transform(df_work[col].astype(str))

        return df_work

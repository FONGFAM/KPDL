import pyodbc
import pandas as pd
from typing import Optional, List, Tuple


class SQLServerConnector:
    """Kết nối SQL Server Data Warehouse cho K-Means clustering"""
    
    def __init__(self, connection_string: str = None):
        self.connection_string = connection_string
        self.connection = None
    
    def set_connection_string(self, connection_string: str):
        """Set connection string"""
        self.connection_string = connection_string
    
    def connect(self) -> Tuple[bool, str]:
        """Kết nối tới SQL Server"""
        try:
            if not self.connection_string:
                return False, "Connection string chưa được cấu hình"
            
            self.connection = pyodbc.connect(self.connection_string)
            return True, "Kết nối thành công"
        except Exception as e:
            return False, f"Lỗi kết nối: {str(e)}"
    
    def disconnect(self):
        """Đóng kết nối"""
        if self.connection:
            self.connection.close()
            self.connection = None
    
    def test_connection(self) -> Tuple[bool, str]:
        """Test kết nối SQL Server"""
        try:
            if not self.connection_string:
                return False, "Connection string chưa được cấu hình"
            
            conn = pyodbc.connect(self.connection_string, timeout=5)
            cursor = conn.cursor()
            cursor.execute("SELECT @@VERSION")
            version = cursor.fetchone()[0]
            conn.close()
            
            version_short = version.split('\n')[0]
            return True, f"Kết nối thành công! SQL Server version: {version_short}"
        except Exception as e:
            return False, f"Lỗi kết nối: {str(e)}"
    
    def get_views(self) -> Tuple[List[str], Optional[str]]:
        """Lấy danh sách views trong database"""
        try:
            if not self.connection:
                success, msg = self.connect()
                if not success:
                    return [], msg
            
            cursor = self.connection.cursor()
            cursor.execute("""
                SELECT TABLE_SCHEMA + '.' + TABLE_NAME as view_name
                FROM INFORMATION_SCHEMA.VIEWS
                ORDER BY TABLE_SCHEMA, TABLE_NAME
            """)
            views = [row[0] for row in cursor.fetchall()]
            
            return views, None
        except Exception as e:
            return [], f"Lỗi lấy danh sách views: {str(e)}"
    
    def get_tables(self) -> Tuple[List[str], Optional[str]]:
        """Lấy danh sách tables trong database"""
        try:
            if not self.connection:
                success, msg = self.connect()
                if not success:
                    return [], msg
            
            cursor = self.connection.cursor()
            cursor.execute("""
                SELECT TABLE_SCHEMA + '.' + TABLE_NAME as table_name
                FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_TYPE = 'BASE TABLE'
                ORDER BY TABLE_SCHEMA, TABLE_NAME
            """)
            tables = [row[0] for row in cursor.fetchall()]
            
            return tables, None
        except Exception as e:
            return [], f"Lỗi lấy danh sách tables: {str(e)}"
    
    def load_view(self, view_name: str) -> Tuple[Optional[pd.DataFrame], Optional[str]]:
        """Load dữ liệu từ view vào DataFrame"""
        try:
            if not self.connection:
                success, msg = self.connect()
                if not success:
                    return None, msg
            
            # Sanitize view name để tránh SQL injection
            # View name format: schema.view_name
            if not self._validate_object_name(view_name):
                return None, "Tên view không hợp lệ"
            
            query = f"SELECT * FROM {view_name}"
            df = pd.read_sql(query, self.connection)
            
            return df, None
        except Exception as e:
            return None, f"Lỗi load view: {str(e)}"
    
    def save_clustering_result(
        self, 
        respondent_ids: List[int], 
        cluster_ids: List[int],
        table_name: str = "Fact_Clustering_Result"
    ) -> Tuple[bool, str]:
        """Lưu kết quả clustering vào SQL Server"""
        try:
            if not self.connection:
                success, msg = self.connect()
                if not success:
                    return False, msg
            
            cursor = self.connection.cursor()
            
            # Kiểm tra và tạo bảng nếu chưa tồn tại
            cursor.execute(f"""
                IF NOT EXISTS (
                    SELECT * FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_NAME = '{table_name}'
                )
                BEGIN
                    CREATE TABLE {table_name} (
                        respondentID INT PRIMARY KEY,
                        cluster_id INT NOT NULL,
                        created_at DATETIME DEFAULT GETDATE()
                    )
                END
            """)
            
            # Xóa dữ liệu cũ
            cursor.execute(f"DELETE FROM {table_name}")
            
            # Insert dữ liệu mới
            for resp_id, cluster_id in zip(respondent_ids, cluster_ids):
                cursor.execute(
                    f"INSERT INTO {table_name} (respondentID, cluster_id) VALUES (?, ?)",
                    (resp_id, cluster_id)
                )
            
            self.connection.commit()
            
            return True, f"Đã lưu {len(respondent_ids)} kết quả clustering vào {table_name}"
        except Exception as e:
            return False, f"Lỗi lưu kết quả: {str(e)}"
    
    def _validate_object_name(self, name: str) -> bool:
        """Validate tên object (table/view) để tránh SQL injection"""
        import re
        # Chấp nhận format: schema.name hoặc name
        # Chỉ cho phép chữ cái, số, underscore
        pattern = r'^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)?$'
        return bool(re.match(pattern, name))
    
    def get_view_columns(self, view_name: str) -> Tuple[List[dict], Optional[str]]:
        """Lấy thông tin các cột của view"""
        try:
            if not self.connection:
                success, msg = self.connect()
                if not success:
                    return [], msg
            
            if not self._validate_object_name(view_name):
                return [], "Tên view không hợp lệ"
            
            # Parse schema và view name
            parts = view_name.split('.')
            if len(parts) == 2:
                schema, vname = parts
            else:
                schema, vname = 'dbo', parts[0]
            
            cursor = self.connection.cursor()
            cursor.execute("""
                SELECT 
                    COLUMN_NAME,
                    DATA_TYPE,
                    IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
                ORDER BY ORDINAL_POSITION
            """, (schema, vname))
            
            columns = []
            for row in cursor.fetchall():
                columns.append({
                    "name": row[0],
                    "type": row[1],
                    "nullable": row[2] == 'YES'
                })
            
            return columns, None
        except Exception as e:
            return [], f"Lỗi lấy thông tin cột: {str(e)}"

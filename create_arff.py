#!/usr/bin/env python3
"""Create ARFF file for Weka comparison"""
import pandas as pd

# Read CSV
df = pd.read_csv('data/StudentLifestyle.csv')

# Select numeric columns only
cols = ['GPA', 'Gender', 'grade_level', 'employment', 'income', 'marital_status', 'on_off_campus', 'sports']
df_numeric = df[cols].copy()

# Fill missing values with median
for col in df_numeric.columns:
    if df_numeric[col].dtype == 'object':
        df_numeric[col] = pd.to_numeric(df_numeric[col], errors='coerce')
    df_numeric[col] = df_numeric[col].fillna(df_numeric[col].median())

# Create ARFF file
arff_content = """@RELATION StudentLifestyle

@ATTRIBUTE GPA NUMERIC
@ATTRIBUTE Gender NUMERIC
@ATTRIBUTE grade_level NUMERIC
@ATTRIBUTE employment NUMERIC
@ATTRIBUTE income NUMERIC
@ATTRIBUTE marital_status NUMERIC
@ATTRIBUTE on_off_campus NUMERIC
@ATTRIBUTE sports NUMERIC

@DATA
"""

for _, row in df_numeric.iterrows():
    values = [str(row[col]) for col in cols]
    arff_content += ",".join(values) + "\n"

# Save file
with open('data/StudentLifestyle_for_weka.arff', 'w') as f:
    f.write(arff_content)

print("Created: data/StudentLifestyle_for_weka.arff")
print(f"Rows: {len(df_numeric)}")
print(f"Columns: {cols}")
print()
print("="*50)
print("HƯỚNG DẪN SO SÁNH VỚI WEKA:")
print("="*50)
print("1. Mở Weka -> Explorer")
print("2. Open file: data/StudentLifestyle_for_weka.arff")  
print("3. Vào tab Cluster")
print("4. Chọn: weka.clusterers.SimpleKMeans")
print("5. Cấu hình:")
print("   - numClusters = 4")
print("   - seed = 42")
print("6. Click Start")
print()
print("Kết quả KPDL để so sánh:")
print("   - K = 4")
print("   - Cluster 0: 17.6%")
print("   - Cluster 1: 28.8%")
print("   - Cluster 2: 25.6%")
print("   - Cluster 3: 28.0%")

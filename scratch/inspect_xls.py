import pandas as pd

try:
    df = pd.read_excel("قاعدة بيانات الحلقات 6.xls")
    print("Columns in XLS:")
    print(df.columns.tolist())
    print("\nFirst 5 rows:")
    print(df.head().to_string())
except Exception as e:
    print(f"Error: {e}")

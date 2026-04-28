import pandas as pd
import json
import os

def process_csv(file_path):
    # Try different encodings for Arabic
    encodings = ['utf-8-sig', 'windows-1256', 'cp1256', 'utf-8']
    for enc in encodings:
        try:
            df = pd.read_csv(file_path, encoding=enc)
            print(f"Successfully read CSV with {enc}")
            return df
        except Exception as e:
            continue
    return None

def process_xls(file_path):
    try:
        df = pd.read_excel(file_path)
        print(f"Successfully read XLS")
        return df
    except Exception as e:
        print(f"Error reading XLS: {e}")
        return None

# Files
csv_file = "حلقات بن خميس 1447 - تحضير الفصل الدراسي الثاني(2) (1).csv"
xls_file = "قاعدة بيانات الحلقات 6.xls"

data = {}

df_csv = process_csv(csv_file)
if df_csv is not None:
    # Extract Students and Teachers from CSV
    # Columns: الاسم, الحلقة, المعلم
    students = []
    for _, row in df_csv.iterrows():
        students.append({
            'name': str(row.get('الاسم', '')).strip(),
            'circle': str(row.get('الحلقة', '')).strip(),
            'teacher': str(row.get('المعلم', '')).strip()
        })
    data['students_from_csv'] = students

df_xls = process_xls(xls_file)
if df_xls is not None:
    # Convert entire XLS to list of dicts for inspection
    data['xls_data'] = df_xls.to_dict(orient='records')

# Save to scratch
os.makedirs('scratch', exist_ok=True)
with open('scratch/extracted_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Data extraction complete. Saved to scratch/extracted_data.json")

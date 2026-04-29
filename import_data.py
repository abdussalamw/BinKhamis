import pandas as pd
import requests
import json
import time
from datetime import datetime

# Configuration
XLS_PATH = 'c:/Users/Abdussalam/OneDrive/BinKhamis/قاعدة بيانات الحلقات 6.xls'
API_URL = 'http://localhost:8000/api/import/excel' 

def clean_string(s):
    if not isinstance(s, str): return s
    cleaned = "".join(c for c in s if ('\u0600' <= c <= '\u06FF') or ('\u0020' <= c <= '\u007E'))
    return cleaned.strip()

def serialize_item(x):
    if isinstance(x, (datetime, pd.Timestamp)):
        return x.isoformat()
    if pd.isna(x):
        return None
    return clean_string(x)

def migrate_data():
    print(f"--- Fast Micro-Chunk Migration (Size: 10) ---")
    
    try:
        df = pd.read_excel(XLS_PATH, sheet_name=1, header=4)
        df = df[df['اسم الطالب'].notna()]
        
        records = []
        for _, row in df.iterrows():
            record = {}
            for col, val in row.items():
                record[col] = serialize_item(val)
            records.append(record)
        
        total = len(records)
        print(f"Found {total} records. Starting upload...")

        chunk_size = 10
        for i in range(0, total, chunk_size):
            chunk = records[i:i + chunk_size]
            payload = {'term_name': 'الفصل الثاني 1447', 'data': chunk}
            
            print(f"B{i//chunk_size + 1} ({i}-{min(i+chunk_size, total)})...", end=" ", flush=True)
            try:
                response = requests.post(API_URL, json=payload, timeout=60)
                if response.status_code == 200:
                    print("OK", end=" | ", flush=True)
                else:
                    print(f"FAIL: {response.text[:20]}", end=" | ", flush=True)
            except Exception as e:
                print(f"ERR: {str(e)[:10]}", end=" | ", flush=True)
            
            if (i//chunk_size + 1) % 5 == 0: print("") # New line every 5 chunks
            time.sleep(0.1)

        print("\n--- MICRO-MIGRATION COMPLETE ---")

    except Exception as e:
        print(f"FATAL ERROR: {str(e)}")

if __name__ == "__main__":
    migrate_data()

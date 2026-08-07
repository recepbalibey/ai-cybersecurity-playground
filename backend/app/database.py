import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "soc_investigations.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS investigations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            dataset_name TEXT,
            severity TEXT,
            iocs_extracted TEXT,
            mitre_mappings TEXT,
            summary TEXT,
            full_report TEXT
        )
    """)
    conn.commit()
    conn.close()

def save_investigation(dataset_name: str, severity: str, iocs: Dict[str, Any], mitre: List[Dict[str, Any]], summary: str, full_report: Dict[str, Any]) -> int:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO investigations (dataset_name, severity, iocs_extracted, mitre_mappings, summary, full_report)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        dataset_name,
        severity,
        json.dumps(iocs),
        json.dumps(mitre),
        summary,
        json.dumps(full_report)
    ))
    conn.commit()
    inv_id = cursor.lastrowid
    conn.close()
    return inv_id

def get_recent_investigations(limit: int = 10) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, timestamp, dataset_name, severity, summary
        FROM investigations
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

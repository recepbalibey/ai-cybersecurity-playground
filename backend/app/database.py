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
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS malware_analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            sample_key TEXT,
            file_name TEXT,
            risk_rating TEXT,
            mitre_mappings TEXT,
            detections TEXT,
            threat_summary TEXT,
            full_report TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS code_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            language TEXT,
            risk_level TEXT,
            security_score_before INTEGER,
            security_score_after INTEGER,
            findings_count INTEGER,
            findings TEXT,
            full_report TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS privacy_scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            scenario_id TEXT,
            classification TEXT,
            risk_level TEXT,
            risk_score INTEGER,
            findings_count INTEGER,
            findings TEXT,
            full_report TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS governance_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            project_id TEXT,
            base_score INTEGER,
            residual_score INTEGER,
            recommendation TEXT,
            controls_count INTEGER,
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


def save_malware_analysis(sample_key: str, file_name: str, risk_rating: str,
                          mitre: List[Dict[str, Any]], detections: Dict[str, Any],
                          threat_summary: str, full_report: Dict[str, Any]) -> int:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO malware_analyses (sample_key, file_name, risk_rating, mitre_mappings, detections, threat_summary, full_report)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        sample_key,
        file_name,
        risk_rating,
        json.dumps(mitre),
        json.dumps(detections),
        threat_summary,
        json.dumps(full_report),
    ))
    conn.commit()
    aid = cursor.lastrowid
    conn.close()
    return aid


def get_recent_malware_analyses(limit: int = 10) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, timestamp, sample_key, file_name, risk_rating, threat_summary
        FROM malware_analyses
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def save_code_review(language: str, risk_level: str, score_before: int,
                     score_after: int, findings: List[Dict[str, Any]],
                     full_report: Dict[str, Any]) -> int:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO code_reviews (language, risk_level, security_score_before, security_score_after, findings_count, findings, full_report)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        language,
        risk_level,
        score_before,
        score_after,
        len(findings),
        json.dumps(findings),
        json.dumps(full_report),
    ))
    conn.commit()
    rid = cursor.lastrowid
    conn.close()
    return rid


def get_recent_code_reviews(limit: int = 10) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, timestamp, language, risk_level, security_score_before, security_score_after, findings_count
        FROM code_reviews
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def save_privacy_scan(scenario_id: str, classification: str, risk_level: str,
                      risk_score: int, findings: List[Dict[str, Any]],
                      full_report: Dict[str, Any]) -> int:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO privacy_scans (scenario_id, classification, risk_level, risk_score, findings_count, findings, full_report)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        scenario_id,
        classification,
        risk_level,
        risk_score,
        len(findings),
        json.dumps(findings),
        json.dumps(full_report),
    ))
    conn.commit()
    pid = cursor.lastrowid
    conn.close()
    return pid


def get_recent_privacy_scans(limit: int = 10) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, timestamp, scenario_id, classification, risk_level, risk_score, findings_count
        FROM privacy_scans
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def save_governance_review(project_id: str, base_score: int, residual_score: int,
                           recommendation: str, controls_count: int,
                           full_report: Dict[str, Any]) -> int:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO governance_reviews (project_id, base_score, residual_score, recommendation, controls_count, full_report)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        project_id,
        base_score,
        residual_score,
        recommendation,
        controls_count,
        json.dumps(full_report),
    ))
    conn.commit()
    rid = cursor.lastrowid
    conn.close()
    return rid


def get_recent_governance_reviews(limit: int = 10) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, timestamp, project_id, base_score, residual_score, recommendation, controls_count
        FROM governance_reviews
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

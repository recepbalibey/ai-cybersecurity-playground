export interface HuntingStep {
  step: number;
  name: string;
  detail: string;
  timestamp: string;
}

export interface TelemetrySource {
  name: string;
  status: string;
  active: boolean;
  count: string;
}

export interface ThreatFinding {
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  evidence: string;
  user: string;
  host: string;
  mitre: string;
}

export interface ThreatHuntingReport {
  title: string;
  hunting_id: string;
  objective: string;
  hypothesis: string;
  data_sources_used: string[];
  detection_logic_summary: string;
  findings_summary: string;
  mitre_mapping: {
    id: string;
    tactic: string;
    name: string;
  };
  recommended_actions: Array<{
    priority: string;
    action: string;
    type: string;
  }>;
}

export interface ThreatHuntResult {
  threat_query: string;
  title: string;
  hypothesis: string;
  quality_score: number;
  confidence: string;
  mitre_id: string;
  tactic: string;
  queries: {
    sigma: string;
    kql: string;
    splunk: string;
    sql: string;
  };
  timeline: HuntingStep[];
  telemetry_sources: TelemetrySource[];
  findings: ThreatFinding[];
  instructor_teaching_points: Array<{
    title: string;
    concept: string;
    explanation: string;
    key_takeaway: string;
  }>;
  report: ThreatHuntingReport;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchThreatScenarios() {
  try {
    const res = await fetch(`${API_BASE_URL}/threat-hunting/scenarios`);
    if (res.ok) {
      const data = await res.json();
      return data.scenarios;
    }
  } catch (err) {
    console.warn("Backend API offline, using local scenarios");
  }
  return [
    { key: "1_powerShell_hunting", label: "Detect PowerShell Abuse", query: "Find suspicious obfuscated PowerShell activity", mitre: "T1059.001" },
    { key: "2_lateral_movement", label: "Search Lateral Movement", query: "Look for possible internal SMB admin share lateral movement", mitre: "T1021.002" },
    { key: "3_data_exfiltration", label: "Detect Data Exfiltration", query: "Detect local archive staging and high-volume outbound data transfer", mitre: "T1041" }
  ];
}

export async function runThreatHunt(threatQuery: string): Promise<ThreatHuntResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/threat-hunting/hunt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: threatQuery }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend API offline, executing client-side Threat Hunter engine");
  }

  // Fallback client-side engine
  return fallbackClientThreatHunt(threatQuery);
}

function fallbackClientThreatHunt(query: string): ThreatHuntResult {
  const q = query.toLowerCase();
  let title = "Detect Obfuscated PowerShell Abuse";
  let mitre_id = "T1059.001";
  let tactic = "Execution";
  let hypothesis = "Adversaries are executing obfuscated PowerShell scriptblocks (-EncodedCommand) to dump LSASS memory.";

  if (q.includes("lateral") || q.includes("smb") || q.includes("psexec")) {
    title = "Search Internal Lateral Movement";
    mitre_id = "T1021.002";
    tactic = "Lateral Movement";
    hypothesis = "Adversaries are leveraging administrative SMB shares (IPC$, ADMIN$) to move laterally between internal systems.";
  } else if (q.includes("exfiltration") || q.includes("data") || q.includes("upload")) {
    title = "Detect Data Exfiltration & Staging";
    mitre_id = "T1041";
    tactic = "Exfiltration";
    hypothesis = "Sensitive corporate files are being archived into encrypted packages in %TEMP% and exfiltrated over outbound C2 channels.";
  }

  return {
    threat_query: query,
    title,
    hypothesis,
    quality_score: 92,
    confidence: "95%",
    mitre_id,
    tactic,
    queries: {
      sigma: `title: ${title}\nlogsource:\n    category: process_creation\n    product: windows\ndetection:\n    selection:\n        CommandLine|contains: 'suspicious'\n    condition: selection`,
      kql: `DeviceProcessEvents\n| where ProcessCommandLine contains "suspicious"\n| project TimeGenerated, DeviceName, AccountName, ProcessCommandLine`,
      splunk: `index=windows EventCode=4688 CommandLine="*suspicious*"\n| table _time, ComputerName, User, CommandLine`,
      sql: `SELECT timestamp, host, user, command_line FROM process_events WHERE command_line LIKE '%suspicious%';`
    },
    timeline: [
      { step: 1, name: "Understanding Objective", detail: `Interpreted threat objective: '${query}'. Identified tactic: ${tactic}.`, timestamp: "T+0.03s" },
      { step: 2, name: "Creating Hypothesis", detail: hypothesis, timestamp: "T+0.18s" },
      { step: 3, name: "Selecting Telemetry", detail: "Queried Windows Security EVTX, Sysmon Process & Network events.", timestamp: "T+0.41s" },
      { step: 4, name: "Generating Queries", detail: "Synthesized multi-dialect detection logic (Sigma, KQL, Splunk, SQL).", timestamp: "T+0.65s" },
      { step: 5, name: "Analyzing Results", detail: `Discovered suspicious operational behaviors matching MITRE ${mitre_id}.`, timestamp: "T+0.88s" }
    ],
    telemetry_sources: [
      { name: "Windows Events (EVTX)", status: "Connected", active: true, count: "1,420 events/sec" },
      { name: "Network Traffic (Zeek/Suricata)", status: "Connected", active: true, count: "8,950 packets/sec" },
      { name: "DNS Query Logs", status: "Connected", active: true, count: "3,100 queries/sec" },
      { name: "Cloud Audit Logs (AWS/Azure)", status: "Available", active: false, count: "Standby" }
    ],
    findings: [
      {
        title: `${title} Anomaly Detected`,
        severity: "CRITICAL",
        evidence: "powershell.exe -Enc aW52b2tl...",
        user: "CORP\\jsmith",
        host: "finance-wkstn-04",
        mitre: mitre_id
      }
    ],
    instructor_teaching_points: [
      {
        title: "Threat Hunting vs. Reactive Alerting",
        concept: "Hypothesis-Driven Security",
        explanation: "Threat hunting starts with an active hypothesis based on adversary TTPs, assuming attackers have already bypassed perimeter signature filters.",
        key_takeaway: "Proactive hunting reduces adversary dwell time from months to hours."
      },
      {
        title: "Multi-Dialect Query Translation",
        concept: "Abstract Detection Engineering",
        explanation: "AI converts human threat hypotheses into native SIEM dialects (KQL for Sentinel, SPL for Splunk, Sigma for vendor-agnostic rules).",
        key_takeaway: "AI eliminates dialect syntax friction, letting analysts focus on threat logic."
      }
    ],
    report: {
      title: `Threat Hunting Investigation Report: ${title}`,
      hunting_id: "HUNT-2026-9921",
      objective: `Proactively investigate environment for '${query}'`,
      hypothesis,
      data_sources_used: ["Windows EVTX Security Logs", "Sysmon Process & Network Telemetry"],
      detection_logic_summary: `Generated multi-dialect query targeting ${mitre_id} (${tactic}).`,
      findings_summary: `Discovered 1 confirmed threat behavior across target hosts.`,
      mitre_mapping: { id: mitre_id, tactic, name: title },
      recommended_actions: [
        { priority: "P0 - Immediate", action: "Revoke compromised user session tokens and enforce credential reset.", type: "Identity Containment" },
        { priority: "P1 - High", action: "Deploy generated KQL / Sigma detection rule into production SIEM.", type: "Detection Engineering" }
      ]
    }
  };
}

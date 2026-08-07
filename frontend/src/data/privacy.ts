export type PrivacySeverity = "Critical" | "High" | "Medium" | "Low" | "Informational";

export type ClassificationLabel =
  | "Public"
  | "Internal"
  | "Confidential"
  | "Restricted"
  | "Highly Restricted";

export interface PrivacyScenario {
  id: string;
  title: string;
  category: string;
  description: string;
  classification: ClassificationLabel;
  risk_level: PrivacySeverity;
  handling: string;
  document: string;
  teaching_points: string[];
}

export const PRIVACY_SCENARIOS: PrivacyScenario[] = [
  {
    id: "customer_database",
    title: "Customer Database Export",
    category: "Customer PII",
    description: "A support analyst exports customer rows to ask a public AI assistant for help building a marketing email.",
    classification: "Confidential",
    risk_level: "High",
    handling: "Customer personal data must never be sent to a public AI service. Aggregate or synthesize before use.",
    document: `MARKETING EMAIL DRAFT HELP - SUPPORT TEAM

Hi there, please help me write a friendly email for our loyalty program. Here is a sample of our customer database:

Customer: Sarah Whitfield
Email: sarah.whitfield@northwind.example
Phone: (555) 014-2281
Address: 214 Birchwood Lane, Portland, OR 97205
Customer ID: CUST-88421
Card on file: 4111 2233 4455 6677 exp 08/27

Customer: Marcus Bell
Email: mbell@northwind.example
Phone: +1 555 019-3345
Address: 88 Harbor Point, Seattle, WA 98101
Customer ID: CUST-11309
Card on file: 5500 7788 9911 2233 exp 11/26

Customer: Elena Petrova
Email: elena.petrova@northwind.example
Phone: (555) 016-7720
Address: 7 Maple Court, Denver, CO 80202
Customer ID: CUST-77204
Card on file: 6011 5566 7788 9900 exp 03/28

I only need the email body, thanks!`,
    teaching_points: [
      "Even a small sample of real customer records is personal data.",
      "Payment card numbers are regulated data and must be protected end to end.",
      "The analyst only needed the email structure - the rows added no value.",
      "Synthetic or aggregated data would have been enough for this task.",
    ],
  },
  {
    id: "source_code_secret",
    title: "Source Code with Secrets",
    category: "Secrets & Source Code",
    description: "A developer pastes application source code that contains live secrets into a public AI assistant to debug an error.",
    classification: "Restricted",
    risk_level: "Critical",
    handling: "Secrets in source must be rotated if exposed. Source code itself is proprietary and must not leave the company.",
    document: `DEBUG HELP - CAN ANYONE SEE WHY THE CONNECTION FAILS?

# database.py - payments service
import psycopg2

DB_HOST = "db-payments-prod.internal.example"
DB_USER = "payments_app"
DB_PASSWORD = "S3cureP@ssw0rd!2026"
DB_NAME = "payments"

# mailer credentials
MAILGUN_API_KEY = "sk-live-9f2b4d7a1c6e8f0b3d5a7c9e1f2b4d6a"

# aws deployment account (do not share)
AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

# private key for tls termination
PRIVATE_KEY = """-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA1... (truncated for brevity)
-----END RSA PRIVATE KEY-----"""

TOKEN = "ghp_9Xy2zQw8R4tV6uN1mK3lP5oI7bS0dF2hJ4"

conn = psycopg2.connect(
    host=DB_HOST,
    user=DB_USER,
    password=DB_PASSWORD,
    dbname=DB_NAME,
)

# internal project this belongs to: Project AURORA`,
    teaching_points: [
      "Live API keys and database passwords should never be in a paste or a prompt.",
      "A public AI service is outside the organization's data boundary.",
      "Any secret seen by the model may be echoed back or stored by the provider.",
      "Exposed credentials must be rotated, then the leak process reviewed.",
      "Source code is proprietary and should only go to approved internal tools.",
    ],
  },
  {
    id: "employee_hr_record",
    title: "Employee HR Record",
    category: "HR Data",
    description: "An HR generalist copies a full employee record into a public AI assistant to summarize performance notes.",
    classification: "Highly Restricted",
    risk_level: "Critical",
    handling: "HR records contain salary and personal data. Never upload to a public AI service; use approved internal HR tooling.",
    document: `CAN YOU SUMMARIZE THIS PERFORMANCE REVIEW?

Employee Record
Name: Daniel Okafor
Employee ID: EMP-00912
Date of birth: 1987-04-12
Home address: 561 Cherry Grove, Austin, TX 78704
Personal email: daniel.okafor.personal@gmail.example
Personal phone: (512) 555-0187
Emergency contact: Grace Okafor, (512) 555-0142

Employment
Department: Platform Engineering
Manager: Rita Chen
Base salary: $142,000
Equity: $60,000 RSUs vesting over 4 years
Last bonus: $18,500

Performance Review Q3
Rita noted strong delivery on the migration project and one coaching area around documentation. Discussion included a possible promotion to Staff Engineer next cycle and a salary adjustment of 6%.

Disclosure
This record is confidential. Do not share outside HR or the direct manager.`,
    teaching_points: [
      "Salary and personal details are among the most sensitive employee data.",
      "Performance review content is private between the employee, manager, and HR.",
      "The summary task needed only the review text - personal and salary fields added no value.",
      "Sensitive HR data belongs to approved internal systems with access controls.",
    ],
  },
  {
    id: "security_incident",
    title: "Security Incident Investigation",
    category: "Incident Data",
    description: "An incident responder pastes an internal investigation draft into a public AI assistant to draft a summary for executives.",
    classification: "Restricted",
    risk_level: "High",
    handling: "Incident details reveal internal infrastructure and findings. Never send to a public AI service; use an approved internal tool.",
    document: `DRAFT INVESTIGATION SUMMARY - PLEASE HELP REWRITE THIS CLEARLY

Incident INC-2026-0441 - Lateral movement observed
Investigator: Dana Whitaker

Timeline
12:42 attacker used VPN account vp-nguyen on gateway AUTH-GW-02 (10.24.8.15)
12:57 moved to file server FS-CORP-01 (10.24.12.7)
13:10 credentials for service account svc-backup were found in a script
13:22 connection to staging host STG-WEB-03 (10.24.20.9)

Findings
- RDP logs showed unusual night-time logins from 10.24.8.15
- The backup service account has domain admin delegation - risk flagged
- A scheduled task persisted on FS-CORP-01
- No evidence of data exfiltration so far; network egress logs still under review

Containment
Account vp-nguyen disabled, AUTH-GW-02 isolated, password reset planned for svc-backup.

This is internal and confidential - do not distribute.`,
    teaching_points: [
      "Incident data reveals network topology, accounts, and control gaps.",
      "A public AI service is outside the company data boundary during a live incident.",
      "The draft should have been stripped of hostnames, IPs, and account names first.",
      "Sensitive security details leaking can help the adversary during containment.",
    ],
  },
  {
    id: "healthcare_record",
    title: "Healthcare Patient Record",
    category: "Health Data",
    description: "A clinical administrator copies a patient chart into a public AI assistant to ask for a plain-language summary for a patient.",
    classification: "Highly Restricted",
    risk_level: "Critical",
    handling: "Health information is regulated (HIPAA and similar). Never send patient data to a public AI service.",
    document: `HELP ME WRITE A SIMPLE SUMMARY FOR THE PATIENT

Patient Record - St. Helena Clinic

Patient: Maria Delgado
MRN (Medical Record Number): MRN-4482917
Date of birth: 1969-11-02
Insurance ID: AETNA-33011527
Primary care physician: Dr. Alan Torres

Diagnosis
Type 2 diabetes, ICD-10 code E11.9, diagnosed 2019

Medical History
- Hypertension, controlled with lisinopril 10 mg daily
- Elevated HbA1c, last reading 8.1% on 2026-03-14
- Prescribed metformin 500 mg twice daily
- Blood panel flagged low vitamin D; supplement recommended
- Knee MRI from 2025 showed mild osteoarthritis

Notes
Patient asked about diet changes. Reviewed portion control and carbohydrate counting. Follow-up in 12 weeks with labs.

Confidential - protected health information (PHI).`,
    teaching_points: [
      "Health information is among the most protected categories of personal data.",
      "Diagnosis, medications, and identifiers together can identify a specific patient.",
      "The task only needed a phrasing example - the chart itself was not required.",
      "Use approved clinical AI tools, never a public assistant, for PHI.",
    ],
  },
];

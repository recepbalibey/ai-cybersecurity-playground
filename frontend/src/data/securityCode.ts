export type RiskLevel = "Critical" | "High" | "Medium" | "Low" | "Informational";
export type CodeLanguage =
  | "python" | "javascript" | "typescript" | "java" | "csharp"
  | "c" | "cpp" | "go" | "rust" | "php";

export interface FindingMeta {
  title: string;
  description: string;
  why_dangerous: string;
  impact: string;
  fix: string;
  learning_example: string[];
}

export interface ReviewExample {
  id: string;
  title: string;
  language: string;
  severity: RiskLevel;
  owasp: string;
  cwe: string;
  description: string;
  vulnerable_code: string;
  secure_code: string;
  finding: FindingMeta;
  checklist: string[];
}

export const REVIEW_EXAMPLES: ReviewExample[] = [
  {
    id: "python_sql_injection",
    title: "SQL Injection in Python",
    language: "python",
    severity: "Critical",
    owasp: "A03:2021 - Injection",
    cwe: "CWE-89",
    description: "A Flask endpoint builds a SQL query with string interpolation.",
    vulnerable_code: `from flask import Flask, request
import sqlite3

app = Flask(__name__)

def get_user(username):
    conn = sqlite3.connect("users.db")
    cur = conn.cursor()
    # BAD: untrusted input is interpolated into SQL text
    query = f"SELECT * FROM users WHERE username = '{username}'"
    cur.execute(query)
    return cur.fetchall()

@app.route("/user")
def user():
    name = request.args.get("name", "")
    rows = get_user(name)
    return {"rows": rows}`,
    secure_code: `import sqlite3

def get_user(username):
    conn = sqlite3.connect("users.db")
    cur = conn.cursor()
    # GOOD: placeholders keep input as data, never code
    query = "SELECT * FROM users WHERE username = ?"
    cur.execute(query, (username,))
    return cur.fetchall()

@app.route("/user")
def user():
    name = request.args.get("name", "")
    rows = get_user(name)
    return {"rows": rows}`,
    finding: {
      title: "SQL Injection",
      description: "Untrusted user input is concatenated into a SQL statement.",
      why_dangerous: "The database parses user-controlled text as executable query code.",
      impact: "Unauthorized database access, data theft, deletion, or privilege escalation.",
      fix: "Bind input with placeholders (?) and pass values as arguments.",
      learning_example: [
        "Input: ' OR '1'='1 selects every row",
        "The same input as a parameter is just a harmless string",
      ],
    },
    checklist: [
      "Validate and sanitize all user input before use",
      "Use parameterized statements or prepared queries",
      "Apply least privilege to the database account",
    ],
  },
  {
    id: "python_command_injection",
    title: "Command Injection in Python",
    language: "python",
    severity: "Critical",
    owasp: "A03:2021 - Injection",
    cwe: "CWE-78",
    description: "A server hands user input directly to the OS shell.",
    vulnerable_code: `import subprocess
import os

def ping_host(host):
    # BAD: shell=True lets the shell interpret input
    cmd = f"ping -c 1 {host}"
    return subprocess.run(cmd, shell=True, capture_output=True)

def log_backup(path):
    os.system(f"tar -cf /backups/log.tgz {path}")`,
    secure_code: `import subprocess

def ping_host(host):
    if not _is_valid_host(host):
        raise ValueError("Invalid host")
    return subprocess.run(["ping", "-c", "1", host], capture_output=True)

def _is_valid_host(host: str) -> bool:
    return all(c.isalnum() or c in "-." for c in host)`,
    finding: {
      title: "OS Command Injection",
      description: "User-supplied input reaches a shell interpreter without escaping.",
      why_dangerous: "The shell runs user text like '; rm -rf /' as a command.",
      impact: "Arbitrary command execution and full host compromise.",
      fix: "Avoid the shell, pass an argument list, and allowlist the input.",
      learning_example: [
        "Input '; whoami' runs both commands",
        "Parameterized subprocess.run([]) keeps input as a single argument",
      ],
    },
    checklist: [
      "Never use shell=True with untrusted input",
      "Pass arguments as a list, not a string",
      "Validate input with an allowlist",
    ],
  },
  {
    id: "javascript_xss",
    title: "Cross-Site Scripting in JavaScript",
    language: "javascript",
    severity: "High",
    owasp: "A03:2021 - Injection",
    cwe: "CWE-79",
    description: "A web app renders user input with innerHTML.",
    vulnerable_code: `function renderComment(comment) {
  const box = document.getElementById("comments");
  // BAD: browser parses user text as HTML
  box.innerHTML += \`<div class="comment">\${comment}</div>\`;
}`,
    secure_code: `function renderComment(comment) {
  const box = document.getElementById("comments");
  const el = document.createElement("div");
  el.className = "comment";
  // GOOD: textContent never parses HTML
  el.textContent = comment;
  box.appendChild(el);
}`,
    finding: {
      title: "Cross-Site Scripting (XSS)",
      description: "Untrusted content is inserted via innerHTML and parsed as HTML.",
      why_dangerous: "The browser executes attacker markup embedded in the page.",
      impact: "Session theft, account takeover, defacement.",
      fix: "Insert with textContent or encode output for its context.",
      learning_example: [
        "Input: <img src=x onerror=alert(document.cookie)>",
        "textContent shows the string as harmless visible text",
      ],
    },
    checklist: [
      "Encode or escape output in its context",
      "Prefer textContent over innerHTML for untrusted text",
      "Apply a Content-Security-Policy",
    ],
  },
  {
    id: "node_authentication",
    title: "Broken Authentication in Node.js",
    language: "javascript",
    severity: "High",
    owasp: "A07:2021 - Identification and Authentication Failures",
    cwe: "CWE-287",
    description: "Login stores session secrets and compares passwords in plaintext.",
    vulnerable_code: `const app = require("express")();
const SESSION_SECRET = "development-secret";

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const row = db.get("SELECT * FROM users WHERE username = ?", username);
  if (row && row.password === password) {
    const token = Buffer.from(username).toString("base64"); // BAD
    res.json({ ok: true, token });
  } else {
    res.status(401).json({ ok: false });
  }
});`,
    secure_code: `const app = require("express")();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const SESSION_SECRET = process.env.SESSION_SECRET;

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const row = await db.get("SELECT * FROM users WHERE username = ?", username);
  if (row && (await bcrypt.compare(password, row.password_hash))) {
    const sessionId = crypto.randomBytes(32).toString("hex");
    res.json({ ok: true, sessionId });
  } else {
    res.status(401).json({ ok: false });
  }
});`,
    finding: {
      title: "Broken Authentication",
      description: "Passwords are compared in plaintext and session tokens are forgeable.",
      why_dangerous: "Credentials and tokens can be stolen or replayed.",
      impact: "Account takeover and impersonation.",
      fix: "Hash passwords, use crypto-random expiring tokens, add rate limiting.",
      learning_example: [
        "Plaintext comparison exposes every stored password if the DB leaks",
        "base64 of the username is not a token; anyone can forge it",
      ],
    },
    checklist: [
      "Hash passwords with bcrypt/argon2",
      "Use random expiring session tokens",
      "Rate-limit the login endpoint",
    ],
  },
  {
    id: "java_deserialization",
    title: "Insecure Deserialization in Java",
    language: "java",
    severity: "Critical",
    owasp: "A08:2021 - Software and Data Integrity Failures",
    cwe: "CWE-502",
    description: "A service deserializes untrusted bytes straight from the request body.",
    vulnerable_code: `public class ImportServlet extends HttpServlet {
  protected void doPost(HttpServletRequest req, HttpServletResponse resp)
      throws IOException {
    // BAD: deserializes attacker-supplied bytes
    try (ObjectInputStream ois = new ObjectInputStream(req.getInputStream())) {
      Object obj = ois.readObject();
      resp.getWriter().write("Imported: " + obj.getClass().getName());
    } catch (ClassNotFoundException e) {
      resp.getWriter().write("Invalid object");
    }
  }
}`,
    secure_code: `public class ImportServlet extends HttpServlet {
  protected void doPost(HttpServletRequest req, HttpServletResponse resp)
      throws IOException {
    // GOOD: parse a validated format instead of raw objects
    byte[] body = req.getInputStream().readAllBytes();
    ImportData data = JsonMapper.parse(new String(body, StandardCharsets.UTF_8));
    if (data == null || !data.isValid()) {
      resp.setStatus(400);
      return;
    }
    resp.getWriter().write("Imported: " + data.name());
  }
}`,
    finding: {
      title: "Insecure Deserialization",
      description: "readObject() on client bytes lets the attacker pick which classes run.",
      why_dangerous: "Java deserialization can trigger gadget chains that execute code.",
      impact: "Remote code execution and full application compromise.",
      fix: "Never deserialize untrusted data; use explicit JSON/XML with allowlists.",
      learning_example: [
        "A crafted stream can run code with no application logic",
        "A validated JSON mapper removes the class-instantiation surface",
      ],
    },
    checklist: [
      "Never deserialize untrusted input",
      "Use explicit validated formats",
      "Apply allowlists for accepted object types",
    ],
  },
  {
    id: "php_file_upload",
    title: "Unsafe File Upload in PHP",
    language: "php",
    severity: "High",
    owasp: "A03:2021 - Injection",
    cwe: "CWE-434",
    description: "An upload trusts the client filename and extension only.",
    vulnerable_code: `if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $uploaded = $_FILES["file"];
  $ext = pathinfo($uploaded["name"], PATHINFO_EXTENSION);
  if (in_array($ext, ["png", "jpg"])) {
    $dest = "uploads/" . $uploaded["name"];
    move_uploaded_file($uploaded["tmp_name"], $dest);
    echo "Uploaded: $dest";
  }
}`,
    secure_code: `if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $file = $_FILES["file"];
  $finfo = finfo_open(FILEINFO_MIME_TYPE);
  $mime = finfo_file($finfo, $file["tmp_name"]);
  if (in_array($mime, ["image/png", "image/jpeg"], true)
      && is_uploaded_file($file["tmp_name"])
      && $file["size"] < 2000000) {
    $name = bin2hex(random_bytes(16)) . ".bin";
    move_uploaded_file($file["tmp_name"], "/private/uploads/" . $name);
    echo "Uploaded securely";
  }
}`,
    finding: {
      title: "Unrestricted File Upload",
      description: "The upload checks only the client extension, not the content.",
      why_dangerous: "A PHP script disguised as an image can be stored in the web root.",
      impact: "Web shell upload and server compromise.",
      fix: "Verify content from bytes, generate a random name, store off the web root.",
      learning_example: [
        "The name says .png but the bytes are a PHP script",
        "Reading MIME from the bytes instead of the name blocks that",
      ],
    },
    checklist: [
      "Verify content from file bytes, not the extension",
      "Use random destination names",
      "Store uploads outside the web root",
    ],
  },
  {
    id: "cpp_buffer_overflow",
    title: "Buffer Overflow in C++",
    language: "cpp",
    severity: "Critical",
    owasp: "A03:2021 - Injection",
    cwe: "CWE-120",
    description: "An unbounded strcpy writes into a fixed-size buffer.",
    vulnerable_code: `#include <cstring>
#include <iostream>

void process(const char* data) {
    char buffer[64];
    // BAD: no length check; strcpy writes until the null byte
    strcpy(buffer, data);
    std::cout << buffer << std::endl;
}

int main(int argc, char** argv) {
    if (argc > 1) process(argv[1]);
    return 0;
}`,
    secure_code: `#include <string>
#include <iostream>

void process(const std::string& input) {
    if (input.size() > 1024) {
        std::clog << "input too long\\n";
        return;
    }
    std::cout << input << std::endl;
}

int main(int argc, char** argv) {
    if (argc > 1) process(argv[1]);
    return 0;
}`,
    finding: {
      title: "Buffer Overflow",
      description: "strcpy writes into a fixed buffer with no size check.",
      why_dangerous: "Writing past the buffer can overwrite control-flow data.",
      impact: "Memory corruption, code execution, crash as a denial of service.",
      fix: "Use std::string with its own bounds and check lengths.",
      learning_example: [
        "Overlong input overwrites memory beyond the buffer",
        "std::string manages its own bounds so this cannot happen",
      ],
    },
    checklist: [
      "Never copy into fixed buffers without a length check",
      "Prefer std::string / containers with automatic bounds",
      "Enable compiler defenses (ASLR, canaries, DEP)",
    ],
  },
  {
    id: "go_path_traversal",
    title: "Path Traversal in Go",
    language: "go",
    severity: "High",
    owasp: "A01:2021 - Broken Access Control",
    cwe: "CWE-110",
    description: "A handler reads files using a user path without sanitizing '..'.",
    vulnerable_code: `func downloadHandler(w http.ResponseWriter, r *http.Request) {
    name := r.URL.Query().Get("file")
    // BAD: path built directly from user input
    path := "files/" + name
    data, err := os.ReadFile(path)
    if err != nil {
        http.Error(w, "not found", http.StatusNotFound)
        return
    }
    w.Write(data)
}`,
    secure_code: `func downloadHandler(w http.ResponseWriter, r *http.Request) {
    name := r.URL.Query().Get("file")
    base := filepath.Clean("files")
    target := filepath.Join(base, filepath.Clean("/"+name))
    if !strings.HasPrefix(target, base+"/") {
        http.Error(w, "forbidden", http.StatusForbidden)
        return
    }
    data, err := os.ReadFile(target)
    if err != nil {
        http.Error(w, "not found", http.StatusNotFound)
        return
    }
    w.Write(data)
}`,
    finding: {
      title: "Path Traversal",
      description: "A query string name is joined into a path without '..' checks.",
      why_dangerous: "The path resolves outside the intended directory.",
      impact: "Reading arbitrary host files.",
      fix: "Clean and check the resolved path stays under the intended root.",
      learning_example: [
        "Input: ../../etc/shadow walks out of the files dir",
        "After clean + prefix check the request is refused",
      ],
    },
    checklist: [
      "Sanitize and validate file paths",
      "Verify paths stay inside a trusted root",
      "Prefer allowlists of keys over free-form names",
    ],
  },
  {
    id: "csharp_hardcoded_secret",
    title: "Hard-coded Secrets in C#",
    language: "csharp",
    severity: "High",
    owasp: "A02:2021 - Cryptographic Failures",
    cwe: "CWE-798",
    description: "API keys and a password are baked into the source.",
    vulnerable_code: `public class PaymentClient
{
    private const string ApiKey = "sk_live_3f9c2b8b";
    const string ConnectionString = "Server=prod;User=sa;Password=Spa_!;";

    public void Charge(int amount)
    {
        var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization = "Bearer " + ApiKey;
    }
}`,
    secure_code: `using Microsoft.Extensions.Configuration;

public class PaymentClient
{
    private readonly string _apiKey;

    public PaymentClient(IConfiguration config)
    {
        _apiKey = config["Payments:ApiKey"];
        if (string.IsNullOrEmpty(_apiKey)) throw new InvalidOperationException();
    }
}`,
    finding: {
      title: "Hard-coded Credentials",
      description: "API keys and passwords are embedded in source code.",
      why_dangerous: "Source often reaches shared systems, and the binary leaks the value.",
      impact: "Credential theft and unauthorized data access.",
      fix: "Load secrets from a secrets manager or environment variables.",
      learning_example: [
        "Anyone with code or binary access can read the key",
        "A secrets manager keeps the value out of the repo and lets you rotate it",
      ],
    },
    checklist: [
      "Keep secrets out of source and version control",
      "Load secrets from env vars / managers at runtime",
      "Rotate any already-committed secrets",
    ],
  },
  {
    id: "rust_safe_example",
    title: "Safer Defaults in Rust",
    language: "rust",
    severity: "Informational",
    owasp: "A04:2021 - Insecure Design",
    cwe: "CWE-20",
    description: "Rust's memory safety helps, but external input still needs validation.",
    vulnerable_code: `use std::io;

fn main() -> io::Result<()> {
    let mut name = String::new();
    io::stdin().read_line(&mut name)?;
    // Minor: no length bound or allowlist on external input
    println!("Hello {}", name.trim());
    Ok(())
}`,
    secure_code: `use std::io;

fn main() -> io::Result<()> {
    let mut name = String::new();
    io::stdin().read_line(&mut name)?;
    let name = name.trim();
    if name.is_empty() || name.chars().count() > 64 {
        eprintln!("invalid input");
        return Ok(());
    }
    println!("Hello {}", name);
    Ok(())
}`,
    finding: {
      title: "Missing Input Validation (Informational)",
      description: "In-memory input is used without length or content bounds.",
      why_dangerous: "Even memory-safe code must treat external input as untrusted.",
      impact: "Low here; unvalidated input can feed other sinks and cause logic errors.",
      fix: "Validate length and content with an allowlist at the boundary.",
      learning_example: [
        "Memory safety does not replace input validation",
        "Validate at the boundary, not deep inside the logic",
      ],
    },
    checklist: [
      "Validate all external input even in memory-safe languages",
      "Enforce length and character allowlists",
      "Use the language safe abstractions (String, Vec)",
    ],
  },
];
# AI Security Code Reviewer (Module 9)

An interactive, defensive lab that shows how AI assists secure-code review.
Learn to run an AI review, inspect each finding, understand its risk, review a
secure fix, and see why a human reviewer must always sign off.

This lab is strictly defensive and educational. It reviews simulated code only.
It does not generate exploits, payloads, or automated attack code.

## What you do in this lab

1. Load an educational example or paste your own source code.
2. Run the AI review. It flags issues with a severity, a confidence value, and
   the affected lines.
3. Open each finding to read why it is dangerous, its impact, its OWASP mapping,
   its CWE reference, the recommended fix, and learning notes.
4. Compare the vulnerable and secure versions side by side and read the list of
   improvements applied.
5. Ask the review assistant questions about the review, OWASP, CWE, or
   deploying secure code.

## Learning objectives

- Explain how an AI-assist pattern review can widen coverage beyond a sampled
  manual read of the same file.
- Read a finding and judge its severity, confidence, and affected lines.
- Map a class of flaw to the right OWASP category and CWE reference.
- Review and verify a proposed fix so it stays functional, not just different.
- Argue why automation improves breadth but a human owns the decision.

## What the AI checks

The rule-based engine scans source for common vulnerability classes:

- SQL injection
- Command injection
- Cross-site scripting (XSS)
- Broken authentication / weak password storage
- Insecure deserialization
- Unsafe file upload
- Buffer overflow
- Path traversal
- Hardcoded secrets and weak crypto usage
- Missing input validation

Supported languages and detection keywords:

- Python, JavaScript, TypeScript, Java, C#, C, C++, Go, Rust, PHP

## Standard mapping and references

Each finding is classified with a common catalog reference:

- OWASP Top 10 (for example A03 Injection, A02 Cryptographic Failures)
- Common Weakness Enumeration (for example CWE-89, CWE-79, CWE-120)

The knowledge base context adds these guided topics:

- Secure coding principles
- Input validation
- Authentication and authorization
- Cryptography and secrets management
- Error handling, logging, and secure API design
- A secure development review checklist

## Educational examples (datasets/code-review)

Each example ships the vulnerable code, a secure rewrite, a finding (title,
description, why it is dangerous, impact, fixed version, learning example),
and a review checklist:

- python_sql_injection
- python_command_injection
- javascript_xss
- node_authentication
- java_deserialization
- php_file_upload
- cpp_buffer_overflow
- go_path_traversal
- csharp_hardcoded_secret
- rust_safe_example (and effect on control, no issues)

## Run the backend

FastAPI with a SQLite history table (`code_reviews`).

    cd backend
    ./venv/bin/python -m pytest -q
    ./venv/bin/python -m uvicorn main:app --port 8000

Endpoints:

- GET  /api/code-review/examples
- GET  /api/code-review/examples/{example_id}
- POST /api/code-review/review
- POST /api/code-review/compare
- POST /api/code-review/assistant
- GET  /api/code-review/history

The review service is rule-based with a `ModelProvider` abstraction ready for
OpenAI, Ollama, or an enterprise LLM. Unknown routes return 404.

## Run the frontend

    cd frontend
    npm run typecheck
    npm test
    rm -rf .next && npm run build
    npm start

## Notes

- Database table: `code_reviews` in `backend/app/database.py`.
- Shared datasets under `datasets/code-review/` and the knowledge base under
  `knowledge/secure-coding/knowledge_base.json`.
- Data integrity is checked by the frontend suite.
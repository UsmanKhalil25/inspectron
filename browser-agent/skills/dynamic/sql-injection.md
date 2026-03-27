---
name: sql-injection
description: Test login and search forms on {url} for SQL injection via error-based detection and authentication bypass payloads.
---

# SQL Injection Testing

## Phase 1 — Discover Injection Points

Navigate to {url} and visit up to 5 pages. Record:
- All login forms (inputs: username/email + password)
- All search forms or URL parameters that query a backend (e.g., `?id=`, `?search=`, `?category=`)

## Phase 2 — Login Form: Authentication Bypass

For each login form (max 3), test in order. Stop on first confirmed bypass.

**Attempt 1:** `admin'--` / `anything`
**Attempt 2:** `' OR '1'='1` / `' OR '1'='1`
**Attempt 3:** `admin'/*` / `*/--`

After each submit, check:
- Redirected to authenticated page → **CRITICAL: Auth Bypass**
- SQL syntax error in response → **HIGH: Error Disclosure** — record the error message as evidence

## Phase 3 — Error-Based Detection on Parameters

For each URL parameter or form field that takes a free-text search (max 3):

1. Inject: `test'"`
2. If the response contains any of: `syntax error`, `unexpected`, `near`, `mysql`, `sqlite`, `postgresql`, `ora-`, `sql server`, `unterminated` → **HIGH: SQL Injection (Error-Based)**

3. Inject: `1 AND 1=1` vs `1 AND 1=2`
4. If the two responses differ in content length or structure → **HIGH: SQL Injection (Boolean-Based)**

## Efficiency Rules

- Auth bypass confirmed on one login form → skip remaining login forms
- Error disclosure confirmed on one parameter → skip identical parameter names on other pages
- Do not submit the same payload to the same endpoint twice

## Output Format

Return ONLY a JSON vulnerability report with this exact format (no other text):

```json
{
  "summary": { "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0 },
  "findings": [
    {
      "id": "VULN-001",
      "title": "SQL Injection — Error-Based in Search Parameter",
      "severity": "high",
      "category": "sql-injection",
      "url": "{url}/search?q=test'\"",
      "description": "The 'q' parameter is not sanitised before being interpolated into a SQL query. A syntax error is returned when the payload contains unbalanced quotes.",
      "evidence": "Response body contained: You have an error in your SQL syntax near '\"'",
      "remediation": "Use parameterised queries or prepared statements. Never concatenate user input into SQL strings."
    }
  ],
  "scanned_urls": ["{url}"],
  "scan_timestamp": "..."
}
```

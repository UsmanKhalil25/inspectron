---
name: static-web-security-scan
description: Passive static security scan — HTTP headers, sensitive file exposure, cookie security, CSRF detection. Does not submit forms or inject payloads.
---

# Static Web Application Security Scan

You are performing a **static** web application security scan on {url}.

## Phase 1 — Discovery

Visit up to 5 internal pages starting from the homepage. For each page visited, record:
- The full URL
- All HTML forms: their action URL, HTTP method, and input field names
- Any URL parameters present

## Phase 2 — Static Security Checks

### 1. Response Headers
Call `get_response_headers()` on the homepage.

**Flag as findings if MISSING:**
- Content-Security-Policy
- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

**Flag as findings if PRESENT:**
- Server (information disclosure)
- X-Powered-By (information disclosure)

### 2. Sensitive Endpoints
Call `check_sensitive_endpoint()` for each of these paths:
```
/.git/HEAD, /.env, /.env.local, /robots.txt, /.htaccess, /phpinfo.php, /admin, /backup.sql, /wp-config.php, /.DS_Store
```

### 3. Cookie Security
Call `evaluate()` with script "document.cookie" on each page that has a session.

Any visible cookie value means HttpOnly flag is NOT set.

### 4. Form Security
For all forms found in Phase 1:
- Call `evaluate()` to check if each form has a hidden input with a name containing "csrf", "token", or "_token"
- Call `evaluate()` to check if password inputs have autocomplete="off" or autocomplete="new-password"

## Efficiency Guidelines

**Avoid Redundant Checks:**
- Security headers only need to be checked once per domain (they're typically global)
- Cookie HttpOnly check: test only 2-3 pages max, then assume consistency
- CSRF token check: if one form lacks CSRF protection, similar forms likely do too - test only 2-3 representative forms
- Sensitive endpoints: test each unique path only once
- Password autocomplete: check 2-3 forms, then assume consistency across the site

**Skip Duplicates:**
- If multiple pages share the same form structure (same fields, same action URL), test only one
- If forms use the same framework (indicated by CSS classes like `.form-control`, `.ng-`, `.react-`), security controls are likely consistent

## Allowed Categories
- security-headers
- sensitive-files
- cookies
- csrf
- information-disclosure

## Completion

Do NOT call done until both phases are fully complete.

## Output Format

Return ONLY a JSON vulnerability report with this exact format (no other text).

**JSON safety rules — violations will break parsing:**
- Do NOT use double-quote characters (`"`) inside string field values. Use single quotes instead (e.g. `'value'` not `"value"`)
- Do NOT use backtick code spans inside field values
- Keep `evidence` and `remediation` values as plain prose — no inline code, no example payloads with quotes

```json
{
  "summary": {
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0,
    "info": 0
  },
  "findings": [
    {
      "id": "VULN-001",
      "title": "...",
      "severity": "critical|high|medium|low|info",
      "category": "...",
      "url": "...",
      "description": "...",
      "evidence": "...",
      "remediation": "..."
    }
  ],
  "scanned_urls": ["..."],
  "scan_timestamp": "..."
}
```

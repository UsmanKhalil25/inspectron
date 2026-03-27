---
name: cookie-security
description: Inspect cookies set by {url} for missing HttpOnly and Secure flags.
---

# Cookie Security Check

Navigate to {url}. Visit at most 3 pages (homepage + up to 2 internal links) to trigger session cookies.

On each page, call:
```js
evaluate("JSON.stringify(document.cookie)")
```

**Findings:**
- If `document.cookie` returns any non-empty string, one or more cookies are missing the **HttpOnly** flag (HttpOnly cookies are invisible to JavaScript). Record each visible cookie name as a finding.
- Navigate using HTTPS — if the site responds over HTTP without redirecting, flag all session cookies as also missing the **Secure** flag.

Stop after 3 pages — cookie flags are set server-wide and are consistent across pages.

**Severity:** medium for missing HttpOnly, medium for missing Secure flag on session cookies.

## Output Format

Return ONLY a JSON vulnerability report with this exact format (no other text):

```json
{
  "summary": { "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0 },
  "findings": [
    {
      "id": "VULN-001",
      "title": "Cookie Missing HttpOnly Flag",
      "severity": "medium",
      "category": "cookies",
      "url": "{url}",
      "description": "The cookie 'session' is accessible via JavaScript, indicating the HttpOnly flag is not set.",
      "evidence": "document.cookie returned: session=abc123",
      "remediation": "Set the HttpOnly attribute on all session cookies."
    }
  ],
  "scanned_urls": ["{url}"],
  "scan_timestamp": "..."
}
```

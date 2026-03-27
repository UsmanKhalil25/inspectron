---
name: security-headers
description: Check HTTP response headers on {url} for missing security controls and information disclosure headers.
---

# Security Headers Check

Navigate to {url} and call `get_response_headers()`.

**Flag as MISSING (each is a separate finding):**
| Header | Severity | Category |
|--------|----------|----------|
| Content-Security-Policy | high | security-headers |
| Strict-Transport-Security | high | security-headers |
| X-Frame-Options | medium | security-headers |
| X-Content-Type-Options | medium | security-headers |
| Referrer-Policy | low | security-headers |

**Flag as PRESENT (information disclosure):**
| Header | Severity | Category |
|--------|----------|----------|
| Server | low | information-disclosure |
| X-Powered-By | low | information-disclosure |

Headers only need to be checked once — they are typically applied globally per domain.

## Output Format

Return ONLY a JSON vulnerability report with this exact format (no other text):

```json
{
  "summary": { "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0 },
  "findings": [
    {
      "id": "VULN-001",
      "title": "Missing Content-Security-Policy Header",
      "severity": "high",
      "category": "security-headers",
      "url": "{url}",
      "description": "...",
      "evidence": "Header not present in response",
      "remediation": "..."
    }
  ],
  "scanned_urls": ["{url}"],
  "scan_timestamp": "..."
}
```

---
name: xss
description: Test URL parameters and form inputs on {url} for reflected cross-site scripting (XSS) by injecting sentinel payloads.
---

# Reflected XSS Testing

## Phase 1 — Discover Injection Points

Navigate to {url} and visit up to 5 internal pages. Record:
- All URL query parameters on each page
- All form inputs (type: text, search, email, tel, url — skip password and hidden)

## Phase 2 — URL Parameter Injection

For each unique query parameter (max 3 per page, 3 pages total):

1. Build the URL with the parameter set to:
   ```
   <script>window.__xss=1</script>
   ```
2. Navigate to that URL
3. Call:
   ```js
   evaluate(`JSON.stringify({
     executed: typeof window.__xss !== 'undefined',
     reflected: document.documentElement.innerHTML.includes('window.__xss=1')
   })`)
   ```

**Results:**
- `executed: true` → **CRITICAL XSS** — script executed in page context
- `executed: false, reflected: true` → **HIGH XSS** — payload reflected unencoded, likely exploitable
- Both false → parameter is safe, move on

## Phase 3 — Form Input Injection

For each in-scope form input (max 3 inputs per form, 3 forms total):

1. Navigate to the form page
2. Fill the input with:
   ```
   "><img src=x onerror="window.__xss=1">
   ```
3. Submit the form
4. Call:
   ```js
   evaluate(`JSON.stringify({
     executed: typeof window.__xss !== 'undefined',
     reflected: document.documentElement.innerHTML.includes('onerror=')
   })`)
   ```

**Results:** same severity mapping as Phase 2.

## Efficiency Rules

- If parameter `search` is vulnerable on one page, skip all other `search` parameters — assume site-wide vulnerability
- If one text input in a form is vulnerable, skip similar inputs in forms with the same action URL
- Do not test the same parameter name + page combination twice

## Output Format

Return ONLY a JSON vulnerability report with this exact format (no other text):

```json
{
  "summary": { "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0 },
  "findings": [
    {
      "id": "VULN-001",
      "title": "Reflected XSS in 'q' Parameter",
      "severity": "critical",
      "category": "xss",
      "url": "{url}/search?q=<script>window.__xss=1</script>",
      "description": "The 'q' parameter reflects user input into the page without encoding, allowing arbitrary script execution.",
      "evidence": "evaluate() returned {executed: true, reflected: true}",
      "remediation": "HTML-encode all user-controlled values before rendering them in the page. Apply a strict Content-Security-Policy."
    }
  ],
  "scanned_urls": ["{url}"],
  "scan_timestamp": "..."
}
```

---
name: csrf
description: Detect forms on {url} that are missing CSRF token protection.
---

# CSRF Token Check

## Phase 1 — Discover Forms

Visit up to 5 internal pages starting from {url}. For each page, record all HTML forms:
- Action URL
- HTTP method
- All input field names and types

## Phase 2 — Check Each Form

For each form that uses POST method, call:
```js
evaluate(`
  JSON.stringify({
    hasCsrf: !!document.querySelector(
      'input[name*="csrf" i], input[name*="token" i], input[name*="_token" i], input[name*="authenticity" i]'
    ),
    method: document.querySelector('form') && document.querySelector('form').method
  })
`)
```

**Flag as finding if:**
- Form uses POST and `hasCsrf` is false

**Skip if:**
- Form uses GET method (CSRF is irrelevant for GET)
- Multiple forms share identical structure — test only one representative

Also check for password inputs:
```js
evaluate(`
  JSON.stringify([...document.querySelectorAll('input[type=password]')].map(i => i.autocomplete))
`)
```
Flag if autocomplete is not `"off"` or `"new-password"`.

**Severity:** medium for missing CSRF token, low for password autocomplete.

## Output Format

Return ONLY a JSON vulnerability report with this exact format (no other text):

```json
{
  "summary": { "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0 },
  "findings": [
    {
      "id": "VULN-001",
      "title": "Form Missing CSRF Token",
      "severity": "medium",
      "category": "csrf",
      "url": "{url}/contact",
      "description": "The POST form at /contact does not include a CSRF token.",
      "evidence": "No input matching 'csrf', 'token', or '_token' found in form",
      "remediation": "Add a synchronizer token to all state-changing POST forms."
    }
  ],
  "scanned_urls": ["{url}"],
  "scan_timestamp": "..."
}
```

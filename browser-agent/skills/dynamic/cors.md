---
name: cors
description: Test {url} for CORS (Cross-Origin Resource Sharing) misconfigurations — overly permissive origin policies, credentials with wildcards, and missing security controls.
---

# CORS Misconfiguration Testing

CORS misconfigurations allow malicious websites to read sensitive data from your application through a victim's browser. Test for wildcard origins, credential leakage, and permissive preflight responses.

---

## Phase 1 — Initial Response Header Check

Call `get_response_headers()` on {url}.

Check for these CORS headers:

| Header | What to Flag |
|--------|-------------|
| `Access-Control-Allow-Origin` | If `*` → MEDIUM. If `null` → HIGH |
| `Access-Control-Allow-Credentials` | If `true` → check ACAO below |
| `Access-Control-Allow-Methods` | If includes PUT/DELETE or is `*` → flag INFO |
| `Access-Control-Allow-Headers` | If includes `Authorization` or is `*` → flag INFO |
| `Access-Control-Expose-Headers` | If exposes sensitive headers → flag INFO |
| `Access-Control-Max-Age` | If very large (>86400) → flag INFO |

**Critical combination:** `Access-Control-Allow-Origin: *` OR `Access-Control-Allow-Origin: null` together with `Access-Control-Allow-Credentials: true` → CRITICAL. Although modern browsers reject this combination, it indicates a dangerous server-side misconfiguration.

If NO CORS headers are present in the response, that is normal for same-origin requests — proceed to Phase 2.

---

## Phase 2 — Fetch-Based Header Inspection

Use `evaluate()` to make a fetch request and inspect all response headers from JavaScript:

```js
evaluate(`(async () => {
  try {
    const r = await fetch(window.location.href, {method: 'GET', credentials: 'include'});
    const headers = {};
    r.headers.forEach((v, k) => { headers[k] = v; });
    return JSON.stringify(headers);
  } catch(e) {
    return JSON.stringify({_error: e.message});
  }
})()`)
```

If the response includes CORS headers here that were not visible in Phase 1, use these values. If ACAO is `*`, also call `evaluate("document.cookie")` to check whether session cookies exist on the current page.

- If cookies exist AND `Access-Control-Allow-Origin: *` → HIGH (credentials could be sent cross-origin if combined with `Access-Control-Allow-Credentials: true` on a misconfigured endpoint)
- If cookies exist AND `Access-Control-Allow-Origin: null` → CRITICAL (null origin allows sandboxed iframe attacks with credentials)

---

## Phase 3 — Preflight (OPTIONS) Test

Use `evaluate()` to send an OPTIONS request and inspect CORS preflight response:

```js
evaluate(`(async () => {
  try {
    const r = await fetch(window.location.href, {method: 'OPTIONS'});
    const headers = {};
    r.headers.forEach((v, k) => { headers[k] = v; });
    return JSON.stringify(headers);
  } catch(e) {
    return JSON.stringify({_error: e.message});
  }
})()`)
```

Flags from preflight response:
- `Access-Control-Allow-Methods` includes dangerous methods (PUT, DELETE, PATCH) → MEDIUM
- `Access-Control-Allow-Methods: *` → HIGH (allows any method)
- `Access-Control-Allow-Headers: *` → HIGH (allows any request header)
- `Access-Control-Allow-Credentials: true` with wildcard in any ACAO → CRITICAL

---

## Phase 4 — Multi-Endpoint Consistency Check

For up to 3 additional pages discovered in the main scan's Phase 1:

1. Call `get_response_headers()` or use `evaluate()` fetch on each
2. Check if CORS headers are inconsistent across endpoints (some pages return ACAO:* while others don't)
3. Flag inconsistency as INFO — indicates CORS configuration is not applied uniformly

---

## Efficiency Rules

- CORS headers are typically applied globally — if `get_response_headers()` returns no CORS headers on the homepage and the fetch-based test also shows none, test at most 2 more pages to confirm
- If a CRITICAL finding is confirmed on one endpoint, do not retest the same combination — record it and move on
- Skip API-specific CORS testing if no API endpoints were discovered

---

## Output Format

Return ONLY a JSON vulnerability report with this exact format (no other text).

**JSON safety rules — violations will break parsing:**
- Do NOT use double-quote characters (`"`) inside string field values. Use single quotes instead
- Do NOT use backtick code spans inside field values
- Keep `evidence` and `remediation` values as plain prose

```json
{
  "summary": { "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0 },
  "findings": [
    {
      "id": "VULN-001",
      "title": "CORS: Wildcard Origin with Credentials Allowed",
      "severity": "critical",
      "category": "cors",
      "url": "{url}",
      "description": "The server returns Access-Control-Allow-Origin: * together with Access-Control-Allow-Credentials: true. This allows any website to make authenticated cross-origin requests and read responses.",
      "evidence": "Response headers included: Access-Control-Allow-Origin: *, Access-Control-Allow-Credentials: true. Session cookies are present on the page.",
      "remediation": "Do not use wildcard (*) for Access-Control-Allow-Origin when credentials are allowed. Specify an explicit allowlist of trusted origins. Never set ACAO to null."
    }
  ],
  "scanned_urls": ["{url}"],
  "scan_timestamp": "..."
}
```

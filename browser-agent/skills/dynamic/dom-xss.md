---
name: dom-xss
description: Test {url} for DOM-based cross-site scripting (XSS) by checking hash fragments, window.name propagation, and client-side source-to-sink flows — no server reflection required.
---

# DOM-based XSS Testing

DOM-based XSS occurs when client-side JavaScript reads from a DOM source (URL hash, `window.name`, `location.search`) and writes it unsafely into a sink (`innerHTML`, `document.write`, `eval`). Unlike reflected XSS, the payload may never reach the server.

---

## Phase 1 — Identify Client-Side Entry Points

Navigate to {url}. Record:

- The current `window.location.hash` (use `evaluate("window.location.hash")`)
- Whether the page has complex client-side rendering (SPA frameworks, heavy inline scripts)
- Any `<script>` tags with inline code that read from `location`, `document.URL`, `document.referrer`, or `window.name`

Use `find_elements("script[src]")` to note external script URLs for context.

---

## Phase 2 — URL Hash Fragment Injection

Test at most 3 pages.

1. Navigate to `{url}#<img src=x onerror="window.__domxss_hash=1">`
2. Wait for the page to load
3. Call:
   ```js
   evaluate(`JSON.stringify({
     executed: typeof window.__domxss_hash !== 'undefined',
     reflected: document.documentElement.innerHTML.includes('__domxss_hash=1')
   })`)
   ```

Results:
- `executed: true` → CRITICAL DOM XSS — script executed from hash fragment
- `executed: false, reflected: true` → HIGH — payload appears in DOM unencoded, likely exploitable
- Both false → hash fragment is safe

If CRITICAL found on one page, skip remaining pages — the client-side codebase likely shares the vulnerability.

---

## Phase 3 — window.name Propagation

`window.name` persists across page navigations and is a known DOM XSS vector.

1. Call `evaluate("window.name = '<img src=x onerror=\"window.__domxss_name=1\">'")`
2. Navigate to {url} (reload the same page)
3. Wait for the page to load
4. Call:
   ```js
   evaluate(`JSON.stringify({
     executed: typeof window.__domxss_name !== 'undefined',
     reflected: document.documentElement.innerHTML.includes('__domxss_name=1')
   })`)
   ```

Results:
- `executed: true` → CRITICAL — window.name payload reaches DOM unsafely
- `reflected: true` → HIGH
- Both false → safe

---

## Phase 4 — DOM Sink Analysis

Use `evaluate()` to scan inline scripts for dangerous sink usage:

```js
evaluate(`(function() {
  var results = {sinksFound: []};
  var scripts = document.querySelectorAll('script:not([src])');
  for (var s of scripts) {
    var code = s.textContent;
    if (code.includes('innerHTML') && code.includes('location')) {
      results.sinksFound.push('innerHTML + location');
    }
    if (code.includes('document.write') && code.includes('location')) {
      results.sinksFound.push('document.write + location');
    }
    if (code.includes('eval(') && (code.includes('location') || code.includes('hash'))) {
      results.sinksFound.push('eval + location/hash');
    }
  }
  return JSON.stringify(results);
})()`)
```

If sinks are found but no XSS confirmed in Phases 2-3, add an INFO finding noting potential DOM XSS surface. If sinks correlate with confirmed XSS, use them as evidence.

---

## Efficiency Rules

- Test hash fragments on at most 3 pages — if one is vulnerable, the same client-side rendering logic likely applies site-wide
- Test window.name propagation on at most 2 pages
- Skip hash testing on pages with no visible client-side interactivity (static pages)
- Do not repeat tests on pages that share the exact same URL structure

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
      "title": "DOM-based XSS via URL Hash Fragment",
      "severity": "critical",
      "category": "dom-xss",
      "url": "{url}#<img src=x onerror=...>",
      "description": "The page reads the URL hash fragment and inserts it into the DOM via innerHTML without sanitisation, allowing arbitrary script execution.",
      "evidence": "evaluate() returned {executed: true, reflected: true} after injecting hash payload",
      "remediation": "Use textContent or createTextNode instead of innerHTML when inserting user-controlled values. Sanitise via DOMPurify if HTML rendering is required. Apply a strict Content-Security-Policy that disallows inline scripts."
    }
  ],
  "scanned_urls": ["{url}"],
  "scan_timestamp": "..."
}
```

---
name: dynamic-web-security-scan
description: Active dynamic security scan — registers a test account to gain authenticated access, then tests for reflected XSS and SQL injection across authenticated pages.
---

# Dynamic Web Application Security Scan

You are performing a **DYNAMIC** web application security scan on {url}. You will actively inject payloads to detect exploitable vulnerabilities.

**Use these test credentials throughout:** username `inspectron_test`, email `inspectron@test.local`, password `InspectronTest1!`

---

## Phase 0 — Authentication (only if needed)

Navigate to {url}. Check whether the page has testable content (forms, URL parameters, search inputs, or internal links to explore). If yes, **skip Phase 0 entirely** and go straight to Phase 1.

Only proceed with authentication if the landing page is a login wall — i.e. the only meaningful content is a login form with no other testable surface.

**Test credentials:** username `inspectron_test`, email `inspectron@test.local`, password `InspectronTest1!`

### Step 1 — Try to register

Look for a registration link (paths like `/register`, `/signup`, `/join`, or a link on the login page). If found:

1. Navigate to the registration page
2. Fill all visible inputs:
   - Name / username → `inspectron_test`
   - Email → `inspectron@test.local`
   - Password → `InspectronTest1!`
   - Password confirmation → `InspectronTest1!`
   - Any checkbox (terms, agree) → check it
   - Any other required text field → `test`
3. Submit the form
4. Outcome:
   - Redirected away from registration → **session active**, skip Step 2
   - "email already registered" or "username taken" → proceed to Step 2
   - "verify your email" → note it, proceed to Step 2
   - Any other error → note it, proceed to Step 2

### Step 2 — Login

Navigate to the login page. Fill in:
- Username / email → `inspectron_test` (try `inspectron@test.local` if that fails)
- Password → `InspectronTest1!`

Submit and confirm you are redirected away from the login page.

**If both fail:** move on to Phase 1 from the public pages. Do not loop back to login or registration again.

---

## Phase 1 — Discovery

Visit up to 5 internal pages starting from the current page (post-login if authenticated). For each page, record:
- The full URL and all query parameter names
- All HTML forms: action URL, HTTP method, every input field name and type
- Any links or URLs containing redirect-like parameter names (redirect, next, return, url, goto, callback, redir, dest, destination, target, forward, location)

**Do not navigate back to the login or registration page during discovery.**

## Efficiency Guidelines

- If URL parameter "search" is vulnerable on one page, assume all "search" parameters site-wide are vulnerable — test only 2-3 unique parameter names
- If one text input is vulnerable to XSS, similar inputs in forms with the same action URL are likely vulnerable — test only 2-3 representative forms
- If one login form is vulnerable to SQL injection, skip other login forms — they share the same backend
- Skip inputs with identical names and context (e.g., all "email" fields in newsletter forms)

---

## Phase 2 — Reflected XSS Testing

Test URL parameters and form inputs for reflected XSS. Test at most 3 parameters per page and 3 pages total.

### URL Parameters

For each URL parameter:
1. Set the parameter value to: `<script>window.__xss=1</script>`
2. Navigate to that URL
3. Call `evaluate()` with:
   ```
   JSON.stringify({executed:typeof window.__xss!=='undefined',reflected:document.documentElement.innerHTML.includes('window.__xss=1')})
   ```
4. `executed: true` → **CRITICAL XSS**
5. `executed: false, reflected: true` → **HIGH XSS**

### Form Inputs

For each form input (type text, search, email, tel, url — skip password/hidden):
1. Navigate to the form page
2. Fill the input with: `"><img src=x onerror="window.__xss=1">`
3. Submit the form
4. Call `evaluate()` with:
   ```
   JSON.stringify({executed:typeof window.__xss!=='undefined',reflected:document.documentElement.innerHTML.includes('onerror=')})
   ```

---

## Phase 3 — SQL Injection Testing

Test login forms and search/query inputs for SQL injection.

### Login Form — Authentication Bypass

For each login form (max 3), try in order. Stop as soon as bypass succeeds.

1. Username: `admin'--` / Password: `anything`
2. Username: `' OR '1'='1` / Password: `' OR '1'='1`
3. Username: `test'"` / Password: `anything` — if SQL syntax error appears → **HIGH SQL Injection**
4. Username: `admin'/*` / Password: `*/--`

If login succeeds (redirect to dashboard/authenticated page) → **CRITICAL SQL Injection (Authentication Bypass)**

If bypass confirmed on one form, skip remaining login forms.

### Search / Query Parameters

For each free-text search input or `?id=` / `?search=` style parameter (max 3):
1. Inject: `test'"`  — SQL error in response → **HIGH SQL Injection (Error-Based)**
2. Inject: `1 AND 1=1` vs `1 AND 1=2` — differing responses → **HIGH SQL Injection (Boolean-Based)**

---

## Allowed Categories
- xss
- sql-injection

## Completion

Do NOT call done until all phases (0 through 3) are fully complete.

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

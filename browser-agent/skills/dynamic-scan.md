---
name: dynamic-web-security-scan
description: Active dynamic security scan — performs site reconnaissance, optionally authenticates, then tests for reflected/dom XSS, SQL injection, CORS misconfigurations, and session management weaknesses.
---

# Dynamic Web Application Security Scan

You are performing a **DYNAMIC** web application security scan on {url}. You will actively inject payloads to detect exploitable vulnerabilities.

**Use these test credentials throughout:** username `inspectron_test`, email `inspectron@test.local`, password `InspectronTest1!`

---

## Phase 0 — Site Reconnaissance & Optional Authentication

Navigate to {url}. Determine what kind of site this is and whether it has a login/registration system.

**Test credentials:** username `inspectron_test`, email `inspectron@test.local`, password `InspectronTest1!`

### Skip authentication entirely if ANY of these are true:
- The landing page has testable content (forms, search inputs, multiple internal links)
- No login or registration links exist
- Registration or login has CAPTCHA (elements with class/id containing `captcha`, `recaptcha`, `hcaptcha`, `turnstile`)
- Registration requires email verification (text contains "verify your email", "check your inbox", "confirmation link")
- Registration requires OTP or 2FA (text contains "OTP", "verification code", "two-factor", "authenticator")
- Login is SSO-only (Google, GitHub, Microsoft buttons with no password field)
- Registration requires payment or invite (text contains "credit card", "subscription", "invite", "waitlist")

### If you do authenticate:
1. Try registration first — scan the page for blockers BEFORE filling the form
2. If registration blocked by email verification/OTP/CAPTCHA → skip auth and move on
3. If "account already exists" → try login with same credentials
4. If login blocked by CAPTCHA or 2FA → skip auth and move on
5. Never loop back to authentication once skipped

**If auth succeeds:** proceed to Phase 1 with access to authenticated pages.
**If auth skipped or failed:** proceed to Phase 1 from public pages. Record the reason.

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

---

## Phase 4 — DOM-based XSS Testing

Test for client-side XSS that does not require server reflection.

### URL Hash Fragment

1. Navigate to `{url}#<img src=x onerror="window.__domxss_hash=1">`
2. Call `evaluate()` with:
   ```
   JSON.stringify({executed:typeof window.__domxss_hash!=='undefined',reflected:document.documentElement.innerHTML.includes('__domxss_hash=1')})
   ```
3. `executed: true` → **CRITICAL DOM XSS**
4. `executed: false, reflected: true` → **HIGH DOM XSS**

Test at most 2 pages. If CRITICAL on one, skip remaining.

### window.name Propagation

1. Call `evaluate("window.name = '<img src=x onerror=\"window.__domxss_name=1\">'")`
2. Navigate to {url} (reload)
3. Call `evaluate()` with:
   ```
   JSON.stringify({executed:typeof window.__domxss_name!=='undefined',reflected:document.documentElement.innerHTML.includes('__domxss_name=1')})
   ```
4. `executed: true` → **CRITICAL**, `reflected: true` → **HIGH**

Test on at most 2 pages.

### DOM Sink Analysis

Call `evaluate()` to scan inline scripts for dangerous patterns (innerHTML + location, document.write + location, eval + hash). If sinks found but no XSS confirmed above, add an INFO finding noting potential DOM XSS surface.

---

## Phase 5 — CORS Misconfiguration Testing

### Header Check

Call `get_response_headers()` on the homepage and check for CORS headers:

- `Access-Control-Allow-Origin: *` → **MEDIUM**
- `Access-Control-Allow-Origin: null` → **HIGH** (sandbox bypass)
- `Access-Control-Allow-Credentials: true` combined with wildcard/null ACAO → **CRITICAL**
- Overly permissive methods/headers (`*` or PUT/DELETE in ACAM) → **INFO**

### Fetch-Based Inspection

Use `evaluate()` to make a GET fetch to the current URL and inspect response headers. If CORS headers are returned that were not visible via `get_response_headers()`, use those values.

Also use `evaluate()` to make an OPTIONS request and check the preflight response headers.

### Cookie + CORS Cross-Check

Call `evaluate("document.cookie")`. If session cookies exist AND any ACAO is `*` or `null` → escalate severity: `*` → **HIGH**, `null` → **CRITICAL**.

Test CORS headers on at most 3 endpoints total.

---

## Phase 6 — Session Management Testing

If you authenticated successfully in Phase 0, run the full Phase 6. If not authenticated, run only the checks marked as applicable to unauthenticated state.

### Pre/Post Auth Comparison

Compare cookies from before and after login (from Phase 0). If ANY cookie value is identical before and after login → **MEDIUM** (session fixation — the server did not rotate the session identifier).

Call `evaluate("window.location.href")` after login — if the URL contains `jsessionid=`, `phpsessid=`, `sessionid=`, `sid=`, or `token=` in the query string → **HIGH** (session token in URL).

### Cookie Attribute Audit

Use `evaluate("document.cookie")`:

- Any cookie with a session-like name (`session`, `sid`, `token`, `auth`, `connect.sid`, `JSESSIONID`, `PHPSESSID`) visible in output → **HIGH** (missing HttpOnly — readable by JS)
- On HTTPS pages, any session cookies visible → **HIGH** (likely missing Secure flag)
- Long-lived cookies (`remember_me`, `persist`, `keep_logged_in`) → **MEDIUM**

### Logout Effectiveness

1. Find and click the logout link
2. Call `evaluate("document.cookie")` — session cookies should be cleared
3. Navigate to a protected page (e.g. `/dashboard`, `/profile`, `/account`, `/settings`)
4. If the page loads with authenticated content → **HIGH** (session not invalidated)
5. If the logout link is a plain GET without a CSRF token → **LOW** (logout CSRF)

### Password Autocomplete

On login/registration pages, check password fields:
```
evaluate("JSON.stringify(Array.from(document.querySelectorAll('input[type=password]')).map(el=>({name:el.name,autocomplete:el.getAttribute('autocomplete')})))")
```
Fields missing `autocomplete="off"` or `autocomplete="new-password"` → **LOW**

## Efficiency Guidelines

- If URL parameter "search" is vulnerable on one page, assume all "search" parameters site-wide are vulnerable — test only 2-3 unique parameter names
- If one text input is vulnerable to XSS, similar inputs in forms with the same action URL are likely vulnerable — test only 2-3 representative forms
- If one login form is vulnerable to SQL injection, skip other login forms — they share the same backend
- Skip inputs with identical names and context (e.g., all "email" fields in newsletter forms)
- DOM XSS hash test: if one page is vulnerable, skip other pages — same client codebase
- CORS headers: test on at most 3 endpoints; if no CORS headers anywhere, skip further CORS tests
- Session management: cookie attribute checks on at most 3 pages; logout tested once

## Allowed Categories
- xss
- sql-injection
- dom-xss
- cors
- session-management

## Completion

Do NOT call done until all phases (0 through 6) are fully complete. If you could not authenticate in Phase 0, skip Phase 6.4 (Logout Effectiveness) and Phase 6.1 pre/post comparison but still run Phase 5 and other Phase 6 checks.

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

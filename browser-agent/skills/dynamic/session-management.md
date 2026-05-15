---
name: session-management
description: Test {url} for session management weaknesses — session tokens in URLs, cookie security flags, logout effectiveness, and session fixation.
---

# Session Management Testing

Test the application's session management for common weaknesses that could allow session hijacking, fixation, or unauthorised access after logout.

If you are authenticated from a prior login phase, run all phases. If not authenticated, skip Phases 2 and 4 and flag this in the output.

---

## Phase 1 — Pre-Authentication Baseline

Navigate to {url}.

1. Call:
   ```js
   evaluate(`JSON.stringify({
     cookies: document.cookie,
     url: window.location.href,
     localStorageSize: localStorage.length,
     hasSessionStorage: !!window.sessionStorage
   })`)
   ```
2. Record the cookie string and full URL. These serve as the pre-auth baseline for Phase 2 comparison.

If any of these patterns appear in the URL, flag immediately:
- `jsessionid=`, `phpsessid=`, `sessionid=`, `sid=`, `token=` in query string → HIGH (session token in URL)
- `;jsessionid=` or similar path-param pattern → HIGH

---

## Phase 2 — Post-Authentication Comparison (skip if not authenticated)

After logging in successfully:

1. Call `evaluate("document.cookie")` and record all cookies
2. Compare with the pre-auth cookie string from Phase 1
3. If ANY cookie value is identical before and after login → MEDIUM (potential session fixation — the server did not rotate the session identifier)
4. Call `evaluate("window.location.href")` — if the URL now contains a session token (e.g. `?token=...`, `?session=...`) that was not present before → HIGH
5. Call:
   ```js
   evaluate(`JSON.stringify({
     localStorageTokens: Object.keys(localStorage).filter(k => k.toLowerCase().includes('token') || k.toLowerCase().includes('session') || k.toLowerCase().includes('auth')).length,
     sessionStorageTokens: Object.keys(sessionStorage).length
   })`)
   ```
   If tokens are stored in localStorage/sessionStorage, flag INFO — client-side token storage is vulnerable to XSS extraction.

---

## Phase 3 — Cookie Attribute Audit

On a page where session cookies exist:

1. Check for **missing HttpOnly**: if `evaluate("document.cookie")` returns any cookie that appears to be a session identifier (names like `session`, `sid`, `token`, `auth`, `connect.sid`, `JSESSIONID`, `PHPSESSID`, `laravel_session`, `_session_id`) → HIGH. The cookie is readable by JavaScript and can be stolen via XSS.

2. Check for **missing Secure flag on HTTPS**: if the page URL starts with `https://` and `evaluate("document.cookie")` returns any session-like cookie → HIGH. The cookie could be transmitted over unencrypted connections.

3. Check for **persistent/remember-me cookies**: if `evaluate("document.cookie")` reveals cookies with long lifetime indicators (names like `remember_me`, `persist`, `keep_logged_in`) → MEDIUM. These create a larger window for token theft.

Since JavaScript cannot read cookie flags (Secure, HttpOnly, SameSite, Expires are not exposed via `document.cookie`), use the presence of cookies in `document.cookie` output as evidence that HttpOnly is NOT set. For Secure flag, infer from the HTTPS context.

Add an INFO finding for each cookie attribute that cannot be verified from JavaScript (SameSite, Max-Age) noting that these should be verified manually.

---

## Phase 4 — Logout Effectiveness (skip if not authenticated)

1. Find the logout link. Use `find_elements("a")` and scan for text containing "log out", "logout", "sign out", "signout". If not found, search the page content for `logout` or `sign_out` paths.

2. Before clicking logout, note whether the logout link is a plain GET link without a CSRF token parameter. This is detectable by checking if the `<a href="...">` contains `?token=` or `?_token=` or similar CSRF protection. If logout is a plain GET → LOW (logout CSRF — an attacker can force-logout a victim by embedding the logout URL in an img tag).

3. Click the logout link.

4. Verify session invalidation:
   - Call `evaluate("document.cookie")` — session cookies should be cleared or have empty values
   - Navigate to a protected page (e.g. `/dashboard`, `/profile`, `/account`, `/settings`)
   - If the page loads with authenticated content → HIGH (session not invalidated after logout)
   - If redirected to login page → logout works correctly

5. If session cookies are NOT cleared after logout → HIGH (cookies persist after logout, enabling token reuse)

---

## Phase 5 — Additional Session Security Checks

Run these checks regardless of authentication state:

1. **Password field autocomplete**: For any login or registration page found, call:
   ```js
   evaluate(`JSON.stringify(
     Array.from(document.querySelectorAll('input[type=password]')).map(el => ({
       name: el.name,
       autocomplete: el.getAttribute('autocomplete')
     }))
   )`)
   ```
   Password fields missing `autocomplete="off"` or `autocomplete="new-password"` → LOW

2. **X-Content-Type-Options check on session-protected pages**: Call `get_response_headers()` on any page that appears to require authentication. Missing `X-Content-Type-Options: nosniff` → LOW (enables MIME-sniffing attacks against session-protected content)

---

## Efficiency Rules

- Cookie attribute checks: test at most 3 pages, then assume consistency
- Logout test: run once — if logout fails to invalidate the session, do not retest on other pages
- Session fixation: compare cookies once post-login — do not repeat across multiple pages
- If the site has no authentication (Phase 1 finds no login/signup links), skip Phases 2 and 4 entirely

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
      "title": "Session Cookie Missing HttpOnly Flag",
      "severity": "high",
      "category": "session-management",
      "url": "{url}",
      "description": "The session cookie is accessible via document.cookie, indicating the HttpOnly flag is not set. This makes it vulnerable to theft via XSS.",
      "evidence": "evaluate('document.cookie') returned: session=abc123...",
      "remediation": "Set the HttpOnly flag on all session cookies to prevent JavaScript access. Also set Secure and SameSite=Lax flags."
    }
  ],
  "scanned_urls": ["{url}"],
  "scan_timestamp": "..."
}
```

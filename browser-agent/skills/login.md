---
name: login
description: Explore {url} to understand the site structure, then attempt authentication via registration or login. Gracefully skip if email verification, OTP, CAPTCHA, SSO-only, or other blockers are present.
---

# Site Reconnaissance & Authentication

## Objective

Understand what kind of site {url} is, determine whether authentication is possible and worthwhile, then attempt to gain access.

Credentials: username `inspectron_test`, email `inspectron@example.com`, password `InspectronTest1!`

**Golden rule:** Never get stuck. If authentication is blocked by email verification, OTP, CAPTCHA, SSO-only, payment, or invite requirements, skip it immediately, record the reason, and move on. A scan of public pages is better than no scan at all.

---

## Phase 0 — Site Reconnaissance

Navigate to {url}. Spend a few steps understanding what kind of site this is:

1. Observe the page content. Is this a blog, a web app, an e-commerce site, a landing page, or a login wall?
2. Use `find_elements("a")` to scan navigation links. Look for:
   - Login: paths like `/login`, `/signin`, `/auth`, `/account`, `/log-in`
   - Register: paths like `/register`, `/signup`, `/join`, `/create-account`, `/get-started`
   - Protected pages: paths like `/dashboard`, `/profile`, `/settings`, `/admin`
3. Visit 2-3 internal pages to gauge how much content is publicly accessible
4. If the homepage alone has forms, search inputs, multiple internal links, or content worth testing → record that public access is sufficient

---

## Phase 1 — Authentication Decision

Based on Phase 0, make a clear decision:

### Skip authentication if ANY of these are true:

| Blocker | How to detect |
|---------|--------------|
| No login/register links exist | `find_elements("a")` returns no matching links |
| Site has testable public content | Homepage has forms, search, navigation, or meaningful inputs |
| SSO-only login | Login page shows Google/GitHub/Microsoft/Apple buttons with no password field |
| CAPTCHA on registration or login | Page contains elements with `class`/`id` containing `captcha`, `recaptcha`, `hcaptcha`, `turnstile` |
| Email verification required | Text contains "verify your email", "check your inbox", "confirmation link", "activate your account" |
| OTP / 2FA required | Text contains "OTP", "one-time", "verification code", "enter code", "authenticator", "two-factor", "2FA" |
| Payment / subscription required | Text contains "subscription", "free trial", "billing", "credit card", "choose a plan" |
| Invite-only | Text contains "invite", "waitlist", "request access", "apply for access" |
| Registration disabled | Text contains "registration is closed", "signups are disabled", or no register link + no password field on login |

### Proceed with authentication only if:
- The landing page is a login wall (login form is the **only** meaningful content — no other pages, forms, or inputs are accessible)
- The site has login/register links AND authenticating would reveal a significant additional testable surface (dashboards, admin panels, user profiles)

If you decide to **skip authentication**, jump directly to Phase 5 (Output). Record the specific blocker and reason.

---

## Phase 2 — Register a Test Account

Navigate to the registration page. Before filling anything, run these blocker checks:

### Blocker detection (do this FIRST — before typing anything)

1. Scan page text with `search_page("verify your email")`, `search_page("check your inbox")`, `search_page("confirmation link")` — if any match → **email verification required, skip auth**

2. Scan page text with `search_page("OTP")`, `search_page("verification code")`, `search_page("two-factor")`, `search_page("authenticator")` — if any match → **OTP/2FA required, skip auth**

3. Use `evaluate("!!document.querySelector('[class*=captcha], [class*=recaptcha], [class*=hcaptcha], [class*=turnstile], [id*=captcha], [id*=recaptcha]')")` — if true → **CAPTCHA present, skip auth**

4. Scan page text with `search_page("credit card")`, `search_page("subscription")`, `search_page("billing")`, `search_page("free trial")` — if any match → **payment required, skip auth**

5. Scan page text with `search_page("invite")`, `search_page("waitlist")`, `search_page("request access")` — if any match → **invite-only, skip auth**

6. Use `evaluate("Array.from(document.querySelectorAll('input[type=email]')).length")` — if there is no email field, the form may not be a standard registration form → proceed with caution

**If any blocker is found:** record it and jump to Phase 5 (Output). Do NOT attempt to fill or submit the form.

### Fill and submit (only if no blockers found)

1. Use `find_elements("input, select, textarea")` to identify all fields
2. Fill in the form:
   - Name / username fields → `inspectron_test`
   - Email fields → `inspectron@example.com`
   - Password fields → `InspectronTest1!`
   - Password confirmation fields → `InspectronTest1!`
   - Any checkbox (terms, agree, privacy, newsletter) → check it
   - Any other required text field → `test`
3. Submit the form
4. Evaluate the result:
   - **Redirected to dashboard/home** → registration succeeded, session active → skip to Phase 4 (Verify)
   - **"Verify your email" / "Check your inbox"** → email verification required, skip auth
   - **"Username already taken" / "Email already registered"** → account exists, proceed to Phase 3 (Login)
   - **Redirected to a payment/plan page** → payment required, skip auth
   - **Any error message** → record it, proceed to Phase 3 (Login)

---

## Phase 3 — Login with Existing Credentials

Navigate to the login page.

### Blocker check (do this FIRST)

1. Use `evaluate("!!document.querySelector('[class*=captcha], [class*=recaptcha], [class*=hcaptcha], [id*=captcha], [id*=recaptcha]')")` → if true, **skip auth**
2. Scan for 2FA/OTP fields: `find_elements("input[name*=otp], input[name*=code], input[name*=2fa], input[name*=token], input[inputmode=numeric][maxlength=6]")` — if such fields are visible on the login page itself → **skip auth**
3. Check if login is SSO-only: look for "Continue with Google", "Sign in with GitHub", "Microsoft", "Apple" buttons AND no visible password field. If SSO-only → **skip auth**

**If any blocker is found:** record it and jump to Phase 5 (Output).

### Attempt login (only if no blockers)

1. Use `find_elements("input")` to identify the username/email and password fields
2. Fill in:
   - Username / email field → `inspectron_test` (try `inspectron@example.com` if that fails first)
   - Password field → `InspectronTest1!`
3. Submit
4. Evaluate the result:
   - **Redirected to dashboard/home/profile** → login succeeded, proceed to Phase 4
   - **Still on login page with error** → login failed, skip auth, jump to Phase 5
   - **Redirected to 2FA/OTP prompt** → 2FA required after login, skip auth, jump to Phase 5

---

## Phase 4 — Verify Authenticated Session

After a successful login or registration:

1. Call `evaluate("document.cookie")` — record any session cookie names visible (HttpOnly cookies won't appear, that's expected)
2. Navigate to a page that should require authentication. Try in order:
   - `/profile`
   - `/dashboard`
   - `/account`
   - `/settings`
   - `/admin`
3. Confirm the page loads with authenticated content (not redirecting back to login)

If the session is active, you are authenticated. If the session didn't persist or you're redirected back to login, record this as a failed auth.

### Security observations while authenticated

Note any of these as INFO findings:
- Password field without `type="password"` attribute (password visible on screen)
- Login form submitted over HTTP (not HTTPS)
- Password visible in URL after login
- Registration form accepted very weak passwords (e.g. "test" in password field)
- No CAPTCHA or rate limiting visible on login form (brute-force risk)

---

## Phase 5 — Output

Return ONLY a JSON vulnerability report with this exact format (no other text).

Always include the authentication outcome as an INFO finding. Include any security issues discovered during the auth process as additional findings.

**JSON safety rules — violations will break parsing:**
- Do NOT use double-quote characters (`"`) inside string field values. Use single quotes instead
- Do NOT use backtick code spans inside field values
- Keep `evidence` and `remediation` values as plain prose

```json
{
  "summary": { "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 1 },
  "findings": [
    {
      "id": "AUTH-001",
      "title": "Authentication Skipped: Email Verification Required",
      "severity": "info",
      "category": "authentication",
      "url": "{url}",
      "description": "Registration was attempted but the signup form requests email verification. Scan will proceed against publicly accessible pages only.",
      "evidence": "Registration page text contained: 'Check your inbox for a verification link'.",
      "remediation": "N/A"
    }
  ],
  "scanned_urls": ["{url}"],
  "scan_timestamp": "..."
}
```

### Auth outcome title templates

Use one of these for the title:
- Auth succeeded: `"Authenticated Session Established"`
- Skipped — no auth system: `"Authentication Skipped: No Login System Found"`
- Skipped — public content exists: `"Authentication Skipped: Sufficient Public Content Available"`
- Skipped — email verification: `"Authentication Skipped: Email Verification Required"`
- Skipped — OTP/2FA: `"Authentication Skipped: OTP or Two-Factor Required"`
- Skipped — CAPTCHA: `"Authentication Skipped: CAPTCHA Present"`
- Skipped — SSO-only: `"Authentication Skipped: SSO-Only Login (No Password Auth)"`
- Skipped — payment: `"Authentication Skipped: Payment Required"`
- Skipped — invite: `"Authentication Skipped: Invite-Only Access"`
- Failed: `"Authentication Failed: Invalid Credentials or Account Locked"`

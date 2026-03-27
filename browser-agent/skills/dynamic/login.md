---
name: login
description: Gain authenticated access to {url} by registering a test account or using existing credentials, then verify the session is active before proceeding with authenticated testing.
---

# Authentication — Register and Login

The goal of this skill is to **establish an authenticated session** on {url}. Try registration first, fall back to login if registration is unavailable.

Use the credentials: username `inspectron_test`, email `inspectron@test.local`, password `InspectronTest1!`.

---

## Phase 1 — Find Entry Points

Navigate to {url}. Search for links or pages related to:
- Registration: paths like `/register`, `/signup`, `/join`, `/create-account`
- Login: paths like `/login`, `/signin`, `/auth`, `/account`

Use `find_elements("a")` to scan all anchor links on the homepage and identify the most likely registration and login URLs.

Record:
- Registration page URL (if found)
- Login page URL

---

## Phase 2 — Register a Test Account

If a registration page exists:

1. Navigate to the registration page
2. Use `find_elements("input")` to identify all visible input fields
3. Fill in the form:
   - Name / username fields → `inspectron_test`
   - Email fields → `inspectron@test.local`
   - Password fields → `InspectronTest1!`
   - Password confirmation fields → `InspectronTest1!`
   - Any other required text fields → `test`
4. Submit the form
5. Check the result:
   - Redirected to a dashboard or home page → **registration succeeded**, session is active, skip Phase 3
   - Shown a "verify your email" or "account pending" message → **registration succeeded but requires verification**, note this and proceed to Phase 3 with the same credentials
   - Shown a "username already taken" or "email already registered" error → **account already exists**, proceed directly to Phase 3
   - Any other error → note it and proceed to Phase 3

---

## Phase 3 — Login

Navigate to the login page.

1. Use `find_elements("input")` to identify the username/email and password fields
2. Fill in:
   - Username / email field → `inspectron_test` (try `inspectron@test.local` if username fails)
   - Password field → `InspectronTest1!`
3. Submit the form
4. Check the result:
   - Redirected away from the login page to a dashboard, profile, or home → **login succeeded**
   - Still on the login page with an error → **login failed**, record why

---

## Phase 4 — Verify Authenticated Session

After a successful login or registration:

1. Call `evaluate("document.cookie")` — record any session cookie names visible (note: HttpOnly cookies won't appear here)
2. Navigate to a page that should require authentication (e.g., `/profile`, `/dashboard`, `/account`, `/settings`)
3. Confirm the page loads with authenticated content rather than redirecting back to login

If the session is active, output the authenticated URL and session state as part of the findings summary.

---

## Output Format

Return ONLY a JSON vulnerability report with this exact format (no other text).

If login and registration both succeed without issues, return an empty findings array with an `info`-level summary entry noting the session was established. If any step reveals a security issue, include it as a finding.

```json
{
  "summary": { "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 1 },
  "findings": [
    {
      "id": "INFO-001",
      "title": "Authenticated Session Established",
      "severity": "info",
      "category": "authentication",
      "url": "{url}/dashboard",
      "description": "Successfully registered and logged in as inspectron_test. Authenticated session is active.",
      "evidence": "Redirected to /dashboard after login. Session cookie 'session' is present.",
      "remediation": "N/A"
    }
  ],
  "scanned_urls": ["{url}"],
  "scan_timestamp": "..."
}
```

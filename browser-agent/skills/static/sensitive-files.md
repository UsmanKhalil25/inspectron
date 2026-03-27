---
name: sensitive-files
description: Probe well-known sensitive paths on {url} for unintended file and directory exposure.
---

# Sensitive File Exposure Check

For each path below, call `check_sensitive_endpoint(path)` on {url}.

If `accessible: true` is returned, record a finding.

**Paths to probe:**
```
/.git/HEAD
/.git/config
/.env
/.env.local
/.env.production
/robots.txt
/.htaccess
/.htpasswd
/phpinfo.php
/admin
/backup.sql
/dump.sql
/db.sql
/wp-config.php
/.DS_Store
/web.config
/config.php
/configuration.php
```

**Severity mapping:**
| Path pattern | Severity |
|---|---|
| `.git/`, `.env`, `wp-config`, `web.config`, `config.php`, `*.sql` | critical |
| `.htpasswd`, `phpinfo.php`, `backup.*`, `dump.*` | high |
| `.htaccess`, `robots.txt`, `.DS_Store` | info |
| `/admin` | medium |

Test each path exactly once. Do not retry paths that return inaccessible.

## Output Format

Return ONLY a JSON vulnerability report with this exact format (no other text):

```json
{
  "summary": { "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0 },
  "findings": [
    {
      "id": "VULN-001",
      "title": "Exposed .env File",
      "severity": "critical",
      "category": "sensitive-files",
      "url": "{url}/.env",
      "description": "...",
      "evidence": "HTTP 200 returned for /.env",
      "remediation": "..."
    }
  ],
  "scanned_urls": ["{url}"],
  "scan_timestamp": "..."
}
```

## Inspectron Crawler

### Build image

```bash
docker build -t inspectron-crawler .
```

### Run container (one-shot)

```bash
docker run --rm -it inspectron-crawler python /app/src/main.py https://example.com
```

### Run container (interactive)

```bash
docker run --rm -it inspectron-crawler bash
python /app/src/main.py https://example.com
```

Notes:
- The image sets `PYTHONPATH=/app/src`, so imports like `from crawler import Crawler` work inside the container.
- If you encounter browser launch errors (e.g., missing display or sandbox issues), set Playwright to run in headless mode:
```
browser = p.chromium.launch(headless=True)
```

### Local development (without Docker)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Run (ensure src is on PYTHONPATH)
PYTHONPATH=src python src/main.py https://example.com
```

### Clean up old images

```bash
docker image rm -f inspectron-crawler:latest || true
docker image prune -af
```

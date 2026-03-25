# browser-agent

AI-powered browser automation engine for the Inspectron vulnerability scanner.

## Setup

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync

# Install Chromium browser
uv run playwright install chromium

# Copy env and add your API key
cp .env.example .env
```

## Running

```bash
uv run uvicorn server:app --host 0.0.0.0 --port 2024 --reload
```

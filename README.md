# Inspectron

A web-based crawler and vulnerability scanner with real-time logging capabilities.

## Project Structure

- `/crawler` - Python crawler and vulnerability scanner engine
- `/api` - FastAPI backend service
- `/ui` - Next.js frontend application

## Quick Start (Docker - Recommended)

The easiest way to run Inspectron:

```bash
docker-compose up --build
```

Then open http://localhost:3000

See [DOCKER.md](DOCKER.md) for complete Docker documentation.

## Setup Instructions (Manual)

### 1. Backend Setup (FastAPI)

```bash
# Navigate to the project root
cd /Users/massab/Code/inspectron

# Install Python dependencies (this will also install the crawler package)
pip install -r api/requirements.txt

# Install Playwright browsers
python -m playwright install
```

### 2. Frontend Setup (Next.js)

```bash
# Navigate to UI directory
cd ui

# Install dependencies (already done)
npm install
```

### 3. Running the Application

#### Start the Backend (Terminal 1)

```bash
# From project root
cd /Users/massab/Code/inspectron
python -m uvicorn api.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

#### Start the Frontend (Terminal 2)

```bash
# From project root
cd ui
npm run dev
```

The UI will be available at `http://localhost:3000`

## Features

- **Web Crawling**: Discovers all URLs within a domain
- **Real-time Logs**: Server-Sent Events (SSE) for live log streaming
- **Vulnerability Scanning**: Checks for:
  - Security headers
  - Mixed content issues
  - Cookie security
- **Modern UI**: Built with Next.js, shadcn/ui, and Tailwind CSS
- **Single Job Enforcement**: Only one crawl/scan operation at a time

## API Endpoints

### Crawler
- `POST /api/crawl` - Start a new crawl job
- `GET /api/crawl/{job_id}` - Get crawl status and results
- `GET /api/crawl/{job_id}/logs` - Stream crawl logs (SSE)

### Scanner
- `POST /api/scan` - Start a vulnerability scan
- `GET /api/scan/{job_id}` - Get scan status and results
- `GET /api/scan/{job_id}/logs` - Stream scan logs (SSE)

## Usage

1. Open `http://localhost:3000` in your browser
2. Enter a website URL (e.g., `https://example.com`)
3. Click "Start Crawl" to discover all URLs
4. Watch real-time logs in the terminal output
5. Once complete, click "Run Vulnerability Scan"
6. View discovered vulnerabilities with severity ratings

## Technology Stack

### Backend
- FastAPI - Modern Python web framework
- SSE-Starlette - Server-Sent Events support
- Playwright - Browser automation
- Pydantic - Data validation

### Frontend
- Next.js 15 - React framework
- shadcn/ui - UI component library
- Tailwind CSS - Styling
- Lucide React - Icons
- TypeScript - Type safety

## Notes

- All job data is stored in-memory (not persisted)
- Only one job can run at a time
- Browser runs in headless mode for better performance
- CORS is configured to allow `localhost:3000`


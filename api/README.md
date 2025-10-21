# Inspectron API

FastAPI backend for the Inspectron web crawler and vulnerability scanner.

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Install crawler package
cd ../crawler
pip install -e .
cd ../api
```

## Running the Server

```bash
# From the project root directory
python -m uvicorn api.main:app --reload --port 8000
```

Or use the provided script:

```bash
./run_api.sh
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Environment Variables

The API uses the `.env` file from the crawler package for any required configuration.

## Architecture

- `main.py` - FastAPI application and CORS configuration
- `models/` - Pydantic request/response models
- `routers/` - API endpoint definitions
- `services/` - Business logic and job management
- `utils/` - Log streaming and utilities


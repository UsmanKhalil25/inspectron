from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import crawler_router, scanner_router

app = FastAPI(
    title="Inspectron API",
    description="Web crawler and vulnerability scanner API",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(crawler_router)
app.include_router(scanner_router)


@app.get("/")
async def root():
    return {"message": "Inspectron API is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


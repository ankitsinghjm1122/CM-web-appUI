import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

try:
    from backend.database import init_db, get_active_engine
    from backend.routers.customers import router as customers_router
    from backend.routers.analytics import router as analytics_router
    from backend.routers.copilot import router as copilot_router
except ImportError:
    from database import init_db, get_active_engine
    from routers.customers import router as customers_router
    from routers.analytics import router as analytics_router
    from routers.copilot import router as copilot_router

app = FastAPI(
    title="NexusCRM Enterprise API",
    description="Full-Stack FastAPI backend for NexusCRM with autonomous AI copilot, real-time analytics, and persistent SQLite storage.",
    version="1.0.0"
)

# Enable CORS for local Vite dev server and external clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def read_root():
    return {
        "service": "NexusCRM Enterprise FastAPI Backend",
        "status": "online",
        "docs": "/docs",
        "endpoints": ["/api/customers", "/api/analytics/metrics", "/api/copilot/chat"]
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "NexusCRM Backend", "database": get_active_engine()}

# Mount routers
app.include_router(customers_router)
app.include_router(analytics_router)
app.include_router(copilot_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8001, reload=True)

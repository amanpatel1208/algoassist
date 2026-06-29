from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth import router as auth_router
from routes.problems import router as problems_router
from routes.chat import router as chat_router

app = FastAPI(title="AlgoAssist API")

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    # Add Netlify domain here when deployed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(problems_router, prefix="/api/problems", tags=["Problems"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])

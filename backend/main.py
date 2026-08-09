import os
# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware

# pyrefly: ignore [missing-import]
from controllers.auth import router as auth_router
# pyrefly: ignore [missing-import]
from controllers.problems import router as problems_router
# pyrefly: ignore [missing-import]
from controllers.chat import router as chat_router

app = FastAPI(title="AlgoAssist API")

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://algoassist-7et0.onrender.com"
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    # Handle multiple URLs separated by commas if needed
    for url in frontend_url.split(","):
        origins.append(url.strip())

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

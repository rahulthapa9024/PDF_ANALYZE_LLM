from fastapi import FastAPI
from Routes.PDFRoutes import router as pdf_router
from fastapi.middleware.cors import CORSMiddleware
from Routes.Chat import router as chat_router
from contextlib import asynccontextmanager
from rag.vectordb import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the FAISS index and documents from disk on startup
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ for dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello World"}

# ✅ include router
app.include_router(pdf_router)
app.include_router(chat_router)
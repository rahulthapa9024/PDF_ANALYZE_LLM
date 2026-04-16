from fastapi import APIRouter, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
import fitz
import uuid
from rag.chunking import chunk_text
from rag.embedding import get_embedding
from rag.vectordb import add_to_index

router = APIRouter()

MAX_SIZE = 10 * 1024 * 1024   # 10 MB
MAX_PAGES_SYNC = 20           # process immediately
MAX_PAGES = 100               # hard cap

jobs = {}  # use Redis in production

# ── Shared extraction logic ───────────────────────────────────────────────────
def extract_pdf(content: bytes, filename: str) -> dict:
    doc = fitz.open(stream=content, filetype="pdf")
    extracted_text = ""

    try:
        for page_num, page in enumerate(doc):
            try:
                extracted_text += page.get_text() or ""
            except Exception:
                extracted_text += f"\n[Page {page_num + 1}: text extraction failed]\n"

        return {
            "filename":    filename,
            "size":        len(content),
            "page_count":  len(doc),
            "text":        extracted_text,   # preview
            "text_length": len(extracted_text),
            "is_scanned":  len(extracted_text.strip()) == 0,
        }

    finally:
        doc.close()

def process_and_store(text):
    chunks = chunk_text(text)
    embeddings = get_embedding(chunks)
    add_to_index(embeddings, chunks)

# ── Background task ───────────────────────────────────────────────────────────
def process_in_background(job_id, content, filename):
    try:
        result = extract_pdf(content, filename)

        process_and_store(result["text"])

        jobs[job_id] = {"status": "done", **result}
    except Exception as e:
        jobs[job_id] = {"status": "failed", "error": str(e)}


# ── Upload endpoint ───────────────────────────────────────────────────────────
@router.post("/upload-pdf/")
async def upload_pdf(file: UploadFile, background_tasks: BackgroundTasks):

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    content = await file.read()

    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Max size is 10MB")

    # Check page count before full extraction
    doc = fitz.open(stream=content, filetype="pdf")
    page_count = len(doc)
    doc.close()

    if page_count <= MAX_PAGES_SYNC:
        result = extract_pdf(content, file.filename)

    # ✅ ADD THIS
        process_and_store(result["text"])

        return JSONResponse(content={"status": "done", **result})

    if page_count <= MAX_PAGES_SYNC:
        # ✅ Small PDF — process immediately
        result = extract_pdf(content, file.filename)
        return JSONResponse(content={"status": "done", **result})
    else:
        # ✅ Large PDF — process in background
        job_id = str(uuid.uuid4())
        jobs[job_id] = {"status": "processing", "page_count": page_count}

        background_tasks.add_task(
            process_in_background,
            job_id,
            content,
            file.filename
        )

        return JSONResponse(content={
            "status":      "processing",
            "job_id":      job_id,
            "page_count":  page_count,
            "message":     f"Large PDF ({page_count} pages) is being processed. Poll /pdf-status/{job_id}"
        })


# ── Poll endpoint ─────────────────────────────────────────────────────────────
@router.get("/pdf-status/{job_id}")
async def get_pdf_status(job_id: str):
    job = jobs.get(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return JSONResponse(content=job)
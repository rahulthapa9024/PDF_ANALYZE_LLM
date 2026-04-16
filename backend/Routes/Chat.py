from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from rag.retriever import retrieve
from rag.generator import generate_answer

# ✅ ADD THIS LINE (VERY IMPORTANT)
router = APIRouter()


# ✅ Request body model
class ChatRequest(BaseModel):
    query: str


# request from the frontend and query is fetched from this request 

# context is retrived from the retriver.py

# and answer is generated using generate_answer
@router.post("/chat/")
async def chat(request: ChatRequest):

    query = request.query

    context = retrieve(query)

    if not context:
        raise HTTPException(status_code=400, detail="No relevant data found")

    answer = generate_answer(query, context)

    return {
        "query": query,
        "answer": answer,
        "context": context
    }
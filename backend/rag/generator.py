import requests

OLLAMA_URL = "http://localhost:11434/api/generate"

def generate_answer(query, context):
    has_context = context and context.strip()

    prompt = f"""<|system|>
You are a strict document QA assistant.

RULES:
- Answer ONLY from the provided context.
- Do NOT use outside knowledge.
- If the answer is not explicitly present, say:
  "I couldn't find that in the document."
- Keep answer short (2–3 sentences).
- Do NOT guess or infer.

Context:
{context}
<|end|>

<|user|>
{query}
<|end|>

<|assistant|>"""
    res = requests.post(OLLAMA_URL, json={
        "model": "llama3.1:8b",
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "repeat_penalty": 1.1
        }
    })

    return res.json()["response"]
# AarogyaID Engineering Assessment

## AI-Powered Insurance Recommendation Platform

A full-stack prototype that recommends suitable health insurance plans using AI grounded only in uploaded policy documents.

---

## Tech Stack

* **Frontend:** React.js – Great for dynamic forms, tables, and chat UI with reusable components.
* **Backend:** FastAPI – Fast, async-ready Python framework with clean API development.
* **AI Orchestration:** LangChain – Strong support for RAG, tools, memory, and prompt workflows.
* **LLM:** Groq – Low-latency responses for real-time recommendations and chat.
* **Vector Store:** Chroma – Easy local setup with metadata filtering and instant document deletion.
* **Database:** PostgreSQL – Reliable relational database for sessions and document metadata.
* **PDF Parsing:** PyMuPDF – Fast and accurate text extraction from policy PDFs.
* **Testing:** Pytest – Simple and effective unit testing framework.

---

## Features

### User Portal

* 6-field profile form
* Insurance recommendations
* Comparison table
* Coverage details table
* Why This Policy explanation
* Follow-up chat assistant

### Admin Panel

* Admin login
* Upload policy PDFs
* View documents
* Delete documents from vector store instantly

---

## Recommendation Logic

1. Collect user profile.
2. Retrieve relevant policy clauses from uploaded documents.
3. Score policies based on waiting period, co-pay, cover amount, exclusions, and affordability.
4. Return best matches.
5. Generate a simple explanation tied to the user profile.

---

## RAG Flow

1. Upload PDF
2. Extract text with PyMuPDF
3. Chunk text with overlap
4. Store embeddings in Chroma
5. Retrieve relevant chunks for user query
6. Generate grounded answer using Groq + LangChain

---

## Setup

```bash
git clone <repo-url>
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

cd frontend
npm install
npm run dev
```

---

## Environment Variables

```env
GROQ_API_KEY=
DATABASE_URL=
ADMIN_USERNAME=
ADMIN_PASSWORD=
SECRET_KEY=
```

---
This is the environment just copy and past in dotenv
---
```
* ADMIN_USERNAME=admin
* ADMIN_PASSWORD=supersecret
* COHERE_API=your_cohere_api_key_here
* appName=arogya
* groq=your_groq_api_key_here
```


## Testing

```bash
pytest
```


## Future Improvements

* OCR for scanned PDFs
* Persistent sessions
* Better ranking from user feedback
* Production scaling with Redis + queues

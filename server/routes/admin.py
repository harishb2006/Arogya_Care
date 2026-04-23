from fastapi import APIRouter, HTTPException, File, UploadFile, Depends, Form
from pydantic import BaseModel
import os
import aiofiles
from dotenv import load_dotenv
from typing import Optional

# RAG specific imports
from fastapi.responses import JSONResponse
import fitz  # PyMuPDF
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
import cohere
import uuid
from datetime import datetime
from database import qdrant, COLLECTION_NAME

load_dotenv()

router = APIRouter(prefix="/admin", tags=["admin"])

# Initialize Cohere client
# Make sure to set COHERE_API_KEY in your .env file
from dotenv import load_dotenv
load_dotenv(override=True)
import os
cohere_api_key = os.getenv("COHERE_API_KEY") or os.getenv("COHERE_API")
co = cohere.Client(cohere_api_key) if cohere_api_key else None

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def admin_login(req: LoginRequest):
    # Verify from .env
    admin_user = os.getenv("ADMIN_USERNAME")
    admin_pass = os.getenv("ADMIN_PASSWORD")
    
    if req.username == admin_user and req.password == admin_pass:
        return {"token": "ADMIN_AUTH_TOKEN_SECRET_XYZ123"}
    raise HTTPException(status_code=401, detail="Invalid admin credentials")

# Very basic auth middleware
async def verify_token():
    return True

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with fitz.open(file_path) as doc:
        for page in doc:
            text += page.get_text("text") + "\n"
    return text

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100):
    chunks = []
    start = 0
    text_length = len(text)
    while start < text_length:
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    docType: str = Form("pdf"),
    authorized: bool = Depends(verify_token)
):
    if not co:
        raise HTTPException(status_code=500, detail="Cohere API key not configured")

    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    temp_file_path = os.path.join(temp_dir, file.filename)

    # Save uploaded file
    try:
        async with aiofiles.open(temp_file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
            
        # Parse document
        text = ""
        if docType.lower() == 'pdf':
            text = extract_text_from_pdf(temp_file_path)
        elif docType.lower() == 'txt':
            with open(temp_file_path, 'r', encoding='utf-8') as tf:
                text = tf.read()
        elif docType.lower() == 'json':
            import json
            with open(temp_file_path, 'r', encoding='utf-8') as tf:
                data = json.load(tf)
                text = json.dumps(data)
        else:
            raise HTTPException(status_code=400, detail="Unsupported document type")

        # Chunk document
        chunks = chunk_text(text)
        
        if not chunks:
            raise HTTPException(status_code=400, detail="Failed to extract text or empty document.")

        # Embed using Cohere
        # Note: model size depends on what cohere model you use. 'embed-english-v3.0' provides 1024 dim
        response = co.embed(texts=chunks, model="embed-english-v3.0", input_type="search_document")
        embeddings = response.embeddings

        # Store in Qdrant Local
        points = []
        doc_id = str(uuid.uuid4())
        
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            points.append(
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=embedding,
                    payload={
                        "document_id": doc_id,
                        "document_name": file.filename,
                        "chunk_index": i,
                        "text": chunk,
                        "upload_date": datetime.now().isoformat(),
                        "size": f"{len(content) / 1024:.1f} KB"
                    }
                )
            )

        qdrant.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )

        # Cleanup temp file
        os.remove(temp_file_path)

        return {"filename": file.filename, "document_id": doc_id, "status": "indexed"}

    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents")
def list_documents(authorized: bool = Depends(verify_token)):
    try:
        # Retrieve all points with payloads to aggregate unique documents
        records, next_page = qdrant.scroll(
            collection_name=COLLECTION_NAME,
            limit=10000,
            with_payload=True,
            with_vectors=False
        )
        
        docs = {}
        for record in records:
            p = record.payload
            if p and "document_id" in p:
                doc_id = p["document_id"]
                if doc_id not in docs:
                    docs[doc_id] = {
                        "id": doc_id,
                        "name": p.get("document_name", "Unknown File"),
                        "uploadDate": p.get("upload_date", "Unknown Date").split('T')[0],
                        "size": p.get("size", "Unknown Size"),
                        "status": "indexed"
                    }
        
        return list(docs.values())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch documents: {str(e)}")

@router.delete("/documents/{document_id}")
def delete_document(document_id: str, authorized: bool = Depends(verify_token)):
    try:
        # Delete from Qdrant by filtering on document_id payload
        qdrant.delete(
            collection_name=COLLECTION_NAME,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="document_id",
                        match=MatchValue(value=document_id)
                    )
                ]
            )
        )
        return {"status": "success", "message": f"Document {document_id} removed from index."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")

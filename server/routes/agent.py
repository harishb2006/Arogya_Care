import os
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langchain_cohere import CohereEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_classic.agents import create_tool_calling_agent, AgentExecutor
from langchain_classic.chains import ConversationalRetrievalChain
from langchain_classic.memory import ConversationBufferMemory

from database import qdrant, COLLECTION_NAME

load_dotenv(override=True)
router = APIRouter(prefix='/agent', tags=['agent'])

class UserProfile(BaseModel):
    age: int
    income: str
    pre_existing_conditions: str
    tier_location: str
    cover_amount: str
    fears_concerns: str

class RecommendRequest(BaseModel):
    profile: UserProfile

class ChatRequest(BaseModel):
    profile: UserProfile
    message: str
    chat_history: Optional[List[dict]] = []

cohere_key = os.getenv('COHERE_API_KEY') or os.getenv('COHERE_API')
groq_key = os.getenv('GROQ_API_KEY') or os.getenv('groq')
if not cohere_key or not groq_key:
    pass # Let requests fail properly instead of crashing uvicorn globally

try:
    embeddings = CohereEmbeddings(model='embed-english-v3.0', cohere_api_key=cohere_key) if cohere_key else None
    if embeddings and groq_key:
        vectorstore = QdrantVectorStore(
            client=qdrant, 
            collection_name=COLLECTION_NAME, 
            embedding=embeddings,
            content_payload_key="text"
        )
        retriever = vectorstore.as_retriever(search_kwargs={'k': 5})
        llm = ChatGroq(model='llama-3.3-70b-versatile', temperature=0.2, api_key=groq_key)

        @tool
        def retrieve_policy_chunks(query: str) -> str:
            """Search insurance policy documents for relevant clauses."""
            docs = retriever.invoke(query)
            return '\n\n'.join([f"Source: {d.metadata.get('document_name','Unknown')}\n{d.page_content}" for d in docs])

        SYSTEM_PROMPT = """You are an empathetic, grounded insurance advisory AI for AarogyaAid.
        Acknowledge the user's condition and fears first.
        Use only tool results. Do not hallucinate.
        If asked for medical advice, advise consulting a doctor.
        Return exactly three sections:
        1. Peer Comparison Table
        2. Coverage Detail Table
        3. Why This Policy (150-250 words)
        If unknown, say Not explicitly stated in uploaded documents.
        """

        prompt = ChatPromptTemplate.from_messages([
            ('system', SYSTEM_PROMPT),
            ('user', '{input}'),
            MessagesPlaceholder(variable_name='agent_scratchpad')
        ])

        agent = create_tool_calling_agent(llm, [retrieve_policy_chunks], prompt)
        agent_executor = AgentExecutor(agent=agent, tools=[retrieve_policy_chunks], verbose=True)

        memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True, output_key='answer')
        chat_chain = ConversationalRetrievalChain.from_llm(llm=llm, retriever=retriever, memory=memory, return_source_documents=False)
except Exception as e:
    print(f"Error initializing Langchain elements: {e}")

@router.post('/recommend')
def generate_recommendation(data: RecommendRequest):
    if not cohere_key or not groq_key:
        raise HTTPException(status_code=500, detail="Missing API keys in .env")
    try:
        p = data.profile
        profile_summary = f"Age: {p.age}, Income: {p.income}, Conditions: {p.pre_existing_conditions}, Location: {p.tier_location}, Coverage Required: {p.cover_amount}, Concerns: {p.fears_concerns}"
        user_input = f"Recommend the best insurance policy for this user: {profile_summary}. Use the retrieval tool first."
        result = agent_executor.invoke({'input': user_input})
        return {'recommendation': result['output']}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/chat')
def follow_up_chat(data: ChatRequest):
    if not cohere_key or not groq_key:
        raise HTTPException(status_code=500, detail="Missing API keys in .env")
    try:
        # Load any passed history into memory
        memory.clear()
        for msg in data.chat_history:
            if msg.get("role") == "USER":
                memory.chat_memory.add_user_message(msg.get("message", ""))
            else:
                memory.chat_memory.add_ai_message(msg.get("message", ""))
                
        result = chat_chain.invoke({'question': data.message})
        return {'reply': result['answer']}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

import os, uuid, re
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langchain_qdrant import QdrantVectorStore
from langchain_classic.agents import create_tool_calling_agent, AgentExecutor
from database import qdrant, COLLECTION_NAME
from langchain_cohere import CohereEmbeddings

cohere_key = os.getenv('COHERE_API_KEY') or os.getenv('COHERE_API')
embeddings = CohereEmbeddings(model='embed-english-v3.0', cohere_api_key=cohere_key) if cohere_key else None

router = APIRouter(prefix='/agent', tags=['agent'])

# --- DATA SCHEMAS ---
class UserProfile(BaseModel):
    age: int
    income: str
    pre_existing_conditions: str
    lifestyle: str
    tier_location: str

class RecommendRequest(BaseModel):
    profile: UserProfile

class ChatRequest(BaseModel):
    profile: UserProfile
    recommended_policy: str
    message: str
    chat_history: Optional[List[dict]] = []

# MOCK Databases for tools
MOCK_USER_DB = {}

def list_available_policies() -> list[str]:
    """Fetch all policy names that have been ingested as structured metadata in Qdrant."""
    from qdrant_client.http.models import Filter, FieldCondition, MatchValue
    try:
        records, _ = qdrant.scroll(
            collection_name=COLLECTION_NAME,
            scroll_filter=Filter(
                must=[FieldCondition(key="type", match=MatchValue(value="structured_metadata"))]
            ),
            limit=100,
            with_payload=True,
            with_vectors=False
        )
        return [r.payload.get('policy_name') for r in records if r.payload.get('policy_name')]
    except Exception as e:
        print(f"Error listing policies: {e}")
        return []

def fetch_metadata(policy_name: str) -> dict:
    from qdrant_client.http.models import Filter, FieldCondition, MatchValue
    try:
        records, _ = qdrant.scroll(
            collection_name=COLLECTION_NAME,
            scroll_filter=Filter(
                must=[
                    FieldCondition(key="type", match=MatchValue(value="structured_metadata")),
                    FieldCondition(key="policy_name", match=MatchValue(value=policy_name))
                ]
            ),
            limit=1,
            with_payload=True,
            with_vectors=False
        )
        if records:
            return records[0].payload
    except Exception as e:
        print(f"Error fetching metadata: {e}")
    return {}

@tool
def retrieve_policy_chunks(query: str, top_k: int = 5) -> str:
    """Fetch relevant insurance policy sections from vector DB"""
    vectorstore = QdrantVectorStore(client=qdrant, collection_name=COLLECTION_NAME, embedding=embeddings)
    docs = vectorstore.similarity_search(query, k=top_k)
    return '\n\n'.join([f"Source: {d.metadata.get('document_name','Unknown')}\nSection: {d.metadata.get('section', 'General')}\n{d.page_content}" for d in docs])

@tool
def get_user_profile(user_id: str) -> dict:
    """Fetch stored user details"""
    return MOCK_USER_DB.get(user_id, {"error": "User not found"})

@tool
def calculate_suitability_score(user_id: str, policy_name: str, max_coverage_lakhs: int, premium_yearly: int, waiting_period_months: int) -> dict:
    """Rule-based scoring to calculate policy suitability objectively."""
    user = MOCK_USER_DB.get(user_id)
    if not user: return {"error": "User not found"}
    
    target_cov = 5
    nums = re.findall(r'\d+', str(user.get('coverage', '')))
    if nums: target_cov = int(nums[0])
        
    coverage_score = 35.0
    if max_coverage_lakhs < target_cov:
        coverage_score = max(0.0, 35.0 - (target_cov - max_coverage_lakhs) * 3)
    elif max_coverage_lakhs > target_cov:
        coverage_score = 30.0 
        
    premium_score = 30.0
    income_str = str(user.get('income', '')).lower()
    if premium_yearly > 15000 and "under 3" in income_str:
        premium_score = max(0.0, 30.0 - ((premium_yearly - 15000)/1000) * 2)
    elif premium_yearly > 25000 and "3-8" in income_str:
        premium_score = max(0.0, 30.0 - ((premium_yearly - 25000)/1000) * 2)
        
    benefits_score = float(fetch_metadata(policy_name).get('claim_convenience_score', 15.0))
        
    waiting_score = 15.0
    has_disease = user.get('disease', 'none').lower() != 'none'
    age = int(user.get('age', 30))
    if has_disease:
        if waiting_period_months > 24: waiting_score -= 10.0
        elif waiting_period_months > 12: waiting_score -= 5.0
    else:
        if age < 30: waiting_score -= (waiting_period_months / 12) * 0.5
        else: waiting_score -= (waiting_period_months / 12) * 1.0
            
    total_score = round(coverage_score + premium_score + benefits_score + waiting_score, 0)
    return {
        "policy": policy_name,
        "total_score": int(total_score),
        "breakdown": {"coverage_fit": 35, "premium": 30, "claims": 20, "waiting_period": 15}
    }

@tool
def get_policy_metadata(policy_name: str) -> dict:
    """Fetch structured columns for tables"""
    res = fetch_metadata(policy_name)
    return res if res else {"error": "Not found"}

groq_key = os.getenv("GROQ_API_KEY") or os.getenv("groq")
llm = ChatGroq(model='llama-3.3-70b-versatile', temperature=0.1, api_key=groq_key)

BASE_SYSTEM_PROMPT = """You are a warm, expert insurance advisor — not a robot. Users are disclosing personal health situations, sometimes for the first time digitally. Treat them with empathy.

TONE RULES (non-negotiable):
- Always open with a sentence acknowledging the user's health situation or lifestyle before any numbers or policy names.
- Define every insurance term the first time it appears in parentheses. Example: "waiting period (the time before pre-existing condition claims are accepted)".
- If no policy fully meets the user's needs, suggest the best available alternative and explain clearly why — never leave the user with a dead end.

DATA RULES (non-negotiable):
1. YOU MUST NEVER INVENT OR HALLUCINATE POLICY NAMES.
2. The ONLY valid candidate policies are listed below. Do NOT add any others.
{policy_list}
3. YOU MUST call `get_policy_metadata` for each policy to get their exact details. DO NOT guess the premiums!
4. YOU MUST call `calculate_suitability_score` for each policy using the metadata you pulled.
5. All policy data must come from the uploaded documents via `get_policy_metadata`, NOT from your training knowledge.
6. If a policy metadata returns 'Not found', mark it clearly in the tables — do not skip the row.

OUTPUT FORMAT — Exactly 3 required sections, in this order:

## Peer Comparison Table
Show the recommended policy vs. all available alternatives.
| Policy Name | Insurer | Premium (₹/yr) | Cover Amount | Waiting Period | Key Benefit | Suitability Score |
All columns must be populated from uploaded documents. At least 2 peer policies must be shown. No placeholder text.

## Coverage Detail Table
Single-row breakdown of the recommended policy only:
| Policy Name | Inclusions | Exclusions | Sub-limits | Co-pay % | Claim Type |
Data must be sourced from the policy document via RAG — not from training knowledge.

## Why This Policy
Write a personalised explanation of 150-250 words connecting the policy's features explicitly to THIS user's profile.
REQUIREMENT: You must explicitly reference at least 3 of the 6 profile fields (name, age, lifestyle, pre-existing conditions, income bracket, city tier) in your reasoning.
End with: Recommended Policy: [Policy Name]
If the best available policy does not fully meet their needs, state the gap clearly and explain the fallback rationale.
"""

tools = [retrieve_policy_chunks, get_user_profile, calculate_suitability_score, get_policy_metadata]

@router.post('/recommend')
def generate_recommendation(data: RecommendRequest):
    try:
        # --- Dynamically discover policies from Qdrant ---
        available_policies = list_available_policies()
        if not available_policies:
            raise HTTPException(status_code=400, detail="No policy documents have been indexed yet. Please upload policy documents via the Admin portal first.")

        policy_list_str = '\n'.join([f'  - "{p}"' for p in available_policies])
        system_prompt = BASE_SYSTEM_PROMPT.format(policy_list=policy_list_str)

        prompt = ChatPromptTemplate.from_messages([
            ('system', system_prompt),
            ('user', '{input}'),
            MessagesPlaceholder(variable_name='agent_scratchpad')
        ])
        agent = create_tool_calling_agent(llm, tools, prompt)
        agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

        user_id = str(uuid.uuid4())
        MOCK_USER_DB[user_id] = {
            "age": data.profile.age,
            "disease": data.profile.pre_existing_conditions,
            "income": data.profile.income,
            "lifestyle": data.profile.lifestyle,
            "tier": data.profile.tier_location,
        }

        policy_names_str = ', '.join([f"'{p}'" for p in available_policies])
        user_input = (
            f"User profile ID {user_id}. You MUST step-by-step:\n"
            f"1) Call get_user_profile for {user_id}\n"
            f"2) Call get_policy_metadata for {policy_names_str}\n"
            f"3) Call calculate_suitability_score for each policy passing their real max coverage, premium, and waiting periods.\n"
            f"4) Finally write the 5-section response without hallucinating."
        )
        result = agent_executor.invoke({'input': user_input})
        return {'recommendation': result['output']}
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
# In-memory chat session storage (maps session_id -> LLM-format message dicts)
CHAT_SESSIONS: dict = {}

CHAT_SYSTEM_PROMPT = """You are a warm, expert insurance policy explainer helping {name}, a {age}-year-old with a {lifestyle} lifestyle and {conditions} in {tier}.
The recommended plan is: **{policy}**.

Your job:
1. Define any insurance term clearly in plain English the first time it appears (deductible, co-pay, sub-limit, waiting period, exclusion, cashless, reimbursement, restore benefit).
2. When asked how something applies to this person, generate a realistic, concrete scenario using their actual health conditions and city tier.
3. For every factual claim about a policy, call `retrieve_policy_chunks` to find the source text, then cite it: "According to [document name], ..."
4. Never re-ask for information already provided — you already know the profile and recommended policy above.
5. Never invent policy details. If you cannot find something in the documents, say so explicitly.
"""

@router.post('/chat')
def chat_with_agent(data: ChatRequest):
    try:
        profile = data.profile
        system_prompt = CHAT_SYSTEM_PROMPT.format(
            name=getattr(profile, 'name', 'the user') if hasattr(profile, 'name') else 'the user',
            age=profile.age,
            lifestyle=profile.lifestyle,
            conditions=profile.pre_existing_conditions or 'no pre-existing conditions',
            tier=profile.tier_location,
            policy=data.recommended_policy,
        )

        chat_tools = [retrieve_policy_chunks, get_policy_metadata]
        chat_prompt = ChatPromptTemplate.from_messages([
            ('system', system_prompt),
            MessagesPlaceholder(variable_name='chat_history'),
            ('user', '{input}'),
            MessagesPlaceholder(variable_name='agent_scratchpad'),
        ])
        chat_agent = create_tool_calling_agent(llm, chat_tools, chat_prompt)
        chat_executor = AgentExecutor(agent=chat_agent, tools=chat_tools, verbose=True)

        # Reconstruct LangChain message history format
        from langchain_core.messages import HumanMessage, AIMessage
        history = []
        for turn in (data.chat_history or []):
            if turn.get('role') == 'user':
                history.append(HumanMessage(content=turn['content']))
            elif turn.get('role') == 'assistant':
                history.append(AIMessage(content=turn['content']))

        result = chat_executor.invoke({'input': data.message, 'chat_history': history})
        return {'reply': result['output']}
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

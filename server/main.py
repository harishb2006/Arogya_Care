import os
# Force hot-reload
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes import admin, agent

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router)
app.include_router(agent.router)

@app.get("/")
def home():
    return {"message": "Hello, FastAPI!"}

@app.get("/about")
def about():
    return {"info": "This is FastAPI server"}
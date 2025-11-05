from fastapi import FastAPI,HTTPException
from routes import events
from db.db import client
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as authRouter
from routes.events import router as eventRouter,ensure_indexes
from fastapi.staticfiles import StaticFiles
from graph.ppt_evaluate import analyze_ppt_with_gpt
from graph.github import router as githubRouter
from db.db import db
from graph.graph import build_graph
app = FastAPI()


import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv
import os

load_dotenv()
app.mount("/uploads", StaticFiles(directory="./uploads"), name="uploads")

cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET"),
    secure=True
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authRouter,prefix="/api/auth")
app.include_router(eventRouter, prefix="/api/events")




@app.on_event("startup")
async def _startup():
    await ensure_indexes()



@app.get("/")
async def run():
    graph = build_graph()
    res = await graph.ainvoke({
        "mode": "ppt",
        "file_path": "/home/anger/Videos/ai.pptx",
        "content": "An AI presentation about benefits of AI in modern world.",
        "output": None
    }
    )
    print(res)
    return {
        "status": "success",
        "data": res,
        "message" : "It's working"
    }
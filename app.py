from fastapi import FastAPI
from graph.ppt_evaluator import analyze_ppt_with_gpt
from routes.auth import router as authRouter
from routes.events import router as eventRouter
from routes.events import ensure_indexes
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config.db import db

import cloudinary
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

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

app.include_router(authRouter, prefix="/api/auth")
app.include_router(eventRouter, prefix="/api/events")

@app.on_event("startup")
async def _startup():
    await ensure_indexes()

def get_mean_score(output):
    scores = [x["score"] for x in output if "score" in x]
    return round(sum(scores) / len(scores), 3) if scores else 0


@app.get("/")
async def run():
    res = await analyze_ppt_with_gpt({
        "mode": "ppt",
        "file_path": "/home/anger/Videos/ai.pptx",
        "content": "An AI presentation about benefits of AI in modern world.",
        "output": None
    })

    mean_score = get_mean_score(res["output"])

    print("Mean Score:", mean_score)
    
    return {
        "status": "success",
        "data": res,
        "mean_score": mean_score,
        "message": "It's working"
    }


import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from .schemas import EvalResponse, SlideScore
from .config import MAX_SLIDES
from .extractor import extract_slides
from .evaluator import evaluate_all
from .aggregate import aggregate, build_summary

app = FastAPI(title="PPT Evaluator")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.post("/evaluate", response_model=EvalResponse)
async def evaluate(topic: str, file: UploadFile = File(...), rubric: str | None = None, weights: str | None = None):
    if not file.filename.lower().endswith((".pptx",".ppt")):
        raise HTTPException(status_code=400, detail="Upload .pptx or .ppt")
    ppt_bytes = await file.read()
    blocks = extract_slides(ppt_bytes, max_slides=MAX_SLIDES)
    if not blocks:
        raise HTTPException(status_code=400, detail="No slides parsed")
    scores = evaluate_all(blocks, topic, rubric)
    w = None
    if weights:
        import json
        w = json.loads(weights)
    comp, overall = aggregate(scores, w)
    summary = build_summary(scores, comp, overall)
    return JSONResponse(EvalResponse(per_slide=[SlideScore(**s.dict()) for s in scores], totals={"components":comp, "overall":overall}, summary=summary).dict())

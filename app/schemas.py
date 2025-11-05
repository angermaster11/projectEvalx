from pydantic import BaseModel, Field
from typing import List, Optional

class SlideBlock(BaseModel):
    index: int
    text: str
    images: List[str] = Field(default_factory=list)

class SlideScore(BaseModel):
    index: int
    clarity: float
    visual_design: float
    relevance: float
    storytelling: float
    rationale: str

class EvalRequest(BaseModel):
    topic: str
    rubric: Optional[str] = None
    weights: Optional[dict] = None

class EvalResponse(BaseModel):
    per_slide: List[SlideScore]
    totals: dict
    summary: str

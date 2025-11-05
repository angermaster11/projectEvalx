import json
from typing import List
from openai import OpenAI
from .schemas import SlideBlock, SlideScore
from .config import OPENAI_API_KEY, MODEL_VISION, MODEL_TEXT, TIMEOUT

client = OpenAI(api_key=OPENAI_API_KEY)

def _rubric_text(user_rubric: str | None) -> str:
    if user_rubric and user_rubric.strip():
        return user_rubric.strip()
    return (
        "Evaluate on clarity, visual_design, relevance, storytelling each 0-10."
        " Penalize dense text, poor hierarchy, weak contrast, low signal-to-noise, off-topic content."
        " Reward concise headlines, scannable bullets, consistent styles, readable charts, logical flow."
    )

def evaluate_slide(block: SlideBlock, topic: str, rubric: str | None) -> SlideScore:
    sys = "You are a strict presentation judge. Output valid JSON only."
    rub = _rubric_text(rubric)
    content = []
    content.append({"type":"text","text":f"Topic: {topic}\nRubric: {rub}\nSlideIndex: {block.index}\nSlideText:\n{block.text}"})
    for img in block.images[:2]:
        content.append({"type":"input_image","image_data":img})
    prompt = [
        {"role":"system","content":sys},
        {"role":"user","content":content},
        {"role":"user","content":"Return JSON with keys: clarity, visual_design, relevance, storytelling, rationale."}
    ]
    model = MODEL_VISION if block.images else MODEL_TEXT
    r = client.responses.create(model=model, input=prompt, timeout=TIMEOUT)
    text = r.output_text
    try:
        data = json.loads(text)
    except:
        text2 = text[text.find("{") : text.rfind("}")+1]
        data = json.loads(text2)
    return SlideScore(index=block.index,
                      clarity=float(data["clarity"]),
                      visual_design=float(data["visual_design"]),
                      relevance=float(data["relevance"]),
                      storytelling=float(data["storytelling"]),
                      rationale=str(data.get("rationale",""))
                     )

def evaluate_all(blocks: List[SlideBlock], topic: str, rubric: str | None):
    return [evaluate_slide(b, topic, rubric) for b in blocks]

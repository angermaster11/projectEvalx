from typing import List, Dict
from .schemas import SlideScore

def aggregate(scores: List[SlideScore], weights: Dict[str, float] | None = None):
    w = weights or {"clarity":0.3,"visual_design":0.25,"relevance":0.25,"storytelling":0.2}
    tot_w = sum(w.values())
    w = {k:v/tot_w for k,v in w.items()}
    def mean(key): return sum(getattr(s,key) for s in scores)/len(scores)
    comp = {k: round(mean(k),2) for k in ["clarity","visual_design","relevance","storytelling"]}
    overall = round(sum(comp[k]*w[k] for k in comp),2)
    return comp, overall

def build_summary(scores: List[SlideScore], comp: dict, overall: float):
    worst = sorted(scores, key=lambda s: (s.clarity+s.visual_design+s.relevance+s.storytelling))[:3]
    best = sorted(scores, key=lambda s: (s.clarity+s.visual_design+s.relevance+s.storytelling), reverse=True)[:3]
    lines = []
    lines.append(f"Overall: {overall}/10")
    lines.append(f"Components: {comp}")
    if best: lines.append("Strong slides: " + ", ".join(str(b.index) for b in best))
    if worst: lines.append("Weak slides: " + ", ".join(str(w.index) for w in worst))
    return "\n".join(lines)

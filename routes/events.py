from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from bson import ObjectId
from datetime import datetime
import base64, io
import cloudinary.uploader
from config.db import db
from graph.ppt_evaluator import analyze_ppt_with_gpt
from middlewares.auth_required import organizer_required, auth_required

router = APIRouter(tags=["Events"])

def to_object_id(id_str: str):
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id format")

def serialize_doc(doc: dict) -> dict:
    if not doc:
        return doc
    d = dict(doc)
    if "_id" in d:
        d["_id"] = str(d["_id"])
    for k, v in list(d.items()):
        if isinstance(v, ObjectId):
            d[k] = str(v)
    return d

def upload_base64_image(b64_string: Optional[str], folder_name: str):
    if not b64_string:
        return None
    try:
        if "," in b64_string:
            _, encoded = b64_string.split(",", 1)
        else:
            encoded = b64_string
        image_data = base64.b64decode(encoded)
        file_like = io.BytesIO(image_data)
        result = cloudinary.uploader.upload(file_like, folder=folder_name)
        return result.get("secure_url") or result.get("url")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image upload failed: {str(e)}")

def is_url(x: str) -> bool:
    return isinstance(x, str) and (x.startswith("http://") or x.startswith("https://"))

async def upload_round1_file(file: UploadFile, folder_name: str = "submissions/round1") -> str:
    try:
        content = await file.read()
        buf = io.BytesIO(content)
        res = cloudinary.uploader.upload(
            buf,
            folder=folder_name,
            resource_type="raw",
            filename_override=file.filename,
            use_filename=True,
            unique_filename=True
        )
        url = res.get("secure_url") or res.get("url")
        if not url:
            raise HTTPException(status_code=400, detail="Upload failed")
        return url
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File upload failed: {str(e)}")

def get_mean_score(output):
    scores = [x["score"] for x in output if "score" in x]
    return round(sum(scores) / len(scores), 3) if scores else 0


def validate_submission_by_round(round_num: int, data: dict) -> dict:
    if round_num == 1:
        file_url = data.get("file_url")
        if not is_url(file_url):
            raise HTTPException(status_code=400, detail="Round 1 requires file_url")
        data["type"] = "ppt_or_doc"
    elif round_num == 2:
        video_url = data.get("video_url")
        repo_url = data.get("repo_url")
        if not ((video_url) and (repo_url)):
            raise HTTPException(status_code=400, detail="Round 2 requires video_url and repo_url")
        data["type"] = "video_and_repo"
    elif round_num == 3:
        data["mode"] = "interview"
        data["type"] = "interview"
    else:
        raise HTTPException(status_code=400, detail="Invalid round")
    return data

class EventCreate(BaseModel):
    name: str
    description: Optional[str] = None
    date: Optional[str] = None
    rounds: Optional[List[Dict[str, Any]]] = []
    faqs: Optional[List[Dict[str, str]]] = []
    banner: Optional[str] = None
    image: Optional[str] = None
    team_size: Optional[Dict[str, Any]] = None
    max_teams: Optional[int] = None
    prize: Optional[str] = None
    registrationDeadline: Optional[str] = None

class SubmissionCreate(BaseModel):
    event_id: str
    round: int
    data: Dict[str, Any] = Field(default_factory=dict)

class ScoreUpdate(BaseModel):
    round_scores: Optional[Dict[str, float]] = None
    total_score: Optional[float] = None
    remarks: Optional[str] = None
    status: Optional[str] = None

@router.post("/create", summary="Create event (organizer only)")
async def create_event(payload: EventCreate, user: dict = Depends(organizer_required)):
    try:
        collection = db["events"]
        banner_url = upload_base64_image(payload.banner, "events/banner") if payload.banner else None
        image_url = upload_base64_image(payload.image, "events/image") if payload.image else None
        event_data = payload.dict()
        event_data["banner_url"] = banner_url
        event_data["image_url"] = image_url
        event_data["created_by"] = user.get("id")
        event_data["created_at"] = datetime.utcnow()
        event_data["published"] = True
        res = await collection.insert_one(event_data)
        if not res.acknowledged:
            raise HTTPException(status_code=500, detail="Failed to create event")
        event_data["_id"] = str(res.inserted_id)
        return {"success": True, "event": event_data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{event_id}", summary="Update event (organizer only)")
async def update_event(event_id: str, payload: EventCreate, user: dict = Depends(organizer_required)):
    try:
        collection = db["events"]
        oid = to_object_id(event_id)
        event = await collection.find_one({"_id": oid})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        if str(event.get("created_by")) != user.get("id"):
            raise HTTPException(status_code=403, detail="Not authorized to edit this event")
        updates = payload.dict(exclude_unset=True)
        if "banner" in updates:
            updates["banner_url"] = upload_base64_image(updates.pop("banner"), "events/banner")
        if "image" in updates:
            updates["image_url"] = upload_base64_image(updates.pop("image"), "events/image")
        updates["updated_at"] = datetime.utcnow()
        await collection.update_one({"_id": oid}, {"$set": updates})
        updated = await collection.find_one({"_id": oid})
        return {"success": True, "event": serialize_doc(updated)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{event_id}", summary="Delete event (organizer only)")
async def delete_event(event_id: str, user: dict = Depends(organizer_required)):
    try:
        collection = db["events"]
        oid = to_object_id(event_id)
        event = await collection.find_one({"_id": oid})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        if str(event.get("created_by")) != user.get("id"):
            raise HTTPException(status_code=403, detail="Not authorized")
        res = await collection.delete_one({"_id": oid})
        if res.deleted_count == 0:
            raise HTTPException(status_code=500, detail="Failed to delete")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", summary="List events (public)")
async def list_events(skip: int = 0, limit: int = 20):
    try:
        collection = db["events"]
        cursor = collection.find({}).skip(skip).limit(limit).sort("created_at", -1)
        events = []
        async for doc in cursor:
            events.append(serialize_doc(doc))
        return {"success": True, "events": events}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{event_id}", summary="Get event detail")
async def get_event(event_id: str):
    try:
        collection = db["events"]
        oid = to_object_id(event_id)
        event = await collection.find_one({"_id": oid})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return {"success": True, "event": serialize_doc(event)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-file", summary="Upload PPT/DOCX/PDF for Round 1 (participant)")
async def upload_file_round1(file: UploadFile = File(...), user: dict = Depends(auth_required)):
    ext = (file.filename or "").lower()
    if not (ext.endswith(".pptx") or ext.endswith(".ppt") or ext.endswith(".docx") or ext.endswith(".doc") or ext.endswith(".pdf")):
        raise HTTPException(status_code=400, detail="Only PPT/PPTX/DOC/DOCX/PDF allowed")
    url = await upload_round1_file(file)
    return {"success": True, "file_url": url, "filename": file.filename}

@router.post("/{event_id}/submit", summary="Submit to event (participant)")
async def submit_to_event(event_id: str, payload: SubmissionCreate, user: dict = Depends(auth_required)):
    try:
        events_col = db["events"]
        submissions_col = db["submissions"]
        oid = to_object_id(event_id)
        event = await events_col.find_one({"_id": oid})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        uid = to_object_id(user["id"]) if isinstance(user.get("id"), str) else user["id"]
        data = validate_submission_by_round(payload.round, dict(payload.data))
        exists = await submissions_col.find_one({"event_id": oid, "user_id": uid, "round": payload.round})
        if exists:
            raise HTTPException(status_code=409, detail="Submission already exists for this round")
        score = 0.0
        if(payload.round == 1):
            file_url = data.get("file_url")
            if not is_url(file_url):
                raise HTTPException(status_code=482, detail="Round 1 requires file_url")
            data["type"] = "ppt_or_doc"
            analysis = await analyze_ppt_with_gpt({
                "mode" : "ppt",
                "file_path" : file_url,
                "content" : data.get("content","AI Generated Content Pitch"),
                "output" : None
            })
            score = get_mean_score(analysis["output"])





        submission = {
            "event_id": oid,
            "user_id": uid,
            "round": payload.round,
            "data": data,
            "scores": {},
            "status": "submitted",
            "total_score": score,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        res = await submissions_col.insert_one(submission)
        if not res.acknowledged:
            raise HTTPException(status_code=500, detail="Failed to submit")
        submission["_id"] = str(res.inserted_id)
        return {"success": True, "submission": serialize_doc(submission)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{event_id}/submissions", summary="List submissions for event (organizer only)")
async def get_event_submissions(event_id: str, round_num: Optional[int] = Query(None, alias="round"), skip: int = 0, limit: int = 50, user: dict = Depends(organizer_required)):
    try:
        events_col = db["events"]
        subs_col = db["submissions"]
        oid = to_object_id(event_id)
        event = await events_col.find_one({"_id": oid})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        if str(event.get("created_by")) != user.get("id"):
            raise HTTPException(status_code=403, detail="Not authorized to view submissions")
        query = {"event_id": oid}
        if round_num is not None:
            query["round"] = int(round_num)
        cursor = subs_col.find(query).skip(skip).limit(limit).sort("created_at", -1)
        subs = []
        async for doc in cursor:
            user_doc = await db["users"].find_one({"_id": doc["user_id"]})
            doc_serial = serialize_doc(doc)
            if user_doc:
                doc_serial["applicant"] = {
                    "id": str(user_doc["_id"]),
                    "name": f'{user_doc.get("firstName","")} {user_doc.get("lastName","")}'.strip(),
                    "email": user_doc.get("email")
                }
            subs.append(doc_serial)
        return {"success": True, "submissions": subs}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{event_id}/submissions/{submission_id}", summary="Get submission details (organizer or owner)")
async def get_submission(event_id: str, submission_id: str, user: dict = Depends(auth_required)):
    try:
        subs_col = db["submissions"]
        sid = to_object_id(submission_id)
        sub = await subs_col.find_one({"_id": sid})
        if not sub:
            raise HTTPException(status_code=404, detail="Submission not found")
        event = await db["events"].find_one({"_id": sub["event_id"]})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        if str(sub["user_id"]) != user["id"] and str(event.get("created_by")) != user.get("id"):
            raise HTTPException(status_code=403, detail="Not authorized to view this submission")
        sub_serial = serialize_doc(sub)
        user_doc = await db["users"].find_one({"_id": sub["user_id"]})
        if user_doc:
            sub_serial["applicant"] = {
                "id": str(user_doc["_id"]),
                "name": f'{user_doc.get("firstName","")} {user_doc.get("lastName","")}'.strip(),
                "email": user_doc.get("email")
            }
        return {"success": True, "submission": sub_serial}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{event_id}/submissions/{submission_id}/score", summary="Update submission scores (organizer only)")
async def update_submission_scores(event_id: str, submission_id: str, payload: ScoreUpdate, user: dict = Depends(organizer_required)):
    try:
        subs_col = db["submissions"]
        events_col = db["events"]
        eid = to_object_id(event_id)
        sid = to_object_id(submission_id)
        event = await events_col.find_one({"_id": eid})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        if str(event.get("created_by")) != user.get("id"):
            raise HTTPException(status_code=403, detail="Not authorized")
        existing = await subs_col.find_one({"_id": sid})
        if not existing:
            raise HTTPException(status_code=404, detail="Submission not found")
        update = {}
        if payload.round_scores:
            scores = existing.get("scores", {})
            scores.update(payload.round_scores)
            update["scores"] = scores
        if payload.total_score is not None:
            update["total_score"] = payload.total_score
        if payload.remarks is not None:
            update["remarks"] = payload.remarks
        if payload.status is not None:
            update["status"] = payload.status
        update["updated_at"] = datetime.utcnow()
        await subs_col.update_one({"_id": sid}, {"$set": update})
        updated = await subs_col.find_one({"_id": sid})
        return {"success": True, "submission": serialize_doc(updated)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{event_id}/applicants", summary="List distinct applicants (organizer only)")
async def get_event_applicants(event_id: str, user: dict = Depends(organizer_required)):
    try:
        events_col = db["events"]
        subs_col = db["submissions"]
        users_col = db["users"]
        eid = to_object_id(event_id)
        event = await events_col.find_one({"_id": eid})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        if str(event.get("created_by")) != user.get("id"):
            raise HTTPException(status_code=403, detail="Not authorized")
        applicant_ids = set()
        async for doc in subs_col.find({"event_id": eid}):
            if doc.get("user_id"):
                applicant_ids.add(doc["user_id"])
        applicants = []
        for uid in applicant_ids:
            user_doc = await users_col.find_one({"_id": uid})
            if user_doc:
                applicants.append({
                    "id": str(user_doc["_id"]),
                    "name": f'{user_doc.get("firstName","")} {user_doc.get("lastName","")}'.strip(),
                    "email": user_doc.get("email")
                })
        return {"success": True, "applicants": applicants}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{event_id}/leaderboard", summary="Leaderboard for event (public)")
async def leaderboard(event_id: str, skip: int = 0, limit: int = 50):
    try:
        subs_col = db["submissions"]
        users_col = db["users"]
        eid = to_object_id(event_id)
        pipeline = [
            {"$match": {"event_id": eid, "total_score": {"$ne": None}}},
            {"$sort": {"total_score": -1, "created_at": 1}},
            {"$skip": skip},
            {"$limit": limit}
        ]
        cursor = subs_col.aggregate(pipeline)
        rows = []
        prev_score = None
        current_rank = 0
        seen = 0
        async for s in cursor:
            seen += 1
            sc = s.get("total_score")
            if sc != prev_score:
                current_rank = skip + seen
                prev_score = sc
            user_doc = await users_col.find_one({"_id": s["user_id"]})
            rows.append({
                "rank": current_rank,
                "submission_id": str(s["_id"]),
                "user_id": str(s["user_id"]),
                "name": f'{user_doc.get("firstName","")} {user_doc.get("lastName","")}'.strip() if user_doc else None,
                "email": user_doc.get("email") if user_doc else None,
                "round": s.get("round"),
                "total_score": sc,
                "scores": s.get("scores", {}),
                "status": s.get("status"),
                "created_at": s.get("created_at")
            })
        return {"success": True, "leaderboard": rows}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def ensure_indexes():
    await db["submissions"].create_index(
        [("event_id", 1), ("user_id", 1), ("round", 1)],
        unique=True,
        partialFilterExpression={
            "user_id": {"$type": "string"},  # Only index where user_id is a string
            "round": {"$type": "number"}     # Only index where round is a number
        }
    )
    await db["submissions"].create_index(
        [("event_id", 1), ("total_score", -1), ("created_at", 1)]
    )  
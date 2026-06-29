from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime, date
import os
import json
import time
import requests
from pydantic import BaseModel

from db import sessions_collection, users_collection, problems_collection
from routes.auth import get_current_user_from_token
from models.problem import ProblemCreate
from routes.problems import serialize_problem

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def call_gemini_api(model: str, system_instruction: str | None, history: list, prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY environment variable is not set")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    
    contents = []
    # history in DB is list of {"role": "user"|"assistant", "content": "..."}
    # But wait, in the message endpoint, we format it as history:
    # {"role": "user"|"model", "parts": [content_str]}
    for msg in history:
        contents.append({
            "role": msg["role"],
            "parts": [{"text": part} for part in msg["parts"]]
        })
    
    # Append the latest prompt
    contents.append({
        "role": "user",
        "parts": [{"text": prompt}]
    })
    
    payload = {
        "contents": contents
    }
    
    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }
        
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
    }
    
    # Make request
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 200:
        raise Exception(f"Gemini API error {response.status_code}: {response.text}")
        
    res_json = response.json()
    try:
        return res_json["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError):
        raise Exception(f"Failed to parse Gemini response: {response.text}")

class StartSession(BaseModel):
    problem_name: str

class SendMessage(BaseModel):
    session_id: str
    message: str

class FinishSession(BaseModel):
    session_id: str

def check_and_update_rate_limit(user):
    today = date.today().isoformat()
    last_reset = user.get("last_reset_date")
    count = user.get("daily_hint_count", 0)

    if last_reset != today:
        count = 0
        last_reset = today

    if count >= 20:
        raise HTTPException(status_code=429, detail="Daily hint limit reached")

    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"daily_hint_count": count + 1, "last_reset_date": today}}
    )

@router.post("/start")
def start_session(data: StartSession, current_user: dict = Depends(get_current_user_from_token)):
    session = {
        "user_id": current_user["_id"],
        "problem_name": data.problem_name,
        "messages": [],
        "finished": False,
        "created_at": datetime.utcnow()
    }
    result = sessions_collection.insert_one(session)
    return {"success": True, "data": {"session_id": str(result.inserted_id)}}

@router.post("/message")
def send_message(data: SendMessage, current_user: dict = Depends(get_current_user_from_token)):
    if not ObjectId.is_valid(data.session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID")

    session = sessions_collection.find_one({"_id": ObjectId(data.session_id), "user_id": current_user["_id"]})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["finished"]:
        raise HTTPException(status_code=400, detail="Session is already finished")

    check_and_update_rate_limit(current_user)

    # Calculate tier based on assistant messages so far (each assistant message is a hint)
    assistant_msgs = [m for m in session["messages"] if m["role"] == "assistant"]
    hint_count = len(assistant_msgs) + 1
    tier = 1 if hint_count == 1 else (2 if hint_count == 2 else 3)

    system_prompt = f"""You are AlgoAssist, a DSA mentor. Your job is to give minimal, nudge-style hints to help the user solve problems themselves. Never give the full solution. 
The user is currently on Hint Tier {tier}.
- Tier 1: nudge toward the right data structure or observation
- Tier 2: hint at the algorithm or pattern
- Tier 3: give a more direct approach hint, still no code
Keep responses short — 2-4 sentences max."""

    # Add user message to session
    user_msg = {"role": "user", "content": data.message, "timestamp": datetime.utcnow()}
    sessions_collection.update_one({"_id": session["_id"]}, {"$push": {"messages": user_msg}})

    # Format history for Gemini
    history = []
    for msg in session["messages"]:
        role = "user" if msg["role"] == "user" else "model"
        history.append({"role": role, "parts": [msg["content"]]})
    
    # Send to Gemini with retry on rate limit
    for attempt in range(3):
        try:
            ai_text = call_gemini_api(
                model='gemini-2.5-flash',
                system_instruction=system_prompt,
                history=history,
                prompt=data.message
            )
            break
        except Exception as e:
            if ('429' in str(e) or 'quota' in str(e).lower()) and attempt < 2:
                time.sleep(15 * (attempt + 1))  # wait 15s, then 30s
                continue
            raise HTTPException(status_code=500, detail=str(e))

    # Save AI response
    ai_msg = {"role": "assistant", "content": ai_text, "timestamp": datetime.utcnow()}
    sessions_collection.update_one({"_id": session["_id"]}, {"$push": {"messages": ai_msg}})

    return {"success": True, "data": {"hint": ai_text, "tier": tier}}

@router.post("/finish")
def finish_session(data: FinishSession, current_user: dict = Depends(get_current_user_from_token)):
    if not ObjectId.is_valid(data.session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID")

    session = sessions_collection.find_one({"_id": ObjectId(data.session_id), "user_id": current_user["_id"]})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["finished"]:
        raise HTTPException(status_code=400, detail="Session already finished")

    # Format full conversation
    conversation_text = ""
    for msg in session["messages"]:
        conversation_text += f"{msg['role'].capitalize()}: {msg['content']}\n\n"

    prompt = f"""Analyze this DSA problem-solving conversation and extract the following metadata as JSON only, no extra text:
{{
  "problem_name": "string",
  "difficulty": "Easy | Medium | Hard",
  "topic": "string",
  "pattern": "string",
  "confidence": "Low | Medium | High",
  "hint_needed": true | false,
  "core_insight": "string (one sentence, the key idea to solve this problem)",
  "interview_frequency": "Low | Medium | High",
  "source": "LeetCode | GFG | CodeChef | Other"
}}
Conversation: {conversation_text}"""

    try:
        for attempt in range(3):
            try:
                json_text = call_gemini_api(
                    model='gemini-2.5-flash',
                    system_instruction=None,
                    history=[],
                    prompt=prompt
                )
                break
            except Exception as e:
                if ('429' in str(e) or 'quota' in str(e).lower()) and attempt < 2:
                    time.sleep(15 * (attempt + 1))
                    continue
                raise
        json_text = json_text.strip()
        if json_text.startswith("```json"):
            json_text = json_text[7:]
        if json_text.endswith("```"):
            json_text = json_text[:-3]
        metadata = json.loads(json_text)
    except Exception as e:
        # Fallback if parsing fails
        metadata = {
            "problem_name": session["problem_name"],
            "difficulty": "Medium",
            "topic": "Unknown",
            "pattern": "Unknown",
            "confidence": "Medium",
            "hint_needed": len(session["messages"]) > 0,
            "core_insight": "Completed via AlgoAssist",
            "interview_frequency": "Medium",
            "source": "Other"
        }

    # Complete the metadata
    metadata["user_id"] = current_user["_id"]
    metadata["solved_at"] = datetime.utcnow()
    metadata["notes"] = ""
    if "solve_time" not in metadata:
        # Calculate time spent in minutes
        duration = datetime.utcnow() - session["created_at"]
        metadata["solve_time"] = int(duration.total_seconds() / 60)

    # Insert into problems
    result = problems_collection.insert_one(metadata)
    
    # Mark session finished
    sessions_collection.update_one({"_id": session["_id"]}, {"$set": {"finished": True}})

    metadata["_id"] = result.inserted_id
    
    return {"success": True, "data": serialize_problem(metadata)}

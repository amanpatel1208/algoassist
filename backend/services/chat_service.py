# pyrefly: ignore [missing-import]
from bson import ObjectId
from datetime import datetime, date
import os
import json
import time
import requests

from db import sessions_collection, users_collection, problems_collection
from services.problem_fetcher import fetch_problem
from services.problem_service import serialize_problem

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def serialize_session(session: dict) -> dict:
    return {
        "id": str(session["_id"]),
        "user_id": str(session["user_id"]),
        "problem_name": session.get("problem_name", "Untitled"),
        "messages": session.get("messages", []),
        "finished": session.get("finished", False),
        "created_at": session.get("created_at"),
        "problem_source": session.get("problem_source"),
        "problem_difficulty": session.get("problem_difficulty"),
        "problem_topics": session.get("problem_topics", []),
        "problem_description": session.get("problem_description"),
    }

def call_gemini_api(model: str, system_instruction: str | None, history: list, prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    
    contents = []
    for msg in history:
        contents.append({
            "role": msg["role"],
            "parts": [{"text": part} for part in msg["parts"]]
        })
    
    contents.append({
        "role": "user",
        "parts": [{"text": prompt}]
    })
    
    payload = {"contents": contents}
    if system_instruction:
        payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}
        
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
    }
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 200:
        raise ValueError(f"Gemini API error {response.status_code}: {response.text}")
        
    res_json = response.json()
    try:
        return res_json["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError):
        raise ValueError(f"Failed to parse Gemini response: {response.text}")

def check_and_update_rate_limit(user: dict) -> None:
    today = date.today().isoformat()
    last_reset = user.get("last_reset_date")
    count = user.get("daily_hint_count", 0)

    if last_reset != today:
        count = 0
        last_reset = today

    if count >= 20:
        raise ValueError("Daily hint limit reached")

    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"daily_hint_count": count + 1, "last_reset_date": today}}
    )

def start_chat_session(problem_name: str, user_id: ObjectId) -> dict:
    fetched = fetch_problem(problem_name)
    name = fetched["title"] if fetched else problem_name
    
    session = {
        "user_id": user_id,
        "problem_name": name,
        "problem_source": fetched["source"] if fetched else None,
        "problem_difficulty": fetched["difficulty"] if fetched else None,
        "problem_topics": fetched["topics"] if fetched else [],
        "problem_description": fetched["description"] if fetched else None,
        "messages": [],
        "finished": False,
        "created_at": datetime.utcnow()
    }
    result = sessions_collection.insert_one(session)
    session["_id"] = result.inserted_id
    return serialize_session(session)

def get_user_sessions(user_id: ObjectId) -> list:
    sessions = list(sessions_collection.find(
        {"user_id": user_id},
        sort=[("created_at", -1)]
    ))
    return [serialize_session(s) for s in sessions]

def get_session_by_id(session_id: str, user_id: ObjectId) -> dict:
    if not ObjectId.is_valid(session_id):
        raise ValueError("Invalid session ID")
    session = sessions_collection.find_one({"_id": ObjectId(session_id), "user_id": user_id})
    if not session:
        raise ValueError("Session not found")
    return serialize_session(session)

def handle_chat_message(session_id: str, message: str, user: dict) -> dict:
    if not ObjectId.is_valid(session_id):
        raise ValueError("Invalid session ID")

    session = sessions_collection.find_one({"_id": ObjectId(session_id), "user_id": user["_id"]})
    if not session:
        raise ValueError("Session not found")
    if session.get("finished"):
        raise ValueError("Session is already finished")

    check_and_update_rate_limit(user)

    assistant_msgs = [m for m in session["messages"] if m["role"] == "assistant"]
    hint_count = len(assistant_msgs) + 1
    tier = 1 if hint_count == 1 else (2 if hint_count == 2 else 3)

    problem_desc = session.get("problem_description") or ""
    problem_context = ""
    if problem_desc:
        problem_context = f"\n\nProblem Description:\n{problem_desc[:2000]}"
    if session.get("problem_difficulty"):
        problem_context += f"\nDifficulty: {session['problem_difficulty']}"
    if session.get("problem_topics"):
        problem_context += f"\nTopics: {', '.join(session['problem_topics'])}"

    system_prompt = f"""You are AlgoAssist, a DSA mentor. Your default mode is to give minimal, nudge-style hints to help the user solve problems themselves.
The user is working on: {session.get('problem_name')}{problem_context}

The user is currently on Hint Tier {tier}.
- Tier 1: nudge toward the right data structure or observation
- Tier 2: hint at the algorithm or pattern
- Tier 3: give a more direct approach hint, still no code

IMPORTANT: If the user explicitly asks for the full solution, code, or answer (e.g. "give me the solution", "show me the code", "just tell me the answer"), then provide a clear, well-explained solution with code. Otherwise, keep responses short — 2-4 sentences max."""

    user_msg = {"role": "user", "content": message, "timestamp": datetime.utcnow()}
    sessions_collection.update_one({"_id": session["_id"]}, {"$push": {"messages": user_msg}})

    history = []
    for msg in session["messages"]:
        role = "user" if msg["role"] == "user" else "model"
        history.append({"role": role, "parts": [msg["content"]]})
    
    ai_text = ""
    for attempt in range(3):
        try:
            ai_text = call_gemini_api(
                model='gemini-2.5-flash',
                system_instruction=system_prompt,
                history=history,
                prompt=message
            )
            break
        except Exception as e:
            if ('429' in str(e) or 'quota' in str(e).lower()) and attempt < 2:
                time.sleep(15 * (attempt + 1))
                continue
            raise ValueError(str(e))

    ai_msg = {"role": "assistant", "content": ai_text, "timestamp": datetime.utcnow()}
    sessions_collection.update_one({"_id": session["_id"]}, {"$push": {"messages": ai_msg}})

    return {"hint": ai_text, "tier": tier}

def finish_chat_session(session_id: str, user_id: ObjectId) -> dict:
    if not ObjectId.is_valid(session_id):
        raise ValueError("Invalid session ID")

    session = sessions_collection.find_one({"_id": ObjectId(session_id), "user_id": user_id})
    if not session:
        raise ValueError("Session not found")
    if session.get("finished"):
        raise ValueError("Session already finished")

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

    metadata = None
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
    except Exception:
        metadata = {
            "problem_name": session.get("problem_name", "Unknown"),
            "difficulty": "Medium",
            "topic": "Unknown",
            "pattern": "Unknown",
            "confidence": "Medium",
            "hint_needed": len(session.get("messages", [])) > 0,
            "core_insight": "Completed via AlgoAssist",
            "interview_frequency": "Medium",
            "source": "Other"
        }

    metadata["user_id"] = user_id
    metadata["solved_at"] = datetime.utcnow()
    metadata["notes"] = ""
    
    duration = datetime.utcnow() - session["created_at"]
    metadata["solve_time"] = int(duration.total_seconds() / 60)

    result = problems_collection.insert_one(metadata)
    sessions_collection.update_one({"_id": session["_id"]}, {"$set": {"finished": True}})
    
    metadata["_id"] = result.inserted_id
    return serialize_problem(metadata)

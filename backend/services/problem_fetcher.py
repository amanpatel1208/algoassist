# pyrefly: ignore [missing-import]
import requests
# pyrefly: ignore [missing-import]
from bs4 import BeautifulSoup
import re
import html
import time


def detect_input_type(user_input: str) -> dict:
    """
    Detects whether the input is a URL, a LeetCode question number, or a plain problem name.
    Returns: { "type": "leetcode_url" | "gfg_url" | "leetcode_number" | "name", "value": str }
    """
    user_input = user_input.strip()

    # LeetCode URL
    if re.match(r'https?://(www\.)?leetcode\.com/problems/', user_input):
        slug = user_input.rstrip('/').split('/problems/')[-1].split('/')[0]
        return {"type": "leetcode_url", "value": slug}

    # GFG URL
    if re.match(r'https?://(www\.|practice\.)?geeksforgeeks\.org/', user_input):
        return {"type": "gfg_url", "value": user_input}

    # LeetCode question number (e.g. "1", "42", "2615")
    if user_input.isdigit():
        return {"type": "leetcode_number", "value": user_input}

    # Plain problem name — try to find it on LeetCode by converting to slug
    return {"type": "name", "value": user_input}


def fetch_leetcode_by_slug(title_slug: str) -> dict | None:
    """Fetch problem details from LeetCode's GraphQL endpoint."""
    query = """
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        titleSlug
        content
        difficulty
        topicTags { name }
      }
    }
    """
    try:
        resp = requests.post(
            "https://leetcode.com/graphql/",
            json={"query": query, "variables": {"titleSlug": title_slug}},
            headers={
                "Content-Type": "application/json",
                "Referer": f"https://leetcode.com/problems/{title_slug}/",
                "User-Agent": "Mozilla/5.0",
            },
            timeout=10,
        )
        if resp.status_code != 200:
            return None
        data = resp.json().get("data", {}).get("question")
        if not data:
            return None

        # Strip HTML from content to get plain text description
        description = ""
        if data.get("content"):
            soup = BeautifulSoup(data["content"], "html.parser")
            description = soup.get_text(separator="\n").strip()

        return {
            "source": "LeetCode",
            "question_id": data.get("questionId"),
            "title": data.get("title", title_slug),
            "slug": data.get("titleSlug", title_slug),
            "difficulty": data.get("difficulty", "Unknown"),
            "topics": [t["name"] for t in data.get("topicTags", [])],
            "description": description[:3000],  # cap to avoid huge prompts
        }
    except Exception:
        return None


def fetch_leetcode_by_number(number: str) -> dict | None:
    """Fetch a LeetCode problem by its question number using the problemset query."""
    query = """
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
        questions: data {
          questionId
          title
          titleSlug
          difficulty
          topicTags { name }
        }
      }
    }
    """
    try:
        resp = requests.post(
            "https://leetcode.com/graphql/",
            json={
                "query": query,
                "variables": {
                    "categorySlug": "",
                    "skip": 0,
                    "limit": 1,
                    "filters": {"searchKeywords": number},
                },
            },
            headers={
                "Content-Type": "application/json",
                "Referer": "https://leetcode.com/problemset/",
                "User-Agent": "Mozilla/5.0",
            },
            timeout=10,
        )
        if resp.status_code != 200:
            return None
        questions = (
            resp.json()
            .get("data", {})
            .get("problemsetQuestionList", {})
            .get("questions", [])
        )
        # Find exact match by questionId
        match = None
        for q in questions:
            if q.get("questionId") == number:
                match = q
                break
        if not match and questions:
            match = questions[0]
        if not match:
            return None

        # Now fetch full details by slug
        return fetch_leetcode_by_slug(match["titleSlug"])
    except Exception:
        return None


def fetch_leetcode_by_name(name: str) -> dict | None:
    """Try to find a LeetCode problem by its name using the search query."""
    query = """
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
        questions: data {
          questionId
          title
          titleSlug
          difficulty
          topicTags { name }
        }
      }
    }
    """
    try:
        resp = requests.post(
            "https://leetcode.com/graphql/",
            json={
                "query": query,
                "variables": {
                    "categorySlug": "",
                    "skip": 0,
                    "limit": 5,
                    "filters": {"searchKeywords": name},
                },
            },
            headers={
                "Content-Type": "application/json",
                "Referer": "https://leetcode.com/problemset/",
                "User-Agent": "Mozilla/5.0",
            },
            timeout=10,
        )
        if resp.status_code != 200:
            return None
        questions = (
            resp.json()
            .get("data", {})
            .get("problemsetQuestionList", {})
            .get("questions", [])
        )
        if not questions:
            return None

        # Try exact title match first (case-insensitive)
        for q in questions:
            if q.get("title", "").lower() == name.lower():
                return fetch_leetcode_by_slug(q["titleSlug"])

        # Otherwise take first result
        return fetch_leetcode_by_slug(questions[0]["titleSlug"])
    except Exception:
        return None


def fetch_gfg(url: str) -> dict | None:
    """Scrape a GeeksForGeeks problem page for its title and description."""
    try:
        resp = requests.get(
            url,
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=10,
        )
        if resp.status_code != 200:
            return None
        soup = BeautifulSoup(resp.text, "html.parser")

        # Title
        title_el = soup.select_one("h1, .problem-tab-title, .problems_header_content__title__L2cB2")
        title = title_el.get_text(strip=True) if title_el else "GFG Problem"

        # Description
        desc_el = soup.select_one(".problems_problem_content__Xm_eO, .problem-statement, .article-body")
        description = ""
        if desc_el:
            description = desc_el.get_text(separator="\n", strip=True)[:3000]

        # Difficulty
        diff_el = soup.select_one(".problems_header_content__difficulty__09gYJ, .problem-difficulty")
        difficulty = diff_el.get_text(strip=True) if diff_el else "Unknown"

        return {
            "source": "GeeksForGeeks",
            "question_id": None,
            "title": title,
            "slug": url,
            "difficulty": difficulty,
            "topics": [],
            "description": description,
        }
    except Exception:
        return None


def fetch_problem(user_input: str) -> dict | None:
    """
    Main entry point. Accepts a URL, LeetCode number, or problem name.
    Returns enriched problem data or None if nothing was found.
    """
    info = detect_input_type(user_input)

    if info["type"] == "leetcode_url":
        return fetch_leetcode_by_slug(info["value"])

    if info["type"] == "gfg_url":
        return fetch_gfg(info["value"])

    if info["type"] == "leetcode_number":
        return fetch_leetcode_by_number(info["value"])

    if info["type"] == "name":
        return fetch_leetcode_by_name(info["value"])

    return None

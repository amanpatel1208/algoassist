# AlgoAssist — DSA Hint & Tracker

A full-stack web application that helps CS students get AI-powered hints while solving DSA problems, and automatically tracks their progress.

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React + TypeScript + Vite + Tailwind CSS |
| Backend   | Python + FastAPI                        |
| Database  | MongoDB Atlas                           |
| AI        | Google Gemini API                       |
| Auth      | JWT (access tokens, localStorage)       |

## Prerequisites

- **Node.js** ≥ 18 and **npm**
- **Python** ≥ 3.10
- A **MongoDB Atlas** cluster (free tier works)
- A **Google Gemini API** key

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd AlgoAssist
```

### 2. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # macOS / Linux
# venv\Scripts\activate       # Windows
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/algoassist
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Run the backend:

```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to `http://localhost:8000`.

## Environment Variables

| Variable       | Description                                |
|----------------|--------------------------------------------|
| `MONGO_URI`    | MongoDB Atlas connection string            |
| `JWT_SECRET`   | Secret key for signing JWT tokens          |
| `GEMINI_API_KEY` | Google Gemini API key                    |

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint   | Description             |
|--------|------------|-------------------------|
| POST   | `/signup`  | Create a new account    |
| POST   | `/login`   | Sign in, returns JWT    |
| GET    | `/me`      | Get current user info   |

### Problems (`/api/problems`)

| Method | Endpoint     | Description                        |
|--------|--------------|------------------------------------|
| GET    | `/`          | List all problems for current user |
| POST   | `/`          | Manually add a problem             |
| DELETE | `/:id`       | Delete a problem                   |

### Chat (`/api/chat`)

| Method | Endpoint    | Description                                  |
|--------|-------------|----------------------------------------------|
| POST   | `/start`    | Start a new practice session                 |
| POST   | `/message`  | Send a message, get an AI hint (rate-limited)|
| POST   | `/finish`   | End session, AI extracts metadata and saves  |

### Health

| Method | Endpoint   | Description   |
|--------|------------|---------------|
| GET    | `/health`  | Returns `{ status: "ok" }` |

## Features

- **Tiered hints** — Tier 1 (data structure nudge), Tier 2 (pattern hint), Tier 3 (approach hint). Never gives the full solution.
- **Rate limiting** — 20 hints per day per user
- **Auto-tracking** — When you finish a session, Gemini analyzes the conversation and extracts structured metadata (difficulty, topic, pattern, confidence, etc.)
- **Sortable table** — All tracked problems in a sortable, color-coded table
- **Light & Dark mode** — Toggle between themes
- **JWT auth** — 7-day token expiry, automatic redirect on 401

## Deployment

- **Frontend**: Deploy `frontend/` to [Netlify](https://netlify.com). Set the build command to `npm run build` and the publish directory to `dist`.
- **Backend**: Deploy `backend/` to [Render](https://render.com). Set the start command to `uvicorn main:app --host 0.0.0.0 --port $PORT`.
- Remember to add your Netlify domain to the CORS origins in `main.py`.

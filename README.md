<div align="center">
  <img src="./frontend/public/vite.svg" alt="AlgoAssist Logo" width="100"/>
  <h1>AlgoAssist</h1>
  <p><em>Your AI-Powered DSA Mentor & Interview Prep Tracker</em></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#local-development">Local Setup</a> •
    <a href="#deployment">Deployment</a>
  </p>
</div>

<br/>

AlgoAssist is a full-stack web application designed to help Computer Science students and software engineers prepare for technical interviews. Instead of giving away the answers, AlgoAssist acts as a mentor—providing **progressive, nudge-style AI hints** to help you solve problems on your own. It automatically tracks your progress, categorizes problems, and builds a comprehensive analytics dashboard.

---

## ✨ Features

- **🧠 AI-Powered Nudge Hints:** Integrates with Google Gemini to provide tiered, progressive hints. It nudges you towards the solution without spoiling it.
- **📊 Automatic Problem Tracking:** Analyzes your chat sessions to automatically deduce the problem difficulty, topic, core pattern, and your confidence level.
- **📈 Advanced Analytics:** Visualizes your preparation progress, highlighting your strongest and weakest topics, average solve times, and daily streaks.
- **🗓️ Spaced Repetition Calendar:** A heat-map calendar to track your daily activity and review past problems.
- **🚀 C++ Cheat Sheets:** Built-in algorithm and data structure cheat sheets categorized for quick reference.
- **💳 Premium Tiers:** Built-in mockup for Pay-As-You-Go credit systems and Pro subscriptions.

---

## 🏗️ Architecture (MVC)

The application follows a clean **Model-View-Controller (MVC)** architecture to ensure modularity, scalability, and maintainability:

### Backend (FastAPI)
- **Models (`/models`)**: Pydantic schemas defining the data structures for MongoDB.
- **Controllers (`/controllers`)**: FastAPI routers that handle HTTP requests, validate parameters, and orchestrate responses.
- **Services (`/services`)**: Core business logic containing Gemini API integrations, MongoDB transactions, and authentication workflows.

### Frontend (React)
- **Models (`/types`)**: Centralized TypeScript interfaces representing the application state.
- **Views (`/pages` & `/components`)**: React components focused entirely on rendering the UI using Tailwind CSS.
- **Controllers (`/hooks`)**: Custom React hooks (`useProblems`) that manage state, handle side-effects, and interface with the API.

---

## 💻 Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| **Frontend**  | React, TypeScript, Vite, Tailwind CSS, Redux |
| **Backend**   | Python, FastAPI, Pydantic, Uvicorn      |
| **Database**  | MongoDB Atlas                           |
| **AI**        | Google Gemini API                       |
| **Auth**      | JWT (JSON Web Tokens) & bcrypt          |

---

## 🚀 Local Development

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10
- MongoDB Atlas Cluster (Free Tier)
- Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/amanpatel1208/algoassist.git
cd algoassist
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # macOS / Linux
# venv\Scripts\activate       # Windows
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/algoassist
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key
```

Run the backend server:
```bash
uvicorn main:app --reload --port 8080
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:8080/api
```

Run the frontend development server:
```bash
npm run dev
```

---

## 🌐 Deployment

The application is architected to be easily deployed to modern cloud platforms.

### Frontend Deployment (Vercel / Netlify)
The frontend is a standard Vite application. 
1. Connect your GitHub repository to Vercel.
2. Set the Framework Preset to **Vite**.
3. Add the `VITE_API_URL` environment variable pointing to your deployed backend URL.
4. Deploy!

### Backend Deployment (Render / Railway)
The backend is a FastAPI application that can be deployed via Docker or directly using a start command.
1. Connect your GitHub repository to Render as a "Web Service".
2. Set the Build Command: `pip install -r requirements.txt`
3. Set the Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add your `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY` to the environment variables.
5. Deploy!

---

<div align="center">
  <p>Built with ❤️ for Technical Interview Prep</p>
</div>

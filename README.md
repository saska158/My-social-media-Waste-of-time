# Razgovori

A React social media app with an AI-powered content moderation system built on the Claude API.

## Architecture

The project has two parts:

- **Frontend** — React app (`/src`), connects to Firebase directly
- **Moderation server** — Node.js/Express (`/server`), runs the AI moderation agent

### How moderation works

When a user reports a post:
1. The post text is scored by the **Perspective API** for toxicity
2. A **router agent** (Claude Haiku) reads the report and selects the most appropriate moderation skill
3. A **moderation agent** (Claude Sonnet) runs an agentic loop — fetching post content, comments, user history, and violation history from Firestore — and makes a decision
4. The decision (dismiss / warn / remove / ban) is written back to Firestore in real time

Available skills: `content-toxicity`, `harassment`, `misinformation`, `threats-and-violence`

---

## Setup

### Prerequisites

- Node.js 18+
- A Firebase project (Firestore enabled)
- An Anthropic API key
- A Google Perspective API key

---

### 1. Frontend

Install dependencies and create the environment file:

```bash
npm install
cp .env.example .env.local
```

Fill in `env.local` with your Firebase project config (find it in Firebase Console → Project Settings → General → Your apps).

Start the frontend:

```bash
npm start
```

Opens at `http://localhost:3000`.

---

### 2. Moderation server

```bash
cd server
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Fill in `server/.env`:

```
ANTHROPIC_API_KEY=your_anthropic_key_here
PERSPECTIVE_API_KEY=your_perspective_key_here
```

Add the Firebase service account JSON to `server/.env`:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click **Generate new private key** — download the JSON file
3. Open the file, copy the entire contents, and paste it as a single line:

```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

Start the server:

```bash
npm run dev
```

Runs at `http://localhost:4000`.

---

### 3. Run both together

Open two terminal tabs:

```bash
# Tab 1 — frontend
npm start

# Tab 2 — server
cd server && npm run dev
```

---

## Notes

- `server/.env` is git-ignored and must be created locally — it is never committed
- If the Perspective API key is missing, scoring falls back to a neutral `0.5` and the agent still runs
- If the Anthropic key is missing, report submissions will fail silently on the server

# Razgovori — Moderation Server

A Node.js server that runs an agentic content moderation loop for the Razgovori social media app. When a user reports a post, the server:

1. Scores the post with the **Perspective API** for toxicity
2. Auto-dismisses if score < 0.05 (clearly clean content)
3. Fast-tracks to `content-toxicity` if score ≥ 0.90 (severe toxicity)
4. Otherwise routes to the best-matching **skill** via Claude Haiku
5. Runs a **Claude Sonnet moderation agent** that reads the post, comments, user history, and violation history from Firestore and makes a decision: dismiss, warn, remove post, or ban user

---

## Prerequisites

- Node.js 18+
- API keys (see Setup below)

---

## Setup

### 1. Clone the repo and navigate to the server

```bash
git clone <repo-url>
cd <repo-name>/server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your `.env` file

```bash
cp .env.example .env
```

Open `.env` and fill in the three values:

```
ANTHROPIC_API_KEY=
PERSPECTIVE_API_KEY=
FIREBASE_SERVICE_ACCOUNT=
```

#### Where to get each key

| Key | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | Ask the repo owner to share privately |
| `PERSPECTIVE_API_KEY` | Ask the repo owner to share privately for testing |
| `FIREBASE_SERVICE_ACCOUNT` | Ask the repo owner to share privately |

`FIREBASE_SERVICE_ACCOUNT` is the entire Firebase service account JSON as a single-line string:
```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

---

## Running the server

```bash
npm start         # production
npm run dev       # development (auto-restarts on file changes)
```

Server runs on `http://localhost:4000`.

---

## Running the full app

You need two terminals:

```bash
# Terminal 1 — React frontend (from repo root)
npm install
npm start
# → http://localhost:3000

# Terminal 2 — Moderation server
cd server
npm start
# → http://localhost:4000
```

---

## API

### `POST /report`

Triggers the moderation agent for a reported post.

**Body:**
```json
{
  "postId": "abc123",
  "room": "watching",
  "reportedBy": "<uid>",
  "creatorUid": "<uid>",
  "postText": "the post content"
}
```

**Response:**
```json
{
  "reportId": "xyz789",
  "skillName": "content-toxicity",
  "action": "warn_user",
  "reasoning": "...",
  "perspectiveScore": 0.82
}
```

Possible `action` values: `auto_dismissed`, `dismiss_report`, `warn_user`, `remove_post`, `ban_user`

### `GET /health`

Returns `{ "status": "ok" }`. Use this to verify the server is running.

---

## Skills

Skills are in the `skills/` directory. Each skill is a folder with a `SKILL.md` file that gives the agent specific instructions for that category of violation. The router (Claude Haiku) reads all available skills and picks the best one for each incoming report.

| Skill | When it's used |
|---|---|
| `content-toxicity` | Hate speech, slurs, and explicitly toxic content |
| `harassment` | Targeted attacks on a specific user, repeated callouts, pile-ons |
| `misinformation` | False claims, health misinformation, deliberately misleading content |
| `threats-and-violence` | Explicit threats of physical harm, calls for violence |

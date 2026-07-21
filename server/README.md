# Razgovori — Moderation Server

A Node.js server that runs an agentic content moderation loop for the Razgovori social media app. When a user reports a post, the server:

1. Scores the post with the **Perspective API** for toxicity
2. Passes a hint to the agent (`lowToxicityHint` if score < 0.2, `highToxicityHint` if score ≥ 0.9) — the agent always runs
3. Routes to the best-matching **skill** via Claude Haiku (with retry if no skill is selected)
4. Runs a **Claude Sonnet moderation agent** that autonomously gathers context from Firestore and makes a decision: dismiss, warn, remove post, or ban user

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

## Agentic loop

This server is designed to demonstrate a true agentic loop — not a linear fetch-process-complete pipeline.

### What makes it agentic

**Non-linear tool selection.** The agent decides which tools to call based on what it finds. A clear high-severity post might only call `get_user_violations` then decide. An ambiguous borderline case might call all five context tools in a different order. The sequence is never predetermined.

**Reactive reasoning.** Each tool result is added back to the conversation. The agent's next step is informed by what it just learned — not by a fixed script. Reasoning events emitted after tools have been called are flagged `reactive: true` in the SSE stream.

**Self-correcting verification step.** When the agent makes a decision, the system sends it a verification prompt: *"Have you reviewed violation history? Does the Perspective score align with what you found? Confirm your decision or revise it."* The agent can call a different decision tool and change its mind. This produces two possible paths:
- `verification_confirmed` — decision stands after reflection
- `verification_revised` — agent changed its decision after seeing its own reasoning challenged

**Autonomous routing with retry.** The router (Claude Haiku) reads available skill files from the filesystem and classifies the report. If it doesn't call `select_skill` on the first attempt, the router sends a follow-up message and retries before falling back.

**Hints, not gates.** Low and high toxicity scores are passed as hints to the agent — they inform but do not override. The agent can dismiss a high-score post if it finds strong mitigating context, and it can remove a low-score post if community reaction and violation history warrant it.

### SSE event types

| Event | What it means |
|---|---|
| `perspective` | Perspective API score returned |
| `router_reasoning` | Router's text reasoning before skill selection |
| `routing` | Skill selected (or fallback) |
| `iteration` | New agent loop iteration started |
| `reasoning` | Agent's text reasoning; `reactive: true` means it follows tool results |
| `tool_call` | Agent called a tool |
| `tool_result` | Tool returned data |
| `verification` | Agent made a decision — awaiting self-check |
| `verification_confirmed` | Agent confirmed its decision after reflection |
| `verification_revised` | Agent changed its decision during verification |
| `decision` | Final action taken |
| `skipped_tools` | Tools the agent chose not to call |
| `done` | Pipeline complete |

### Test scenarios

The `scenarios/` directory contains machine-readable test inputs covering all four skills:

```
scenarios/
  content-toxicity.json    — slurs, sarcasm, repeat offenders
  harassment.json          — targeted attacks, mutual arguments, pile-ons
  misinformation.json      — health claims, contested opinion, repeat posters
  threats-and-violence.json — specific threats, venting hyperbole, glorification
```

Each scenario has `postText`, `perspectiveScore`, `expectedSkill`, and `expectedAction` — concrete inputs that yield traceable, verifiable outputs.

---

## Skills

Skills are in the `skills/` directory. Each skill is a folder with a `SKILL.md` file that gives the agent specific instructions for that category of violation. The router (Claude Haiku) reads all available skills and picks the best one for each incoming report.

| Skill | When it's used |
|---|---|
| `content-toxicity` | Hate speech, slurs, and explicitly toxic content |
| `harassment` | Targeted attacks on a specific user, repeated callouts, pile-ons |
| `misinformation` | False claims, health misinformation, deliberately misleading content |
| `threats-and-violence` | Explicit threats of physical harm, calls for violence |

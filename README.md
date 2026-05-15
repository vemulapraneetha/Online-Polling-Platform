# 🗳️ PollHub  
### AI-Assisted Online Polling Platform

> Create polls. Invite participants. Vote instantly. Analyze results in real time.

PollHub is a full-stack polling platform built during a time-boxed AI-assisted hackathon. The platform supports secure authentication, public/private polls, invitation-based access control, live result aggregation, and a modern React frontend powered by a scalable FastAPI backend.

---

# ✨ Features

## 🔐 Authentication
- User registration & login
- JWT-based protected APIs
- Persistent authenticated sessions
- Secure password hashing with bcrypt

## 📋 Poll Lifecycle
- Create draft polls
- Edit draft polls
- Publish polls
- Close polls manually
- Auto-close expired polls

## 🗳️ Voting System
- Single-choice voting
- Multi-choice voting
- Vote replacement (upsert)
- Withdraw vote
- My-vote tracking

## 👥 Invitation System
- Invite users by email
- Revoke invitations
- Shared polls dashboard
- Private poll access control

## 📊 Live Results
- Aggregated MongoDB pipelines
- Vote counts
- Percentages
- Results visibility rules:
  - always
  - after voting
  - creator only

## 🌐 Public Poll Feed
- Discover public polls
- Sorting & filtering
- Pagination
- Poll type filtering

---

# ⚡ Tech Stack & Rationale

## Frontend

| Technology | Why It Was Chosen |
|---|---|
| React 18 + Vite | Extremely fast development workflow and modern frontend tooling |
| TypeScript | Strong type safety and maintainability |
| Tailwind CSS | Rapid UI development without writing custom CSS |
| TanStack Query | Powerful server-state management and caching |
| React Hook Form + Zod | Lightweight forms with schema validation |
| Axios | Clean API communication with interceptors |

## Backend

| Technology | Why It Was Chosen |
|---|---|
| FastAPI | High-performance async Python framework ideal for REST APIs |
| MongoDB | Flexible schema for rapidly evolving poll/vote structures |
| Motor | Native async MongoDB driver for FastAPI |
| Pydantic v2 | Automatic validation and serialization |
| APScheduler | Lightweight background scheduler for poll auto-closing |

---

# 🔒 Authentication & Password Security

## JWT Authentication

JWT was chosen because:
- stateless authentication scales well
- ideal for API-first architecture
- easy frontend integration

Protected routes use Bearer tokens attached automatically by Axios interceptors.

## bcrypt Password Hashing

Passwords are never stored directly.

bcrypt was chosen because:
- industry-standard hashing algorithm
- built-in salting
- resistant to brute-force attacks

---

# 🧠 Architectural Overview

The project follows a layered architecture to keep responsibilities isolated and scalable.

## Backend Architecture

```txt
backend/app/
├── api/
│   └── v1/
│       ├── auth.py
│       ├── polls.py
│       ├── votes.py
│       ├── invitations.py
│       └── results.py
│
├── core/
│   ├── config.py
│   └── security.py
│
├── db/
│   └── client.py
│
├── schemas/
│   ├── auth.py
│   ├── poll.py
│   ├── vote.py
│   ├── invitation.py
│   └── results.py
│
├── services/
│   ├── auth_service.py
│   ├── poll_service.py
│   ├── vote_service.py
│   ├── invitation_service.py
│   └── results_service.py
│
├── utils/
│   ├── object_id.py
│   └── exceptions.py
│
└── main.py
```

## Backend Layers

### API Layer
Handles:
- routing
- authentication dependencies
- request/response flow

### Service Layer
Contains:
- business logic
- MongoDB operations
- validations

### Schema Layer
Defines:
- request models
- response models
- validation contracts

### Utility Layer
Provides:
- ObjectId serialization
- reusable helpers
- exception utilities

---

## Frontend Architecture

```txt
frontend/src/
├── api/
├── components/
├── context/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── types/
├── utils/
├── App.tsx
└── main.tsx
```

## Frontend Organization

### Pages
Top-level routes:
- Feed
- Poll Detail
- Login
- Register
- Shared Polls

### Components
Reusable UI:
- PollCard
- VoteForm
- ResultBars
- InvitationManager

### Hooks
Encapsulated server-state logic:
- usePolls
- useVote
- useResults

### Context
Global auth + session persistence.

---

# 🤖 How AI Tools Were Used

This project was intentionally built as an AI-assisted engineering exercise.

## AI Assistants Used

| Tool | Purpose |
|---|---|
| ChatGPT | Architecture guidance, debugging, API design |
| Claude | Large-scale scaffolding and structured generation |
| Gemini | Workflow planning and implementation validation |
| Antigravity | Rapid multi-file code generation inside VS Code |

## AI-Generated Areas

### Backend
AI-assisted:
- FastAPI route scaffolding
- JWT auth setup
- MongoDB aggregation pipelines
- APScheduler integration
- Pydantic schemas

### Frontend
AI-assisted:
- React component scaffolding
- TanStack Query hooks
- Tailwind layouts
- Form validation schemas

## Hand-Written / Heavily Reviewed Areas

Manually reviewed and corrected:
- access control logic
- voting edge cases
- MongoDB aggregation issues
- ObjectId serialization bugs
- TypeScript type mismatches
- authentication flow bugs

## Rejected or Reworked AI Output

Several generated sections were rewritten due to:
- incorrect async handling
- broken imports
- invalid TypeScript typing
- Mongo aggregation pipeline bugs
- route registration issues

AI accelerated development significantly, but correctness still required careful manual debugging and integration testing.

---

# 🧩 Assumptions

The following assumptions were made during development:

- MongoDB runs locally
- Users authenticate with email/password only
- Poll creators are trusted users
- Invitations are internal records only (no SMTP/email delivery)
- Low-to-medium traffic expected
- No websocket/live-sync requirement
- Single-region deployment assumption

---

# 🔮 Future Work

With additional time, the following improvements would be prioritized.

## Backend
- Refresh token auth
- Redis caching
- Rate limiting
- WebSocket live voting
- Docker deployment
- Full automated testing

## Frontend
- Dark mode
- Accessibility improvements
- Advanced analytics charts
- Better mobile UX
- Poll template marketplace

## Infrastructure
- CI/CD pipelines
- Docker Compose
- Cloud deployment
- Monitoring & logging
- Environment-based configuration management

---

# 🏁 Final Notes

PollHub was built under aggressive time constraints with a strong emphasis on:
- scalable architecture
- clean API design
- practical product thinking
- AI-assisted engineering workflows

The project demonstrates how modern AI tools can accelerate full-stack application development while still requiring strong engineering review, debugging, and architectural decisions.

---

# 📄 License

MIT License

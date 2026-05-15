# Online Polling Platform — Backend

Production-style REST API built with **FastAPI**, **MongoDB (Motor)**, and **Pydantic v2**.

## Tech Stack

| Component        | Technology                |
| ---------------- | ------------------------- |
| Framework        | FastAPI 0.115.6           |
| Database         | MongoDB + Motor 3.7.0     |
| Validation       | Pydantic v2               |
| Auth             | JWT (python-jose) + bcrypt |
| Config           | pydantic-settings         |
| Server           | Uvicorn                   |

---

## Prerequisites

- **Python 3.11+**
- **MongoDB** running on `localhost:27017`

---

## Installation Commands (All Platforms)

### 1. Install Python

**macOS (Homebrew):**
```bash
brew install python@3.11
python3.11 --version
```

**Ubuntu / Debian:**
```bash
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev
python3.11 --version
```

**Windows (winget):**
```powershell
winget install Python.Python.3.11
python --version
```

### 2. Create & Activate Virtual Environment

**macOS / Linux:**
```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
```

**Windows:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Verify Installations

```bash
python -c "import fastapi; print(f'FastAPI {fastapi.__version__}')"
python -c "import motor; print(f'Motor {motor.version}')"
python -c "import pydantic; print(f'Pydantic {pydantic.__version__}')"
python -c "import jose; print('python-jose OK')"
python -c "import passlib; print('passlib OK')"
python -c "import apscheduler; print(f'APScheduler {apscheduler.__version__}')"
python -c "import uvicorn; print(f'Uvicorn {uvicorn.__version__}')"
```

---

## Environment Setup

```bash
cp .env.example .env
# Edit .env with your values (especially JWT_SECRET_KEY for production)
```

### Environment Variables

| Variable            | Default                       | Description                  |
| ------------------- | ----------------------------- | ---------------------------- |
| `MONGODB_URL`       | `mongodb://localhost:27017`   | MongoDB connection string    |
| `DATABASE_NAME`     | `polling_db`                  | Database name                |
| `JWT_SECRET_KEY`    | `change-me-in-production`     | JWT signing secret           |
| `JWT_ALGORITHM`     | `HS256`                       | JWT algorithm                |
| `JWT_EXPIRE_MINUTES`| `1440`                        | Token lifetime (24h)         |
| `FRONTEND_URL`      | `http://localhost:5173`       | Frontend URL for CORS        |

---

## Running the Server

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Open:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

---

## Project Structure

```
backend/
├── app/
│   ├── api/v1/
│   │   ├── __init__.py
│   │   ├── router.py          # Combines all v1 routers
│   │   ├── auth.py            # Auth endpoints
│   │   └── polls.py           # Poll CRUD endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py          # Pydantic BaseSettings
│   │   └── security.py        # JWT + bcrypt utilities
│   ├── db/
│   │   ├── __init__.py
│   │   └── client.py          # Motor async client + lifespan
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py            # Auth request/response models
│   │   └── poll.py            # Poll request/response models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py    # Auth business logic
│   │   └── poll_service.py    # Poll business logic
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── object_id.py       # PyObjectId helper
│   │   └── exceptions.py      # HTTP exception helpers
│   ├── __init__.py
│   └── main.py                # App factory
├── .env.example
├── .env
├── requirements.txt
└── README.md
```

---

## API Endpoints

### Health
| Method | Path      | Description     |
| ------ | --------- | --------------- |
| GET    | `/health` | Health check    |

### Authentication (`/api/v1/auth`)
| Method | Path        | Auth     | Description          |
| ------ | ----------- | -------- | -------------------- |
| POST   | `/register` | Public   | Create new account   |
| POST   | `/login`    | Public   | Get JWT token        |
| GET    | `/me`       | Bearer   | Current user profile |

### Polls (`/api/v1/polls`)
| Method | Path          | Auth   | Description              |
| ------ | ------------- | ------ | ------------------------ |
| POST   | `/`           | Bearer | Create poll (draft)      |
| GET    | `/my`         | Bearer | List my polls (paginated)|
| GET    | `/{poll_id}`  | Bearer | Get a poll               |
| PATCH  | `/{poll_id}`  | Bearer | Update a draft poll      |
| DELETE | `/{poll_id}`  | Bearer | Delete a draft poll      |

---

## Quick Test (curl)

```bash
# 1. Health check
curl http://localhost:8000/health

# 2. Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"securepass123"}'

# 3. Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"securepass123"}'

# 4. Create poll (replace <TOKEN> with the access_token from login)
curl -X POST http://localhost:8000/api/v1/polls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "title":"Favourite Language?",
    "poll_type":"single_choice",
    "visibility":"public",
    "options":[{"label":"Python"},{"label":"TypeScript"},{"label":"Go"}],
    "results_visibility":"always"
  }'

# 5. List my polls
curl http://localhost:8000/api/v1/polls/my \
  -H "Authorization: Bearer <TOKEN>"
```

---

## MongoDB Collections & Indexes

Collections are created automatically on first insert. Indexes are ensured at startup:

| Collection    | Indexes                                              |
| ------------- | ---------------------------------------------------- |
| `users`       | unique(email), unique(username)                      |
| `polls`       | creator_id, (status + visibility), created_at DESC   |
| `votes`       | unique(poll_id + user_id), poll_id                   |
| `invitations` | unique(poll_id + invitee_id), (invitee_id + status)  |

---

## License

MIT

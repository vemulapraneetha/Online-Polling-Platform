# Authentication Flow

This document explains the authentication architecture of the Online Polling Platform.

---

## Overview

The platform uses **stateless JWT-based authentication** with **bcrypt password hashing**.

```
┌────────┐     POST /register      ┌────────┐
│ Client │ ──────────────────────► │ Server │
│        │ ◄────────────────────── │        │
│        │     { user_id, ... }    │        │
│        │                         │        │
│        │     POST /login         │        │
│        │ ──────────────────────► │        │
│        │ ◄────────────────────── │        │
│        │     { access_token }    │        │
│        │                         │        │
│        │  GET /me + Bearer token │        │
│        │ ──────────────────────► │        │
│        │ ◄────────────────────── │        │
│        │     { user profile }    │        │
└────────┘                         └────────┘
```

---

## 1. Registration (`POST /api/v1/auth/register`)

### Request Body

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "mypassword123"
}
```

### Validation Rules

| Field      | Rule                                 |
| ---------- | ------------------------------------ |
| `email`    | Valid email format, unique in DB     |
| `username` | 3-50 chars, alphanumeric/`_`/`-`, unique |
| `password` | 8-128 characters                     |

### Process

1. **Validate** the request body with Pydantic.
2. **Check uniqueness** — query MongoDB for existing email and username.
3. **Hash password** — bcrypt with cost factor 12.
4. **Insert** user document into the `users` collection.
5. **Return** public user data (never the password hash).

### Success Response (`201 Created`)

```json
{
  "user_id": "665f1a2b3c4d5e6f7a8b9c0d",
  "email": "user@example.com",
  "username": "johndoe",
  "created_at": "2024-06-04T12:00:00Z",
  "is_active": true
}
```

### Error Responses

| Status | Condition                      | Detail                                  |
| ------ | ------------------------------ | --------------------------------------- |
| 409    | Email already registered       | "A user with this email already exists" |
| 409    | Username already taken         | "A user with this username already exists" |
| 422    | Validation failure             | Pydantic error details                  |

---

## 2. Login (`POST /api/v1/auth/login`)

### Request Body

```json
{
  "email": "user@example.com",
  "password": "mypassword123"
}
```

### Process

1. **Find user** by email in MongoDB.
2. **Verify password** — compare plain text against bcrypt hash.
3. **Generate JWT** with payload:
   ```json
   {
     "sub": "665f1a2b3c4d5e6f7a8b9c0d",
     "iat": 1717502400,
     "exp": 1717588800
   }
   ```
4. **Return** the token.

### Success Response (`200 OK`)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

### Error Responses

| Status | Condition             | Detail                    |
| ------ | --------------------- | ------------------------- |
| 401    | Email not found       | "Invalid email or password" |
| 401    | Password mismatch     | "Invalid email or password" |
| 401    | Account deactivated   | "User account is deactivated" |

> **Security Note:** The error message is intentionally identical for "email not found" and "wrong password" to prevent user enumeration attacks.

---

## 3. Get Current User (`GET /api/v1/auth/me`)

### Headers

```
Authorization: Bearer <access_token>
```

### Process

1. **Extract** the Bearer token from the `Authorization` header.
2. **Decode** the JWT and validate the signature and expiry.
3. **Fetch** the user from MongoDB using the `sub` claim.
4. **Return** the user profile (without `hashed_password`).

### Success Response (`200 OK`)

```json
{
  "user_id": "665f1a2b3c4d5e6f7a8b9c0d",
  "email": "user@example.com",
  "username": "johndoe",
  "created_at": "2024-06-04T12:00:00Z",
  "is_active": true
}
```

### Error Responses

| Status | Condition             | Detail                              |
| ------ | --------------------- | ----------------------------------- |
| 401    | Missing token         | "Not authenticated"                 |
| 401    | Expired token         | "Invalid or expired token"          |
| 401    | Invalid token         | "Invalid or expired token"          |
| 401    | User not found        | "User not found"                    |
| 401    | User deactivated      | "User account is deactivated"       |

---

## Password Hashing Details

| Property       | Value           |
| -------------- | --------------- |
| Algorithm      | bcrypt          |
| Cost Factor    | 12              |
| Library        | passlib[bcrypt] |

Bcrypt with cost 12 means `2^12 = 4096` iterations of the key derivation function, providing strong resistance against brute-force attacks while remaining fast enough for interactive login.

---

## JWT Token Details

| Property       | Value                     |
| -------------- | ------------------------- |
| Algorithm      | HS256 (HMAC-SHA256)       |
| Library        | python-jose[cryptography] |
| Default Expiry | 1440 minutes (24 hours)   |
| Payload Claims | `sub`, `iat`, `exp`       |

### Token Payload Structure

```json
{
  "sub": "665f1a2b3c4d5e6f7a8b9c0d",   // user._id as string
  "iat": 1717502400,                      // issued-at timestamp
  "exp": 1717588800                       // expiration timestamp
}
```

### Security Considerations

1. **Secret Key** — loaded from `JWT_SECRET_KEY` environment variable. Must be changed from the default in production.
2. **HTTPS** — tokens should only be transmitted over TLS in production.
3. **No Refresh Tokens** — current implementation uses single access tokens. Refresh token flow can be added in Phase 2.
4. **No Token Revocation** — tokens are valid until expiry. For immediate revocation, consider adding a token blacklist backed by Redis.

---

## User Document Schema

```json
{
  "_id": ObjectId("665f1a2b3c4d5e6f7a8b9c0d"),
  "email": "user@example.com",
  "username": "johndoe",
  "hashed_password": "$2b$12$...",
  "created_at": ISODate("2024-06-04T12:00:00Z"),
  "is_active": true
}
```

### Database Indexes

| Field      | Type   | Purpose                       |
| ---------- | ------ | ----------------------------- |
| `email`    | Unique | Fast lookup during login      |
| `username` | Unique | Prevent duplicate registrations |

---

## Protected Route Pattern

All protected endpoints use the `get_current_user` dependency:

```python
from app.core.security import get_current_user

@router.get("/protected")
async def protected_route(current_user: dict = Depends(get_current_user)):
    # current_user contains the full user document (minus hashed_password)
    return {"user_id": current_user["_id"]}
```

The dependency chain:

1. `OAuth2PasswordBearer` extracts the token from the `Authorization: Bearer <token>` header.
2. `decode_access_token()` validates the JWT signature and expiry.
3. `get_current_user()` fetches the user from MongoDB and strips `hashed_password`.

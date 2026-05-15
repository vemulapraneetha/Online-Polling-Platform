# Invitation System

This document explains the invitation flow, access control, and edge cases.

---

## Overview

The invitation system enables poll creators to invite specific users to vote on private polls. Invitations are managed by email and tracked by status (`active` or `revoked`).

---

## Invitation Document Schema

```json
{
  "_id": ObjectId("..."),
  "poll_id": ObjectId("..."),
  "inviter_id": ObjectId("..."),
  "invitee_id": ObjectId("..."),
  "status": "active",
  "created_at": ISODate("2024-06-04T12:00:00Z"),
  "revoked_at": null
}
```

### Unique Constraint

A compound unique index on `(poll_id, invitee_id)` ensures one invitation per user per poll at the database level.

---

## Endpoints

### 1. Invite User (`POST /api/v1/polls/{poll_id}/invitations`)

**Auth:** Required (creator only)

#### Request Body

```json
{
  "email": "user@example.com"
}
```

#### Behaviour

1. Verify the authenticated user is the poll creator.
2. Look up the invitee by email.
3. Validate constraints (see below).
4. Create an `active` invitation.
5. If a `revoked` invitation exists for the same user, reactivate it instead of creating a duplicate.

#### Validation Rules

| Rule                          | Error                                          |
| ----------------------------- | ---------------------------------------------- |
| User not found by email       | 404 — "User with this email not found"         |
| Inviting yourself             | 409 — "You cannot invite yourself"             |
| Active invite already exists  | 409 — "An active invitation already exists..." |

#### Response (`200 OK`)

```json
{
  "invitation_id": "...",
  "poll_id": "...",
  "inviter_id": "...",
  "invitee_id": "...",
  "invitee_email": "user@example.com",
  "invitee_username": "johndoe",
  "status": "active",
  "created_at": "2024-06-04T12:00:00Z",
  "revoked_at": null
}
```

---

### 2. Revoke Invitation (`DELETE /api/v1/polls/{poll_id}/invitations/{invitee_id}`)

**Auth:** Required (creator only)

#### Behaviour

- Sets `status = "revoked"` and `revoked_at = now`.
- Does **NOT** delete existing votes from the revoked user.
- The invitee can no longer access the poll (unless it's public).

#### Response (`200 OK`)

Returns the updated invitation object with `status: "revoked"`.

#### Error Responses

| Status | Condition              | Detail                                         |
| ------ | ---------------------- | ---------------------------------------------- |
| 404    | Invitation not found   | "Invitation not found"                         |
| 403    | Not the creator        | "Only the poll creator can revoke invitations" |

---

### 3. List Invitations (`GET /api/v1/polls/{poll_id}/invitations`)

**Auth:** Required (creator only)

#### Response (`200 OK`)

```json
{
  "invitations": [
    {
      "invitation_id": "...",
      "poll_id": "...",
      "inviter_id": "...",
      "invitee_id": "...",
      "invitee_email": "user@example.com",
      "invitee_username": "johndoe",
      "status": "active",
      "created_at": "2024-06-04T12:00:00Z",
      "revoked_at": null
    },
    {
      "invitation_id": "...",
      "poll_id": "...",
      "inviter_id": "...",
      "invitee_id": "...",
      "invitee_email": "jane@example.com",
      "invitee_username": "janedoe",
      "status": "revoked",
      "created_at": "2024-06-03T10:00:00Z",
      "revoked_at": "2024-06-04T08:00:00Z"
    }
  ],
  "total": 2
}
```

---

### 4. Shared Polls (`GET /api/v1/polls/shared`)

**Auth:** Required

Returns polls where the current user has an `active` invitation.

#### Query Parameters

| Param   | Type | Default | Description          |
| ------- | ---- | ------- | -------------------- |
| `page`  | int  | 1       | Page number (≥ 1)   |
| `limit` | int  | 20      | Items per page (1-100) |

#### Response (`200 OK`)

Standard `PollListResponse` shape:

```json
{
  "polls": [ /* PollResponse objects */ ],
  "total": 5,
  "page": 1,
  "limit": 20,
  "pages": 1
}
```

---

## Access Control Flow

```
User requests access to a poll
        │
        ▼
   Is user the creator?
        │
   ┌────┤
   │ YES│  → ✅ Access granted (always)
   │    │
   │ NO │
   │    ▼
   │  Is poll public + open?
   │    │
   │ ┌──┤
   │ │YES│ → ✅ Access granted
   │ │   │
   │ │ NO│
   │ │   ▼
   │ │  Does user have active invitation?
   │ │   │
   │ │ ┌─┤
   │ │ │YES│ → ✅ Access granted
   │ │ │   │
   │ │ │ NO│ → ❌ Access denied (403)
   │ │ └──┘
   │ └────┘
   └──────┘
```

---

## Edge Cases

### Revoking an Invitation After the User Voted

- The user's existing vote is **preserved**.
- The user **cannot** change or withdraw their vote (no access).
- Results still count the revoked user's vote.

### Re-inviting a Revoked User

- If a revoked invitation exists, it is **reactivated** (status → active, revoked_at → null).
- No duplicate invitation is created.

### Inviting to a Draft Poll

- Invitations can be created for polls in any status.
- The invitation becomes useful once the poll is published (opened).

### Self-Invitation

- Blocked at the API level with a `409 Conflict`.
- The creator always has access, so self-invitation is unnecessary.

---

## Database Indexes

| Fields                    | Type           | Purpose                               |
| ------------------------- | -------------- | ------------------------------------- |
| `(poll_id, invitee_id)`   | Compound unique | One invitation per user per poll      |
| `(invitee_id, status)`    | Compound       | Fast lookup for shared polls          |

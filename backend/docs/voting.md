# Voting System

This document explains the voting endpoints, rules, access control, and edge cases.

---

## Overview

Users can vote on open polls they have access to. Votes use an **upsert** pattern — submitting a vote when one already exists replaces the previous selection.

---

## Vote Document Schema

```json
{
  "_id": ObjectId("..."),
  "poll_id": ObjectId("..."),
  "user_id": ObjectId("..."),
  "selected_options": ["opt_1"],
  "voted_at": ISODate("2024-06-04T12:00:00Z"),
  "updated_at": ISODate("2024-06-04T12:05:00Z")
}
```

### Unique Constraint

A compound unique index on `(poll_id, user_id)` ensures one vote per user per poll at the database level.

---

## Endpoints

### 1. Submit / Update Vote (`POST /api/v1/polls/{poll_id}/vote`)

**Auth:** Required (Bearer token)

#### Request Body

```json
{
  "selected_options": ["opt_1"]
}
```

#### Access Rules

The user can vote if **all** of these are true:

1. Poll status is `open`.
2. User has access:
   - Poll is `public`, **OR**
   - User is the poll creator, **OR**
   - User has an `active` invitation.

#### Validation Rules

| Poll Type       | Rule                       |
| --------------- | -------------------------- |
| `single_choice` | Exactly 1 option required  |
| `multi_choice`  | 1 or more options required |

- Every option ID in `selected_options` must exist in the poll's `options` array.

#### Upsert Behaviour

- If the user has **not voted** yet → creates a new vote.
- If the user **has voted** → replaces `selected_options` and updates `updated_at`.
- `voted_at` is only set on initial creation.

#### Response (`200 OK`)

```json
{
  "vote_id": "...",
  "poll_id": "...",
  "user_id": "...",
  "selected_options": ["opt_1"],
  "voted_at": "2024-06-04T12:00:00Z",
  "updated_at": "2024-06-04T12:05:00Z"
}
```

#### Error Responses

| Status | Condition                      | Detail                                          |
| ------ | ------------------------------ | ------------------------------------------------ |
| 404    | Poll not found                 | "Poll not found"                                 |
| 409    | Poll not open                  | "Poll is not open for voting"                    |
| 403    | No access                      | "You do not have access to vote on this poll"    |
| 404    | Invalid option ID              | "Option 'opt_99' not found"                      |
| 409    | Wrong count (single_choice)    | "Single choice polls require exactly 1 option"   |
| 409    | Wrong count (multi_choice)     | "Multi choice polls require at least 1 option"   |

---

### 2. Withdraw Vote (`DELETE /api/v1/polls/{poll_id}/vote`)

**Auth:** Required

#### Behaviour

- Deletes the current user's vote on the specified poll.
- Only allowed when poll is `open`.

#### Response

`204 No Content` (empty body)

#### Error Responses

| Status | Condition        | Detail                                  |
| ------ | ---------------- | --------------------------------------- |
| 404    | Poll not found   | "Poll not found"                        |
| 409    | Poll not open    | "Cannot withdraw vote — poll is not open" |
| 404    | No vote exists   | "Vote not found"                        |

---

### 3. Get My Vote (`GET /api/v1/polls/{poll_id}/my-vote`)

**Auth:** Required

#### Behaviour

Returns the current user's vote on a poll, or an empty response if they haven't voted.

#### Response — Voted (`200 OK`)

```json
{
  "vote_id": "...",
  "poll_id": "...",
  "user_id": "...",
  "selected_options": ["opt_1"],
  "voted_at": "2024-06-04T12:00:00Z",
  "updated_at": "2024-06-04T12:05:00Z",
  "has_voted": true
}
```

#### Response — Not Voted (`200 OK`)

```json
{
  "vote_id": null,
  "poll_id": null,
  "user_id": null,
  "selected_options": null,
  "voted_at": null,
  "updated_at": null,
  "has_voted": false
}
```

---

## Edge Cases

### Changing a Vote

Users can change their vote at any time while the poll is open by calling the submit endpoint again. The previous selection is replaced entirely.

### Voting on a Closed Poll

Attempting to vote on a closed poll returns `409 Conflict`. This applies to both submitting and withdrawing votes.

### Voting on a Draft Poll

Draft polls are not open, so voting returns `409 Conflict`.

### Private Poll Voting

Users must have an `active` invitation to vote on private polls. If the invitation is revoked after voting, the existing vote is **preserved** but the user cannot change or withdraw it.

### Creator Voting

The poll creator **can** vote on their own poll. They always have access regardless of visibility settings.

### Duplicate Option IDs

If the same option ID appears multiple times in `selected_options`, it is accepted but only counted once in results aggregation (because the unwind + group pipeline handles deduplication).

---

## Database Indexes

| Fields                    | Type           | Purpose                               |
| ------------------------- | -------------- | ------------------------------------- |
| `(poll_id, user_id)`      | Compound unique | One vote per user per poll            |
| `poll_id`                 | Standard       | Fast lookup for results aggregation   |

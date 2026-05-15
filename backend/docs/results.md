# Results Aggregation

This document explains the results endpoint, aggregation pipeline, and visibility rules.

---

## Overview

The results endpoint computes real-time vote counts using a MongoDB aggregation pipeline. Results visibility is governed by the poll's `results_visibility` setting.

---

## Endpoint

### `GET /api/v1/polls/{poll_id}/results`

**Auth:** Required (Bearer token)

#### Access Rules

Same as viewing the poll:
- Creator can always access.
- Public + open polls: any authenticated user.
- Private polls: requires active invitation.

---

## Results Visibility Matrix

| `results_visibility` | Creator | Voted User | Non-Voted User | After Poll Closed |
| -------------------- | ------- | ---------- | -------------- | ----------------- |
| `always`             | ✅       | ✅          | ✅              | ✅                 |
| `after_voting`       | ✅       | ✅          | ❌              | ✅ (if voted)      |
| `creator_only`       | ✅       | ❌          | ❌              | ✅ (all users)     |

### Detailed Rules

#### `always`
- Results are visible to **anyone** with poll access.
- No restrictions.

#### `after_voting`
- Results are visible only if the user **has voted** on the poll.
- The **creator** can always see results (even without voting).
- After the poll is closed, the same rule applies.

#### `creator_only`
- Only the **creator** can see results while the poll is open.
- Once the poll is **closed**, results become visible to **all users** with access.

---

## Aggregation Pipeline

The results are computed using a MongoDB aggregation pipeline on the `votes` collection:

```
Pipeline Steps:
1. $match    → filter votes for the specific poll_id
2. $unwind   → flatten selected_options array
3. $group    → group by option_id, count votes
4. Merge     → combine with poll.options to include labels
5. Calculate → percentage = (count / total_voters) × 100
```

### Step-by-Step

```javascript
// Step 1: Match votes for this poll
{ $match: { poll_id: ObjectId("...") } }

// Step 2: Unwind selected_options
{ $unwind: "$selected_options" }

// Step 3: Group by option ID and count
{
  $group: {
    _id: "$selected_options",
    count: { $sum: 1 }
  }
}
```

### Total Respondents

A separate pipeline counts unique voters:

```javascript
[
  { $match: { poll_id: ObjectId("...") } },
  { $group: { _id: null, total: { $sum: 1 } } }
]
```

### Percentage Calculation

```
percentage = (option_votes / total_respondents) × 100
```

- Rounded to 1 decimal place.
- For `multi_choice` polls, percentages can exceed 100% in total because each voter can select multiple options.
- `total_respondents` counts **unique voters**, not total vote selections.

---

## Response Shape

```json
{
  "poll_id": "...",
  "poll_status": "open",
  "total_respondents": 42,
  "options": [
    {
      "id": "opt_1",
      "label": "Python",
      "votes": 30,
      "percentage": 71.4
    },
    {
      "id": "opt_2",
      "label": "TypeScript",
      "votes": 12,
      "percentage": 28.6
    }
  ],
  "user_has_voted": true,
  "results_visible": true
}
```

### When `results_visible` is `false`

The response still returns, but with zeroed-out vote data:

```json
{
  "poll_id": "...",
  "poll_status": "open",
  "total_respondents": 0,
  "options": [
    { "id": "opt_1", "label": "Python", "votes": 0, "percentage": 0.0 },
    { "id": "opt_2", "label": "TypeScript", "votes": 0, "percentage": 0.0 }
  ],
  "user_has_voted": false,
  "results_visible": false
}
```

This lets the frontend display the poll options without revealing any vote data.

---

## Error Responses

| Status | Condition                   | Detail                               |
| ------ | --------------------------- | ------------------------------------ |
| 404    | Poll not found              | "Poll not found"                     |
| 403    | No access                   | "You do not have access to this poll" |

---

## Performance Notes

- The aggregation pipeline runs on the `votes` collection, which has an index on `poll_id`.
- For polls with very large numbers of votes (10k+), consider caching results.
- The compound unique index `(poll_id, user_id)` ensures data integrity.

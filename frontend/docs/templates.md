# Use Existing Poll as Template

The "Use Existing Poll as Template" feature allows users to quickly duplicate one of their previous polls to create a new draft.

## Flow

1. On the **Create Poll** page, the user can click **Use Existing Poll**.
2. A modal opens listing their previous open or closed polls.
3. The user selects a poll to use as a template.
4. The system creates a duplicate of that poll with the same options, title (prepended with "Copy of "), and settings.
5. The new poll is saved as a Draft, and the user is navigated to the poll details page where they can edit or publish it.

## Backend Endpoints

### 1. `GET /api/v1/polls/templates`
Returns a paginated list of the current user's polls that are either open or closed.
Response format:
```json
{
  "items": [...],
  "total": 10,
  "page": 1,
  "limit": 20,
  "has_next": false
}
```

### 2. `POST /api/v1/polls/:id/duplicate`
Creates a new draft poll by copying the provided poll's structure. Only the creator can perform this action.
Copies:
- `title` (prepended with "Copy of ")
- `description`
- `poll_type`
- `visibility`
- `options`
- `results_visibility`
- `expires_at`

Resets:
- `status` -> "draft"
- `created_at` -> now
- `updated_at` -> now
- `published_at` -> null
- `closed_at` -> null

## Frontend Components

### `TemplateSelectorModal.tsx`
A modal that fetches the user's templates and provides a search filter to easily locate a past poll. Clicking "Use Template" triggers the duplicate mutation.

### `useTemplates.ts`
Contains the React Query hooks for fetching templates (`useTemplates`) and mutating (`useDuplicatePoll`).

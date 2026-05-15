# Pages Documentation

## Auth Pages
- `/login`: User authentication with email/password.
- `/register`: User registration with username, email, and password confirmation.

## Poll Pages
- `/feed`: Public polls feed. Supports pagination, sorting, and filtering by poll type.
- `/my-polls`: Dashboard for the user's created polls. Grouped by Draft, Open, and Closed statuses.
- `/shared`: Private polls the user has been invited to.
- `/polls/create`: Form to scaffold a new poll (saved as a draft initially).
- `/polls/:id`: Comprehensive poll detail view handling multiple states:
  - Draft (Creator): Edit form, publish, and delete actions.
  - Open (Voter): Vote submission form.
  - Open (Voted): Vote status and withdrawal.
  - Open (Creator): View current status and close poll action.
  - Closed: Final results display.

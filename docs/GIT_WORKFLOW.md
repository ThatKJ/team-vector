# Git Workflow

## Branching Strategy
- `main`: The stable branch. Must always be deployable. Never commit directly to `main`.
- `dev`: The active development integration branch.
- `feature/frontend`: Frontend feature development (Owned by Kirtan).
- `feature/backend`: Backend API, Supabase, AI Engine (Owned by Ayaan).
- `feature/integration`: Dedicated branch for wiring the frontend and backend together and E2E testing.

## Workflow Rules
1. **Never** force push to `main` or `dev`.
2. **Never** rewrite history, amend commits, or squash without approval.
3. Keep commit history clean and truthful.

## Pipeline
`feature/frontend` & `feature/backend` -> Merge into `dev`.
`dev` -> Integration testing in `feature/integration`.
`feature/integration` -> Merge back into `dev` -> Release to `main`.

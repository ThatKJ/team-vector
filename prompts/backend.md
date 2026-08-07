# ⚙️ Backend Prompts

> **Purpose**: Templates for using AI to build API routes, database operations, and server-side logic.  
> **When to use**: When creating API endpoints, database schemas, authentication, or server-side integrations.

---

## Prompt Templates

### 1. API Route Creation

```
Create an API route for [endpoint purpose].

Route: [METHOD] /api/[path]

Request:
- Headers: [required headers]
- Body: [JSON schema or TypeScript type]
- Query params: [if applicable]

Response:
- Success (200): [JSON schema]
- Error (400): [validation error format]
- Error (401): [auth error format]
- Error (500): [server error format]

Business logic:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Requirements:
- Input validation (use zod or similar)
- Error handling with meaningful messages
- TypeScript types for request/response
- Rate limiting (if applicable)
- Auth check (if applicable)
```

### 2. Database Schema Design

```
Design a database schema for [feature/entity].

Entities:
- [Entity 1]: [fields and relationships]
- [Entity 2]: [fields and relationships]

Requirements:
- [constraint 1]
- [constraint 2]
- [indexing needs]

Technology: [Prisma / Supabase / Firebase]

Please provide:
1. Schema definition (in the appropriate format)
2. Migration strategy
3. Seed data for demo
4. TypeScript types
5. Common queries we'll need
```

### 3. AI Integration Endpoint

```
Create an API endpoint that integrates with [AI provider].

Purpose: [what the AI should do]

Input: [what the user provides]
Output: [what the AI should return]

System prompt: [the AI's role and instructions]

Requirements:
- Stream response (if applicable)
- Token usage tracking
- Error handling for API failures
- Rate limiting
- Response validation
- Timeout handling (max 30s)

Memory integration:
- Should this interaction be stored in Breeth? [yes/no/conditionally]
- If yes, what should be stored?
```

### 4. Authentication Setup

```
Set up authentication for the application.

Provider: [Supabase Auth / NextAuth / Custom]

Methods:
- [Email/password]
- [OAuth - Google, GitHub, etc.]
- [Magic link]

Requirements:
- Protected routes: [list routes that need auth]
- Public routes: [list public routes]
- Session management: [strategy]
- Token refresh: [strategy]
- User profile data: [what to store]

Provide:
1. Auth configuration
2. Middleware for route protection
3. Client-side auth hooks
4. Server-side auth helpers
5. TypeScript types for user/session
```

---

## Error Handling Pattern

All API routes should follow this error handling pattern:

```typescript
// Standard error response shape
interface ApiError {
  error: {
    code: string;        // Machine-readable error code
    message: string;     // Human-readable error message
    details?: unknown;   // Optional additional context
  };
}

// Standard success response shape
interface ApiSuccess<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}
```

---

## API Design Principles

1. **RESTful conventions** — Use proper HTTP methods and status codes
2. **Validate everything** — Never trust client input
3. **Fail gracefully** — Meaningful error messages, never expose stack traces
4. **Type everything** — Request and response types in TypeScript
5. **Log meaningfully** — Log errors with context, not just the message
6. **Timeout protection** — External API calls must have timeouts
7. **Idempotency** — POST/PUT operations should be safe to retry

---

## Best Practices

- Always validate input with a schema validator (zod recommended)
- Return consistent error shapes across all endpoints
- Use middleware for cross-cutting concerns (auth, logging, CORS)
- Keep route handlers thin — extract business logic to service functions
- Type your API contracts — share types between client and server

---

*Last updated: 2026-08-07T03:54:00+05:30*

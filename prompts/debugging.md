# 🐛 Debugging Prompts

> **Purpose**: Templates for using AI to diagnose and fix bugs efficiently.  
> **When to use**: When encountering errors, unexpected behavior, or performance issues.

---

## Prompt Templates

### 1. Error Diagnosis

```
I'm encountering an error in our hackathon project.

Error message:
```
[paste the full error message / stack trace]
```

Context:
- File: [path/to/file]
- Line: [line number if known]
- Action that triggered it: [what the user did]
- Expected behavior: [what should happen]
- Actual behavior: [what actually happens]
- Recent changes: [what was changed before this broke]

Environment:
- Node version: [version]
- Framework: [Next.js / React / etc.]
- Browser: [if frontend]
- OS: [macOS / Windows / Linux]

Please:
1. Diagnose the root cause
2. Explain why this is happening
3. Provide a fix
4. Suggest how to prevent this in the future
```

### 2. UI/Visual Bug

```
There's a visual issue with [component/page].

Description:
- Expected: [what it should look like]
- Actual: [what it looks like]
- Screenshot: [if available]

Reproduction:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Affected breakpoints: [mobile / tablet / desktop / all]
Affected browsers: [Chrome / Firefox / Safari / all]

Relevant CSS/component file: [path]

Please diagnose and fix, ensuring the fix doesn't break other components.
```

### 3. Performance Issue

```
The application is experiencing [slowness / jank / memory issues].

Symptoms:
- [What's slow or janky]
- [When it occurs — on load, on interaction, over time]
- [Severity — minor lag vs. unusable]

Measurements (if available):
- LCP: [value]
- FID: [value]
- Bundle size: [value]
- Network requests: [number and size]

Suspected areas:
- [Component or file you think might be the cause]

Please:
1. Identify the performance bottleneck
2. Explain the root cause
3. Provide an optimized solution
4. Estimate the improvement
```

### 4. Integration Bug

```
[External service / API] is not working as expected.

Service: [Breeth / Supabase / OpenAI / etc.]
Endpoint: [URL or method]

Request:
```json
[request payload]
```

Expected response:
```json
[expected response]
```

Actual response:
```json
[actual response or error]
```

Auth: [How auth is configured]
Environment variables: [Are they set? Don't share actual values]

Please diagnose and fix. Check:
1. Auth configuration
2. Request format
3. API version compatibility
4. Rate limiting
5. Network connectivity
```

---

## Debugging Workflow

Follow this order when debugging:

```
1. Reproduce the bug reliably
    │
    ▼
2. Read the error message carefully
    │
    ▼
3. Check recent changes (git diff)
    │
    ▼
4. Isolate the problem (binary search through code)
    │
    ▼
5. Fix the root cause (not the symptom)
    │
    ▼
6. Verify the fix doesn't break other things
    │
    ▼
7. Add error handling to prevent recurrence
    │
    ▼
8. Log the bug in TASKS.md if it reveals a systemic issue
```

---

## Common Hackathon Bugs

| Bug Type | Likely Cause | Quick Fix |
|---|---|---|
| "Cannot read property of undefined" | Missing null check or async timing | Optional chaining (`?.`) |
| CORS error | API route not configured | Add CORS headers or use same-origin API |
| Hydration mismatch | Server/client render different HTML | Use `useEffect` for client-only code |
| 404 on API route | Wrong path or method | Check route file location and HTTP method |
| Env variable undefined | Not prefixed with `NEXT_PUBLIC_` | Add prefix for client-side vars |
| Build fails but dev works | Stricter type checking in build | Fix TypeScript errors |
| State not updating | Object mutation instead of new reference | Use spread operator or `structuredClone` |
| Infinite re-render | Missing dependency array in `useEffect` | Add proper deps or `useCallback` |

---

## Best Practices

1. **Read the error first** — 80% of bugs are explained by the error message
2. **Reproduce reliably** — If you can't reproduce it, you can't fix it
3. **Fix the root cause** — Suppressing errors with try/catch is a band-aid
4. **Don't debug in production** — Use dev mode with source maps
5. **Time-box debugging** — If stuck for 15+ minutes, ask for help or pivot
6. **Log the fix** — Update `TASKS.md` so the bug is tracked

---

*Last updated: 2026-08-07T03:54:00+05:30*

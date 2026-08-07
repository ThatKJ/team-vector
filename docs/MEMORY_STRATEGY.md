# 🧠 Memory Strategy

> **Purpose**: Document how and when persistent AI memory (Breeth) should be used in this project.  
> **When to update**: When memory features are added, the product idea changes, or privacy requirements evolve.

---

## Key Distinction

| Concept | Purpose | Example | Tool |
|---|---|---|---|
| **Application State** | Current UI state | Selected tab, form inputs | React state |
| **Database** | Persistent structured data | User profiles, content | Supabase / Firebase |
| **AI Memory (Breeth)** | Persistent AI context | User preferences, conversation history | Breeth API |

> ⚠️ **Never confuse these three.** Breeth is specifically for making AI interactions smarter over time, not for replacing a database or state management.

---

## When to Use Breeth

Use Breeth **only** when memory genuinely improves the user experience:

### ✅ Good Use Cases

| Use Case | What to Remember | Why It Helps |
|---|---|---|
| User preferences | Tone, style, complexity level | AI responses feel personalized |
| Conversation context | Key topics from past sessions | User doesn't repeat themselves |
| Learning patterns | What the user struggled with | Adaptive difficulty / guidance |
| Feedback loops | What the user liked/disliked | Better recommendations over time |

### ❌ Bad Use Cases (Do Not Use Breeth For)

| Anti-Pattern | Why It's Wrong | Use Instead |
|---|---|---|
| Storing user profiles | That's a database concern | Database |
| Caching API responses | That's an infrastructure concern | Cache layer |
| Storing form data | That's application state | React state |
| Session management | That's auth infrastructure | Auth provider |
| Analytics | That's a data pipeline concern | Analytics service |

---

## Memory Types

| Type | Description | Retention | Example |
|---|---|---|---|
| **Episodic** | Specific interactions or events | Session or short-term | "User asked about X in the last conversation" |
| **Semantic** | General knowledge about the user | Long-term | "User prefers concise explanations" |
| **Procedural** | How to do things for this user | Long-term | "When generating code, use TypeScript" |

---

## Retrieval Strategy

```
User Input
    │
    ▼
[Relevance Check] ─── Is past memory relevant to this query?
    │
    ├── YES ──▶ [Breeth Retrieve] ─── Fetch relevant memories
    │                                      │
    │                                      ▼
    │                              [Context Builder] ─── Inject into AI prompt
    │
    └── NO ───▶ [Skip Memory] ─── Process without memory context
```

**Retrieval rules**:
- Only retrieve memories relevant to the current interaction
- Limit context injection to avoid token bloat
- Prioritize recent and high-relevance memories
- Never retrieve memories that could be stale or contradictory

---

## Storage Strategy

```
AI Response Generated
    │
    ▼
[Memory Evaluator] ─── Should this be remembered?
    │
    ├── YES ──▶ [Classify] ─── Episodic / Semantic / Procedural
    │               │
    │               ▼
    │          [Breeth Store] ─── Save with metadata
    │
    └── NO ───▶ [Discard] ─── Don't store
```

**Storage rules**:
- Only store information that will be useful in future interactions
- Never store sensitive data (passwords, API keys, PII)
- Tag memories with type, timestamp, and relevance score
- Set TTL (time-to-live) for episodic memories

---

## Privacy Considerations

| Principle | Implementation |
|---|---|
| **Minimal storage** | Only store what's genuinely needed |
| **No PII** | Never store names, emails, addresses unless consented |
| **User control** | Users can view and delete their memories |
| **Transparency** | Show users what the AI "remembers" about them |
| **Data isolation** | User memories are never shared between users |
| **Secure transmission** | All Breeth API calls over HTTPS |

---

## Context Management

### Token Budget

AI prompts have limited context windows. Memory must be managed carefully:

| Component | Token Budget | Priority |
|---|---|---|
| System prompt | 500 tokens | Fixed |
| User input | Variable | Required |
| Memory context | 300-500 tokens | Optional |
| Conversation history | Remaining | Fill |

### Context Window Strategy

1. **Summarize** long memories into concise snippets
2. **Rank** memories by relevance to current query
3. **Truncate** low-priority memories first
4. **Never** let memory context exceed 30% of total prompt

---

## Memory Lifecycle

```
Create ──▶ Active ──▶ Stale ──▶ Archive ──▶ Delete
  │           │          │          │
  │           │          │          └── After TTL expires
  │           │          └── No access for 30 days
  │           └── Regularly accessed
  └── New memory stored
```

---

## When NOT to Store Memory

- ❌ Trivial or one-off interactions ("What's 2+2?")
- ❌ Information already in the database
- ❌ Temporary UI state
- ❌ System errors or debug information
- ❌ Sensitive personal information
- ❌ Information the user explicitly asks to forget
- ❌ Duplicate of an existing memory

---

## Integration Decision

**Current status**: Evaluating whether Breeth is appropriate for this project.

**Decision criteria**:
1. Does the product involve repeat user interactions? → Memory adds value
2. Is personalization a core feature? → Memory adds value
3. Is the product a one-shot tool? → Memory may not be needed
4. Does the AI component benefit from context? → Memory adds value

> **Recommendation**: Only integrate Breeth if it genuinely improves the user experience. Never force it. Judges will notice forced sponsor integration.

---

*Last updated: 2026-08-07T03:54:00+05:30*

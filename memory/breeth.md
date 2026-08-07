# 🌬️ Breeth Integration Guide

> **Purpose**: Technical guide for integrating Breeth as the AI memory layer.  
> **When to update**: When Breeth API changes, integration patterns evolve, or new features are added.

---

## What is Breeth?

Breeth is a sponsor-provided AI memory service for ViCodathon 2026. It enables persistent, contextual memory for AI-powered applications — allowing your AI to remember past interactions and personalize future ones.

---

## Integration Status

| Aspect | Status |
|---|---|
| **Decision** | 🟡 Evaluating — integrate only if it genuinely improves UX |
| **SDK Installed** | ⏳ Not yet |
| **API Key Configured** | ⏳ Not yet |
| **Memory Read Implemented** | ⏳ Not yet |
| **Memory Write Implemented** | ⏳ Not yet |
| **Privacy Controls** | ⏳ Not yet |
| **Demo-Ready** | ⏳ Not yet |

---

## When to Integrate Breeth

### ✅ Integrate If

- The product involves **repeat user interactions** (chat, learning, personalization)
- AI responses benefit from **knowing user history** or **preferences**
- The product has a **personalization** component
- Memory adds a **"wow" moment** in the demo

### ❌ Skip If

- The product is a **one-shot tool** (use once, get result)
- All context fits in a **single conversation**
- Memory would feel **forced or unnecessary**
- Time is too short to integrate meaningfully

---

## API Reference (Placeholder)

*Update this section with actual Breeth API documentation when available.*

### Authentication

```typescript
// Initialize Breeth client
import { BreethClient } from '@breeth/sdk';  // or API URL

const breeth = new BreethClient({
  apiKey: process.env.BREETH_API_KEY,
  projectId: process.env.BREETH_PROJECT_ID,
});
```

### Store a Memory

```typescript
await breeth.memories.create({
  userId: 'user_001',
  content: 'User prefers concise responses in bullet-point format.',
  type: 'preference',
  metadata: {
    source: 'ai_inferred',
    importance: 0.8,
    tags: ['style', 'formatting'],
  },
});
```

### Retrieve Memories

```typescript
const memories = await breeth.memories.search({
  userId: 'user_001',
  query: 'response style preferences',
  limit: 5,
  minRelevance: 0.6,
});

// Returns: Array of relevant memories ranked by relevance
```

### Delete a Memory

```typescript
await breeth.memories.delete({
  memoryId: 'mem_abc123',
  userId: 'user_001', // Required for authorization
});
```

### List User Memories

```typescript
const allMemories = await breeth.memories.list({
  userId: 'user_001',
  type: 'preference', // Optional filter
  limit: 20,
  offset: 0,
});
```

---

## Integration Architecture

```
Application
    │
    ├── src/services/memory.ts    ← Memory service wrapper
    │       │
    │       ├── storeMemory()     ← Create new memories
    │       ├── retrieveMemories()← Search relevant memories
    │       ├── deleteMemory()    ← Remove specific memories
    │       └── listMemories()    ← List all user memories
    │
    ├── src/services/ai.ts        ← AI service (uses memory)
    │       │
    │       └── generateResponse()
    │            ├── 1. Retrieve relevant memories
    │            ├── 2. Build prompt with memory context
    │            ├── 3. Call AI API
    │            ├── 4. Evaluate if response should be stored
    │            └── 5. Store memory if appropriate
    │
    └── src/components/MemoryPanel.tsx ← (Optional) Show users their memories
```

---

## Environment Variables

```bash
# .env.local
BREETH_API_KEY=your_api_key_here       # Server-side only
BREETH_PROJECT_ID=your_project_id      # Server-side only

# IMPORTANT: Never expose Breeth credentials to the client
# All Breeth calls must go through server-side API routes
```

---

## Error Handling

```typescript
import { BreethError } from '@breeth/sdk';

try {
  const memories = await breeth.memories.search({ ... });
} catch (error) {
  if (error instanceof BreethError) {
    switch (error.code) {
      case 'RATE_LIMIT':
        // Back off and retry
        break;
      case 'NOT_FOUND':
        // Memory doesn't exist, proceed without it
        break;
      case 'UNAUTHORIZED':
        // API key issue — log and alert
        console.error('Breeth auth failed:', error.message);
        break;
      default:
        // Unknown error — proceed without memory
        console.error('Breeth error:', error);
    }
  }
  
  // IMPORTANT: Never let Breeth failures crash the app
  // Gracefully degrade — the product should work without memory
  return { memories: [], fallback: true };
}
```

---

## Testing Strategy

| Test Type | What to Test |
|---|---|
| Unit tests | Memory service functions with mocked Breeth API |
| Integration tests | End-to-end memory storage and retrieval |
| Fallback tests | App works correctly when Breeth is unavailable |
| Privacy tests | PII is never stored, user deletion works |
| Performance tests | Memory retrieval doesn't add > 500ms latency |

---

## Privacy & Compliance Checklist

- [ ] No PII stored in memories (names, emails, addresses)
- [ ] Users can view their stored memories
- [ ] Users can delete individual memories
- [ ] Users can delete all their memories
- [ ] Breeth API key is server-side only
- [ ] Memory content is sanitized before storage
- [ ] TTL is set for episodic memories

---

*Last updated: 2026-08-07T03:54:00+05:30*

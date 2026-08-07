# 🗄️ Memory Schema

> **Purpose**: Define the data structures and schemas for the memory layer (Breeth or alternative).  
> **When to update**: When memory types are added, fields change, or storage strategy evolves.

---

## Overview

The memory schema defines how persistent AI memories are structured, stored, and retrieved. This is separate from the application database — memories are specifically for making AI interactions smarter over time.

---

## Memory Entry Schema

```typescript
interface MemoryEntry {
  // Identity
  id: string;                    // Unique memory identifier (UUID)
  type: MemoryType;              // Category of memory
  
  // Content
  content: string;               // The actual memory content
  summary: string;               // Brief summary for retrieval ranking
  
  // Context
  userId: string;                // Who this memory belongs to
  sessionId: string;             // Which session created this memory
  source: MemorySource;          // What generated this memory
  
  // Metadata
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  expiresAt?: string;            // Optional TTL for episodic memories
  
  // Relevance
  importance: number;            // 0.0 - 1.0 relevance score
  accessCount: number;           // How many times this was retrieved
  lastAccessedAt?: string;       // When this was last used
  
  // Tags
  tags: string[];                // Searchable tags for retrieval
  relatedMemories?: string[];    // Links to related memory IDs
}
```

---

## Memory Types

```typescript
enum MemoryType {
  EPISODIC = 'episodic',        // Specific events or interactions
  SEMANTIC = 'semantic',        // General knowledge about the user
  PROCEDURAL = 'procedural',   // How to do things for this user
  PREFERENCE = 'preference',   // User preferences and settings
  FEEDBACK = 'feedback',       // User feedback on AI responses
}
```

| Type | Retention | Example |
|---|---|---|
| `episodic` | Session or 7 days | "User asked about React hooks on Aug 7" |
| `semantic` | Long-term | "User is an intermediate developer" |
| `procedural` | Long-term | "When writing code, user prefers detailed comments" |
| `preference` | Long-term | "User prefers dark mode and concise answers" |
| `feedback` | 30 days | "User said the last response was too verbose" |

---

## Memory Source

```typescript
enum MemorySource {
  USER_EXPLICIT = 'user_explicit',       // User explicitly asked to remember
  AI_INFERRED = 'ai_inferred',          // AI detected something worth remembering
  SYSTEM_GENERATED = 'system_generated', // System event (login, config change)
  FEEDBACK = 'feedback',                 // From user feedback on AI responses
}
```

---

## Storage Operations

### Create Memory

```typescript
interface CreateMemoryRequest {
  type: MemoryType;
  content: string;
  summary: string;
  userId: string;
  sessionId: string;
  source: MemorySource;
  importance: number;
  tags: string[];
  expiresAt?: string;
}
```

### Retrieve Memories

```typescript
interface RetrieveMemoriesRequest {
  userId: string;
  query: string;              // Semantic search query
  types?: MemoryType[];       // Filter by memory type
  tags?: string[];            // Filter by tags
  minImportance?: number;     // Minimum relevance score
  limit?: number;             // Max results (default: 5)
  includeExpired?: boolean;   // Include expired memories (default: false)
}

interface RetrieveMemoriesResponse {
  memories: MemoryEntry[];
  totalCount: number;
  queryRelevanceScores: number[];  // How relevant each result is to the query
}
```

### Update Memory

```typescript
interface UpdateMemoryRequest {
  id: string;
  content?: string;
  summary?: string;
  importance?: number;
  tags?: string[];
  expiresAt?: string;
}
```

### Delete Memory

```typescript
interface DeleteMemoryRequest {
  id: string;
  userId: string;  // Required for authorization
}
```

---

## Indexing Strategy

| Field | Indexed | Purpose |
|---|---|---|
| `id` | Primary key | Direct lookups |
| `userId` | Yes | User isolation |
| `type` | Yes | Filter by category |
| `tags` | Yes | Tag-based search |
| `importance` | Yes | Relevance ranking |
| `createdAt` | Yes | Chronological queries |
| `expiresAt` | Yes | TTL cleanup |
| `content` | Full-text / Vector | Semantic search |

---

## Validation Rules

| Field | Rule |
|---|---|
| `content` | Max 2000 characters. Must not contain PII. |
| `summary` | Max 200 characters. |
| `importance` | Between 0.0 and 1.0. |
| `tags` | Max 10 tags per memory. Each tag max 50 chars. |
| `expiresAt` | Must be in the future. |

---

## Example Memories

```json
{
  "id": "mem_abc123",
  "type": "preference",
  "content": "User prefers responses in bullet-point format rather than paragraphs. They value conciseness over completeness.",
  "summary": "Prefers bullet points, concise style",
  "userId": "user_001",
  "sessionId": "sess_xyz789",
  "source": "ai_inferred",
  "createdAt": "2026-08-07T04:00:00+05:30",
  "updatedAt": "2026-08-07T04:00:00+05:30",
  "importance": 0.8,
  "accessCount": 0,
  "tags": ["style", "formatting", "preference"]
}
```

---

*Last updated: 2026-08-07T03:54:00+05:30*

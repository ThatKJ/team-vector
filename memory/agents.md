# 🤖 Agent Memory Documentation

> **Purpose**: Document how AI agents in the product use memory to improve interactions.  
> **When to update**: When agent behavior changes, new agents are added, or memory usage patterns evolve.

---

## Overview

"Agents" in this context refers to the AI-powered components of our product — not the development AI. These are the in-product AI features that interact with users.

---

## Agent Architecture

```
User
  │
  ▼
[Agent Router] ─── Determines which agent handles the request
  │
  ├──▶ [Agent A] ─── Primary feature agent
  ├──▶ [Agent B] ─── Secondary feature agent
  └──▶ [Fallback] ─── General-purpose handler
  │
  ▼
[Memory Layer] ─── Reads/writes context for future interactions
```

---

## Agent Definitions

### Agent Template

```markdown
### [Agent Name]

| Property | Value |
|---|---|
| **Purpose** | What this agent does |
| **Trigger** | When this agent is activated |
| **Input** | What data it receives |
| **Output** | What it produces |
| **Memory Usage** | What it reads/writes to memory |

**System Prompt**:
> [The system prompt for this agent]

**Memory Read Pattern**:
- Reads: [what memories it retrieves before responding]
- Filter: [how it filters relevant memories]

**Memory Write Pattern**:
- Stores: [what it saves after responding]
- Conditions: [when it decides to store vs. discard]
```

---

## Agent Memory Integration

### Pre-Response Flow

```
User Input Received
    │
    ▼
[Identify Agent] ─── Route to correct agent
    │
    ▼
[Retrieve Memories] ─── Query Breeth for relevant context
    │                    Filter by: userId, type, relevance
    │
    ▼
[Build Prompt]
    ├── System prompt (fixed)
    ├── Memory context (dynamic, max 500 tokens)
    ├── Conversation history (recent)
    └── User input (current)
    │
    ▼
[Generate Response] ─── Call AI API
```

### Post-Response Flow

```
AI Response Generated
    │
    ▼
[Evaluate Memory Value]
    │
    ├── Worth remembering? ──▶ [Store in Breeth]
    │                           ├── Classify type
    │                           ├── Set importance
    │                           └── Tag appropriately
    │
    └── Not worth remembering ──▶ [Discard]
    │
    ▼
[Return Response to User]
```

---

## Memory-Aware Prompting

When building prompts with memory context, follow this structure:

```
[System Prompt — Who the agent is and how to behave]

[Memory Context — What you know about this user]
You have the following context about this user:
- {memory_1_summary}
- {memory_2_summary}
- {memory_3_summary}

Use this context to personalize your response, but don't reference
it explicitly unless relevant.

[Conversation History — Recent messages]

[User Input — Current request]
```

---

## Agent Guidelines

### Do
- ✅ Use memory to personalize tone and content
- ✅ Remember user corrections and apply them
- ✅ Build on past interactions naturally
- ✅ Forget when the user asks to forget
- ✅ Be transparent about what you remember

### Don't
- ❌ Over-reference past interactions (feels creepy)
- ❌ Store sensitive information
- ❌ Let stale memories override current input
- ❌ Retrieve memories that aren't relevant
- ❌ Exceed the token budget for memory context

---

## Agent Performance Metrics

Track these to measure agent quality:

| Metric | Measurement | Target |
|---|---|---|
| Response relevance | User feedback / ratings | > 4/5 |
| Memory hit rate | % of retrievals that were useful | > 70% |
| Response latency | Time from input to response | < 3s |
| Memory storage rate | % of interactions that create memories | 10-30% |
| User satisfaction | Survey or implicit signals | > 80% |

---

## Configuration

Agents should be configurable through environment variables or a config file:

```typescript
interface AgentConfig {
  name: string;
  systemPrompt: string;
  model: string;                     // e.g., "gpt-4", "gemini-pro"
  temperature: number;               // 0.0 - 1.0
  maxTokens: number;                 // Response length limit
  memoryEnabled: boolean;            // Use Breeth for this agent?
  memoryRetrievalLimit: number;      // Max memories to inject
  memoryTokenBudget: number;         // Max tokens for memory context
}
```

---

*Last updated: 2026-08-07T03:54:00+05:30*

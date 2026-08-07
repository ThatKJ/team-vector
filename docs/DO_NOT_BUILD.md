# 🚫 Do Not Build — The Scope Firewall

> **Purpose**: Explicitly list things we will NOT build. Prevents feature creep, saves hours, and keeps focus.  
> **When to update**: When someone suggests a feature that doesn't belong. Add it here and move on.  
> **Rule**: If it's on this list, the answer is NO. No discussion. No "but what if." NO.

---

## The Philosophy

> In a 48-hour hackathon, every feature you don't build gives you 2-4 hours to make the features you do build excellent. **Saying no is a superpower.**

---

## 🚫 Never Build These

### Infrastructure Features (0 judge impact)

| Feature | Why Not |
|---|---|
| **Notifications system** | Complex, invisible to judges, massive time sink |
| **User profiles / settings page** | Not demo-worthy, doesn't improve any judging criteria |
| **Settings page** | No judge has ever been impressed by a settings page |
| **Analytics dashboard** | You're building a product, not a BI tool |
| **Complex permissions / RBAC** | Overkill for a demo — hardcode the demo user |
| **Admin panel** | Unless your product IS an admin panel, skip it |
| **Email system** | No transactional emails, no newsletters, no verification emails |
| **File upload** | Unless it's the core feature — drag-and-drop file handling is a time pit |
| **Payment processing** | Absolutely not. Stripe integration is a 4-hour rabbit hole |

### Social Features (scope bombs)

| Feature | Why Not |
|---|---|
| **Chat / messaging** | Unless your product IS chat. Real-time messaging is deceptively complex |
| **Social feeds** | Activity feeds, likes, comments — all scope explosions |
| **User-to-user interactions** | Following, friending, inviting — not in 48 hours |
| **Content moderation** | You don't have time to build trust & safety |

### Technical Over-Engineering (no ROI)

| Feature | Why Not |
|---|---|
| **Internationalization (i18n)** | Your judges speak English. Ship in one language. |
| **Offline support / PWA** | Cool but invisible in a demo |
| **WebSocket real-time sync** | Unless real-time is the core feature |
| **Complex caching layers** | Premature optimization |
| **Database migrations system** | Just use the ORM's built-in tooling |
| **CI/CD pipeline** | Deploy manually. It's 48 hours. |
| **Comprehensive test suite** | Write tests for critical paths only |
| **Microservices** | Monolith. Always monolith. For a hackathon. Always. |
| **GraphQL** | REST is fine. GraphQL adds complexity for zero judge impact. |
| **Custom auth system** | Use Supabase Auth, NextAuth, or Clerk. Don't roll your own. |

### Design Traps (diminishing returns)

| Feature | Why Not |
|---|---|
| **Dark mode toggle** | Pick ONE theme and make it beautiful. Don't build a toggle. |
| **Theme customization** | You're shipping a product, not a theme engine |
| **Complex onboarding flow** | One screen max. Get to the value fast. |
| **404 / 500 custom pages** | Nice but not worth the time. Default is fine. |
| **Cookie consent banner** | Not shipping to production users. Skip it. |

---

## ⚠️ Build Only If Core to Product

These are features that are sometimes necessary but often scope traps:

| Feature | Build If... | Skip If... |
|---|---|---|
| **Authentication** | Users need accounts for the product to work | It's a single-user tool or demo |
| **Database** | Data needs to persist between sessions | Everything can live in memory / local storage |
| **Search** | It's a core user action | It's a "nice to have" on a list page |
| **Filtering / sorting** | The dataset is large enough to need it | You have < 20 items |
| **Multiple pages** | Each page serves a distinct purpose | One page with sections works fine |

---

## The Scope Creep Test

Before adding ANY feature, answer these three questions:

```
1. Will a judge notice this feature during a 5-minute demo?
   → NO → Don't build it.

2. Does this feature improve a specific judging criterion?
   → NO → Don't build it.

3. Can we achieve the same impact with a simpler approach?
   → YES → Build the simpler version.
```

---

## What to Do Instead

Time not spent on unnecessary features should be spent on:

| Instead of Building... | Spend Time On... | Judge Impact |
|---|---|---|
| Settings page | Polishing the main feature | ⭐⭐⭐⭐⭐ |
| Admin panel | Adding micro-animations | ⭐⭐⭐⭐ |
| Notification system | Improving error states | ⭐⭐⭐⭐ |
| Complex auth | Rehearsing the demo | ⭐⭐⭐⭐⭐ |
| Analytics dashboard | Seeding realistic demo data | ⭐⭐⭐⭐ |
| Email system | Writing a compelling README | ⭐⭐⭐ |

---

## Adding to This List

When someone suggests a feature that shouldn't be built, add it here with a one-line reason. Format:

```markdown
| **[Feature Name]** | [Why not — one sentence max] |
```

Then move on. No guilt, no argument. This list protects your time.

---

*Last updated: 2026-08-07T04:05:00+05:30*

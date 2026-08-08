# Product Requirements Document (PRD)

## Project Overview
**Intervu** is an AI technical interview platform built for the Vicodathon hackathon. It conducts adaptive, multi-turn technical interviews based on a candidate's 31-day AI Cohort learning journey. The platform evaluates how a candidate engineers and thinks, rather than testing arbitrary interview survival skills.

## Core Objective
Build a production-quality product that conducts personalized, context-aware technical interviews and generates an actionable engineering readiness report.

## Scope

### Must Have
- **Curriculum Context**: Understand candidate curriculum progress, completed, and skipped topics.
- **Adaptive Interviewing**: Conduct adaptive interviews covering at least 4 curriculum days.
- **Minimum Duration**: Ask at least 8 context-aware questions per interview.
- **Conversation Continuity**: Maintain conversation context across multiple turns.
- **Intelligent Follow-ups**: Generate intelligent follow-up questions based on real-time evaluation of the candidate's answers.
- **Real-time Evaluation**: Evaluate responses against technical rubrics.
- **Actionable Reporting**: Generate structured feedback and an Engineering Readiness Report (Score out of 100, strengths, gaps, next steps, decision trace).
- **HTTP API**: Expose a reliable REST/HTTP API contract between frontend and backend.
- **Premium UX**: High-quality, modern, startup-grade user interface using Stitch-generated design direction.

### Nice to Have
- Advanced micro-animations for interactions.
- Audio/Speech input integration.
- Code-execution sandboxes (if purely UI driven without heavy backend lifting for now).

### Out of Scope
- Full enterprise recruitment ATS features.
- User authentication and accounts (keep it simple for the hackathon demo, mock login if needed).
- Heavy real-time collaboration features (like Google Docs).
- Complex payment or billing integrations.

# Domain Glossary: Agent Learning

## Core Domain Concepts

- **Learning**: A single Markdown document recording one piece of reusable, validated engineering experience or decision. Stored under `learnings/`. Note structure is expressive and context-dependent, not rigidly confined to fixed headers.
- **Note Ingestion Module**: The subsystem responsible for validating basic metadata, formatting, and persisting a Learning into storage.
- **Storage Invariants**: Minimal sanity constraints: non-empty title, non-empty body, valid Agent attribution, slug collision avoidance, and atomic git commit isolation.
- **Agent Identity**: Standard attribution format (`Name <email>`) for the AI agent authoring the Learning, preserved in the note header and git `Co-authored-by` trailer.
- **Agent Adapter**: Platform-specific integration layer (symlink, rule file, or manifest) that binds different AI agent environments (Claude Code, Cursor, Antigravity, Gemini, Codex) to the canonical workflow.
- **Canonical Skill**: The single source of truth workflow specification located at `.agents/skills/remember/SKILL.md`.
- **Knowledge Index & Recall Seam**: The retrieval subsystem (`learnings/INDEX.md` / `query-learning.mjs`) allowing humans and AI agents to search and recall past learnings with zero external search dependencies.
- **Seam**: The interface boundary between consuming AI agents (via CLI/stdio) and the underlying storage and version control mechanisms.

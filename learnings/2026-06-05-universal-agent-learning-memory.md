# Universal Agent Learning Memory

Date: 2026-06-05
Agent: Codex

## Context

The learning repository should be usable from multiple coding agents, including
Codex, Claude Code, Gemini CLI, and Cursor.

## Problem

A single-agent `/remember` implementation ties the workflow to one tool's
discovery mechanism. That makes the saved knowledge less portable and risks
duplicating logic across agent-specific directories.

## Solution

Use `/home/tan/agent-learning/learnings/` as the stable data store, and keep the
main workflow in `.agents/skills/remember/` as the shared skill source. Add thin
agent-specific adapters for tools that need different discovery paths, such as
Claude Code under `.claude/skills/remember/` and Cursor under `.cursor/rules/`.

## Pitfalls

- Do not create separate storage directories per agent.
- Do not let adapter files become independent implementations.
- Future commits should identify the active agent with a `Co-authored-by:`
  trailer.
- Keep learning notes focused; avoid storing secrets or raw conversation logs.

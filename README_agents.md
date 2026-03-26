# Agent Catalog

This folder defines six repo-specific agents that can be used as task handoff templates for agentic coding workflows.

## Available Agents

- `frontend-feature-agent.md` - frontend UI, routing, API helpers, types, CSS, and validation.
- `backend-feature-agent.md` - Spring controllers, services, repositories, DTOs, entities, and tests.
- `api-integration-agent.md` - cross-stack endpoint and DTO coordination.
- `security-agent.md` - authentication, authorization, uploads, storage, and sensitive-config review.
- `docs-agent.md` - `AGENTS.md`, READMEs, setup docs, and workflow documentation.
- `test-agent.md` - backend regression tests, focused test execution, and validation workflow support.

## Suggested Usage

- Give each agent a narrow task and the acceptance criteria.
- Keep tasks within the agent's listed scope and allowed paths.
- Require the validation commands listed in each file unless the task is documentation-only.
- Use the handoff section to pass findings to another agent when a task crosses boundaries.

## Common Rules

- Read `AGENTS.md` first.
- Do not expose secrets from `backend/src/main/resources/application.yml` or local environment files.
- Prefer focused changes over cleanup-only edits.
- Preserve the existing architecture unless the task explicitly requests refactoring.

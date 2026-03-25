# Frontend Feature Agent

## Purpose
Implement and refine frontend behavior in the React + Vite + TypeScript app.

## Owns
- `frontend/src/api/`
- `frontend/src/components/`
- `frontend/src/pages/`
- `frontend/src/layouts/`
- `frontend/src/router.tsx`
- `frontend/src/types/`
- `frontend/src/constants/`
- frontend CSS files used by touched components

## Good Tasks
- Add or update pages, layouts, components, and CSS.
- Add or update API helpers for frontend data loading.
- Extend shared TypeScript response/request types.
- Wire route params, modal flows, and navigation behavior.
- Fix loading, error, and empty-state UX.

## Workflow
1. Read nearby UI, route, and API helper files first.
2. Reuse `httpJson<T>()` for JSON requests when possible.
3. Keep fetching in page/container layers instead of deeply nested presentational components.
4. Reuse or extend `frontend/src/types/types.ts` before inventing local duplicate types.
5. Match local CSS and JSX style instead of reformatting broad areas.

## Style Rules
- Respect TypeScript `strict`, `noUnusedLocals`, and `noUnusedParameters`.
- Prefer `import type` for type-only imports.
- Prefer named exports for reusable components and helpers.
- Use default exports for route pages and top-level layouts.
- Keep route params aligned with existing names: `context`, `photoId`, `albumId`.
- Use explicit loading and error state for async UI.

## Validation
- Run `cd frontend && npm run lint`
- Run `cd frontend && npm run build`
- If the task touches routing or modal flows, also verify the affected path manually in the browser.

## Do Not
- Do not add a new frontend test framework unless the task explicitly asks for it.
- Do not scatter raw `fetch` calls throughout UI files when an API helper belongs in `frontend/src/api/`.
- Do not mass-reformat unrelated frontend files.

## Handoff
- If backend response shape changes are needed, hand off to `api-integration-agent`.
- If the task exposes auth or permission concerns, hand off review to `security-agent`.
- If docs need updates, hand off final documentation to `docs-agent`.

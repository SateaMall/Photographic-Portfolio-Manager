# Photo Gallery Agent Guide

## Project Snapshot
- Multi-user photography portfolio app with a React frontend and Spring Boot backend.
- Public visitors browse profiles, albums, and photos; authenticated owners manage uploads, albums, profiles, and metadata.
- Photos are stored on disk; metadata lives in PostgreSQL normally and H2 in dev/test flows.

## Repository Layout
- `frontend/` - Vite + React + TypeScript app.
- `backend/` - Spring Boot 4 / Java 17 REST API.
- `backend/src/main/resources/application.yml` and `backend/src/main/resources/application-dev.yml` - sensitive local config.
- `storage/` - local photo storage root.
- Top-level `package.json` is not the main app entry point; use `frontend/package.json` for frontend work.

## Rules Files
- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` files were found during analysis.
- If any are added later, merge them into this guide and treat them as higher-priority repo rules.

## Setup Commands
- Frontend install: `cd frontend && npm install`
- Backend bootstrap/test: `cd backend && ./mvnw test`
- Backend Windows wrapper: `cd backend && mvnw.cmd test`
- Preferred tools: `npm` for frontend, Maven Wrapper for backend.

## Frontend Commands
- Dev server: `cd frontend && npm run dev`
- Production build: `cd frontend && npm run build`
- Lint all files: `cd frontend && npm run lint`
- Lint one file: `cd frontend && npm run lint -- src/components/PhotoCard.tsx`
- Preview build: `cd frontend && npm run preview`
- No frontend test runner is configured yet in `frontend/package.json`.

## Backend Commands
- Run backend: `cd backend && ./mvnw spring-boot:run`
- Run backend with H2 dev profile (bash): `cd backend && SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run`
- Run backend with H2 dev profile (PowerShell): `cd backend; $env:SPRING_PROFILES_ACTIVE="dev"; ./mvnw spring-boot:run`
- Run all tests: `cd backend && ./mvnw test`
- Run one test class: `cd backend && ./mvnw -Dtest=BackendApplicationTests test`
- Run one test method: `cd backend && ./mvnw -Dtest=BackendApplicationTests#contextLoads test`
- Build jar: `cd backend && ./mvnw clean package`
- Build without tests: `cd backend && ./mvnw -DskipTests package`

## Validation Expectations
- Frontend-only work: run `npm run lint` and `npm run build` unless the task is tiny.
- Backend-only work: run `./mvnw test` at minimum.
- Cross-stack changes: run frontend build/lint and backend tests.
- If a command cannot run, explain why and give the exact follow-up command.

## Current Testing Reality
- Backend currently has only a minimal Spring context test in `backend/src/test/java/com/AlexiSatea/backend/BackendApplicationTests.java`.
- Frontend currently has zero automated tests, so do not claim strong coverage.

## Architecture Notes
- Frontend routing is centralized in `frontend/src/router.tsx`.
- Frontend data fetching lives mostly in `frontend/src/api/*.ts` through `httpJson` in `frontend/src/api/http.ts`.
- Shared frontend API types live in `frontend/src/types/types.ts`.
- Backend follows controller -> service -> repository, with DTO records and static `from(...)` mappers.
- Controllers live under `backend/src/main/java/com/AlexiSatea/backend/controller`.

## Important Routing Caveat
- Most management controllers are mounted under `/api/manage/...`.
- `SecurityConfig` currently protects `/api/admin/**`, so manage-route security may not fully line up with controller paths.
- Verify the intended namespace before changing auth or admin flows.

## Frontend Style
- The frontend uses TypeScript strict mode; keep code compatible with `strict`, `noUnusedLocals`, and `noUnusedParameters`.
- Prefer precise types over `any`; reuse or extend `frontend/src/types/types.ts` for shared API shapes.
- Use `import type` for type-only imports.
- Prefer named exports for reusable components/hooks/helpers and default exports for route pages/layouts.
- Keep fetch logic in `frontend/src/api/` rather than scattering `fetch` calls through UI components.
- Reuse `httpJson<T>()` for JSON requests unless the response shape forces a different helper.
- Keep route params aligned with existing names such as `context`, `photoId`, and `albumId`.

## Frontend Imports, Naming, and Formatting
- Import order is mixed today; when editing, prefer third-party imports, internal modules, type-only imports, then CSS imports last.
- Do not mass-reformat untouched files just to normalize style.
- Components and types use PascalCase; hooks use `useCamelCase`; utilities and locals use camelCase.
- Constants that are truly constant use SCREAMING_SNAKE_CASE.
- CSS classes are plain CSS and tend to be descriptive or BEM-like; stay consistent within the file.
- Keep JSX readable, use early returns for loading/error states, and avoid deep ternaries.
- Keep comments sparse; add them only when a block is non-obvious.

## Frontend State and Error Handling
- Existing pages commonly use `useEffect` + `useState` for fetching and explicit loading/error state.
- When a fetch depends on route params, include the relevant param in the effect dependency list.
- If a component only transforms fetched data, keep the actual fetch in the page/container layer.
- `httpJson` throws `Error` with status text and body on non-OK responses; components usually surface `error.message` directly.
- Do not swallow fetch failures silently.

## Backend Style
- Use constructor injection via Lombok `@RequiredArgsConstructor` and `private final` fields.
- Keep controllers thin: parse input, delegate to services, and return DTOs or `ResponseEntity`.
- Put validation, business rules, and transactional work in services.
- Keep persistence and query concerns in repositories that extend `JpaRepository`.
- Prefer DTO `record`s at API boundaries instead of exposing entities directly.
- Use `UUID` for entity ids and request path ids where the model already does.
- Use `@Transactional(readOnly = true)` for reads and `@Transactional` for mutations.
- Reuse `CurrentUserService` and `AccessService` for auth-sensitive operations.

## Backend Imports, Naming, and Formatting
- Avoid adding new wildcard imports even though a few existing files still use them.
- Lombok is already standard here for entities and constructor injection; follow that style instead of writing boilerplate accessors.
- Keep annotations grouped at the top of the class in a stable order.
- Controllers end with `Controller`, services with `Service`, repositories with `Repository`.
- Request and response DTOs use noun-based names like `SignupRequest`, `AlbumResponse`, and `MainPhotoResponse`.
- Enum constants use uppercase with underscores; mapper factories are usually `from(...)` static methods.

## Backend Validation and Errors
- The codebase commonly throws `IllegalArgumentException` for validation failures and `AccessDeniedException` for authorization failures.
- There is no global `@ControllerAdvice` yet.
- Prefer consistent service-level validation over controller-level ad hoc checks.
- If you introduce broader exception handling, do it centrally rather than sprinkling `try/catch` blocks through controllers.
- Keep error messages clear because clients often surface them directly.

## Persistence and Domain Model
- JPA entities live under `model/...` and commonly use Lombok builders.
- Some normalization already happens in entity lifecycle hooks, for example photo city/country normalization.
- Keep nullable vs required fields aligned with existing JPA annotations and validation constraints.
- When adding derived fields or storage keys, update persistence and DTO mapping together.

## Security and Sensitive Data
- Treat `application.yml` and mail/auth settings as sensitive configuration.
- Do not duplicate secrets into code comments, docs, tests, or commits.
- Prefer environment-specific overrides or ignored local config for new secrets.
- `.env` is intended to remain ignored.

## Agent Workflow
- Read the local area before editing; formatting is inconsistent, so follow nearby patterns carefully.
- Make focused changes rather than broad cleanup unless the task explicitly asks for refactoring.
- Keep style improvements incremental and low-risk inside files you already touch.
- Call out noteworthy inconsistencies instead of silently rewriting architecture.
- If you add commands, scripts, or new repo rules, update this file in the same change.

## Repo Agent Catalog
- Reusable agent definitions live in `.agents/`.
- Start with `.agents/README.md`, then use the matching role file for the task.
- Available roles: `frontend-feature-agent`, `backend-feature-agent`, `api-integration-agent`, `security-agent`, `docs-agent`, and `test-agent`.
- Keep task handoffs narrow: frontend-only, backend-only, cross-stack, security review, or documentation.

## Good Defaults For Agents
- Frontend feature: add/update API helper, shared type, page/component, CSS, then run lint/build.
- Backend feature: add DTO if needed, service logic, controller wiring, repository query, then run tests.
- Cross-stack change: update backend DTO/route first, then frontend API/types, then verify both sides.

## Project Clarity
- Yes, the project structure is clear enough to work effectively.
- The main gaps are inconsistent formatting, sparse tests, and the manage/admin route-security mismatch.
- Prioritize correctness and minimal-risk improvements over cosmetic cleanup.

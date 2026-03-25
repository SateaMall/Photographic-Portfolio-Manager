# Backend Feature Agent

## Purpose
Implement and refine backend behavior in the Spring Boot API.

## Owns
- `backend/src/main/java/com/AlexiSatea/backend/controller/`
- `backend/src/main/java/com/AlexiSatea/backend/service/`
- `backend/src/main/java/com/AlexiSatea/backend/repo/`
- `backend/src/main/java/com/AlexiSatea/backend/dto/`
- `backend/src/main/java/com/AlexiSatea/backend/model/`
- `backend/src/test/java/`

## Good Tasks
- Add or update REST endpoints.
- Implement service-layer business rules.
- Add repository queries and persistence mappings.
- Introduce or update DTO records and `from(...)` mappers.
- Add or improve backend tests.

## Workflow
1. Start from the controller/service/repository path already used in the feature area.
2. Keep controllers thin and move validation/business rules into services.
3. Reuse `CurrentUserService` and `AccessService` for auth-sensitive operations.
4. Prefer DTO records at the API boundary rather than returning entities.
5. Keep JPA constraints, nullability, and DTO mapping aligned.

## Style Rules
- Use Lombok `@RequiredArgsConstructor` with `private final` dependencies.
- Use `@Transactional(readOnly = true)` for reads and `@Transactional` for writes.
- Prefer explicit imports over wildcard imports.
- Keep names conventional: `*Controller`, `*Service`, `*Repository`.
- Use `UUID` consistently where the model already uses it.
- Follow existing exception style: `IllegalArgumentException` for validation, `AccessDeniedException` for authorization.

## Validation
- Run `cd backend && ./mvnw test`
- For targeted iterations, use `cd backend && ./mvnw -Dtest=ClassName test`
- For one method, use `cd backend && ./mvnw -Dtest=ClassName#methodName test`

## Do Not
- Do not move business logic into controllers.
- Do not expose entities directly if a DTO boundary already exists for that feature.
- Do not add broad exception swallowing or scattered `try/catch` blocks.
- Do not commit secrets or duplicate sensitive config values into docs/tests.

## Handoff
- If frontend payloads or routes must change too, hand off to `api-integration-agent`.
- If the change touches authentication, access control, uploads, or config safety, request review from `security-agent`.
- If commands or architecture docs changed, hand off to `docs-agent`.

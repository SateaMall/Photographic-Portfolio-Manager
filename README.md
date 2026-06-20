# Let Me Lens

Multi-user photography portfolio platform built with React, TypeScript, Spring Boot, PostgreSQL, and local file storage.

## Portfolio Notice

This repository is a public portfolio project and is not open source.
Source code is visible for review and evaluation only.
Reuse, copying, modification, or redistribution of any part of this codebase is not permitted without prior written permission.

## Overview

Let Me Lens is a gallery platform for photographers.
Visitors can browse public portfolios, albums, and photos.
Authenticated owners can manage their profile, upload photos, organize albums, and review portfolio open statistics.

The app is split into:

- `frontend/`: Vite + React + TypeScript client
- `backend/`: Spring Boot REST API, auth, SEO page shell, storage, and database access

Use `frontend/package.json` for frontend commands.
The top-level `package.json` is not the main application entry point.

## Current Feature Set

- Public marketing homepage and legal/privacy page
- Public photographer portfolio pages by slug
- Public album pages and photo pages
- Modal photo viewing inside the gallery flow
- Email/password authentication
- Email verification flow
- Forgot/reset password flow
- Optional Google OAuth login when credentials are configured
- Authenticated management area under `/:slug/manage`
- Profile editing including bio, colors, public email, and social links
- Photo uploads with local file storage
- Photo metadata editing: title, description, country, city, capture year
- Album creation, update, ordering, and photo assignment
- Featured photo management for hero/grid sections
- Portfolio open analytics in the account area
- Backend-generated HTML shell with preview metadata, `robots.txt`, and `sitemap.xml`

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- Bootstrap
- Radix UI
- `@dnd-kit` for ordering interactions
- Recharts for statistics

### Backend

- Java 17
- Spring Boot 4
- Spring MVC
- Spring Data JPA
- Spring Security
- Spring Validation
- Spring Mail
- PostgreSQL driver
- H2 for dev/test profile
- Lombok
- Thumbnailator for image resizing

## Repository Layout

```text
photo_gallery/
|- frontend/              # React app
|- backend/               # Spring Boot API and storage logic
|- manual/                # project notes/manual assets
|- Jenkins/               # CI-related files
|- README.md              # project overview
|- AGENTS.md              # local agent/workflow guidance
```

Important application files:

- `frontend/src/router.tsx`: top-level frontend routing
- `frontend/src/layouts/components/popup/GalleryShell.tsx`: gallery, album, photo, and manage routes
- `frontend/src/api/`: frontend API layer
- `backend/src/main/java/com/letmelens/backend/controller/`: REST and public site controllers
- `backend/src/main/resources/application.yml`: shared backend defaults
- `backend/src/main/resources/application-dev.yml`: H2 dev profile overrides
- `backend/.env.server.example`: server/local environment template
- `backend/.env.local.example`: local override template
- `backend/docker-compose.yml`: PostgreSQL container for local development

## Architecture Notes

- Public gallery data is served from `/api/public/**`.
- Auth endpoints live under `/api/auth/**`.
- Owner management endpoints live under `/api/manage/**`.
- The frontend talks to the backend through `httpJson()` in `frontend/src/api/http.ts`.
- Public HTML routes like `/:slug`, `/:slug/album/:albumId`, and `/:slug/photo/:photoId` are also handled by the backend so it can inject SEO/preview metadata before the frontend takes over.
- Photo files are stored on disk and metadata is stored in the database.

## Local Development

### 1. Install dependencies

Frontend:

```bash
cd frontend
npm install
```

Backend uses the Maven wrapper already committed in the repo.

### 2. Configure backend environment

Create local env files from the examples in `backend/`:

```bash
cp backend/.env.server.example backend/.env.server
cp backend/.env.local.example backend/.env.local
```

Set the values you need in those files.

Main variables:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_FRONTEND_BASE_URL`
- `APP_STORAGE_LOCAL_ROOT_PATH`
- `SPRING_MAIL_*` values for email flows
- `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_*` for Google login

Notes:

- `backend/.env.server` and `backend/.env.local` are ignored and should keep real local/server values only.
- `backend/.env.local` is loaded after `backend/.env.server`, so it is the right place for machine-specific overrides.

### 3. Start PostgreSQL

From `backend/`:

```bash
docker compose up -d
```

This uses `backend/docker-compose.yml` and reads database values from `backend/.env.server`.

### 4. Run the backend

Standard local run with PostgreSQL:

```bash
cd backend
./mvnw spring-boot:run
```

Dev-profile run with in-memory H2:

```bash
cd backend
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
```

PowerShell equivalent:

```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE="dev"
./mvnw spring-boot:run
```

### 5. Run the frontend

```bash
cd frontend
npm run dev
```

By default, frontend API calls use `VITE_API_BASE_URL` if provided, otherwise `http://localhost:8080`.
During local Vite development, `/api` is also proxied to `http://localhost:8080`.

## Storage

- Backend storage type is currently local disk storage.
- Default root path is `./storage` relative to the backend process.
- Override it with `APP_STORAGE_LOCAL_ROOT_PATH`.
- Uploaded files are stored on disk while metadata stays in PostgreSQL or H2.

## Useful Commands

### Frontend

```bash
cd frontend
npm run dev
npm run lint
npm run build
npm run preview
```

### Backend

```bash
cd backend
./mvnw test
./mvnw spring-boot:run
./mvnw clean package
./mvnw -DskipTests package
```

Run one backend test class:

```bash
cd backend
./mvnw -Dtest=BackendApplicationTests test
```

## Testing Status

Current automated coverage is still light.

- Frontend: no automated test runner is configured yet
- Backend: Spring context test plus a focused `LocalStorageService` test

Recommended validation today:

- Frontend work: `cd frontend && npm run lint && npm run build`
- Backend work: `cd backend && ./mvnw test`
- Cross-stack work: run both

## Main Routes

### Frontend/public pages

- `/`
- `/signup`
- `/login`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/privacy`
- `/:slug`
- `/:slug/album/:albumId`
- `/:slug/photo/:photoId`
- `/:slug/manage/*`

### Backend API groups

- `/api/auth/**`
- `/api/public/**`
- `/api/manage/**`

## Deployment Notes

- The project is intended to run with Docker-backed PostgreSQL and local file storage.
- The backend supports forwarded headers via `SERVER_FORWARD_HEADERS_STRATEGY` for reverse-proxy deployments.
- Public preview metadata depends on the frontend shell assets being reachable by the backend.

## Project Identity

The product name used across the application UI is `Let Me Lens`.
The repository name remains `photo_gallery`.

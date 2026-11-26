---
id: tech-stack-and-architecture
title: How is Let Me Lens built? (technology and dependencies)
audience: everyone
category: tech
screen: ""
ui_path: ""
route: ""
requires_login: false
keywords: [technology, tech stack, how was it built, built with, react, spring boot, java, typescript, postgresql, database, framework, dependencies, architecture, open source libraries, deployment, docker, jenkins, ci/cd, hosting]
related: [about-satea-almallouhi, core-profile]
status: published
last_updated: 2026-11-25
---

# How is Let Me Lens built? (technology and dependencies)

## What technologies does Let Me Lens use?
Let Me Lens is a full-stack web application designed and developed by Satea AlMallouhi:
- **Frontend** (what runs in the browser): React 18 with TypeScript, built with Vite, and React Router
  for navigation.
- **Backend** (the server): a REST API in Java 17 with Spring Boot 4, using Spring Security for sign-in,
  Spring Data JPA for the database and Spring Mail for emails.
- **Database**: PostgreSQL stores accounts, profiles, photo details, collections and statistics.
- **Photo storage**: photo files are stored on the server's disk; each upload is saved in its original
  version plus a medium version (up to 1600 px wide) and a thumbnail (up to 400 px wide), so pages load
  fast.

## Which libraries power the gallery features?
Main open-source libraries used by the Let Me Lens interface:
- **react-photo-album**: the justified photo grid.
- **react-photo-view**: the full-screen photo viewer with zoom.
- **Embla Carousel**: the slides and the collections row.
- **dnd-kit**: drag-and-drop ordering of photos, collections and slides.
- **Radix UI**: menus, dropdowns and dialog windows.
- **Recharts**: the visits chart in **Statistics**.
- **exifr**: reads the year from a photo's camera data before upload.
- **react-icons** and **countries-list**: icons and the country list.
On the server, **Thumbnailator** creates the resized photo versions, and **springdoc-openapi** documents
the API for development.

## How is Let Me Lens deployed?
Let Me Lens runs in production on a Linux cloud server. Satea AlMallouhi automated the deployment with
Docker containers and a CI/CD pipeline built with Jenkins, so each new version is built and deployed
automatically. The AI coding agent OpenCode was used to help with tests, debugging and fixing security
flaws.

## How does sign-in work technically?
Let Me Lens supports email-and-password accounts (passwords are stored hashed, never in clear text) with
a 4-digit email verification code, and Google sign-in through OAuth 2.0 / OpenID Connect. A signed-in
user is kept signed in with a secure session cookie.

## How does Let Me Lens help galleries appear in search engines?
The Let Me Lens server generates page titles, descriptions and preview images for every public
gallery, collection and photo, publishes a `robots.txt` and a `sitemap.xml` that lists galleries,
collections and photos (with their images), so search engines and social networks show proper
previews.

## Questions this answers
- What technologies is the site built with? What is the tech stack?
- Which framework / language / database is used?
- What libraries does Let Me Lens depend on?
- How are photos stored?
- Who developed the website?

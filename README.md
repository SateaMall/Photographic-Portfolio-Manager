# photo_gallery

Portofolio Photographique multi-users built with Typescript React and Java Spring Boot

# Important

.env is added in the .getignore for privacy reasons

# Detailed description

Backend:
(Java: 17, Build tool: Maven, Dependencies: Spring Web, Spring Data JPA, PostgreSQL Driver, Lombok, Validation, Spring Security (to add later if needed))

Project description

Photo Gallery is a public web application to showcase and organize photos (photos and albums). The site is accessible to everyone, while photo management (upload, update, delete, organize) is reserved for the owners (photographers). The goal is to publish photos online (later work on discouraging reuse without permission by serving only watermarked and/or reduced-quality versions publicly). The gallery can accept users to generate their portofolio, one user can have multiple profiles. The idea is that the photos are linked to the user, and the albums are linked to the profile. So the users always have the same photos in all their profiles but different albums.
Later goals would be to work on shared albums between two profiles (two different users)
Iam not implementing multiple profile users in the front end yet, maybe later!

Main goals:
Public gallery: visitors can browse photos
Admin area: owners can manage albums/projects/photos.

Workspace :
Github with main + feature branches + Pull Requests (clean collaboration).

Frontend:
React frontend with Vite + React + TypeScript + SWC

Backend:
Java Spring Boot (REST API) for authentication, uploads, metadata, and serving photo information.

Database:
PostgreSQL (metadata) using docker
Photos stored on a folder on VPS disk VPS OS: Ubuntu 24.04 LTS (so in file system in developpment)

Deploymlent:
Docker

For testing :
iam using windows and working on DBeaver and postman

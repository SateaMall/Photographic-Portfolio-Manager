## Config model

- `src/main/resources/application.yml` contains shared, non-secret defaults and imports optional env files.
- `src/main/resources/application-dev.yml` contains only dev-profile overrides like the in-memory H2 datasource.
- `backend/.env.server` and `backend/.env.local` stay ignored and hold real local or server-only values.
- Production can also provide the same values through the systemd environment file.

## Local dev

PowerShell:

```powershell
$env:SPRING_PROFILES_ACTIVE="dev"
mvn spring-boot:run
```

Local-only overrides can go in `backend/.env.local`.
That file is loaded after `backend/.env.server`, so values like `APP_FRONTEND_BASE_URL=http://localhost:5173` can stay local.

## Upload test

```powershell
curl.exe -F "file=@C:\Users\Satea AlMallouhi\Desktop\pic\Les Traces & Nous FR\Une_foule_vers_le_ciel.jpg" `
  -F "owner=Satea" `
  http://localhost:8080/api/admin/photos
```

    

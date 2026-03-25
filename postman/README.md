# Postman Requests

## Feature Context Flow
- Use the `Local` environment in `postman/environments/Local.environment.yaml`.
- Set `profileSlug` to a profile you can manage, for example `satea`.
- Run `Auth/POST Login` first so Postman stores the session cookie.
- Run `Manage - Photos/POST Upload Photo` with a real image file; it now stores the returned `photoId` automatically.
- Run `Manage - Photos/POST Add or Update Photo Feature` to create or update the feature link.
- Run `Manage - Photos/DELETE Photo Feature` to remove the feature link.
- Optionally run `Manage - Photos/DELETE Photo` last to clean up the uploaded photo.

## Variables Used
- `photoId` - set automatically after upload.
- `profileSlug` - target manageable profile slug.
- `featureType` - one of `HOMEPAGE_HERO`, `HOMEPAGE_GRID`, `PROFILE_FEATURED`, `SUGGESTIONS`.
- `featureIndex` - numeric order index sent to the add/update request.
- `featureEnabled` - `true` or `false` for the add/update request.

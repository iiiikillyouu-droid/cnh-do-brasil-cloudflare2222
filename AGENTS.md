# Regras do projeto

- Backend cutover must wait for authorized access to the selected existing destination and source data; changing a reference ID alone cannot migrate schema, identities, records, or services.
- Preserve the connected project's generated Supabase clients and types when restoring source screens; this prevents old backend bindings from replacing the selected destination.
- Administrator role checks run as the caller against owner-readable role rows; elevated clients are loaded only after authorization for account-management operations.
- CNH files use a private Storage bucket and per-user/per-side document rows; authenticated admin-only RLS and server validation protect files and draft notes without granting document access to ordinary users.
- Home-screen installation uses a standalone manifest and bundled icons with Apple head metadata, without an app-shell service worker, to avoid stale previews and unrequested offline caching.
- Deployment target is Cloudflare Workers via `wrangler.jsonc`; the app's database credentials come from Cloudflare variables and secrets, never from code.

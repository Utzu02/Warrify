# Security TODO

- [x] Restrict user CRUD endpoints to the authenticated account and sanitize responses.
- [x] Enforce CSRF origin checks for cookie-authenticated, state-changing requests.
- [x] Add payload validation/whitelisting for user profile updates.
- [x] Harden manual PDF uploads (size/MIME limits and per-user ownership).
- [ ] Audit Gmail OAuth session handling and add `state` verification.
- [ ] Extend input validation and rate limiting to remaining routes (e.g., warranty CRUD).

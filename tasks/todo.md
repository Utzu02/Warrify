# TODO

- [x] **Clarify requirements** – Confirm with the user how Gmail scans should identify the account (UID cookie vs another mechanism) and what data should populate `Product Name`, `Date bought`, `Date of expirance`, and `Product provider` for each saved warranty.
- [x] **Backend data model updates** – Extend the user schema to persist `lastScanAt` (per account) and introduce a dedicated `WarrantyDocument` model that stores the warranty metadata plus a pointer/binary for the PDF so downloads are possible later.
- [x] **Backend API surface** – Expose endpoints to (a) fetch/update last scan info, (b) list warranties for a user, and (c) download a stored PDF; secure them by requiring an explicit user id coming from the frontend.
- [x] **Gmail scan pipeline** – Update `/api/emails` to accept the current user id, refresh their `lastScanAt`, and upsert warranty records/PDF blobs for every confirmed attachment.
- [x] **Frontend dashboard data** – Replace the local placeholders by calling the new warranties API (using the `UID` cookie), wire the `Documents` table + modal to this data set, and surface a “Download PDF” control from the stored file endpoint.
- [x] **Frontend last-scan card** – Have GridContainer load the persisted `lastScanAt` (instead of `localStorage`) and keep it in sync after a new scan finishes.
- [x] **Validation & review** – Smoke-test the flow end-to-end, double-check for syntax/security issues, then capture a short summary plus any caveats in a new *Review* section below.

## Review

- Added persistent scan tracking and Gmail ingestion now stores metadata + PDFs per user; list and download endpoints enforce user ownership.
- Dashboard fetches live warranties/scan info (UID header) so tables + modal show real data with download buttons, and the Grid card reflects DB state instead of local storage.
- Frontend build (`npm run build`) passes; remaining to-do is to run a manual Gmail scan in a real environment because the sandbox lacks Google tokens.

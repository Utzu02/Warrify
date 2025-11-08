# TODO

- [x] **Clarify requirements** – Confirm with the user how Gmail scans should identify the account (UID cookie vs another mechanism) and what data should populate `Product Name`, `Date bought`, `Date of expirance`, and `Product provider` for each saved warranty.
- [x] **Backend data model updates** – Extend the user schema to persist `lastScanAt` (per account) and introduce a dedicated `WarrantyDocument` model that stores the warranty metadata plus a pointer/binary for the PDF so downloads are possible later.
- [x] **Backend API surface** – Expose endpoints to (a) fetch/update last scan info, (b) list warranties for a user, and (c) download a stored PDF; secure them by requiring an explicit user id coming from the frontend.
- [x] **Gmail scan pipeline** – Update `/api/emails` to accept the current user id, refresh their `lastScanAt`, and upsert warranty records/PDF blobs for every confirmed attachment.
- [x] **Frontend dashboard data** – Replace the local placeholders by calling the new warranties API (using the `UID` cookie), wire the `Documents` table + modal to this data set, and surface a “Download PDF” control from the stored file endpoint.
- [x] **Frontend last-scan card** – Have GridContainer load the persisted `lastScanAt` (instead of `localStorage`) and keep it in sync after a new scan finishes.
- [x] **Validation & review** – Smoke-test the flow end-to-end, double-check for syntax/security issues, then capture a short summary plus any caveats in a new *Review* section below.
- [x] **Grid stats from DB** – Drive the “Managed warranties” and “<7 days before expiring” cards off the warranties stored for the logged-in user instead of hardcoded placeholders.
- [x] **Wrap-up review** – Re-check for syntax/security issues after the grid updates and refresh the Review section if needed.
- [x] **Sync Gmail rerun** – Ensure the “Sync Gmail” button reliably restarts the Gmail ingestion flow (frontend trigger + backend processing).
- [x] **Deduplicate warranties** – Prevent duplicate warranty entries when the same attachment appears across scans.
- [x] **Expiry counter rules** – Count warranties expiring within 7 days *or already expired* in the dashboard stats.
- [x] **Final review** – Retest/build after the fixes and update this review block.
- [x] **Remaining card formula** – Update the “Remaining warranties” KPI to use the requested `total - expiring` calculation.
- [x] **Gmail config UX** – Route both Gmail import buttons to a new page/modal where the user selects count + date range before starting OAuth.
- [x] **Backend scan options** – Persist the selected scan settings server-side and apply them to the Gmail fetch logic.
- [x] **Regression pass** – Build + sanity-check after the new flow; summarize in Review.

## Review

- Added persistent scan tracking and Gmail ingestion now stores metadata + PDFs per user; list and download endpoints enforce user ownership.
- Dashboard fetches live warranties/scan info (UID header) so tables + modal show real data with download buttons, and the Grid card reflects DB state instead of local storage.
- Grid cards for “Managed warranties” and “<7 days” now read directly from the warranties API so they stay in sync with the dashboard table.
- Sync Gmail CTA now jumps straight into the backend OAuth/import flow, `warrantyDocumentRoutes` deduplicates by Gmail message + attachment, and the dashboard counter treats already-expired docs as urgent.
- Added a Gmail import configuration page (and updated both Gmail buttons to route there) so users can decide how many documents and which date range to scan; the backend persists those options per session and applies them to Gmail queries. The “Remaining” KPI now uses `total - expiring`.
- Frontend build (`npm run build`) passes; remaining to-do is to run a manual Gmail scan in a real environment because the sandbox lacks Google tokens.

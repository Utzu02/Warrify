# Warrify – AI-Powered Warranty Workspace

Warrify helps individuals and teams centralize every warranty document they receive.  
The backend watches Gmail for PDF attachments, runs OCR + DeepSeek to verify that a file is actually a warranty, stores it securely in MongoDB, and exposes it to the React dashboard. Users can also upload PDFs manually, review summaries, and monitor what is about to expire.

## Core Capabilities
- **Smart Gmail import** – configurable scans through Gmail via OAuth, downloads PDF attachments, scores them with heuristics + DeepSeek, and saves only validated warranties.
- **Manual ingestion** – upload PDFs from the dashboard when a warranty is not in email.
- **Dashboard insights** – searchable/sortable tables, status cards, and warnings for warranties that expire soon (`Front-end/src/pages/Dashboard.tsx`).
- **Profile overview** – quick stats, subscription state, and account metadata gathered from `/api/users/:id` (`Front-end/src/pages/Profile.tsx`).
- **Status pages & flows** – `/gmail-config` for scan options, `/gmail-status` to see ingestion progress, plus landing, pricing, and contact pages to explain the product.

## System Overview
```
Warrify
├─ Front-end/
│  └─ src/
│     ├─ pages/
│     ├─ components/
│     └─ api/
└─ backend/
   ├─ crud/
   ├─ routes/
   ├─ schemas/
   └─ utils/
```

**Data flow**
1. Users register/login (`backend/crud/authCrud.js`). Passwords are hashed with bcrypt. The frontend stores the returned Mongo `_id` in a `UID` cookie and attaches it to each request through the custom `apiFetch` helper.
2. Gmail import:
   - `/gmail-config` saves scan options to the session.
   - `/auth/google` begins the OAuth flow.
   - `backend/crud/gmailCrud.js` uses Google APIs to list messages, downloads PDF attachments, runs `pdf-parse` plus a DeepSeek prompt to confirm the document, then saves metadata + binary data in `WarrantyDocument`.
   - `/gmail-status` polls `/api/emails` to display progress and provide download links.
3. Manual uploads hit `/api/warranties2` and are stored in the `Warranty` collection via `multer`.
4. Dashboard/profile pages query `/api/users/:id/warranties` and `/api/users/:id/scan-info` to show cards, filters, and stats.

## Tech Stack
- **Frontend:** React + Vite, TypeScript, CSS modules, js-cookie, React Router.
- **Backend:** Node.js, Express, axios, googleapis, multer, pdf-parse, DeepSeek API, express-session.
- **Database:** MongoDB (Mongoose models).
- **AI/OCR:** `pdf-parse` for extraction, DeepSeek for final validation.

## Prerequisites
- Node.js(express) and npm.
- MongoDB instance (local or Atlas).
- Google Cloud project with the Gmail API enabled and a Web OAuth client.
- DeepSeek API key (or any compatible key if you fork/replace the AI provider).

## Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Example |
| --- | --- | --- |
| `MONGO_URI` | Yes | `mongodb+srv://username:password@cluster.example.mongodb.net/warrify` |
| `FRONTEND_URL` | Yes | `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | Yes | `1234567890-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Yes | `GOCSPX-xxxxxxxxxxxxxxxxxxxx` |
| `GOOGLE_REDIRECT_URI` | Yes | `http://localhost:8080/auth/google/callback` |
| `SESSION_SECRET` | Yes | `super-long-random-string` |
| `DEEPSEEK_API_KEY` | Yes | `sk-xxxx` |
| `DEEPSEEK_API_URL` | Optional | `https://api.deepseek.com/v1/chat/completions` |

### Frontend (`Front-end/.env`)
| Variable | Required | Example |
| --- | --- | --- |
| `VITE_BASE_URL` | Yes | `http://localhost:8080` |

## Getting Started
1. **Start the backend**
   ```bash
   cd backend
   npm run start   # runs nodemon script.js on PORT (default 8080)
   ```
2. **Start the frontend**
   ```bash
   cd Front-end
   npm run dev     # Vite serves the SPA on http://localhost:5173
   ```
3. Open `http://localhost:5173` in your browser. Register a user, log in, and begin importing warranties.

## Google OAuth & Gmail API Setup
1. Visit [console.cloud.google.com](https://console.cloud.google.com/), create a project, and enable the **Gmail API**.
2. Configure the OAuth consent screen (Internal or External) and add the scopes `https://www.googleapis.com/auth/gmail.readonly`.
3. Create **OAuth 2.0 Client Credentials (Web application)**. Add authorized redirect URI `http://localhost:8080/auth/google/callback`.
6. During development, the Gmail flow is initiated from `/gmail-config` → `Start Gmail import`, which redirects to `/auth/google`.

## DeepSeek Configuration
- Create an account at [https://www.deepseek.com/](https://www.deepseek.com/) (or your chosen AI provider).
- Generate an API key and store it as `DEEPSEEK_API_KEY`.
- By default `gmailCrud.js` uses the `deepseek-chat` model. Adjust the model or URL to match your plan if necessary.
- DeepSeek is used only to answer “Does this PDF look like a warranty?”; if you want richer extraction you can extend `persistWarrantyDocument`.

## API Surface (selected endpoints)
| Method & Path | Description | Handler |
| --- | --- | --- |
| `POST /api/register` | Create a user (username, email, password, terms). | `backend/crud/authCrud.js` |
| `POST /api/login` | Login and return the user `_id`. | `backend/crud/authCrud.js` |
| `GET /api/users/:id` | Retrieve a user document (requires `x-user-id`). | `backend/crud/userCrud.js` |
| `GET /api/users/:id/warranties` | List deduplicated warranties saved during Gmail scans. | `backend/crud/warrantyDocumentCrud.js` |
| `GET /api/users/:id/scan-info` | Fetch the `lastScanAt` timestamp. | `backend/crud/warrantyDocumentCrud.js` |
| `POST /api/warranties2` | Upload a PDF manually (multipart form field `pdf`). | `backend/crud/warrantyFileCrud.js` |
| `POST /api/gmail/options` | Store Gmail scan preferences in the session. | `backend/crud/gmailCrud.js` |
| `GET /api/emails` | Trigger the Gmail scan based on stored options. | `backend/crud/gmailCrud.js` |
| `GET /api/emails/:messageId/attachments/:attachmentId` | Download a Gmail attachment vetted as a warranty. | `backend/crud/gmailCrud.js` |

> Authorization is intentionally simple: the frontend includes `x-user-id` for state-changing calls, while Gmail routes rely on `express-session`. For production you should harden this with JWTs or real session storage.

## License
MIT License – see the repository for details.

# VideoInvoice

AI-powered invoicing for field contractors. Point your camera at a job site, describe the work, and get a professional itemized quote in seconds.

---

## Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                        Mobile App (Expo)                          │
│                                                                   │
│  ┌──────────────┐   ┌──────────────┐   ┌───────────────────────┐  │
│  │ Capture      │   │ Invoice List │   │ Invoice Detail        │  │
│  │ (video/text/ │   │ (two.tsx)    │   │ ([id].tsx)            │  │
│  │  document)   │   │              │   │ edit / export / share │  │
│  └──────┬───────┘   └──────────────┘   └───────────────────────┘  │
└─────────┼───────────────────────┬─────────────────────────────────┘
          │ 1. Upload media       │ 5. Listen (realtime snapshot)
          ▼                       │
┌─────────────────┐               │
│ Firebase        │               │
│ Storage         │               │
│                 │               ▼
│ quotes/         │    ┌──────────────────────┐
│ price_lists/    │    │ Cloud Firestore      │
│ logos/          │    │                      │
│ signatures/     │    │  /invoices/{id}      │
└────────┬────────┘    │  /users/{uid}/       │
         │ 2. URL      │    settings/invoice  │
         ▼             └──────────▲───────────┘
┌──────────────────────────────┐  │ 4. Save completed invoice
│   Node.js API (Express)      │  │
│   :8080                      │  │
│                              │  │
│  POST /api/quotes/generate ──┼──┘
│  POST /api/quotes/edit       │
│  POST /api/quotes/:id/preview│         ┌─────────────────┐
│  POST /api/quotes/:id/export │         │ Google Gemini   │
│  POST /template-preview/:name│         │ API             │
│                              │         │                 │
│  Firebase Auth middleware    │         │ gemini-flash    │
│  EJS template rendering      │         │ -latest         │
└──────┬───────────────────────┘         └────────▲────────┘
       │ 3. Forward AI request                    │
       ▼                                          │
┌──────────────────────────────┐                  │
│   Rust Engine (Axum)         │                  │
│   :3000                      │   3a. Gemini     │
│                              │   File API ──────┘
│  POST /api/ai/process        │   (video upload)
│  POST /api/ai/edit           │
│                              │
│  • Download media in parallel│
│  • Upload to Gemini File API │
│  • Parse AI response →       │
│    structured Invoice JSON   │
│  • Price list caching (10m)  │
└──────────────────────────────┘

PDF Export path:
  Node.js ──(HTML)──► Python PDF Engine (WeasyPrint) :5001
                            │
                        PDF binary
                            │
                      Mobile app ──► Native share sheet
```

---

## How It Works

1. **Capture** — The user records a job-site video, types a description, or attaches a document (PDF, image, CSV). An optional price list can be uploaded to give the AI contractor-specific rates.
2. **Upload** — Media goes to Firebase Storage. An optimistic "processing" stub is immediately written to Firestore so the invoice card appears in the list right away.
3. **Process** — The Node server receives the request, validates the Firebase auth token, and forwards it to the Rust engine. The Rust engine downloads the media in parallel, uploads video to the Gemini File API, and calls `gemini-flash-latest` with a structured estimator prompt. The AI response is parsed into a typed `Invoice` JSON.
4. **Save** — The completed invoice is written back to Firestore. The mobile app's realtime listener updates the UI automatically.
5. **Edit** — Users can tap any line item to manually adjust price/quantity, or use the chat bar to issue natural-language commands ("Add a $150 disposal fee"). Edits go through the same Rust engine using Gemini function calling.
6. **Export** — The Node server renders the chosen EJS template, inlines all external images (Storage URLs → base64), and sends the HTML to the Python/WeasyPrint service. A PDF is returned and opened in the native share sheet.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | Expo 54 · React Native 0.81 · TypeScript · Expo Router |
| Auth | Firebase Authentication (email + Google Sign-In) |
| Database | Cloud Firestore (realtime) |
| File storage | Firebase Storage |
| API gateway | Node.js 22 · Express 5 · EJS templates |
| AI engine | Rust · Axum · Google Gemini API (`gemini-flash-latest`) |
| PDF engine | Python 3.12 · Flask · WeasyPrint |
| Infra | Docker · Docker Compose · Railway |

---

## Project Structure

```
VideoInvoice/
├── app/                        # Expo React Native app
│   ├── app/
│   │   ├── (auth)/             # Onboarding, login, signup, verify, setup
│   │   ├── (tabs)/             # Main tabs: Capture, Invoices, Profile
│   │   ├── invoice/[id].tsx    # Invoice detail, editing, export
│   │   ├── settings.tsx        # Template & business details
│   │   ├── preview.tsx         # Full-screen invoice preview (WebView)
│   │   └── privacy-security.tsx
│   ├── context/
│   │   ├── AuthContext.tsx     # Firebase auth state
│   │   └── ThemeContext.tsx    # Light / dark / system theme + AsyncStorage
│   ├── constants/Colors.ts     # Semantic color tokens (light & dark)
│   ├── utils/currency.ts       # Currency formatting & search
│   ├── config.ts               # API base URL (dev ngrok / prod Railway)
│   └── firebaseConfig.ts
│
├── api/
│   ├── node_server/            # Express API — auth, routing, templates, PDF
│   │   ├── src/
│   │   │   ├── app.js
│   │   │   ├── routes/quotes.js
│   │   │   ├── controllers/quotesController.js
│   │   │   ├── middlewares/auth.js
│   │   │   └── views/          # EJS invoice templates (6 designs)
│   │   └── Dockerfile
│   │
│   ├── rust_engine/            # Axum AI microservice — Gemini, Firestore
│   │   ├── src/
│   │   │   ├── main.rs         # Endpoints: /process, /edit
│   │   │   ├── gemini.rs       # Gemini API client + File API uploads
│   │   │   ├── prompt.rs       # System prompts
│   │   │   ├── models.rs       # Invoice / LineItem types
│   │   │   ├── db.rs           # Firestore read/write
│   │   │   └── media.rs        # Media download + processing
│   │   └── Dockerfile
│   │
│   ├── pdf_engine/             # Flask + WeasyPrint — HTML → PDF
│   │   ├── main.py
│   │   └── Dockerfile
│   │
│   └── docker-compose.yml
│
└── docs/
    └── VIDEOINVOICE_PRD.md
```

---

## Prerequisites

- **Node.js** 22+
- **Rust** (stable, for building the engine locally) or Docker
- **Python** 3.12+ (or Docker)
- **Expo CLI** — `npm install -g expo-cli`
- **Firebase project** with Auth, Firestore, and Storage enabled
- **Google Gemini API key** — [aistudio.google.com](https://aistudio.google.com)
- **Docker & Docker Compose** (recommended for the backend)

---

## Setup

### 1. Clone

```bash
git clone <repo-url>
cd VideoInvoice
```

### 2. Backend — environment variables

Copy the example files and fill in your credentials:

```bash
cp api/node_server/.env.example api/node_server/.env
cp api/rust_engine/.env.example api/rust_engine/.env
```

**`api/node_server/.env`**

```env
PORT=8080
RUST_AI_URL=http://rust_engine:3000/api/ai
PDF_ENGINE_URL=http://pdf_engine:5001
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**`api/rust_engine/.env`**

```env
PORT=3000
GEMINI_API_KEY=your-gemini-api-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Start the backend

```bash
cd api
docker compose up --build
```

Services start on:
- Node API → `http://localhost:8080`
- Rust engine → `http://localhost:3000`
- PDF engine → `http://localhost:5001`

### 4. Mobile app

```bash
cd app
npm install
```

Update `app/config.ts` with your backend URL (use [ngrok](https://ngrok.com) to expose localhost for device testing):

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `i`/`a` for iOS/Android simulator.

---

## Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password + Google
3. Enable **Firestore** in Native mode
4. Enable **Storage**
5. Generate a **service account key** (Project Settings → Service Accounts → Generate new private key) and use it for `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`
6. Copy your web app config into `app/firebaseConfig.ts`

### Firestore collections

| Collection | Purpose |
|---|---|
| `invoices` | Generated invoices — `project_name`, `line_items`, `total`, `currency`, `media_url`, `status` |
| `users/{uid}` | User profile — `hasCompletedOnboarding` |
| `users/{uid}/settings/invoice` | Invoice settings — `template`, `companyName`, `currency`, `theme_color`, `company_logo`, `signature_url`, `price_list_url` |

---

## API Reference

All endpoints require a Firebase ID token in the `Authorization: Bearer <token>` header.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/quotes/generate` | Generate invoice from media URLs + prompt |
| `POST` | `/api/quotes/edit` | Apply natural-language edit to existing invoice |
| `POST` | `/api/quotes/:id/preview` | Render invoice HTML with user's template |
| `POST` | `/api/quotes/:id/export` | Export invoice as PDF |
| `POST` | `/api/quotes/template-preview/:name` | Render sample invoice for template picker |

**Generate request body**

```json
{
  "invoice_id": "optional-existing-doc-id",
  "media_urls": ["https://firebasestorage.googleapis.com/..."],
  "prompt": "Describe the job or leave empty for video-only",
  "currency": "USD",
  "price_list_url": "https://firebasestorage.googleapis.com/..."
}
```

---

## Invoice Templates

Six built-in designs, each customisable with a theme colour:

| ID | Style |
|---|---|
| `modern` | Clean header, rounded info cards, accent total badge |
| `classic` | Bordered table, accent top rule, letterhead layout |
| `minimal` | Ultra-sparse, wide tracking, thin dividers |
| `premium` | Dark navy header, italic branding, dark total button |
| `elegant` | Centred masthead, double gold rules, italic invoice label |
| `bold` | Full-width accent banner, ghost "INV" watermark |

---

## Light & Dark Mode

The app ships with full light/dark support. Users can choose **System** (follows device), **Light**, or **Dark** from the Profile tab. The preference is persisted to AsyncStorage.

Camera-mode UI elements (overlays on the live viewfinder) always remain dark regardless of the theme setting.

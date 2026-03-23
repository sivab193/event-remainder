# Birthday Tracker

A multi-channel notification system designed for tracking personal and professional birthdays with robust timezone support, calendar synchronization, and automated reminders.

---

## 🏗️ Architecture

This repository is built as a monorepo containing three main components:

- **`ui/`**: The modern Next.js 16 frontend application using App Router. Built with Tailwind CSS and shadcn/ui. Uses Firebase for Authentication and Firestore for the real-time database.
- **`python-workers/`**: A distributed backend for asynchronous notifications. Uses Redis as a message broker to decouple the scheduling of birthdays from the actual sending of Emails (Resend), Telegram messages, and Discord webhooks.
- **`mcp-server/`**: A standalone Model Context Protocol (MCP) server that exposes database querying capabilities directly to AI agents.

## ✨ Features

- **Multi-Channel Reminders**: Get notified via Email, Telegram, or Discord.
- **Timezone Intelligence**: Reminders are dynamically calculated and dispatched exactly 5 minutes before midnight in the birthday person's specific timezone.
- **Calendar Sync**: Dynamic `.ics` feeds for native mobile calendar synchronization (Apple/Google calendars).
- **Bulk Import**: Easily import birthdays from Facebook (`.ics`), Google Contacts, and Apple Contacts (`.vcf` / `.zip`).
- **Firebase Authentication**: Secure login/signup with email, password, and Google OAuth.

---

## 🚀 Setup Instructions

### 1. UI Setup (Next.js)

Navigate to the `ui` directory:
```bash
cd ui
npm install
```

Set up your frontend environment variables in `ui/.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Run the development server:
```bash
npm run dev
```

### 2. Microservices Backend (Python Workers)

Navigate to `python-workers` and configure your environment:
```env
REDIS_HOST=localhost
RESEND_API_KEY=your_resend_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
DISCORD_WEBHOOK_URL=your_discord_webhook
```

Start the Redis server, scheduler, and worker containers:
```bash
docker-compose up -d
```

### 3. MCP Server

Navigate to `mcp-server` to start the local Model Context Protocol service:
```bash
cd mcp-server
npm install
npm start
```

---

## 🧪 Testing

### UI Tests (Vitest)

```bash
cd ui
npm test               # watch mode
npm run test:coverage  # single run with coverage report
```

All 43 unit and component tests pass across:
- **Library utilities**: `birthday-calculator`, `birthdays`, `notifications`, `user-profile`, `firebase`, `utils`
- **Components**: `BirthdayCard`, `BirthdayDashboard`, `ImportBirthdays`, `ProtectedRoute`

Coverage is enforced at 80% (lines, functions, branches) in CI.

### CI/CD (GitHub Actions)

On every push/PR to `main`, the workflow at `.github/workflows/test.yml` runs:
- **UI tests** — Vitest unit/integration + Playwright E2E
- **Worker tests** — Pytest with coverage (Python workers)
- **MCP tests** — Vitest (passes with no tests flag until tests are added)

---

## 🔒 Firestore Security Rules

Ensure your Firestore database is secure. Add these rules to your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Birthdays collection
    match /birthdays/{birthdayId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

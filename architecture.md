# Birthday Tracker Architecture

A multi-channel notification system designed for tracking personal and professional birthdays with robust timezone support, calendar synchronization, and automated reminders.

## 🏗️ System Overview

The application follows a modern serverless frontend architecture combined with a dockerized backend worker system for high-reliability background tasks.

### 1. Frontend: Next.js + Tailwind CSS
*   **Framework**: Next.js 15 (App Router).
*   **Authentication**: Firebase Auth (Email/Password + Google OAuth).
*   **Database**: Google Cloud Firestore (NoSQL) for real-time data and stats.
*   **Styling**: Responsive Tailwind CSS, mobile-first design, and PWA ready.
*   **State Management**: React Context API (`AuthContext`, `ThemeContext`).

### 2. Microservices Backend: Python + Redis + Docker
To handle reminders asynchronously without overloading the main UI process, we use a distributed worker pattern:
*   **Message Broker (Redis)**: Actively decouples the scheduler from the notification workers.
*   **Scheduler (Python)**: Periodically scans Firestore for upcoming birthdays and dispatches "jobs" to Redis.
*   **Workers (Email, Telegram, Discord)**: Independent Python containers that listen to their respective Redis queues and execute API calls. This allows us to scale notification channels horizontally.

### 3. Notification Ecosystem
*   **Email**: Integrated via Resend.
*   **Telegram**: Bot API integration for direct messaging.
*   **Discord**: Webhook-based channel alerts.
*   **Mobile Push (Calendar Sync)**: Native push notifications via dynamic `.ics` feeds that users subscribe to in their mobile calendar app (Apple/Google).

## 📊 Component Interaction Diagram

1.  **User Action**: User adds a birthday via the Next.js UI.
2.  **Data Storage**: Entry is stored in Firestore; Firebase counters increment site-wide stats.
3.  **Synchronization**: The Calendar Feed endpoint (`/api/calendar/[userId]`) is automatically updated with the new event.
4.  **Scheduled Reminder**:
    *   **Scheduler** finds the birthday.
    *   Scheduler pushes a JSON payload to `redis:email_queue`.
    *   **Email Worker** pops the message and sends the email via Resend API.

## 📤 Data Import & Integration

The application supports bulk importing birthdays from major platforms using standard file formats.

### 1. Facebook Import (ICS)
Facebook is the most common source for friend birthdays. 
1. Go to **Facebook** on your computer.
2. Navigate to **Events** -> **Birthdays**.
3. Scroll to the bottom and look for a link: **"Export Birthdays"** (usually on the right sidebar).
4. A popup will give you a Webcal URL. 
   - *Tip*: Copy that URL, paste it into your browser, change `webcal://` to `https://`, and press enter to download the `.ics` file.
5. Upload that `.ics` file directly into our **Bulk Import** dropzone.

### 2. Contact Import (VCF)
You can export your entire phone contact list to bring in birthdays.
*   **iPhone**: Open **Contacts** -> Select All (or a group) -> **Export vCard**.
*   **Android/Google**: Open **Google Contacts** -> **Export** -> **vCard (for iOS Contacts)**.
*   Upload the resulting `.vcf` file. Our parser specifically looks for the `FN` (Full Name) and `BDAY` fields.

### 3. Calendar Sync (ICS/ZIP)
If you have a digital calendar with birthdays (Google, Outlook, Apple), export the specific "Birthdays" calendar as an `.ics` or a `.zip` file and upload it.

### Frontend (UI & API Routes)
*   **Provider**: Vercel.
*   **Reason**: Native Next.js support, edge functions for the ICS feed, and automatic SSL/CDN.

### Backend (Docker Workers)
*   **Provider**: Railway or Render (via `docker-compose.yml`).
*   **Alternatively**: A small VPS (DigitalOcean/Linode) running the `docker-compose` stack.
*   **Configuration**:
    *   Set `FIREBASE_CREDENTIALS` as a mounted volume or secret.
    *   Environment variables for `RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN`, and `REDIS_HOST`.

---

## 🎨 Image Generation Prompt (Architecture Diagram)

> **Prompt**: "A clean, modern, isometric architectural diagram of a web application on a dark background. The diagram should show three main layers: 
> 1. Top Layer: 'Web UI' (Next.js icon, desktop and mobile screens) connected to 'Firebase Auth'. 
> 2. Middle Layer: 'Database & Sync' (Firestore icon) with data flowing into an '.ics Calendar Feed' and out to a 'Redis Message Broker'. 
> 3. Bottom Layer: 'Python Microservices' (three distinct circular nodes labeled Email, Telegram, and Discord) connected to the Redis broker. 
> Arrows should show data flow from the UI to Database, and from Database to Redis to Workers. Professional tech illustration style, neon emerald and blue highlights, high detail, 4k resolution, clean typography."

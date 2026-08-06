# 🧭 GatePulse

> **IT Park Job Walk-in Drive Intelligence & Landmark Gate Navigation Platform**

GatePulse is a full-stack monorepo application designed to aggregate, parse, verify, and navigate job walk-in drives across major IT parks in India (Bengaluru, Hyderabad, Pune, Chennai, Noida). 

Powered by **Gemini 1.5 Flash AI**, GatePulse instantly extracts key recruitment details from raw, unformatted job notices (WhatsApp, Telegram, LinkedIn), runs authenticity scoring to detect payment fraud demands, and provides precise landmark gate directions with direct Google Maps navigation and device calendar entry.

---

## 🌐 Live Production Application

- **Web Portal (Vercel)**: [https://gatepulse-xi.vercel.app](https://gatepulse-xi.vercel.app)
- **Express API Health Endpoint**: [https://gatepulse-xi.vercel.app/health](https://gatepulse-xi.vercel.app/health)
- **GitHub Repository**: [https://github.com/premsekarb001/Gatepulse](https://github.com/premsekarb001/Gatepulse)

---
##Gatepulse Android APP View
<img width="350" height="596" alt="image" src="https://github.com/user-attachments/assets/e695644e-0bae-41cc-a55b-30ccfad001b2" />



## 🚀 System Architecture & Stack

```
gatepulse-monorepo/
├── services/
│   └── api/             # Express.js + TypeScript + Gemini 1.5 Flash + Supabase
├── apps/
│   ├── web/             # Next.js 14 App Router + Tailwind CSS Web Portal
│   └── mobile/          # React Native + Expo SDK + Google Maps & Calendar Integration
├── packages/
│   └── shared/          # Shared TypeScript Interfaces & Data Schemas
└── scripts/
    ├── auto-sync.js     # Git Auto-Stage, Commit & Push Automation
    └── watch-and-sync.js# Continuous Background File Watcher Service
```

### Stack & Technologies
- **Core Engine**: TypeScript, Node.js (v24+)
- **AI Processing**: Google Gemini 1.5 Flash via `@google/genai`
- **Database**: Supabase PostgreSQL (`@supabase/supabase-js`)
- **Web Portal**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons
- **Mobile App**: Expo SDK 51, React Native, `react-native-maps`
- **DevOps & Cloud**: Vercel Serverless Functions, GitHub Actions / Auto-Sync

---

## ✨ Key Features

1. **AI Notice Parsing (`POST /api/v1/ingest/parse-and-save`)**:
   - Takes raw, messy WhatsApp/Telegram recruitment text.
   - Extracts `company_name`, `job_title`, `experience_range`, `walkin_start_date`, `city`, `it_park_name`, `landmark_gate`, `trust_score`, and `contains_payment_demand`.

2. **Automated Fraud Protection**:
   - Scores drives from 0 to 100% based on authenticity signals.
   - Flags mandatory registration, training, or deposit fee demands with a **Red Alert Fraud Warning Banner**.

3. **Landmark Gate Locator**:
   - Displays gate-specific entrance details (e.g., *"Gate 3 Main Visitor Entrance, Block N1 Reception"*).
   - One-click **Google Maps Navigation** intent (`geo:` / web fallback).

4. **Direct Calendar Entry**:
   - Generates instant Google Calendar & iCal event links for walk-in interview dates.

5. **Continuous Git Auto-Sync**:
   - Active file watcher service (`npm run watch-sync`) that automatically stages, commits, and pushes file edits to GitHub main branch.

---

## 🛠️ Quick Start & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/premsekarb001/Gatepulse.git
cd Gatepulse

# Install all workspace dependencies
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in `services/api/.env`:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Run Development Services

```bash
# Build shared packages first
npm run build:shared

# Start Express Backend API (Port 5000)
npm run dev:api

# Start Next.js Web Portal (Port 3000)
npm run dev:web

# Start Expo Mobile App Dev Server
npm run dev:mobile
```

---

## 📡 API Reference

### 1. Ingest Notice & AI Parse
- **Endpoint**: `POST /api/v1/ingest/parse-and-save`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "raw_text": "Walk-in drive at TCS Bangalore for Java Fullstack Developers! Exp: 1-3 Yrs. Date: 2026-08-12. Location: Manyata Tech Park Gate 3. No registration fee."
  }
  ```
- **Response**: `201 Created` with extracted JSON and Supabase record ID.

### 2. Fetch Active Walk-in Drives
- **Endpoint**: `GET /api/v1/drives`
- **Query Params**: `city`, `it_park_name`, `experience`, `search`, `min_trust_score`
- **Response**: Active drives sorted by `walkin_start_date` (Earliest first).

---

## 🗄️ Supabase SQL Database Schema

```sql
CREATE TABLE IF NOT EXISTS walkin_drives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  experience_range TEXT,
  experience_min INT DEFAULT 0,
  experience_max INT DEFAULT 5,
  walkin_start_date DATE NOT NULL,
  walkin_end_date DATE,
  time_slot TEXT,
  city TEXT NOT NULL,
  it_park_name TEXT NOT NULL,
  landmark_gate TEXT NOT NULL,
  trust_score INT DEFAULT 85,
  contains_payment_demand BOOLEAN DEFAULT FALSE,
  raw_text TEXT,
  contact_email TEXT,
  venue_address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---

## 📱 Mobile APK Build (Android)

To generate a standalone Android `.apk` file:

```bash
cd apps/mobile
npx eas-cli build --platform android --profile preview
```

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

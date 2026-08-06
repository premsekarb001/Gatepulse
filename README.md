# 🚀 GatePulse — AI-Powered Walk-In Job Drive & Resume Matcher

> **Live Web Application:** [gatepulse-xi.vercel.app](https://gatepulse-xi.vercel.app)  
> **GitHub Repository:** [github.com/premsekarb001/Gatepulse](https://github.com/premsekarb001/Gatepulse)  
> **Architecture:** Full-Stack Monorepo (Next.js 14, Expo React Native, Express/Vercel Serverless)

---

## 📌 Overview

**GatePulse** is a cross-platform career platform built to help job seekers discover active walk-in hiring drives and evaluate their candidate-job fit instantly using **Google Gemini 1.5 Flash AI**.

Job seekers can upload their CV (`.pdf`, `.docx`, `.doc`, `.txt`) on either web or mobile to receive instant skill extraction, compatibility scoring, skill overlap & gap analysis, and tailored application feedback.

---

## ✨ Key Features

* **AI Auto-Match CV Engine:** Uses Google Gemini 1.5 Flash with Zod schema validation to parse resumes, extract core tech stacks, and evaluate candidate experience against active job drives.
* **Fail-Safe Heuristic Fallback:** Built-in resilience engine using local keyword/heuristic extraction to guarantee 100% upload processing uptime during API latency or network timeouts.
* **Color-Coded Match Scoring:** Real-time fit breakdown featuring **Emerald (80%+)**, **Amber (50–79%)**, and **Slate (<50%)** compatibility badges.
* **Skill Overlap & Gap Breakdown:** Side-by-side display of matching skill tags alongside missing job requirements.
* **Full Cross-Platform Parity:** Feature-matched web application (Next.js 14) and mobile application (Expo / React Native).
* **Vercel Serverless & Supabase Integration:** Powered by Supabase PostgreSQL queries and Vercel serverless API route handlers.

---

## 🛠️ Tech Stack & Monorepo Architecture

| Component | Technology |
| :--- | :--- |
| **Monorepo Management** | npm Workspaces (`packages/shared`, `apps/web`, `apps/mobile`, `services/api`) |
| **Web Frontend** | Next.js 14 (App Router), React, Tailwind CSS |
| **Mobile Frontend** | Expo, React Native, `expo-document-picker` |
| **Backend & Serverless** | Next.js App Router API Routes (`/api/v1/match-cv`), Node.js, Express |
| **AI Processing** | Google Gemini 1.5 Flash AI |
| **Database** | Supabase (PostgreSQL) |
| **Hosting & Deployment** | Vercel (Production Hosting & Serverless Functions) |

---

## 📁 Repository Structure

```text
Gatepulse/
├── apps/
│   ├── web/            # Next.js 14 Web Application (Deployed on Vercel)
│   └── mobile/         # Expo React Native App (Android / iOS)
├── services/
│   └── api/            # Express Node.js Backend API Service
├── packages/
│   └── shared/         # Shared TypeScript Types & Business Logic
├── vercel.json         # Vercel Deployment & Build Config
└── package.json        # Root Monorepo Scripts & Workspaces

```

---

## 🚀 Getting Started Locally

### Prerequisites

* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher

### Installation

1. **Clone the repository:**
```bash
git clone [https://github.com/premsekarb001/Gatepulse.git](https://github.com/premsekarb001/Gatepulse.git)
cd Gatepulse

```


2. **Install workspace dependencies:**
```bash
npm install

```


3. **Build shared workspace packages:**
```bash
npm run build:shared

```


4. **Run local development servers:**
```bash
# Start Web App (http://localhost:3000)
npm --prefix apps/web run dev

# Start Mobile App Metro Bundler
npm --prefix apps/mobile run start

```



---

## ⚙️ Environment Configuration

Create an `.env.local` file inside `apps/web` (and configure these variables in your Vercel Dashboard):

```env
NEXT_PUBLIC_API_URL=[https://gatepulse-xi.vercel.app](https://gatepulse-xi.vercel.app)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key

```

---

## 📄 License

This project is open-source and available under the **MIT License**.

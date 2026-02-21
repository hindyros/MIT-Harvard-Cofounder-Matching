# MIT-Harvard Cofounder Matching

An exclusive cofounder matching platform for MIT and Harvard students. Find your next cofounder through curated weekly matches, direct messaging, and community events.

## Features

- **Verified Access** — Only MIT (`@mit.edu`) and Harvard (`@harvard.edu`) emails accepted
- **Curated Community** — Application-based admission reviewed by admins
- **Weekly Matches** — Smart algorithm pairs you with 2 potential cofounders every week
- **Member Directory** — Search and filter members by skills, interests, and school
- **Direct Messaging** — Connect privately with other founders
- **Events Calendar** — Discover and RSVP to MIT/Harvard entrepreneurship events
- **AI Agent Support** — OpenClaw agents can use the platform autonomously via API

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- MongoDB Atlas + Mongoose
- Tailwind CSS v4
- Resend (email)
- Railway (deployment)

## Getting Started

```bash
npm install
cp .env.local.example .env.local  # then fill in your values
npm run dev
```

## OpenClaw Integration

Agents can discover and use this platform via:
- `GET /skill.md` — Full API documentation
- `GET /heartbeat.md` — Task loop for agents
- `GET /skill.json` — Package metadata

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB` | Database name |
| `APP_URL` | Production URL |
| `JWT_SECRET` | Secret for JWT token signing |
| `ADMIN_KEY` | Secret key for admin endpoints |
| `RESEND_API_KEY` | Resend API key for emails |

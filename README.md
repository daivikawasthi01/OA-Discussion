# OA Discussion

A MERN-stack community platform where students share and browse company Online Assessment (OA) and interview experiences (questions, difficulty, topics, and outcomes) to help others prepare for placements.

## Features

- **Experience posts**: create, browse, filter, and compare OA/interview experiences by company, role, platform, difficulty, topics, and question patterns
- **Trending & comparison views**: surface popular experiences and compare multiple companies side by side
- **Voting, bookmarking & reporting**: upvote useful posts, bookmark them for later, and report inappropriate content
- **Threaded comments**: comment and reply on experience posts, with optional anonymous posting
- **Authentication**: email/password signup with OTP email verification, password reset, and Google OAuth login (Passport.js + JWT)
- **Admin moderation**: admin-only routes for reviewing reported posts and removing content
- **Gamification**: users earn coins and leaderboard points (e.g. daily visit claims, a coin-to-points "shop") and can view a leaderboard
- **Notifications**: in-app and web-push notifications (company OA alerts, comment replies, weekly digest), with per-user notification preferences
- **AI-assisted drafting**: generates a structured OA/interview experience description from role, platform, difficulty, and topics via the Groq API
- **User profiles**: public profile pages and a bookmarks view per user

## Tech Stack

**Backend**
- Node.js, Express 5
- MongoDB with Mongoose
- Passport.js (Google OAuth 2.0), JSON Web Tokens, bcryptjs
- Nodemailer / Resend (OTP & email), web-push (push notifications)
- Groq SDK / OpenAI SDK (AI-generated content)

**Frontend**
- React 18 + Vite
- React Router, Tailwind CSS, Radix UI primitives, shadcn-style components
- Framer Motion, Recharts, react-markdown

## Project Structure

```
OA-Discussion/
├── backend/
│   ├── config/        # DB connection, Passport strategy, push/notification helpers
│   ├── controllers/    # auth, comment, experience, reward, user
│   ├── middleware/      # auth, admin, error handling
│   ├── models/          # User, Experience, Comment, Notification, Otp, Reward
│   ├── routes/           # /auth, /api/experience, /api/users, /api/comments, /api/ai, /api/push, /api/shop, /api/sidebar, /api/notifications
│   └── server.js
└── frontend/
    ├── src/pages/      # Home, Feed, Forum, Trending, Leaderboard, profile & auth pages, Admin
    ├── src/components/ # ExperienceCard, CommentSection, UpvoteButton, notifications, etc.
    └── src/services/   # API client, data normalization, filters
```

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or Atlas)
- API keys as needed: Google OAuth client, Groq/OpenAI, Nodemailer/Resend, web-push VAPID keys

### Backend

```bash
cd backend
npm install
# create a .env with MONGO_URI, JWT_SECRET, FRONTEND_URL, GOOGLE_CLIENT_ID/SECRET,
# GROQ_API_KEY, and mail/push credentials as needed
node server.js
```

The API runs on `http://localhost:5000` by default and exposes routes under `/auth` and `/api/*`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server defaults to `http://localhost:5173` and talks to the backend via `src/services/api.js`.

## Usage

Sign up (or sign in with Google), verify your email via OTP, then browse the feed to read OA/interview experiences, post your own, comment, upvote, bookmark, and track your coins/points on the leaderboard.

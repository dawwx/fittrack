# FitTrack Pro

FitTrack — Final Build Prompt (paste this into Lovable / Emergent / any AI app builder)

Build a full-stack web app called "FitTrack – Smart Gym & Diet Planner": a personal fitness companion for tracking workouts, nutrition, water intake, and progress. It should feel like a polished, real fitness product — not a tutorial CRUD app.

STACK

Frontend: React + Tailwind CSS

Backend: Node.js + Express (REST API)

Database: PostgreSQL (or your platform's default relational DB)

Charts: Recharts

Auth: JWT-based, with bcrypt password hashing

Icons: lucide-react

If any of these are unavailable in your environment, substitute the closest stable equivalent rather than stopping.

PROJECT STRUCTURE

Keep frontend and backend as separate deployable units, no cross-folder imports:

Code fittrack/

├── backend/

│   ├── package.json

│   ├── .env.example

│   └── src/

│       ├── server.js

│       ├── config/db.js

│       ├── db/ (schema.sql, seed.js)

│       ├── middleware/ (auth.js, errorHandler.js)

│       ├── utils/calculations.js

│       ├── controllers/ (one per feature)

│       ├── routes/ (one per feature)

│       └── services/ (workoutGenerator.js, dietGenerator.js, fitbot.js, achievementService.js)

└── frontend/

    ├── package.json, vite.config.js, tailwind.config.js

    └── src/

        ├── main.jsx, App.jsx, index.css

        ├── api/client.js

        ├── context/ (AuthContext.jsx, ThemeContext.jsx)

        ├── components/ (Sidebar, BottomNav, Layout, Card, ProgressRing, ProtectedRoute)

        └── pages/ (Login, Register, OnboardingProfile, Dashboard, Workouts, WorkoutSession, Diet, Calories, Water, Progress, FitBot, Achievements, Profile, Admin)

BUILD IN THIS ORDER

Verify each stage works before moving to the next:

Project scaffold (frontend + backend + DB connection)

Database schema (tables listed below)

Auth: register, login, logout, protected routes, hashed passwords

User profile creation (post-signup onboarding)

Dashboard

Workout module (plan generator + tracker)

Diet module (meal planner + food log)

Calorie/macro tracker

Water tracker

Progress tracker + charts

Gamification (streaks, achievements)

AI chatbot ("FitBot")

Admin panel

Full responsive polish + dark mode

Bug pass

CORE FEATURES

User Profile (post-registration form): full name, age, gender, height (cm), weight (kg), fitness level (beginner/intermediate/advanced), fitness goal (weight loss/muscle gain/maintenance/general fitness), workout location (gym/home), workout days/week, session duration, food preference (veg/non-veg/vegan), allergies, optional target weight.

Dashboard: greeting header, current vs target weight, BMI, daily calorie/protein targets, water progress, today's workout, streak counter, progress charts. Cards with circular/bar progress indicators.

BMI Calculator: standard formula, category + healthy range, visual indicator. Label clearly as a screening metric, not a diagnosis.

Workout Generator: personalized plans based on goal, level, location, days/week, duration, equipment. Categories: chest, back, shoulders, biceps, triceps, legs, core, full body. Each exercise: name, target muscle, sets, reps, rest time, difficulty, equipment, instructions, common mistakes. Users mark exercises complete.

Workout Tracker: start/complete sessions, log sets/reps/weight/duration, view history, daily completion %.

Diet Planner: meal plan (breakfast, mid-morning snack, lunch, evening snack, dinner) generated from calorie/protein targets, food preference, and allergies. Each item shows calories/protein/carbs/fat. Users can swap meals.

Food Database: seed with common foods including Indian staples (rice, roti, dal, paneer, curd, milk, eggs, chicken, fish, oats, banana, apple, sprouts, nuts, vegetables) with calories/macros/serving size. Searchable, addable to daily log.

Calorie & Macro Tracker: daily totals vs targets (calories, protein, carbs, fat) with circular/bar progress. Add/remove food, adjust servings.

Water Tracker: default 3L/day goal, quick-add buttons (250/500/750ml) + custom amount, visual progress.

Progress Tracker: log weight, waist, chest, arms, thighs. Charts for weight/calories/protein/workouts/water over 7d/30d/3mo/6mo.

Gamification: workout streaks, nutrition/water streaks, achievement badges (e.g. 7-Day Streak, First Workout, Hydration Hero), shown on profile.

FitBot (AI Assistant): answers questions on workouts, exercises, nutrition swaps, scheduling, motivation, and progress — personalized using the user's profile data. Must never present itself as a medical/dietitian professional; include a visible disclaimer that guidance is general wellness info, not medical advice.

Weekly Report: auto-generated summary — weight change, workouts completed, avg calories/protein/water, completion %, streak, badges earned, plus a short motivational insight.

Reminders: user-created reminders for workouts, water, meals, progress updates; browser notifications if supported.

Exercise Library: searchable/filterable (muscle group, difficulty, equipment, home/gym), same detail fields as above.

Admin Panel (role-restricted): manage exercises, foods, achievements, workout/meal templates; view registered users. No access for regular users.

UI/UX

Fully responsive: mobile (bottom nav), tablet, desktop (sidebar nav)

Modern card-based layout, rounded corners, smooth transitions

Light + dark mode, persisted per user

Proper loading, empty, and error states everywhere (friendly copy, not raw errors — e.g. "No workouts logged yet. Complete your first workout to start tracking your progress! 💪")

Nav sections: Dashboard, Workouts, Diet, Calories, Water, Progress, FitBot, Achievements, Profile

DATABASE TABLES

users, profiles, exercises, workout_plans, workout_plan_days, workout_plan_exercises, workout_logs, workout_log_exercises, foods, meal_plans, meal_plan_items, food_logs, water_logs, progress_logs, achievements, user_achievements, reminders, chat_messages — with proper foreign keys so each user only ever accesses their own data.

SECURITY

Hashed passwords, JWT auth middleware, per-user data isolation, input validation, no secrets/API keys in frontend code, .env for config.

CALCULATIONS

Implement BMI, BMR, daily calorie needs, and protein targets using standard formulas. Label all results as estimates, not medical-grade figures.

DEMO DATA

Seed realistic sample exercises, foods, workout plans, meal plans, and achievements so the app looks complete on first run. No real personal data.

DEPLOYMENT READINESS

Frontend and backend must be independently deployable, each with its own package.json.

Backend reads ALL config (DB connection string, JWT secret, PORT, allowed CORS origins) from environment variables — never hardcode localhost URLs or ports.

Frontend reads the API base URL from an environment variable (e.g. VITE_API_URL) — never hardcode http://localhost:5000.

Enable CORS on the backend with an allowlist driven by an env variable, so it can be pointed at the deployed frontend domain.

Use a DB connection method compatible with hosted providers (standard connection string) — works with Supabase, Neon, Railway, or Render Postgres.

Frontend has a production build script (npm run build) outputting static files servable by any static host.

Backend has a npm start script for production, separate from the dev script.

Add a health check endpoint (GET /api/health) returning 200 OK.

No secrets committed to the repo — provide .env.example with placeholder values only.

Target deployment: frontend on Vercel/Netlify, backend + DB on Render/Railway (or note steps if using a single all-in-one host instead).

Avoid platform-locked features (no serverless-only syntax unless requested; no filesystem writes for persistent data, since most hosts have ephemeral filesystems).

DELIVERABLES AT THE END

Working app (frontend + backend connected)

Database schema

API documentation

Setup/run instructions (frontend + backend) for local development

DEPLOYMENT.md — step-by-step deployment guide (e.g. Vercel + Render), including which env variables go where

.env.example files for both frontend and backend

Demo admin login + demo user account

Folder structure overview

Brief explanation of each module

PRIORITY IF TRADE-OFFS ARE NEEDED

Functionality > clean UI > responsiveness > DB structure > auth security > personalization > polish. Avoid overengineering — keep it stable and demoable over feature-maximal.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c959ec6b-dd73-457a-8ef3-5e77ff8a019b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

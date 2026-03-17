# The Return of Attention

The Return of Attention is a Next.js meditation and self-reflection platform built around the PAHM (Present Attention and Happiness Matrix) methodology. It includes guided stage progression, timed practice sessions, self-assessments, daily notes, and an admin area for monitoring and support.

## Overview

- Frontend: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS
- Backend: Next.js route handlers and server actions
- Authentication: NextAuth credentials login with optional Google OAuth
- Database: Prisma ORM with PostgreSQL on Supabase
- Email: Resend for verification and password reset emails
- Deployment target: Vercel + Supabase

## Core Features

- Guided meditation journey across six stages
- PAHM session setup, timer, click tracking, and reflection flows
- Questionnaire and self-assessment workflows
- Daily notes and happiness tracking
- User profile and password management
- Admin tools for user management, stage control, and reporting

## Prerequisites

Before starting, ensure you have:

### 1. Node.js and npm

1. Download and install [Node.js 20 or newer](https://nodejs.org/).
2. Verify installation:

   ```bash
   node --version
   npm --version
   ```

### 2. Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in or create an account.
2. Create a new project:
   - Click **New project**.
   - Choose an organization, enter a project name, set a strong database password, and select a region.
   - Wait for the database to initialize.
3. Once ready, note your **Project URL**, **Anon Key**, and **Service Role Key** (found under **Settings > API keys**).

### 3. Vercel Account (for deployment)

1. Go to [vercel.com](https://vercel.com) and sign in or create an account.
2. You'll use Vercel to deploy the application later.

### 4. Optional Integrations

- **Google OAuth**: Register at [Google Cloud Console](https://console.cloud.google.com/) if you want to support Google login.
- **Resend**: Sign up at [resend.com](https://resend.com) if you want to enable email verification and password reset emails.

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Create your local environment file.

```bash
copy .env.example .env.local
```

3. Fill in the required values in `.env.local`.

Required for basic app startup:

- `NEXTAUTH_URL`
	- Local dev value: `http://localhost:3000`
	- Production value: your deployed app URL (for example `https://your-app.vercel.app`)

- `NEXTAUTH_SECRET`
	- Generate a strong random secret (32+ chars).
	- Quick way (PowerShell):

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

	- Paste the output as `NEXTAUTH_SECRET`.

- `DATABASE_URL` and `DIRECT_URL`
	- In Supabase Dashboard, open your project.
	- Click `Connect` (top bar).
	- Open the `ORMs` tab.
	- Select `Prisma`.
	- You will see two connection URLs. **Both contain `[your-password]` as a placeholder**.
	- Replace `[your-password]` with the database password you set when creating the Supabase project.
	- Copy the updated URLs into:
		- `DATABASE_URL`
		- `DIRECT_URL`

- `NEXT_PUBLIC_SUPABASE_URL`
	- In Supabase Dashboard, open your project.
	- Click `Connect` (top bar).
	- Go to the `API keys` tab.
	- Copy the `Project URL`.

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
	- Supabase Dashboard -> `Project Settings` -> `API keys`.
	- Under Legacy keys, copy `anon` key.

- `SUPABASE_SERVICE_ROLE_KEY`
	- Supabase Dashboard -> `Project Settings` -> `API keys`.
	- Under Legacy keys, copy `service_role` key.
	- Keep this server-only and never expose it in client code.

Optional integrations:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `RESEND_API_KEY`
- `FROM_EMAIL`
- `ENABLE_EMAIL_VERIFICATION`

Required only for admin-only protected operations:

- `ADMIN_REGISTRATION_KEY`
- `ADMIN_CLEAR_DATA_CODE`

4. Generate Prisma client.

```bash
npm run db:generate
```

5. Apply database migrations.

```bash
npm run db:deploy
```

6. Seed the baseline data.

```bash
npm run db:seed
```

7. Start the development server.

```bash
npm run dev
```

The app will run at `http://localhost:3000`.

## Admin Bootstrap

Before creating the first admin user, set these values in `.env.local`:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

If you intend to use admin registration or destructive admin maintenance routes, also set:

- `ADMIN_REGISTRATION_KEY`
- `ADMIN_CLEAR_DATA_CODE`

Then run:

```bash
npm run admin:create
```

The script will fail if the admin email or password is missing. This is intentional to avoid shipping default credentials.

## Deployment

Recommended deployment model:

1. Host the application on Vercel.
2. Host PostgreSQL on Supabase.
3. Configure the same environment variables from `.env.example` in the Vercel project.
   - **Important**: Set `NEXTAUTH_URL` to your Vercel deployment URL (for example `https://your-app.vercel.app`). This must match your actual deployed domain exactly, or authentication will fail.
4. Run database deployment commands against the production database before the first release.

Recommended production sequence:

```bash
npm install
npm run db:generate
npm run db:deploy
npm run build
```

Notes:

- If Google OAuth credentials are not provided, credentials-based sign-in still works.
- If `ENABLE_EMAIL_VERIFICATION=false`, new users can sign in immediately after registration.
- If `ENABLE_EMAIL_VERIFICATION=true`, Resend should also be configured so verification emails can be delivered.
- Admin registration and destructive admin data-clear routes are disabled unless `ADMIN_REGISTRATION_KEY` and `ADMIN_CLEAR_DATA_CODE` are explicitly configured.
- `prisma/migrations` is baseline-driven for fresh database setup; run `npm run db:deploy` on a new Supabase database to create the full schema.

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run check
npm run db:generate
npm run db:deploy
npm run db:seed
npm run db:studio
npm run admin:create
```

## Project Structure

```text
src/
	app/              Next.js routes, pages, and API handlers
	components/       Client UI and feature components
	hooks/            Shared React hooks
	lib/              Auth, data, validation, Prisma, Supabase, business logic
prisma/
	schema.prisma     Prisma schema
	migrations/       Database migrations
	seed.ts           Seed data for stages and baseline records
scripts/
	create-admin.ts   Admin bootstrap script
public/
	audio/            Audio assets
	images/           Static assets
```

## Troubleshooting

- If the app fails at startup, verify every required variable in `.env.local`.
- If authentication redirects fail, confirm `NEXTAUTH_URL` matches the current environment exactly.
- If database commands fail, confirm Supabase connection strings are correct and SSL settings are included.
- If email flows fail, either configure Resend correctly or set `ENABLE_EMAIL_VERIFICATION=false` for environments that should not send mail.
- If Google login is needed, add both Google OAuth variables and confirm the redirect URL in Google Cloud matches the Vercel domain.
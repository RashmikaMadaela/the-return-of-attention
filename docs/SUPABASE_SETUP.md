# Supabase Setup Instructions

## 🚀 Quick Setup Guide

### 1. Create Supabase Account & Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `the-return-of-attention` 
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project initialization (2-3 minutes)

### 2. Get Your Supabase Credentials

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy the following values:

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"

# Anon (public) key - safe to use in client-side code
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# Service role key - server-side only, keep secret!
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

3. Go to **Settings** → **Database**
4. Copy the connection string:

```bash
# Connection pooling URL (recommended for production)
DATABASE_URL="postgresql://postgres.your-ref:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# Direct connection URL (for migrations)
DIRECT_URL="postgresql://postgres.your-ref:[YOUR-PASSWORD]@aws-0-us-west-1.compute-1.amazonaws.com:5432/postgres"
```

### 3. Update Environment Variables

Replace the placeholder values in `.env.local`:

```bash
# Database
DATABASE_URL="your-supabase-connection-pooling-url"
DIRECT_URL="your-supabase-direct-connection-url"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 4. Test Connection

After updating your environment variables:

```bash
# Test Prisma connection
npm run db:generate

# Test Supabase connection (will be available after we set up auth)
```

### 5. Database Setup

Once environment is configured:

```bash
# Initialize Prisma with Supabase
npm run db:migrate

# Open Prisma Studio to verify
npm run db:studio
```

## 🔧 Configuration Notes

### For Development:
- Use the **connection pooling URL** for `DATABASE_URL`
- Use the **direct connection URL** for `DIRECT_URL`
- This setup allows Prisma to work optimally with Supabase

### For Production:
- Same URLs work for production
- Make sure to set environment variables in your deployment platform (Vercel)
- Enable Row Level Security (RLS) in Supabase for production

### Security:
- **Never commit real credentials** to Git
- **Service role key** should only be used server-side
- **Anon key** is safe for client-side but still keep it in env files

## 📋 Next Steps After Setup

1. ✅ Update `.env.local` with real credentials
2. ✅ Test database connection with Prisma
3. ✅ Run first database migration
4. ✅ Verify connection in Prisma Studio
5. ⏳ Set up authentication with NextAuth + Supabase
6. ⏳ Configure Row Level Security policies

---

**Note**: Keep your database password safe! You'll need it if you ever want to connect directly to your database or reset credentials.
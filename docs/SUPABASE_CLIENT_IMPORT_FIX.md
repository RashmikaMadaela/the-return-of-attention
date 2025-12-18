# Quick Fix: Supabase Client Import Error

## ❌ Error You Saw
```
Runtime Error
supabaseKey is required.
```

## ✅ What We Fixed

### Problem
The `HomePageClient.tsx` (client component) was importing from `@/lib/supabase` which includes server-only code that tries to access `SUPABASE_SERVICE_ROLE_KEY` - an environment variable NOT available in the browser.

### Solution
Created a separate browser-safe Supabase client:

**New File:** `src/lib/supabase-browser.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
```

**Updated:** `src/components/HomePageClient.tsx`
```typescript
// ❌ Old (WRONG for client components)
import { supabase } from '@/lib/supabase'

// ✅ New (CORRECT for client components)
import { supabaseBrowser } from '@/lib/supabase-browser'
```

## 📋 Rule of Thumb

### Client Components (Browser)
```typescript
'use client'

// ✅ USE THIS
import { supabaseBrowser } from '@/lib/supabase-browser'

// Only uses NEXT_PUBLIC_* environment variables
// Safe for browser
```

### Server Components (Node.js)
```typescript
// ✅ USE THIS
import { supabase, supabaseAdmin } from '@/lib/supabase'

// Can access ALL environment variables
// Never sent to browser
```

## 🔍 How to Identify the Issue

### Signs You're Using Wrong Import:
1. Error: "supabaseKey is required"
2. Error: "process.env.SUPABASE_SERVICE_ROLE_KEY is undefined"
3. Build/runtime errors in client components

### Quick Check:
```typescript
// If you see this at the top of your file:
'use client'

// Then use this:
import { supabaseBrowser } from '@/lib/supabase-browser'

// NOT this:
import { supabase } from '@/lib/supabase'  // ❌
```

## 🎯 Why This Happens

### Next.js Environment Variables:
- **`NEXT_PUBLIC_*`** → Available in browser (client components)
- **Other env vars** → Only available on server

### Webpack Bundling:
When you import a module in a client component, Webpack bundles the ENTIRE file for the browser, including code that tries to access server-only environment variables.

## ✅ Verification

After the fix, you should:

1. **No errors in browser console**
2. **See this log:**
   ```
   Setting up Supabase realtime subscriptions...
   ```
3. **Page loads fast (<1 second)**
4. **No "supabaseKey is required" error**

## 📚 Related Files

### Browser-Safe Files:
- `src/lib/supabase-browser.ts` (NEW)
- Any file with `'use client'` directive

### Server-Only Files:
- `src/lib/supabase.ts` (existing)
- `src/lib/data/home-page-data.ts` (new server data fetcher)

## 🔐 Security Note

This pattern is secure because:
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` is meant to be public
- ✅ Row Level Security (RLS) in Supabase protects your data
- ✅ `SUPABASE_SERVICE_ROLE_KEY` stays on server only
- ✅ No sensitive data exposed to browser

## 🚀 Now You Can:

1. ✅ Run `npm run dev`
2. ✅ Visit http://localhost:3000/home
3. ✅ See instant page load
4. ✅ Watch console for realtime subscriptions
5. ✅ Complete a session and see auto-update!

---

**Fix Applied:** December 18, 2025
**Status:** ✅ Resolved

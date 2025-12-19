# Home Page Performance Optimization

## Overview
Complete rewrite of home page data fetching from slow SWR polling to fast server components with Supabase realtime updates.

## Performance Improvements

### Before (Slow - 10+ seconds)
- ❌ Client component fetching via API routes
- ❌ Multiple sequential database queries in API routes
- ❌ SWR polling every 5 minutes
- ❌ API overhead (serialize/deserialize JSON)
- ❌ 3 separate API calls: `/api/progress/overview`, `/api/session/progress`
- ❌ Each API call: 5-11 seconds

### After (Fast - <1 second)
- ✅ Server component with direct database access
- ✅ Parallel database queries (Promise.all)
- ✅ Supabase realtime subscriptions (push-based)
- ✅ No API overhead
- ✅ Single server-side data fetch
- ✅ Cached with React cache()

## Technical Changes

### New Files Created

1. **`src/lib/data/home-page-data.ts`**
   - Server-side data fetching function
   - Uses `Promise.all()` for parallel queries
   - Optimized with `cache()` for deduplication
   - Directly queries Prisma without API overhead

2. **`src/components/HomePageClient.tsx`**
   - Client component for interactivity
   - Supabase realtime subscriptions
   - Receives initial data as props (fast!)
   - Automatically updates on database changes

### Modified Files

1. **`src/app/home/page.tsx`**
   - Converted to async server component
   - Fetches data server-side
   - Passes data to client component
   - Instant initial render

## Supabase Realtime Setup

### Tables Monitored
- `Session` - User's meditation sessions
- `UserStageProgress` - Stage completion progress
- `HappinessScore` - Happiness score updates

### How It Works
1. Initial page load: Server fetches data (fast!)
2. Component mounts: Subscribe to Supabase channels
3. Database changes: Supabase sends push notification
4. Client updates: Calls `router.refresh()` to re-fetch
5. Server re-renders: New data from cache (instant!)

### Benefits
- **No polling**: Only updates when data actually changes
- **Real-time**: See changes immediately across devices
- **Efficient**: Only refreshes affected data
- **Scalable**: Server does the heavy lifting

## Performance Metrics

### Expected Improvements
- **Initial Load**: 10+ seconds → <1 second (10x faster!)
- **Subsequent Loads**: Instant (from cache)
- **Data Updates**: Real-time push (vs 5-minute polling)
- **Server Load**: Reduced (no constant API calls)
- **Network Traffic**: Minimal (only changed data)

## Configuration

### Environment Variables Required
```bash
# Client-side (browser) - Must be prefixed with NEXT_PUBLIC_
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Server-side only
DATABASE_URL=your_database_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Optional, for admin operations
```

**Important:** Client components can ONLY access environment variables prefixed with `NEXT_PUBLIC_`. We created a separate `supabase-browser.ts` file that uses only public environment variables.

### Enable Supabase Realtime

In your Supabase dashboard, enable realtime for these tables:
1. Go to Database → Replication
2. Enable for: `Session`, `UserStageProgress`, `HappinessScore`
3. Or run this SQL:

```sql
-- Enable realtime for tables
alter publication supabase_realtime add table "Session";
alter publication supabase_realtime add table "UserStageProgress";
alter publication supabase_realtime add table "HappinessScore";
```

## Code Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Client)                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          HomePageClient Component                      │  │
│  │  • Receives initial data (fast!)                      │  │
│  │  • Subscribes to Supabase channels                    │  │
│  │  • Handles user interactions                          │  │
│  │  • Triggers refresh on updates                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↑                                  │
│                           │ Initial data (props)             │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                    Server (Next.js)                          │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │          src/app/home/page.tsx                         │  │
│  │  • Async server component                             │  │
│  │  • Calls getHomePageData()                            │  │
│  │  • Renders HomePageClient with data                   │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                           │                                  │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │    src/lib/data/home-page-data.ts                     │  │
│  │  • Parallel database queries (Promise.all)            │  │
│  │  • Optimized with cache()                             │  │
│  │  • Returns structured data                            │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            ↓
                    ┌──────────────┐
                    │   Database   │
                    │  (Postgres)  │
                    └──────────────┘
                            ↕
                    ┌──────────────┐
                    │   Supabase   │
                    │   Realtime   │
                    └──────────────┘
```

## Migration from Old System

### Removed Dependencies
- `useProgressOverview` hook (no longer needed)
- SWR polling mechanism
- API route calls from client
- JSON serialization overhead

### Backward Compatibility
- API routes still exist for other features
- No breaking changes to other components
- Gradual migration path

## Testing

### Test Initial Load
```bash
npm run dev
```
1. Navigate to `/home`
2. Check browser DevTools Network tab
3. Should see NO API calls to `/api/progress/overview`
4. Page should load in <1 second

### Test Realtime Updates
1. Open home page in Browser A
2. Open database tool or API route in Browser B
3. Complete a session
4. Browser A should auto-update within seconds
5. Check console for "Session change detected" log

### Test Multiple Tabs
1. Open home page in 2 tabs
2. Complete action in Tab 1
3. Tab 2 should auto-update

## Troubleshooting

### Issue: "supabaseKey is required" error
**Solution:** This happens when client components try to import server-side Supabase code.
- ✅ Use `supabaseBrowser` from `@/lib/supabase-browser` in client components
- ❌ Don't use `supabase` from `@/lib/supabase` in client components (it includes server-only code)
- The `supabase-browser.ts` file only uses `NEXT_PUBLIC_*` environment variables

### Issue: Page still slow
**Solution:** Check database indexes
```sql
-- Add indexes for better performance
CREATE INDEX idx_session_user_status ON "Session"(userId, status);
CREATE INDEX idx_stage_progress_user ON "UserStageProgress"(userId);
CREATE INDEX idx_happiness_user_date ON "HappinessScore"(userId, calculatedAt DESC);
```

### Issue: Realtime not working
**Solution:** 
1. Check Supabase dashboard: Database → Replication
2. Verify tables are added to `supabase_realtime` publication
3. Check browser console for subscription errors
4. Verify `NEXT_PUBLIC_SUPABASE_URL` is set

### Issue: Updates not reflecting
**Solution:**
1. Check router.refresh() is being called
2. Verify server component is re-rendering
3. Clear Next.js cache: `rm -rf .next`

## Future Enhancements

- [ ] Add optimistic UI updates
- [ ] Implement pagination for large datasets
- [ ] Add loading skeletons for partial refreshes
- [ ] Cache strategy tuning
- [ ] Add analytics for performance monitoring

## Performance Monitoring

Add to your monitoring:
```javascript
// In HomePageClient
console.time('data-refresh')
router.refresh()
console.timeEnd('data-refresh')
```

## Rollback Plan

If issues arise:
1. Revert `src/app/home/page.tsx` to use old HomePage component
2. Keep new files for gradual migration
3. Monitor logs and fix issues
4. Re-enable optimized version

## Success Metrics

Monitor these metrics:
- **Page Load Time**: Should be <1s (down from 10s)
- **Time to Interactive**: Should be <2s
- **Real-time Update Latency**: <3s from database change
- **Server CPU Usage**: Should decrease
- **API Call Volume**: Should drop significantly

---

**Implementation Date:** December 18, 2025
**Status:** ✅ Ready for testing

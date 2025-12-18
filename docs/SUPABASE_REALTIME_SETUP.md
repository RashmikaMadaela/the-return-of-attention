# Supabase Realtime Setup Guide

## Quick Setup (5 minutes)

### Step 1: Enable Realtime in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Replication**
3. Find the publication `supabase_realtime`
4. Add these tables to replication:
   - `Session`
   - `UserStageProgress`
   - `HappinessScore`

### Step 2: Or Run This SQL

Alternatively, run this SQL in the Supabase SQL Editor:

```sql
-- Enable realtime for the tables used in home page
ALTER PUBLICATION supabase_realtime ADD TABLE "Session";
ALTER PUBLICATION supabase_realtime ADD TABLE "UserStageProgress";
ALTER PUBLICATION supabase_realtime ADD TABLE "HappinessScore";
```

### Step 3: Verify Setup

Run this query to confirm tables are added:

```sql
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

You should see:
```
schemaname | tablename
-----------+-------------------
public     | Session
public     | UserStageProgress
public     | HappinessScore
```

## How It Works

### Client-Side Subscription
The `HomePageClient` component automatically subscribes to changes:

```typescript
// Subscribes to user's sessions
supabase
  .channel(`user-sessions-${userId}`)
  .on('postgres_changes', {
    event: '*',  // All events (INSERT, UPDATE, DELETE)
    schema: 'public',
    table: 'Session',
    filter: `userId=eq.${userId}`
  }, handleDataRefresh)
  .subscribe()
```

### Real-Time Flow
1. **Database Change**: User completes a session
2. **Postgres Trigger**: Change captured by Supabase
3. **WebSocket Push**: Notification sent to connected clients
4. **Client Update**: Component calls `router.refresh()`
5. **Server Re-render**: Fresh data fetched from cache
6. **UI Update**: User sees updated progress instantly

## Testing Realtime

### Test 1: Console Logs
1. Open home page
2. Open browser DevTools console
3. You should see:
   ```
   Setting up Supabase realtime subscriptions...
   ```

### Test 2: Trigger an Update
1. Open home page in Browser A
2. In Browser B, complete a session via API:
   ```bash
   curl -X POST http://localhost:3000/api/session/complete \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "your-session-id"}'
   ```
3. Browser A should show:
   ```
   Session change detected: {...}
   Updating...
   ```
4. Progress should update automatically!

### Test 3: Multiple Tabs
1. Open 2 tabs with home page
2. Complete action in Tab 1
3. Tab 2 updates automatically
4. No refresh needed!

## Troubleshooting

### Issue: "Setting up subscriptions..." but no updates

**Check 1: Replication enabled?**
```sql
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

**Check 2: WebSocket connection?**
- Open DevTools → Network → WS (WebSocket)
- Should see active connection to Supabase

**Check 3: Environment variables set?**
```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Issue: "Failed to subscribe to channel"

**Solution:** Check Supabase API keys
1. Go to Supabase Dashboard → Settings → API
2. Copy `anon/public` key
3. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Issue: Updates delayed or not working

**Check Row Level Security (RLS):**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('Session', 'UserStageProgress', 'HappinessScore');
```

If RLS is enabled, you need policies:
```sql
-- Example: Allow users to listen to their own data
CREATE POLICY "Users can listen to own sessions"
  ON "Session"
  FOR SELECT
  USING (auth.uid()::text = "userId");
```

## Performance Benefits

### Before (Polling)
- Check every 5 minutes
- Wasted API calls: ~288/day per user
- Latency: Up to 5 minutes
- Server load: Constant

### After (Realtime)
- Update only when data changes
- API calls: 0 (until actual change)
- Latency: < 3 seconds
- Server load: Minimal

## Advanced: Custom Channels

Want to add more realtime features?

```typescript
// Subscribe to daily notes
const notesChannel = supabase
  .channel(`user-notes-${userId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'DailyNote',
    filter: `userId=eq.${userId}`
  }, (payload) => {
    console.log('New note added:', payload)
    // Handle new note...
  })
  .subscribe()
```

## Security Notes

### Data Filtering
- Subscriptions filter by `userId`
- Users only receive their own data
- Uses Postgres Row Level Security

### Connection Security
- WebSocket over WSS (encrypted)
- JWT authentication
- Automatic reconnection

## Monitoring

### Add to your monitoring dashboard:
```typescript
// Track subscription status
supabase
  .channel('my-channel')
  .on('system', {}, (payload) => {
    console.log('Channel status:', payload)
  })
```

### Metrics to Monitor:
- Connection uptime
- Message latency
- Subscription failures
- Reconnection rate

## Cost Considerations

### Supabase Free Tier:
- ✅ 2GB database
- ✅ 500MB file storage
- ✅ **Unlimited realtime connections** (for now)
- ✅ No charge for WebSocket traffic

### Paid Plans:
- More connections
- Higher bandwidth
- Better performance

## Next Steps

1. ✅ Enable realtime for tables
2. ✅ Test with your app
3. ✅ Monitor logs
4. ⏳ Add more realtime features
5. ⏳ Optimize as needed

---

**Setup Time:** 5 minutes
**Difficulty:** Easy
**Impact:** Massive performance improvement!

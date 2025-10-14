# Happiness Score Auto-Trigger - Testing Guide

## 🧪 Quick Testing Instructions

### Prerequisites
Before testing auto-trigger, ensure:
1. ✅ User has completed onboarding questionnaire (27 questions)
2. ✅ User has completed initial self-assessment (6 attachment categories)

> **Note**: Without these two prerequisites, the auto-trigger will log:
> `"Questionnaire not completed - STRICT mode requirement not met"` or
> `"Self-assessment not completed - STRICT mode requirement not met"`

---

## Test 1: Session Completion Trigger

### Steps:
1. Start a meditation session (any type)
2. Complete the session
3. Check console logs for:
   ```
   ✅ Happiness score auto-calculated for user <userId> (trigger: session)
   ```
4. Verify in database:
   ```sql
   SELECT * FROM happiness_scores 
   WHERE user_id = '<userId>' 
   ORDER BY calculated_at DESC 
   LIMIT 1;
   ```
5. Confirm new record was created with recent timestamp

### Expected Result:
- ✅ Session completes normally
- ✅ API response returns immediately
- ✅ New happiness score calculated in background
- ✅ Console shows success log

---

## Test 2: Emoji Note Trigger

### Steps:
1. Submit a quick mood log (emoji note)
2. API: `POST /api/notes/emoji`
   ```json
   {
     "moodRating": 7
   }
   ```
3. Check console logs for:
   ```
   ✅ Happiness score auto-calculated for user <userId> (trigger: daily-note)
   ```
4. Query database for new happiness score

### Expected Result:
- ✅ Emoji note saved successfully
- ✅ API response returns immediately
- ✅ New happiness score calculated in background
- ✅ Console shows success log

---

## Test 3: Detailed Note Trigger

### Steps:
1. Submit a detailed emotional note
2. API: `POST /api/notes/detailed`
   ```json
   {
     "emotion": "happy",
     "intensity": 8,
     "context": "Great day at work!",
     "trigger": "work"
   }
   ```
3. Check console logs for:
   ```
   ✅ Happiness score auto-calculated for user <userId> (trigger: daily-note)
   ```
4. Query database for new happiness score

### Expected Result:
- ✅ Detailed note saved successfully
- ✅ API response returns immediately
- ✅ New happiness score calculated in background
- ✅ Console shows success log

---

## Test 4: Multiple Triggers in Sequence

### Steps:
1. Complete a session
2. Immediately submit an emoji note
3. Submit a detailed note
4. Check database for 3 new happiness score records

### Expected Result:
- ✅ All 3 actions complete successfully
- ✅ 3 happiness scores calculated
- ✅ Each score reflects the latest data at calculation time
- ✅ Scores should be similar but may vary slightly

---

## Test 5: Without Prerequisites

### Steps:
1. Create a new user (no questionnaire/assessment)
2. Try to trigger via session or note
3. Check console logs

### Expected Result:
- ✅ Session/note saves successfully
- ✅ Console shows skip message:
  ```
  Happiness calculation skipped: Questionnaire not completed
  ```
- ✅ No happiness score created
- ✅ No errors thrown

---

## Verify Calculation Accuracy

### Check Component Scores:
```sql
SELECT 
  final_score,
  user_level,
  pahm_score,
  attachment_score,
  emotional_stability_score,
  current_state_score,
  calculated_at
FROM happiness_scores
WHERE user_id = '<userId>'
ORDER BY calculated_at DESC
LIMIT 5;
```

### Verify Weights (should add to 100%):
- PAHM Score × 0.25 (25%)
- Attachment Score × 0.20 (20%)
- Emotional Stability × 0.18 (18%)
- Current State × 0.12 (12%)
- Emotional Regulation × 0.10 (10%)
- Mind Recovery × 0.08 (8%)
- Social Connection × 0.04 (4%)
- Practice Consistency × 0.03 (3%)

---

## Performance Testing

### Check Response Times:

1. **Before Trigger** (baseline):
   - Measure session complete API response time
   - Measure note submit API response time

2. **After Trigger** (should be same):
   - Response times should NOT increase
   - Auto-calculation runs in background
   - No blocking behavior

### Expected:
- Session Complete: ~500-1000ms (same as before)
- Emoji Note: ~100-200ms (same as before)
- Detailed Note: ~100-200ms (same as before)

---

## Error Handling Test

### Steps:
1. Temporarily break database connection
2. Try to trigger calculation
3. Check that:
   - ✅ Session/note still saves (if DB reconnects quickly)
   - ✅ Error logged but doesn't crash API
   - ✅ User receives success response for session/note

### Expected Console Log:
```
❌ Failed to auto-calculate happiness score for user <userId>: <error details>
Failed to auto-trigger happiness calculation after session: <error>
```

---

## Database Query Helpers

### Count Total Happiness Scores:
```sql
SELECT user_id, COUNT(*) as score_count
FROM happiness_scores
GROUP BY user_id;
```

### View Latest Score Details:
```sql
SELECT 
  hs.*,
  u.name as user_name,
  u.email
FROM happiness_scores hs
JOIN users u ON hs.user_id = u.id
WHERE hs.user_id = '<userId>'
ORDER BY hs.calculated_at DESC
LIMIT 1;
```

### Track Score Changes Over Time:
```sql
SELECT 
  DATE(calculated_at) as date,
  final_score,
  user_level,
  practice_enhanced
FROM happiness_scores
WHERE user_id = '<userId>'
ORDER BY calculated_at DESC
LIMIT 30;
```

---

## Debugging Tips

### If Auto-Trigger Not Working:

1. **Check Console Logs**:
   - Look for success messages
   - Look for skip messages
   - Look for error messages

2. **Verify Prerequisites**:
   ```sql
   SELECT 
     (SELECT COUNT(*) FROM questionnaires WHERE user_id = '<userId>' AND is_completed = true) as has_questionnaire,
     (SELECT COUNT(*) FROM self_assessments WHERE user_id = '<userId>') as has_assessment;
   ```

3. **Check Function Import**:
   - Verify `autoTriggerHappinessCalculation` is imported
   - Check import path is correct

4. **Test Function Directly**:
   ```typescript
   const result = await autoTriggerHappinessCalculation(userId, 'manual')
   console.log(result)
   ```

### Common Issues:

| Issue | Cause | Solution |
|-------|-------|----------|
| No calculation | Prerequisites missing | Complete questionnaire + assessment |
| Error thrown | Database connection | Check Prisma connection |
| Duplicate calculations | Multiple triggers | Expected behavior (one per action) |
| Wrong score | Stale data | Check data fetching in calculation |

---

## Success Criteria ✅

All of these should be true:

- [ ] Session completion triggers calculation
- [ ] Emoji note submission triggers calculation
- [ ] Detailed note submission triggers calculation
- [ ] Self-assessment completion triggers calculation (already working)
- [ ] API responses remain fast (no blocking)
- [ ] Console logs show success messages
- [ ] Database records created correctly
- [ ] Component scores calculated properly
- [ ] User level assigned correctly
- [ ] Errors handled gracefully
- [ ] Works without prerequisites (graceful skip)
- [ ] No TypeScript errors
- [ ] No runtime errors

---

## Related Documentation

- `HAPPINESS_AUTO_TRIGGER_IMPLEMENTATION.md` - Full implementation details
- `draft-docs/happiness_calculation_pdf.html` - Algorithm documentation
- `HAPPINESS_SCORE_ANALYSIS.md` - Requirements analysis
- `src/lib/business-logic/auto-trigger.ts` - Auto-trigger source code
- `src/lib/business-logic/happiness-calculation.ts` - Calculation algorithm

---

**Last Updated**: October 14, 2025  
**Status**: Ready for Testing ✅

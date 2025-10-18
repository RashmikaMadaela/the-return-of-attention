# Quick Guide: Admin Stage Actions & Time Skip

## 🎯 3 Main Features

### 1. Admin Unlock Button 🔓
**What:** Makes stages accessible  
**Where:** Admin Stage Testing page  
**How:** Click "Unlock" button  
**Result:** Stage appears on HomePage  

### 2. Admin Complete Button ✅
**What:** Marks stage as finished  
**Where:** Admin Stage Testing page  
**How:** Click "Complete" button  
**Result:** Stage shows completed + next unlocks  

### 3. Time Skip Auto-Save 💾
**What:** Completes session instantly  
**Where:** During any session  
**How:** Click "Time Skip" button  
**Result:** Session saves to database + progress updates  

---

## 🎮 How to Use

### Testing Stage Access
```
1. Go to /admin/stage-testing
2. Click "Unlock" on desired stage
3. Go to /home
4. Stage is now visible ✅
```

### Testing Stage Completion
```
1. Go to /admin/stage-testing
2. Click "Complete" on Stage 1
3. Go to /home
4. Stage 1 shows "Completed" ✅
5. Stage 2 is now unlocked ✅
```

### Quick Session Testing
```
1. Start any session
2. Click "Start Meditation"
3. Click "Time Skip" button
4. Confirm dialog
5. Session completes ✅
6. Progress updates on HomePage ✅
```

---

## 📊 What You'll See

### HomePage - Before Unlock
```
Stage 1: Available ✓
Stage 2: Locked 🔒
Stage 3: Locked 🔒
```

### HomePage - After Unlock Stage 2
```
Stage 1: Available ✓
Stage 2: Available ✓ (0/15 hours)
Stage 3: Locked 🔒
```

### HomePage - After Complete Stage 1
```
Stage 1: Completed ✓ (15/15 sessions)
Stage 2: Available ✓ (0/15 hours)
Stage 3: Locked 🔒
```

### HomePage - After Time Skip Sessions
```
Stage 1: Available ✓ (3/15 sessions) ← Increased!
Stage 2: Locked 🔒
```

---

## ⚡ Quick Reference

| Button | Color | Action | Result |
|--------|-------|--------|--------|
| Unlock | 🟢 Green | Create DB entry | Stage visible |
| Complete | 🔵 Blue | Mark as done | Shows completed |
| Reset | 🟠 Orange | Delete progress | Back to 0 |
| Time Skip | 🔵 Blue | Finish session | Save to DB |

---

## 🎨 Button Locations

### Admin Panel
```
/admin/stage-testing

Each stage card:
┌─────────────┐
│ Stage Name  │
├─────────────┤
│  [Unlock]   │
│  [Complete] │
│  [Reset]    │
└─────────────┘
```

### Timer Pages
```
During session:

Timer Controls
[▶️ Start] [✓ Complete]

Time Controls
[⏭️ Time Skip] [⏩ Fast Forward]
```

---

## ✅ Expected Results

### After Unlock
- Stage visible on HomePage
- Can start sessions
- Progress shows 0/15

### After Complete
- Stage shows "Completed"
- Next stage unlocked
- Progress shows 15/15 (or hours)

### After Time Skip
- Session count +1
- Progress bar updated
- Visible on HomePage

---

## 🐛 Troubleshooting

### Stage Not Showing?
- ✅ Check you clicked "Unlock"
- ✅ Refresh HomePage
- ✅ Check you're logged in

### Complete Not Working?
- ✅ Check success message appeared
- ✅ Refresh HomePage
- ✅ Check database connection

### Time Skip Not Saving?
- ✅ Check you have sessionId
- ✅ Check confirmation dialog appeared
- ✅ Wait for redirect
- ✅ Refresh HomePage

---

## 📝 Testing Steps

### Full Test Flow
```
1. Admin Testing:
   ✓ Unlock Stage 2
   ✓ Complete Stage 1
   ✓ Reset Stage 1
   ✓ Verify on HomePage

2. Time Skip Testing:
   ✓ Start Stage 1 session
   ✓ Use Time Skip
   ✓ Check HomePage progress
   ✓ Start Stage 2 session  
   ✓ Click PAHM buttons
   ✓ Use Time Skip
   ✓ Verify PAHM data saved

3. HomePage Verification:
   ✓ Stage progress accurate
   ✓ Completion status correct
   ✓ Unlock states proper
```

---

## 🎯 Success Checklist

- [ ] Admin can unlock stages
- [ ] HomePage shows unlocked stages
- [ ] Admin can complete stages
- [ ] Completed stages show checkmark
- [ ] Next stage auto-unlocks
- [ ] Time Skip saves sessions
- [ ] Progress increases after Time Skip
- [ ] PAHM data preserved with Time Skip
- [ ] Reset clears all progress
- [ ] No errors in console

---

**Quick Start:**  
1. Go to `/admin/stage-testing`
2. Click any button
3. Check `/home` to see results

That's it! 🎉

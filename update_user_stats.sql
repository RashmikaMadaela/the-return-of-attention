-- SQL Script to Update User Stats for abc@gmail.com
-- Run these commands in your Supabase SQL Editor

-- 1. First, let's check the current user data
SELECT 
  id, 
  email, 
  name, 
  role, 
  created_at 
FROM users 
WHERE email = 'abc@gmail.com';

-- 2. Make sure the user is admin (if not already done)
UPDATE users 
SET role = 'admin' 
WHERE email = 'abc@gmail.com';

-- 3. Get the user ID for the next steps (copy this ID from the result)
-- Replace 'USER_ID_HERE' in the following queries with the actual user ID

-- 4. Update or Insert Happiness Score
INSERT INTO happiness_scores (
  id,
  "userId",
  "currentStateScore",
  "attachmentScore", 
  "pahmScore",
  "practiceScore",
  "progressScore",
  "consistencyScore",
  "reflectionScore",
  "dailyLifeScore",
  "finalScore",
  "userLevel",
  "questionnaireBased",
  "selfAssessmentBased", 
  "practiceEnhanced",
  "calculatedAt"
)
VALUES (
  gen_random_uuid(),
  'USER_ID_HERE', -- Replace with actual user ID
  50.00,  -- Current state score
  60.00,  -- Attachment score  
  70.00,  -- PAHM score
  65.00,  -- Practice score
  55.00,  -- Progress score
  45.00,  -- Consistency score
  40.00,  -- Reflection score
  50.00,  -- Daily life score
  75.50,  -- Final happiness score (0-100)
  'Aware Seeker', -- User level
  true,   -- Questionnaire based
  false,  -- Self assessment based
  false,  -- Practice enhanced
  NOW()   -- Calculated at
)
ON CONFLICT ("userId") 
DO UPDATE SET
  "finalScore" = 75.50,
  "userLevel" = 'Aware Seeker',
  "calculatedAt" = NOW();

-- 5. Update or Insert User Stage Progress (for hours and sessions)
INSERT INTO user_stage_progress (
  id,
  "userId",
  "stageId", 
  "stageNumber",
  "sessionsCompleted",
  "hoursCompleted",
  "isCompleted",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'USER_ID_HERE', -- Replace with actual user ID
  gen_random_uuid(), -- Stage ID (you might need to get actual stage ID)
  1, -- Stage number
  15, -- Sessions completed 
  25.00, -- Hours completed
  false, -- Is completed
  NOW(),
  NOW()
)
ON CONFLICT ("userId", "stageId", "subStage")
DO UPDATE SET
  "sessionsCompleted" = 15,
  "hoursCompleted" = 25.00,
  "updatedAt" = NOW();

-- 6. Create some sample completed sessions 
INSERT INTO sessions (
  id,
  "userId",
  "stageId",
  "stageNumber", 
  "sessionType",
  duration,
  status,
  "startedAt",
  "completedAt",
  "createdAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid(),
  'USER_ID_HERE', -- Replace with actual user ID
  gen_random_uuid(), -- Stage ID
  1, -- Stage number
  'timer_only', -- Session type
  1800, -- Duration in seconds (30 minutes)
  'completed', -- Status
  NOW() - INTERVAL '1 day' * generate_series, -- Started at (different days)
  NOW() - INTERVAL '1 day' * generate_series + INTERVAL '30 minutes', -- Completed at
  NOW(),
  NOW()
FROM generate_series(1, 10) -- Creates 10 sessions

-- 7. Verify the changes
SELECT 
  u.email,
  u.role,
  hs."finalScore" as happiness,
  hs."userLevel",
  usp."sessionsCompleted",
  usp."hoursCompleted",
  (SELECT COUNT(*) FROM sessions s WHERE s."userId" = u.id AND s.status = 'completed') as session_count
FROM users u
LEFT JOIN happiness_scores hs ON hs."userId" = u.id
LEFT JOIN user_stage_progress usp ON usp."userId" = u.id
WHERE u.email = 'abc@gmail.com';
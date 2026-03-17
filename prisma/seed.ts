import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create Stages
  console.log('📚 Creating stages...')

  const stages = [
    {
      stageNumber: 1,
      name: 'Seeker',
      description: 'Foundation Stage - Physical Stillness Mastery through timer-only sessions. Build the essential foundation of sustained attention and physical stillness required for all future PAHM Matrix practices.',
      minSessions: 29,
      minHours: 11.5,
      sessionType: 'timer_only',
      hasSubStages: true,
      subStages: [
        {
          id: 'T1',
          name: 'T1',
          title: 'Initial Introduction',
          duration: 10,
          minSessions: 3,
          minHours: 0.5,
          description: 'Basic posture and breathing awareness'
        },
        {
          id: 'T2',
          name: 'T2',
          title: 'Building Consistency',
          duration: 15,
          minSessions: 4,
          minHours: 1.0,
          description: 'Extending stillness duration'
        },
        {
          id: 'T3',
          name: 'T3',
          title: 'Deepening Practice',
          duration: 20,
          minSessions: 6,
          minHours: 2.0,
          description: 'Deeper stillness and awareness'
        },
        {
          id: 'T4',
          name: 'T4',
          title: 'Advanced Preparation',
          duration: 25,
          minSessions: 6,
          minHours: 2.5,
          description: 'Preparation for PAHM methodology'
        },
        {
          id: 'T5',
          name: 'T5',
          title: 'PAHM Readiness',
          duration: 30,
          minSessions: 10,
          minHours: 5.0,
          description: 'Final preparation for PAHM Matrix introduction'
        }
      ]
    },
    {
      stageNumber: 2,
      name: 'PAHM Trainee',
      description: 'Introduction to Present Attention and Happiness Matrix. Users begin tracking their attention patterns across the 3×3 grid while maintaining physical stillness.',
      minSessions: 30,
      minHours: 15.0,
      sessionType: 'pahm_matrix',
      hasSubStages: false,
      subStages: undefined,
    },
    {
      stageNumber: 3,
      name: 'PAHM Beginner',
      description: 'Developing PAHM Proficiency and Pattern Recognition. Deepen practice by developing greater sensitivity to attention patterns.',
      minSessions: 30,
      minHours: 15.0,
      sessionType: 'pahm_matrix',
      hasSubStages: false,
      subStages: undefined,
    },
    {
      stageNumber: 4,
      name: 'PAHM Practitioner',
      description: 'Advanced PAHM Application and Mastery Development. Develop advanced skills in attention awareness and experience deeper benefits.',
      minSessions: 40,
      minHours: 20.0,
      sessionType: 'pahm_matrix',
      hasSubStages: false,
      subStages: undefined,
    },
    {
      stageNumber: 5,
      name: 'PAHM Master',
      description: 'Complete PAHM Mastery and Leadership Development. Achieve complete mastery and develop skills to guide others.',
      minSessions: 50,
      minHours: 25.0,
      sessionType: 'pahm_matrix',
      hasSubStages: false,
      subStages: undefined,
    },
    {
      stageNumber: 6,
      name: 'PAHM Illuminator',
      description: 'Enlightened PAHM Practice and Global Teaching. Represent the highest achievement combining complete mastery with enlightened understanding.',
      minSessions: 60,
      minHours: 30.0,
      sessionType: 'pahm_matrix',
      hasSubStages: false,
      subStages: undefined,
    }
  ]

  for (const stage of stages) {
    await prisma.stage.upsert({
      where: { stageNumber: stage.stageNumber },
      update: {
        name: stage.name,
        description: stage.description,
        minSessions: stage.minSessions,
        minHours: stage.minHours,
        sessionType: stage.sessionType,
        hasSubStages: stage.hasSubStages,
        subStages: stage.subStages,
        isActive: true,
      },
      create: stage,
    })
  }

  console.log('✅ Created 6 stages')

  // Create Mind Recovery Exercises
  console.log('🧘 Creating mind recovery exercises...')

  const exercises = [
    {
      name: 'Morning Recharge',
      type: 'morning_recharge',
      description: 'Start your day with clarity and focus through gentle PAHM Matrix awareness practice.',
      purpose: 'Begin the day with mental clarity, set positive intentions, and establish mindful awareness.',
      bestTime: 'Morning routine (6-10 AM)',
      duration: 5,
      sortOrder: 1
    },
    {
      name: 'Mid-Day Reset',
      type: 'midday_reset',
      description: 'Quick refresh to maintain focus and energy throughout your busy day.',
      purpose: 'Restore mental energy, refocus attention, and maintain emotional balance during daily activities.',
      bestTime: 'Lunch break or afternoon (12-3 PM)',
      duration: 3,
      sortOrder: 2
    },
    {
      name: 'Emotional Reset',
      type: 'emotional_reset',
      description: 'Settle emotions and find balance when experiencing emotional turbulence.',
      purpose: 'Process difficult emotions, restore emotional equilibrium, and develop resilience.',
      bestTime: 'During emotional challenges (anytime)',
      duration: 5,
      sortOrder: 3
    },
    {
      name: 'Work-Home Transition',
      type: 'work_home_transition',
      description: 'Shift mindfully from work mode to personal time, creating healthy boundaries.',
      purpose: 'Release work stress, transition mindfully between roles, and be present for personal life.',
      bestTime: 'End of workday (5-7 PM)',
      duration: 5,
      sortOrder: 4
    },
    {
      name: 'Bedtime Wind Down',
      type: 'bedtime_wind_down',
      description: 'Gentle preparation for restful sleep through calming PAHM Matrix awareness practice.',
      purpose: 'Release the day\'s tensions, quiet the mind, and prepare for peaceful, restorative sleep.',
      bestTime: 'Before bedtime (8-11 PM)',
      duration: 8,
      sortOrder: 5
    }
  ]

  for (const exercise of exercises) {
    const existingExercise = await prisma.mindRecoveryExercise.findFirst({
      where: { type: exercise.type }
    })

    if (existingExercise) {
      await prisma.mindRecoveryExercise.update({
        where: { id: existingExercise.id },
        data: {
          name: exercise.name,
          description: exercise.description,
          purpose: exercise.purpose,
          bestTime: exercise.bestTime,
          duration: exercise.duration,
          sortOrder: exercise.sortOrder,
          isActive: true,
        }
      })
    } else {
      await prisma.mindRecoveryExercise.create({
        data: exercise
      })
    }
  }

  console.log('✅ Created 5 mind recovery exercises')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
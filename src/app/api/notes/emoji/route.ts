import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Validation schema for emoji note submission
const emojiNoteSchema = z.object({
  moodRating: z.number().min(1).max(10), // 1-10 mood rating scale
});

/**
 * POST /api/notes/emoji
 * Submit quick emoji-based mood tracking
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = emojiNoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input data',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const { moodRating } = validation.data;

    // Check if emoji note already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingNote = await prisma.dailyNote.findFirst({
      where: {
        userId: user.id,
        type: 'emoji',
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    let dailyNote;

    if (existingNote) {
      // Update existing emoji note
      dailyNote = await prisma.dailyNote.update({
        where: { id: existingNote.id },
        data: {
          moodRating,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new emoji note
      dailyNote = await prisma.dailyNote.create({
        data: {
          userId: user.id,
          type: 'emoji',
          moodRating,
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: existingNote ? 'Emoji note updated successfully' : 'Emoji note created successfully',
      data: {
        id: dailyNote.id,
        moodRating: dailyNote.moodRating,
        emotion: dailyNote.emotion,
        intensity: dailyNote.intensity,
        context: dailyNote.context,
        trigger: dailyNote.trigger,
        notes: dailyNote.notes,
        createdAt: dailyNote.createdAt,
        updatedAt: dailyNote.updatedAt
      }
    });

  } catch (error) {
    console.error('Error in emoji note submission:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notes/emoji
 * Retrieve emoji notes history
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter using createdAt
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Retrieve emoji notes
    const emojiNotes = await prisma.dailyNote.findMany({
      where: {
        userId: user.id,
        type: 'emoji',
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        moodRating: true,
        emotion: true,
        intensity: true,
        context: true,
        trigger: true,
        notes: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Get total count for pagination
    const totalCount = await prisma.dailyNote.count({
      where: {
        userId: user.id,
        type: 'emoji',
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        notes: emojiNotes,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving emoji notes:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
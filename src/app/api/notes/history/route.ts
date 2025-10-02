import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/notes/history
 * Retrieve complete notes history (both emoji and detailed)
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type'); // 'emoji', 'detailed', or both
    const emotion = searchParams.get('emotion'); // Filter by emotion

    // Build filters
    const whereClause: any = {
      userId: user.id
    };

    // Type filter
    if (type && (type === 'emoji' || type === 'detailed')) {
      whereClause.type = type;
    }

    // Date filter using createdAt
    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      }
      whereClause.createdAt = dateFilter;
    }

    // Emotion filter
    if (emotion) {
      whereClause.emotion = emotion;
    }

    // Retrieve notes
    const notes = await prisma.dailyNote.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        type: true,
        moodRating: true,
        emotion: true,
        intensity: true,
        context: true,
        trigger: true,
        notes: true,
        emotions: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Parse emotions JSON and format response
    const formattedNotes = notes.map(note => ({
      id: note.id,
      type: note.type,
      // Emoji note fields
      ...(note.type === 'emoji' && {
        moodRating: note.moodRating,
        emotion: note.emotion,
        intensity: note.intensity,
        context: note.context,
        trigger: note.trigger,
        notes: note.notes
      }),
      // Detailed note fields
      ...(note.type === 'detailed' && {
        emotion: note.emotion,
        intensity: note.intensity,
        context: note.context,
        trigger: note.trigger,
        notes: note.notes,
        emotions: note.emotions ? (typeof note.emotions === 'string' ? JSON.parse(note.emotions) : note.emotions) : null
      }),
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    }));

    // Get total count for pagination
    const totalCount = await prisma.dailyNote.count({
      where: whereClause
    });

    // Get summary statistics
    const stats = await prisma.dailyNote.aggregate({
      where: {
        userId: user.id,
        moodRating: { not: null }
      },
      _avg: {
        moodRating: true,
        intensity: true
      },
      _count: {
        id: true
      }
    });

    // Get emotion distribution
    const emotionDistribution = await prisma.dailyNote.groupBy({
      by: ['emotion'],
      where: {
        userId: user.id,
        emotion: { not: null }
      },
      _count: {
        emotion: true
      },
      orderBy: {
        _count: {
          emotion: 'desc'
        }
      },
      take: 10
    });

    return NextResponse.json({
      success: true,
      data: {
        notes: formattedNotes,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        },
        statistics: {
          totalNotes: stats._count.id,
          averageMoodRating: stats._avg.moodRating ? Number(stats._avg.moodRating.toFixed(1)) : null,
          averageIntensity: stats._avg.intensity ? Number(stats._avg.intensity.toFixed(1)) : null,
          topEmotions: emotionDistribution.map(item => ({
            emotion: item.emotion,
            count: item._count.emotion
          }))
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving notes history:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notes/history
 * Delete a specific note
 */
export async function DELETE(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { noteId } = body;

    if (!noteId) {
      return NextResponse.json(
        { success: false, error: 'Note ID is required' },
        { status: 400 }
      );
    }

    // Check if note exists and belongs to user
    const existingNote = await prisma.dailyNote.findFirst({
      where: {
        id: noteId,
        userId: user.id
      }
    });

    if (!existingNote) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }

    // Delete the note
    await prisma.dailyNote.delete({
      where: { id: noteId }
    });

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
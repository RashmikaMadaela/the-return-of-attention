import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { autoTriggerHappinessCalculation } from '@/lib/business-logic/auto-trigger';

// Validation schema for detailed note submission
const detailedNoteSchema = z.object({
  emotion: z.string().min(1, 'Emotion is required'), // Primary emotion (happy, sad, anxious, etc.)
  intensity: z.number().min(1).max(10), // Emotion intensity 1-10
  context: z.string().max(1000).optional(), // What's happening today (optional)
  trigger: z.string().optional(), // What triggered this mood (optional)
});

/**
 * POST /api/notes/detailed
 * Submit detailed mood and reflection notes
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
    const validation = detailedNoteSchema.safeParse(body);

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

    const { emotion, intensity, context, trigger } = validation.data;

    // Create detailed note
    const dailyNote = await prisma.dailyNote.create({
      data: {
        userId: user.id,
        type: 'detailed',
        emotion,
        intensity,
        context: context || null,
        trigger: trigger || null,
      }
    });

    const response = NextResponse.json({
      success: true,
      message: 'Detailed note created successfully',
      data: {
        id: dailyNote.id,
        emotion: dailyNote.emotion,
        intensity: dailyNote.intensity,
        context: dailyNote.context,
        trigger: dailyNote.trigger,
        notes: dailyNote.notes,
        emotions: dailyNote.emotions,
        createdAt: dailyNote.createdAt,
        updatedAt: dailyNote.updatedAt
      }
    });

    // Auto-trigger happiness score calculation after note creation
    // This runs asynchronously without blocking the response
    autoTriggerHappinessCalculation(user.id, 'daily-note').catch(error => {
      console.error('Failed to auto-trigger happiness calculation after detailed note:', error)
    })

    return response

  } catch (error) {
    console.error('Error in detailed note submission:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notes/detailed
 * Retrieve detailed notes history
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const emotion = searchParams.get('emotion'); // Filter by emotion

    // Build filters
    const whereClause: any = {
      userId: user.id,
      type: 'detailed'
    };

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

    // Retrieve detailed notes
    const detailedNotes = await prisma.dailyNote.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
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

    // Notes already have emotions parsed by Prisma
    const parsedNotes = detailedNotes;

    // Get total count for pagination
    const totalCount = await prisma.dailyNote.count({
      where: whereClause
    });

    return NextResponse.json({
      success: true,
      data: {
        notes: parsedNotes,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving detailed notes:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notes/detailed
 * Update an existing detailed note
 */
export async function PUT(request: NextRequest) {
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
    const { noteId, ...updateData } = body;

    if (!noteId) {
      return NextResponse.json(
        { success: false, error: 'Note ID is required' },
        { status: 400 }
      );
    }

    const validation = detailedNoteSchema.partial().safeParse(updateData);

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

    // Check if note exists and belongs to user
    const existingNote = await prisma.dailyNote.findFirst({
      where: {
        id: noteId,
        userId: user.id,
        type: 'detailed'
      }
    });

    if (!existingNote) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }

    const { emotion, intensity, context, trigger } = validation.data;

    // Update the note
    const updatedNote = await prisma.dailyNote.update({
      where: { id: noteId },
      data: {
        ...(emotion !== undefined && { emotion }),
        ...(intensity !== undefined && { intensity }),
        ...(context !== undefined && { context: context || null }),
        ...(trigger !== undefined && { trigger: trigger || null }),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Detailed note updated successfully',
      data: {
        id: updatedNote.id,
        emotion: updatedNote.emotion,
        intensity: updatedNote.intensity,
        context: updatedNote.context,
        trigger: updatedNote.trigger,
        notes: updatedNote.notes,
        emotions: updatedNote.emotions,
        createdAt: updatedNote.createdAt,
        updatedAt: updatedNote.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating detailed note:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
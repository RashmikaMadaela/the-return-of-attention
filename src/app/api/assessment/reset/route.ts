import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const type = url.searchParams.get('type'); // 'questionnaire', 'self-assessment', or 'all'
    const assessmentType = url.searchParams.get('assessment-type'); // 'initial', 'mid', 'final' for self-assessments

    let deletedCount = 0;
    const results: string[] = [];

    // Delete questionnaire
    if (type === 'questionnaire' || type === 'all') {
      const deletedQuestionnaire = await prisma.questionnaire.deleteMany({
        where: { userId: session.user.id }
      });
      deletedCount += deletedQuestionnaire.count;
      if (deletedQuestionnaire.count > 0) {
        results.push(`Deleted ${deletedQuestionnaire.count} questionnaire(s)`);
      }
    }

    // Delete self assessments
    if (type === 'self-assessment' || type === 'all') {
      let whereClause: any = { userId: session.user.id };
      
      // If specific assessment type is specified
      if (assessmentType && ['initial', 'mid', 'final'].includes(assessmentType)) {
        whereClause.type = assessmentType;
      }

      const deletedAssessments = await prisma.selfAssessment.deleteMany({
        where: whereClause
      });
      deletedCount += deletedAssessments.count;
      if (deletedAssessments.count > 0) {
        results.push(`Deleted ${deletedAssessments.count} self assessment(s)`);
      }
    }

    if (deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'No assessments found to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Assessments deleted successfully',
      data: {
        deletedCount,
        details: results
      }
    });

  } catch (error) {
    console.error('Delete assessments error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
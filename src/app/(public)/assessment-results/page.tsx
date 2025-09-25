'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface AssessmentResults {
  questionnaire: {
    id: string;
    completedAt: string;
    insights: any;
    demographics: any;
  } | null;
  selfAssessments: Array<{
    id: string;
    type: string;
    totalScore: number;
    interpretation: string;
    individualScores: any;
    categories: any;
    createdAt: string;
  }>;
  progress: {
    attachmentTracking: any;
    completionStatus: {
      questionnaire: boolean;
      initialAssessment: boolean;
      midAssessment: boolean;
      finalAssessment: boolean;
    };
    spiritualGrowth: any;
  };
}

export default function AssessmentResultsPage() {
  const { data: session } = useSession();
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchResults();
    }
  }, [session]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/assessment/results');
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.error || 'Failed to fetch results');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 0) return 'text-green-600 bg-green-50';
    if (score > -50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Assessment Results</h1>
          <p className="text-gray-600">Please sign in to view your assessment results</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your assessment results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchResults}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Assessment Results</h1>
          <p className="text-gray-600">Complete overview of your PAHM journey progress</p>
        </div>

        {/* Completion Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Completion Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg text-center ${
              results?.progress.completionStatus.questionnaire 
                ? 'bg-green-50 text-green-700' 
                : 'bg-gray-50 text-gray-500'
            }`}>
              <div className="font-medium">Questionnaire</div>
              <div className="text-sm">
                {results?.progress.completionStatus.questionnaire ? '✓ Complete' : '○ Pending'}
              </div>
            </div>
            <div className={`p-3 rounded-lg text-center ${
              results?.progress.completionStatus.initialAssessment 
                ? 'bg-green-50 text-green-700' 
                : 'bg-gray-50 text-gray-500'
            }`}>
              <div className="font-medium">Initial Assessment</div>
              <div className="text-sm">
                {results?.progress.completionStatus.initialAssessment ? '✓ Complete' : '○ Pending'}
              </div>
            </div>
            <div className={`p-3 rounded-lg text-center ${
              results?.progress.completionStatus.midAssessment 
                ? 'bg-green-50 text-green-700' 
                : 'bg-gray-50 text-gray-500'
            }`}>
              <div className="font-medium">Mid Assessment</div>
              <div className="text-sm">
                {results?.progress.completionStatus.midAssessment ? '✓ Complete' : '○ Pending'}
              </div>
            </div>
            <div className={`p-3 rounded-lg text-center ${
              results?.progress.completionStatus.finalAssessment 
                ? 'bg-green-50 text-green-700' 
                : 'bg-gray-50 text-gray-500'
            }`}>
              <div className="font-medium">Final Assessment</div>
              <div className="text-sm">
                {results?.progress.completionStatus.finalAssessment ? '✓ Complete' : '○ Pending'}
              </div>
            </div>
          </div>
        </div>

        {/* Questionnaire Results */}
        {results?.questionnaire && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Questionnaire Summary</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Demographics</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Age:</span> {results.questionnaire.demographics?.ageRange}</p>
                  <p><span className="text-gray-600">Location:</span> {results.questionnaire.demographics?.location}</p>
                  <p><span className="text-gray-600">Occupation:</span> {results.questionnaire.demographics?.occupation}</p>
                  <p><span className="text-gray-600">Education:</span> {results.questionnaire.demographics?.educationLevel}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Experience Levels</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Meditation Experience:</span> {results.questionnaire.insights?.experience?.level}/10</p>
                  <p><span className="text-gray-600">Mindfulness Experience:</span> {results.questionnaire.insights?.mindfulness?.experience}/8</p>
                  <p><span className="text-gray-600">Emotional Awareness:</span> {results.questionnaire.insights?.mindfulness?.awareness}/9</p>
                  <p><span className="text-gray-600">Sleep Quality:</span> {results.questionnaire.insights?.lifestyle?.sleepQuality}/10</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Completed on {formatDate(results.questionnaire.completedAt)}
              </p>
            </div>
          </div>
        )}

        {/* Self-Assessment Results */}
        {results?.selfAssessments && results.selfAssessments.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Self-Assessment History</h2>
            <div className="space-y-6">
              {results.selfAssessments.map((assessment, index) => (
                <div key={assessment.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">
                        {assessment.type} Assessment
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(assessment.createdAt)}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(assessment.totalScore)}`}>
                      {assessment.totalScore} points
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{assessment.interpretation}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <p><span className="text-gray-600">Food & Taste:</span> {assessment.individualScores?.foodTaste}</p>
                      <p><span className="text-gray-600">Scents & Aromas:</span> {assessment.individualScores?.scentsAromas}</p>
                    </div>
                    <div className="space-y-1">
                      <p><span className="text-gray-600">Sounds & Music:</span> {assessment.individualScores?.soundsMusic}</p>
                      <p><span className="text-gray-600">Visual & Beauty:</span> {assessment.individualScores?.visualBeauty}</p>
                    </div>
                    <div className="space-y-1">
                      <p><span className="text-gray-600">Touch & Textures:</span> {assessment.individualScores?.touchTextures}</p>
                      <p><span className="text-gray-600">Thoughts & Images:</span> {assessment.individualScores?.thoughtsImages}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spiritual Growth Progress */}
        {results?.progress.spiritualGrowth && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Spiritual Growth Tracking</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Overall Trend:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  results.progress.spiritualGrowth.trend === 'improving' 
                    ? 'bg-green-100 text-green-800'
                    : results.progress.spiritualGrowth.trend === 'declining'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {results.progress.spiritualGrowth.trend}
                </span>
              </div>
              
              {results.progress.spiritualGrowth.journey && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Journey Milestones:</h3>
                  {results.progress.spiritualGrowth.journey.map((milestone: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="capitalize text-gray-700">{milestone.milestone} Assessment</span>
                      <div className="text-right">
                        <span className={`font-medium ${getScoreColor(milestone.score)}`}>
                          {milestone.score} pts
                        </span>
                        <p className="text-xs text-gray-500">
                          {formatDate(milestone.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {!results?.progress.completionStatus.questionnaire && (
            <Link
              href="/questionnaire"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Take Questionnaire
            </Link>
          )}
          
          {!results?.progress.completionStatus.initialAssessment && (
            <Link
              href="/self-assessment"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Take Initial Assessment
            </Link>
          )}
          
          {results?.progress.completionStatus.initialAssessment && !results?.progress.completionStatus.midAssessment && (
            <Link
              href="/self-assessment"
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Take Mid Assessment
            </Link>
          )}
          
          {results?.progress.completionStatus.midAssessment && !results?.progress.completionStatus.finalAssessment && (
            <Link
              href="/self-assessment"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Take Final Assessment
            </Link>
          )}

          <button
            onClick={fetchResults}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Refresh Results
          </button>
        </div>

        {/* Empty State */}
        {!results?.questionnaire && (!results?.selfAssessments || results.selfAssessments.length === 0) && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessment Data Yet</h3>
            <p className="text-gray-600 mb-4">Start your PAHM journey by taking the questionnaire</p>
            <Link
              href="/questionnaire"
              className="inline-flex px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Questionnaire
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
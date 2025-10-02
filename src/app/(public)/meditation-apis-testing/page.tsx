'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ApiResponse {
  success: boolean;
  [key: string]: any;
}

interface TestResult {
  endpoint: string;
  method: string;
  status?: number;
  success?: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

export default function MeditationAPIsTestingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [requestBody, setRequestBody] = useState('{}');
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [currentPahmSessionId, setCurrentPahmSessionId] = useState('');
  const [stages, setStages] = useState<any[]>([]);
  const [pahmWorkflowResults, setPahmWorkflowResults] = useState<TestResult[]>([]);
  const [isPahmTesting, setIsPahmTesting] = useState(false);
  const [pahmClickCount, setPahmClickCount] = useState(0);
  const [pahmSessionData, setPahmSessionData] = useState<any>(null);
  const [isCompletingStage1, setIsCompletingStage1] = useState(false);
  const [stage1Results, setStage1Results] = useState<TestResult[]>([]);
  const [isDebuggingProgress, setIsDebuggingProgress] = useState(false);
  const [debugResults, setDebugResults] = useState<TestResult[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/signin');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev]);
  };

  const makeRequest = async (endpoint: string, method: string, body?: any, pathParams?: string) => {
    setIsLoading(true);
    const fullEndpoint = pathParams ? endpoint.replace('[id]', pathParams) : endpoint;
    
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(fullEndpoint, options);
      const data = await response.json();

      const result: TestResult = {
        endpoint: fullEndpoint,
        method,
        status: response.status,
        success: response.ok,
        data,
        timestamp: new Date().toLocaleTimeString()
      };

      addTestResult(result);

      // Store session IDs for subsequent requests
      if (data.session?.id) {
        setCurrentSessionId(data.session.id);
      }
      if (data.pahmSession?.id) {
        setCurrentPahmSessionId(data.pahmSession.id);
      }

      return data;
    } catch (error) {
      const result: TestResult = {
        endpoint: fullEndpoint,
        method,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      };

      addTestResult(result);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const testEndpoint = async () => {
    if (!selectedEndpoint) return;

    try {
      let body = undefined;
      let pathParams = '';

      if (requestBody && requestBody.trim() !== '{}') {
        body = JSON.parse(requestBody);
      }

      // Handle path parameters
      if (selectedEndpoint.includes('[id]')) {
        if (selectedEndpoint.includes('/session/')) {
          pathParams = currentSessionId || 'test-session-id';
        } else if (selectedEndpoint.includes('/pahm/session/')) {
          pathParams = currentPahmSessionId || 'test-pahm-session-id';
        } else if (selectedEndpoint.includes('/stages/')) {
          pathParams = stages[0]?.id || 'test-stage-id';
        }
      }

      const method = selectedEndpoint.includes('update') || selectedEndpoint.includes('complete') ? 'PUT' : 
                    selectedEndpoint.includes('start') || selectedEndpoint.includes('click') ? 'POST' : 'GET';

      await makeRequest(selectedEndpoint, method, body, pathParams);
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    
    try {
      // 1. Get all stages first
      console.log('🎯 Testing: Get All Stages');
      const stagesData = await makeRequest('/api/stages', 'GET');
      setStages(stagesData.stages || []);

      // 2. Get progress overview
      console.log('📊 Testing: Progress Overview');
      await makeRequest('/api/progress/overview', 'GET');

      // 3. Get detailed stage progress
      console.log('📈 Testing: Stage Progress');
      await makeRequest('/api/progress/stages', 'GET');

      if (stagesData.stages?.length > 0) {
        const firstStage = stagesData.stages[0];
        
        // 4. Get individual stage details
        console.log('🎯 Testing: Individual Stage Details');
        await makeRequest('/api/stages/[id]', 'GET', undefined, firstStage.id);

        // 5. Check stage unlock status
        console.log('🔓 Testing: Stage Unlock Check');
        await makeRequest('/api/stages/[id]/unlock', 'GET', undefined, firstStage.id);

        // 6. Start a meditation session
        console.log('🧘‍♂️ Testing: Start Session');
        const sessionData = await makeRequest('/api/session/start', 'POST', {
          stageId: firstStage.id,
          stageNumber: firstStage.stageNumber,
          subStage: firstStage.hasSubStages ? 'T1' : undefined,
          sessionType: firstStage.sessionType,
          duration: 10,
          posture: 'sitting'
        });

        if (sessionData.session?.id) {
          const sessionId = sessionData.session.id;
          setCurrentSessionId(sessionId);

          // 7. Update session
          console.log('✏️ Testing: Update Session');
          await makeRequest('/api/session/update', 'PUT', {
            sessionId: sessionId,
            qualityRating: 8,
            insights: 'Test session insights'
          });

          // 8. Start PAHM tracking (if applicable)
          if (firstStage.sessionType === 'pahm_matrix') {
            console.log('🎯 Testing: Start PAHM Session');
            const pahmData = await makeRequest('/api/pahm/start', 'POST', {
              sessionId: sessionId
            });

            if (pahmData.pahmSession?.id) {
              const pahmSessionId = pahmData.pahmSession.id;
              setCurrentPahmSessionId(pahmSessionId);

              // 9. Record PAHM clicks
              console.log('👆 Testing: PAHM Click Tracking');
              await makeRequest('/api/pahm/click', 'POST', {
                pahmSessionId: pahmSessionId,
                position: 'present',
                timestamp: new Date().toISOString(),
                timeFromStart: 30
              });

              // 10. Complete PAHM session
              console.log('✅ Testing: Complete PAHM Session');
              await makeRequest('/api/pahm/complete', 'POST', {
                pahmSessionId: pahmSessionId,
                patternNotes: 'Test pattern notes'
              });

              // 11. Get PAHM session details
              console.log('📋 Testing: Get PAHM Session Details');
              await makeRequest('/api/pahm/session/[id]', 'GET', undefined, pahmSessionId);
            }
          }

          // 12. Complete main session
          console.log('🏁 Testing: Complete Session');
          await makeRequest('/api/session/complete', 'POST', {
            sessionId: sessionId,
            qualityRating: 9,
            insights: 'Completed test session successfully'
          });

          // 13. Get session history
          console.log('📚 Testing: Session History');
          await makeRequest('/api/session/history', 'GET');

          // 14. Get session progress
          console.log('📊 Testing: Session Progress');
          await makeRequest('/api/session/progress', 'GET');
        }
      }

      console.log('✅ All tests completed!');
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const clearPahmResults = () => {
    setPahmWorkflowResults([]);
    setPahmClickCount(0);
    setPahmSessionData(null);
  };

  const clearStage1Results = () => {
    setStage1Results([]);
  };

  const addPahmTestResult = (result: TestResult) => {
    setPahmWorkflowResults(prev => [result, ...prev]);
  };

  const addStage1TestResult = (result: TestResult) => {
    setStage1Results(prev => [result, ...prev]);
  };

  const addDebugResult = (result: TestResult) => {
    setDebugResults(prev => [result, ...prev]);
  };

  const clearDebugResults = () => {
    setDebugResults([]);
  };

  const cleanupActiveSessions = async () => {
    try {
      console.log('🧹 Cleaning up active sessions...');
      
      // Use the force cleanup API
      const cleanupResponse = await fetch('/api/debug/cleanup-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true })
      });
      
      if (cleanupResponse.ok) {
        const cleanupData = await cleanupResponse.json();
        console.log('✅ Session cleanup completed:', cleanupData.summary);
        return cleanupData.summary.successfullyCompleted || 0;
      } else {
        // Fallback to manual cleanup
        console.log('Force cleanup API failed, trying manual cleanup...');
        
        const historyResponse = await fetch('/api/session/history');
        const historyData = await historyResponse.json();
        
        if (historyResponse.ok && historyData.sessions) {
          const activeSessions = historyData.sessions.filter((s: any) => s.status === 'in_progress');
          
          console.log(`Found ${activeSessions.length} active sessions via fallback`);
          
          let completedCount = 0;
          for (const session of activeSessions) {
            try {
              const completeResponse = await fetch('/api/session/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId: session.id,
                  qualityRating: 7,
                  insights: 'Auto-completed for testing cleanup'
                })
              });
              
              if (completeResponse.ok) {
                console.log(`✅ Completed session: ${session.id}`);
                completedCount++;
              } else {
                console.log(`❌ Failed to complete session: ${session.id}`);
              }
            } catch (error) {
              console.log(`❌ Error completing session ${session.id}:`, error);
            }
          }
          
          return completedCount;
        }
      }
      
      return 0;
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      return 0;
    }
  };

  const testPahmWorkflow = async () => {
    setIsPahmTesting(true);
    setPahmWorkflowResults([]);
    setPahmClickCount(0);
    setPahmSessionData(null);

    try {
      console.log('🎯 Starting PAHM Workflow Test...');

      // Step 0: Clean up any active sessions first
      console.log('🧹 Step 0: Cleaning up active sessions...');
      const cleanedCount = await cleanupActiveSessions();
      
      const cleanupResult: TestResult = {
        endpoint: 'Session Cleanup',
        method: 'CLEANUP',
        success: true,
        data: { message: `Cleaned up ${cleanedCount} active sessions` },
        timestamp: new Date().toLocaleTimeString()
      };
      addPahmTestResult(cleanupResult);

      // Step 1: Get stages to find a PAHM-compatible stage
      console.log('📋 Step 1: Getting available stages...');
      const stagesResponse = await fetch('/api/stages');
      const stagesData = await stagesResponse.json();
      
      const stagesResult: TestResult = {
        endpoint: '/api/stages',
        method: 'GET',
        status: stagesResponse.status,
        success: stagesResponse.ok,
        data: stagesData,
        timestamp: new Date().toLocaleTimeString()
      };
      addPahmTestResult(stagesResult);

      if (!stagesResponse.ok || !stagesData.stages?.length) {
        throw new Error('No stages available for testing');
      }

      // Find a PAHM stage (stage 2 or higher)
      const pahmStage = stagesData.stages.find((s: any) => s.sessionType === 'pahm_matrix') || stagesData.stages[0];
      
      // Step 2: Start a meditation session
      console.log('🧘‍♂️ Step 2: Starting meditation session...');
      const sessionStartResponse = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stageId: pahmStage.id,
          stageNumber: pahmStage.stageNumber,
          sessionType: 'pahm_matrix',
          duration: 10,
          posture: 'sitting'
        })
      });
      const sessionData = await sessionStartResponse.json();

      const sessionResult: TestResult = {
        endpoint: '/api/session/start',
        method: 'POST',
        status: sessionStartResponse.status,
        success: sessionStartResponse.ok,
        data: sessionData,
        timestamp: new Date().toLocaleTimeString()
      };
      addPahmTestResult(sessionResult);

      if (!sessionStartResponse.ok || !sessionData.session?.id) {
        throw new Error('Failed to start session');
      }

      const sessionId = sessionData.session.id;
      setCurrentSessionId(sessionId);

      // Step 3: Start PAHM tracking
      console.log('🎯 Step 3: Starting PAHM tracking...');
      const pahmStartResponse = await fetch('/api/pahm/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          exerciseType: 'morning_recharge'
        })
      });
      const pahmData = await pahmStartResponse.json();

      const pahmStartResult: TestResult = {
        endpoint: '/api/pahm/start',
        method: 'POST',
        status: pahmStartResponse.status,
        success: pahmStartResponse.ok,
        data: pahmData,
        timestamp: new Date().toLocaleTimeString()
      };
      addPahmTestResult(pahmStartResult);

      if (!pahmStartResponse.ok || !pahmData.pahmSession?.id) {
        throw new Error('Failed to start PAHM session');
      }

      const pahmSessionId = pahmData.pahmSession.id;
      setCurrentPahmSessionId(pahmSessionId);
      setPahmSessionData(pahmData.pahmSession);

      // Step 4: Record multiple PAHM clicks (simulate user interaction)
      console.log('👆 Step 4: Recording PAHM clicks...');
      const positions = ['present', 'regret', 'past', 'nostalgia', 'dislikes', 'likes', 'worry', 'future', 'anticipation'];
      let clickCounter = 0;

      for (let i = 0; i < 15; i++) { // Record 15 clicks
        const position = positions[Math.floor(Math.random() * positions.length)];
        const timeFromStart = (i + 1) * 10; // 10 seconds apart
        
        const clickResponse = await fetch('/api/pahm/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pahmSessionId: pahmSessionId,
            position: position,
            timestamp: new Date().toISOString(),
            timeFromStart: timeFromStart
          })
        });
        const clickData = await clickResponse.json();

        if (clickResponse.ok) {
          clickCounter++;
          setPahmClickCount(clickCounter);
        }

        // Add result for first, middle, and last clicks
        if (i === 0 || i === 7 || i === 14) {
          const clickResult: TestResult = {
            endpoint: '/api/pahm/click',
            method: 'POST',
            status: clickResponse.status,
            success: clickResponse.ok,
            data: { ...clickData, clickNumber: i + 1, position },
            timestamp: new Date().toLocaleTimeString()
          };
          addPahmTestResult(clickResult);
        }

        // Small delay to simulate real interaction
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`✅ Recorded ${clickCounter} PAHM clicks`);

      // Step 5: Get PAHM session details (current state)
      console.log('📊 Step 5: Getting PAHM session details...');
      const pahmDetailsResponse = await fetch(`/api/pahm/session/${pahmSessionId}`);
      const pahmDetailsData = await pahmDetailsResponse.json();

      const pahmDetailsResult: TestResult = {
        endpoint: `/api/pahm/session/${pahmSessionId}`,
        method: 'GET',
        status: pahmDetailsResponse.status,
        success: pahmDetailsResponse.ok,
        data: pahmDetailsData,
        timestamp: new Date().toLocaleTimeString()
      };
      addPahmTestResult(pahmDetailsResult);

      // Step 6: Complete PAHM session
      console.log('✅ Step 6: Completing PAHM session...');
      const pahmCompleteResponse = await fetch('/api/pahm/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pahmSessionId: pahmSessionId,
          patternNotes: `PAHM Workflow Test completed successfully! Recorded ${clickCounter} clicks across the matrix. Observed patterns of attention movement between past, present, and future states with varying emotional valences.`
        })
      });
      const pahmCompleteData = await pahmCompleteResponse.json();

      const pahmCompleteResult: TestResult = {
        endpoint: '/api/pahm/complete',
        method: 'POST',
        status: pahmCompleteResponse.status,
        success: pahmCompleteResponse.ok,
        data: pahmCompleteData,
        timestamp: new Date().toLocaleTimeString()
      };
      addPahmTestResult(pahmCompleteResult);

      // Step 7: Complete main session
      console.log('🏁 Step 7: Completing meditation session...');
      const sessionCompleteResponse = await fetch('/api/session/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          qualityRating: 9,
          insights: 'PAHM workflow test completed successfully with comprehensive attention tracking.'
        })
      });
      const sessionCompleteData = await sessionCompleteResponse.json();

      const sessionCompleteResult: TestResult = {
        endpoint: '/api/session/complete',
        method: 'POST',
        status: sessionCompleteResponse.status,
        success: sessionCompleteResponse.ok,
        data: sessionCompleteData,
        timestamp: new Date().toLocaleTimeString()
      };
      addPahmTestResult(sessionCompleteResult);

      // Step 8: Final PAHM session details (completed state)
      console.log('📋 Step 8: Getting final PAHM session state...');
      const finalPahmResponse = await fetch(`/api/pahm/session/${pahmSessionId}`);
      const finalPahmData = await finalPahmResponse.json();

      const finalPahmResult: TestResult = {
        endpoint: `/api/pahm/session/${pahmSessionId}`,
        method: 'GET',
        status: finalPahmResponse.status,
        success: finalPahmResponse.ok,
        data: { ...finalPahmData, label: 'Final State' },
        timestamp: new Date().toLocaleTimeString()
      };
      addPahmTestResult(finalPahmResult);

      console.log('🎉 PAHM Workflow Test completed successfully!');

    } catch (error) {
      console.error('❌ PAHM Workflow Test failed:', error);
      const errorResult: TestResult = {
        endpoint: 'PAHM Workflow',
        method: 'WORKFLOW',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      };
      addPahmTestResult(errorResult);
    } finally {
      setIsPahmTesting(false);
    }
  };

  const completeStage1 = async () => {
    setIsCompletingStage1(true);
    setStage1Results([]);

    try {
      console.log('🏆 Starting Stage 1 Completion Process...');

      // Step 1: Get Stage 1 details
      console.log('📋 Step 1: Getting Stage 1 details...');
      const stagesResponse = await fetch('/api/stages');
      const stagesData = await stagesResponse.json();
      
      const stagesResult: TestResult = {
        endpoint: '/api/stages',
        method: 'GET',
        status: stagesResponse.status,
        success: stagesResponse.ok,
        data: stagesData,
        timestamp: new Date().toLocaleTimeString()
      };
      addStage1TestResult(stagesResult);

      if (!stagesResponse.ok || !stagesData.stages?.length) {
        throw new Error('No stages available');
      }

      const stage1 = stagesData.stages.find((s: any) => s.stageNumber === 1);
      if (!stage1) {
        throw new Error('Stage 1 not found');
      }

      const subStages = ['T1', 'T2', 'T3', 'T4', 'T5'];
      const subStageDetails = [
        { name: 'T1', duration: 10, sessions: 3, description: 'Initial Introduction' },
        { name: 'T2', duration: 15, sessions: 4, description: 'Building Consistency' },
        { name: 'T3', duration: 20, sessions: 6, description: 'Deepening Practice' },
        { name: 'T4', duration: 25, sessions: 6, description: 'Advanced Preparation' },
        { name: 'T5', duration: 30, sessions: 10, description: 'PAHM Readiness' }
      ];

      // Step 2: Complete all sub-stages
      for (let i = 0; i < subStageDetails.length; i++) {
        const subStage = subStageDetails[i];
        console.log(`🧘‍♂️ Completing ${subStage.name}: ${subStage.description}...`);

        // Complete required sessions for this sub-stage
        for (let sessionNum = 1; sessionNum <= subStage.sessions; sessionNum++) {
          // Start session
          const sessionStartResponse = await fetch('/api/session/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stageId: stage1.id,
              stageNumber: 1,
              subStage: subStage.name,
              sessionType: 'timer_only',
              duration: subStage.duration,
              posture: 'sitting'
            })
          });
          const sessionData = await sessionStartResponse.json();

          if (sessionStartResponse.ok && sessionData.session?.id) {
            // Complete session immediately
            await fetch('/api/session/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: sessionData.session.id,
                qualityRating: Math.floor(Math.random() * 3) + 8, // 8-10 rating
                insights: `Completed ${subStage.name} session ${sessionNum}/${subStage.sessions}. ${subStage.description} practice.`
              })
            });
          }

          // Small delay to simulate real sessions
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Record sub-stage completion result
        const subStageResult: TestResult = {
          endpoint: `/api/session/complete (${subStage.name})`,
          method: 'POST',
          success: true,
          data: { 
            subStage: subStage.name, 
            sessionsCompleted: subStage.sessions,
            duration: subStage.duration,
            description: subStage.description
          },
          timestamp: new Date().toLocaleTimeString()
        };
        addStage1TestResult(subStageResult);
      }

      // Step 3: Check progress after completion
      console.log('📊 Step 3: Checking Stage 1 progress...');
      const progressResponse = await fetch('/api/progress/stages');
      const progressData = await progressResponse.json();

      const progressResult: TestResult = {
        endpoint: '/api/progress/stages',
        method: 'GET',
        status: progressResponse.status,
        success: progressResponse.ok,
        data: progressData,
        timestamp: new Date().toLocaleTimeString()
      };
      addStage1TestResult(progressResult);

      // Step 4: Check Stage 2 unlock status
      console.log('🔓 Step 4: Checking Stage 2 unlock status...');
      const stage2 = stagesData.stages.find((s: any) => s.stageNumber === 2);
      if (stage2) {
        const unlockResponse = await fetch(`/api/stages/${stage2.id}/unlock`);
        const unlockData = await unlockResponse.json();

        const unlockResult: TestResult = {
          endpoint: `/api/stages/${stage2.id}/unlock`,
          method: 'GET',
          status: unlockResponse.status,
          success: unlockResponse.ok,
          data: unlockData,
          timestamp: new Date().toLocaleTimeString()
        };
        addStage1TestResult(unlockResult);
      }

      // Step 5: Final progress overview
      console.log('🎯 Step 5: Getting final progress overview...');
      const overviewResponse = await fetch('/api/progress/overview');
      const overviewData = await overviewResponse.json();

      const overviewResult: TestResult = {
        endpoint: '/api/progress/overview',
        method: 'GET',
        status: overviewResponse.status,
        success: overviewResponse.ok,
        data: overviewData,
        timestamp: new Date().toLocaleTimeString()
      };
      addStage1TestResult(overviewResult);

      console.log('🎉 Stage 1 completion process finished!');

    } catch (error) {
      console.error('❌ Stage 1 completion failed:', error);
      const errorResult: TestResult = {
        endpoint: 'Stage 1 Completion',
        method: 'WORKFLOW',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      };
      addStage1TestResult(errorResult);
    } finally {
      setIsCompletingStage1(false);
    }
  };

  const bypassStage1ForPahmTesting = async () => {
    setIsDebuggingProgress(true);
    setDebugResults([]);

    try {
      console.log('🛠️ Bypassing Stage 1 for PAHM testing...');

      // Get stages first
      const stagesResponse = await fetch('/api/stages');
      const stagesData = await stagesResponse.json();
      
      if (!stagesResponse.ok || !stagesData.stages?.length) {
        throw new Error('No stages available');
      }

      const stage1 = stagesData.stages.find((s: any) => s.stageNumber === 1);
      if (!stage1) {
        throw new Error('Stage 1 not found');
      }

      // Use force bypass API to completely reset and create Stage 1 progress
      const forceBypassResponse = await fetch('/api/debug/force-bypass-stage1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          force: true
        })
      });

      const forceBypassResult: TestResult = {
        endpoint: '/api/debug/force-bypass-stage1',
        method: 'POST',
        status: forceBypassResponse.status,
        success: forceBypassResponse.ok,
        data: forceBypassResponse.ok ? await forceBypassResponse.json() : { error: 'Force bypass failed' },
        timestamp: new Date().toLocaleTimeString()
      };
      addDebugResult(forceBypassResult);

      // If force bypass didn't work, try the regular bypass
      if (!forceBypassResponse.ok) {
        console.log('Force bypass failed, trying regular bypass...');
        
        const bypassResponse = await fetch('/api/debug/bypass-stage1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stageId: stage1.id,
            force: true
          })
        });

        const bypassResult: TestResult = {
          endpoint: '/api/debug/bypass-stage1',
          method: 'POST',
          status: bypassResponse.status,
          success: bypassResponse.ok,
          data: bypassResponse.ok ? await bypassResponse.json() : { error: 'Regular bypass failed' },
          timestamp: new Date().toLocaleTimeString()
        };
        addDebugResult(bypassResult);
      }

      // If both bypass APIs don't work, let's create the records manually
      if (!forceBypassResponse.ok) {
        console.log('Creating bypass records manually...');
        
        // Create progress records for all sub-stages as completed
        const subStages = ['T1', 'T2', 'T3', 'T4', 'T5'];
        const requirements = [
          { subStage: 'T1', sessions: 3, hours: 0.5 },
          { subStage: 'T2', sessions: 4, hours: 1.0 },
          { subStage: 'T3', sessions: 6, hours: 2.0 },
          { subStage: 'T4', sessions: 6, hours: 2.5 },
          { subStage: 'T5', sessions: 10, hours: 5.0 }
        ];

        for (const req of requirements) {
          try {
            const progressResponse = await fetch('/api/debug/create-progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                stageId: stage1.id,
                stageNumber: 1,
                subStage: req.subStage,
                sessionsCompleted: req.sessions,
                hoursCompleted: req.hours,
                isCompleted: true
              })
            });

            const result: TestResult = {
              endpoint: `/api/debug/create-progress (${req.subStage})`,
              method: 'POST',
              status: progressResponse.status,
              success: progressResponse.ok,
              data: progressResponse.ok ? await progressResponse.json() : { error: 'Failed to create progress' },
              timestamp: new Date().toLocaleTimeString()
            };
            addDebugResult(result);
          } catch (error) {
            console.log(`Manual progress creation failed for ${req.subStage}, continuing...`);
          }
        }
      }

      // Check raw progress records after bypass
      const rawProgressResponse = await fetch('/api/debug/raw-progress');
      const rawProgressData = await rawProgressResponse.json();

      const rawProgressResult: TestResult = {
        endpoint: '/api/debug/raw-progress',
        method: 'GET',
        status: rawProgressResponse.status,
        success: rawProgressResponse.ok,
        data: rawProgressData,
        timestamp: new Date().toLocaleTimeString()
      };
      addDebugResult(rawProgressResult);

      // Check final progress after bypass
      const finalProgressResponse = await fetch('/api/progress/stages');
      const finalProgressData = await finalProgressResponse.json();

      const finalResult: TestResult = {
        endpoint: '/api/progress/stages',
        method: 'GET',
        status: finalProgressResponse.status,
        success: finalProgressResponse.ok,
        data: finalProgressData,
        timestamp: new Date().toLocaleTimeString()
      };
      addDebugResult(finalResult);

      // Check Stage 2 unlock status
      const stage2 = stagesData.stages.find((s: any) => s.stageNumber === 2);
      if (stage2) {
        const stage2UnlockResponse = await fetch(`/api/stages/${stage2.id}/unlock`);
        const stage2UnlockData = await stage2UnlockResponse.json();

        const stage2UnlockResult: TestResult = {
          endpoint: `/api/stages/${stage2.id}/unlock`,
          method: 'GET',
          status: stage2UnlockResponse.status,
          success: stage2UnlockResponse.ok,
          data: stage2UnlockData,
          timestamp: new Date().toLocaleTimeString()
        };
        addDebugResult(stage2UnlockResult);
      }

      console.log('✅ Stage 1 bypass completed!');

    } catch (error) {
      console.error('❌ Stage 1 bypass failed:', error);
      const errorResult: TestResult = {
        endpoint: 'Stage 1 Bypass',
        method: 'BYPASS',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      };
      addDebugResult(errorResult);
    } finally {
      setIsDebuggingProgress(false);
    }
  };

  const debugProgressIssues = async () => {
    setIsDebuggingProgress(true);
    setDebugResults([]);

    try {
      console.log('🔍 Debugging progress tracking issues...');

      // Get current progress
      const progressResponse = await fetch('/api/progress/stages');
      const progressData = await progressResponse.json();

      const progressResult: TestResult = {
        endpoint: '/api/progress/stages',
        method: 'GET',
        status: progressResponse.status,
        success: progressResponse.ok,
        data: progressData,
        timestamp: new Date().toLocaleTimeString()
      };
      addDebugResult(progressResult);

      // Check raw progress records
      const rawProgressResponse = await fetch('/api/debug/raw-progress');
      const rawProgressData = rawProgressResponse.ok ? await rawProgressResponse.json() : { error: 'No debug API' };

      const rawResult: TestResult = {
        endpoint: '/api/debug/raw-progress',
        method: 'GET',
        status: rawProgressResponse.status,
        success: rawProgressResponse.ok,
        data: rawProgressData,
        timestamp: new Date().toLocaleTimeString()
      };
      addDebugResult(rawResult);

      // Check sessions
      const sessionsResponse = await fetch('/api/session/history');
      const sessionsData = await sessionsResponse.json();

      const sessionsResult: TestResult = {
        endpoint: '/api/session/history',
        method: 'GET',
        status: sessionsResponse.status,
        success: sessionsResponse.ok,
        data: sessionsData,
        timestamp: new Date().toLocaleTimeString()
      };
      addDebugResult(sessionsResult);

      console.log('🔍 Debug information collected');

    } catch (error) {
      console.error('❌ Debug failed:', error);
      const errorResult: TestResult = {
        endpoint: 'Progress Debug',
        method: 'DEBUG',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      };
      addDebugResult(errorResult);
    } finally {
      setIsDebuggingProgress(false);
    }
  };

  const endpoints = [
    // Session Management APIs
    { group: 'Session Management', endpoint: '/api/session/start', method: 'POST', description: 'Start meditation session' },
    { group: 'Session Management', endpoint: '/api/session/update', method: 'PUT', description: 'Update session details' },
    { group: 'Session Management', endpoint: '/api/session/complete', method: 'POST', description: 'Complete session' },
    { group: 'Session Management', endpoint: '/api/session/history', method: 'GET', description: 'Get session history' },
    { group: 'Session Management', endpoint: '/api/session/progress', method: 'GET', description: 'Get session progress' },
    
    // PAHM Matrix APIs
    { group: 'PAHM Matrix', endpoint: '/api/pahm/start', method: 'POST', description: 'Start PAHM tracking' },
    { group: 'PAHM Matrix', endpoint: '/api/pahm/click', method: 'POST', description: 'Record PAHM click' },
    { group: 'PAHM Matrix', endpoint: '/api/pahm/complete', method: 'POST', description: 'Complete PAHM session' },
    { group: 'PAHM Matrix', endpoint: '/api/pahm/session/[id]', method: 'GET', description: 'Get PAHM session details' },

    // Stage & Progress APIs
    { group: 'Stages & Progress', endpoint: '/api/stages', method: 'GET', description: 'Get all stages' },
    { group: 'Stages & Progress', endpoint: '/api/stages/[id]', method: 'GET', description: 'Get stage details' },
    { group: 'Stages & Progress', endpoint: '/api/stages/[id]/unlock', method: 'GET', description: 'Check stage unlock' },
    { group: 'Stages & Progress', endpoint: '/api/progress/overview', method: 'GET', description: 'Get progress overview' },
    { group: 'Stages & Progress', endpoint: '/api/progress/stages', method: 'GET', description: 'Get detailed stage progress' },
  ];

  const getExampleRequestBody = (endpoint: string) => {
    const examples: Record<string, any> = {
      '/api/session/start': {
        stageId: currentSessionId || 'stage-id-here',
        stageNumber: 1,
        subStage: 'T1',
        sessionType: 'timer_only',
        duration: 15,
        posture: 'sitting'
      },
      '/api/session/update': {
        sessionId: currentSessionId || 'session-id-here',
        qualityRating: 8,
        insights: 'Session going well'
      },
      '/api/session/complete': {
        sessionId: currentSessionId || 'session-id-here',
        qualityRating: 9,
        insights: 'Great session!'
      },
      '/api/pahm/start': {
        sessionId: currentSessionId || 'session-id-here',
        exerciseType: 'morning_recharge'
      },
      '/api/pahm/click': {
        pahmSessionId: currentPahmSessionId || 'pahm-session-id-here',
        position: 'present',
        timestamp: new Date().toISOString(),
        timeFromStart: 45
      },
      '/api/pahm/complete': {
        pahmSessionId: currentPahmSessionId || 'pahm-session-id-here',
        patternNotes: 'Noticed more present-moment awareness'
      }
    };
    return JSON.stringify(examples[endpoint] || {}, null, 2);
  };

  const groupedEndpoints = endpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.group]) {
      acc[endpoint.group] = [];
    }
    acc[endpoint.group].push(endpoint);
    return acc;
  }, {} as Record<string, typeof endpoints>);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              🧘‍♂️ Meditation & Session APIs Testing
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Test Phase 3 APIs: Session Management, PAHM Matrix, and Stage Progress
            </p>
          </div>

          <div className="p-6">
            {/* Session Info & Testing Guide */}
            <div className="mb-6 space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Current Session ID:</span>
                    <div className="font-mono text-xs mt-1 text-blue-600">
                      {currentSessionId || 'None'}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Current PAHM Session ID:</span>
                    <div className="font-mono text-xs mt-1 text-blue-600">
                      {currentPahmSessionId || 'None'}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Available Stages:</span>
                    <div className="font-mono text-xs mt-1 text-blue-600">
                      {stages.length} stages loaded
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                  ℹ️ Testing Workflow Guide
                </h3>
                <div className="text-sm text-amber-700 space-y-1">
                  <div><strong>Option A - Full Testing:</strong> Complete Stage 1 (🏆 Complete Stage 1) - Unlocks PAHM Matrix access</div>
                  <div><strong>Option B - Quick Testing:</strong> Bypass Stage 1 (🛠️ Bypass Stage 1) - For immediate PAHM testing</div>
                  <div><strong>Step 2:</strong> Test PAHM Workflow (🎯 Test PAHM Workflow) - Comprehensive PAHM testing</div>
                  <div><strong>Step 3:</strong> Run Full Test Suite (🚀 Run Full Test Suite) - Test all APIs</div>
                  <div className="mt-2 text-xs space-y-1">
                    <div><strong>Troubleshooting:</strong> Use 🔍 Debug Progress if completion tracking isn't working</div>
                    <div><strong>Session Conflicts:</strong> Use 🧹 Cleanup Active Sessions if getting "session in progress" errors</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mb-6 flex flex-wrap gap-3">
              <button
                onClick={runAllTests}
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Running Tests...
                  </>
                ) : (
                  <>🚀 Run Full Test Suite</>
                )}
              </button>
              <button
                onClick={completeStage1}
                disabled={isCompletingStage1}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCompletingStage1 ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Completing Stage 1...
                  </>
                ) : (
                  <>🏆 Complete Stage 1</>
                )}
              </button>
              <button
                onClick={testPahmWorkflow}
                disabled={isPahmTesting}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isPahmTesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Testing PAHM...
                  </>
                ) : (
                  <>🎯 Test PAHM Workflow</>
                )}
              </button>
              <button
                onClick={clearResults}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                🗑️ Clear Results
              </button>
              <button
                onClick={clearPahmResults}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                🧹 Clear PAHM Results
              </button>
              <button
                onClick={bypassStage1ForPahmTesting}
                disabled={isDebuggingProgress}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDebuggingProgress ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Bypassing...
                  </>
                ) : (
                  <>🛠️ Bypass Stage 1</>
                )}
              </button>
              <button
                onClick={debugProgressIssues}
                disabled={isDebuggingProgress}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDebuggingProgress ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Debugging...
                  </>
                ) : (
                  <>🔍 Debug Progress</>
                )}
              </button>
              <button
                onClick={clearStage1Results}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                🗑️ Clear Stage 1 Results
              </button>
              <button
                onClick={async () => {
                  const cleanedCount = await cleanupActiveSessions();
                  alert(`Cleaned up ${cleanedCount} active sessions`);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                🧹 Cleanup Active Sessions
              </button>
              <button
                onClick={clearDebugResults}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                🗑️ Clear Debug Results
              </button>
            </div>

            {/* PAHM Workflow Testing Section */}
            {(isPahmTesting || pahmWorkflowResults.length > 0) && (
              <div className="mb-8 p-6 bg-purple-50 border border-purple-200 rounded-lg">
                <h2 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  🎯 PAHM Matrix Workflow Testing
                  {isPahmTesting && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                  )}
                </h2>
                
                {/* PAHM Session Info */}
                {pahmSessionData && (
                  <div className="mb-4 p-4 bg-white rounded border">
                    <h3 className="font-medium text-gray-800 mb-2">Current PAHM Session</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Session ID:</span>
                        <div className="font-mono text-xs text-purple-600">{pahmSessionData.id}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Exercise Type:</span>
                        <div className="font-medium">{pahmSessionData.exerciseType || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Clicks Recorded:</span>
                        <div className="font-bold text-lg text-purple-600">{pahmClickCount}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Clicks:</span>
                        <div className="font-medium">{pahmSessionData.totalClicks || 0}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PAHM Matrix Visualization */}
                {pahmWorkflowResults.some(r => r.data?.pahmSession) && (
                  <div className="mb-4 p-4 bg-white rounded border">
                    <h3 className="font-medium text-gray-800 mb-3">PAHM Matrix Click Distribution</h3>
                    {(() => {
                      const pahmResult = pahmWorkflowResults.find(r => r.data?.pahmSession);
                      const pahm = pahmResult?.data?.pahmSession || {};
                      const maxClicks = Math.max(
                        pahm.regretClicks || 0, pahm.pastClicks || 0, pahm.nostalgiaClicks || 0,
                        pahm.dislikesClicks || 0, pahm.presentClicks || 0, pahm.likesClicks || 0,
                        pahm.worryClicks || 0, pahm.futureClicks || 0, pahm.anticipationClicks || 0
                      );
                      
                      const getCellColor = (clicks: number) => {
                        if (clicks === 0) return 'bg-gray-100';
                        const intensity = Math.min(clicks / Math.max(maxClicks, 1), 1);
                        if (intensity < 0.3) return 'bg-purple-200';
                        if (intensity < 0.6) return 'bg-purple-400';
                        return 'bg-purple-600';
                      };

                      const getCellTextColor = (clicks: number) => {
                        const intensity = Math.min(clicks / Math.max(maxClicks, 1), 1);
                        return intensity < 0.6 ? 'text-gray-800' : 'text-white';
                      };

                      return (
                        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
                          <div className={`p-3 rounded text-center ${getCellColor(pahm.regretClicks || 0)} ${getCellTextColor(pahm.regretClicks || 0)}`}>
                            <div className="text-xs font-medium">Regret</div>
                            <div className="text-lg font-bold">{pahm.regretClicks || 0}</div>
                            <div className="text-xs opacity-75">Past + Dislike</div>
                          </div>
                          <div className={`p-3 rounded text-center ${getCellColor(pahm.pastClicks || 0)} ${getCellTextColor(pahm.pastClicks || 0)}`}>
                            <div className="text-xs font-medium">Past</div>
                            <div className="text-lg font-bold">{pahm.pastClicks || 0}</div>
                            <div className="text-xs opacity-75">Past + Neutral</div>
                          </div>
                          <div className={`p-3 rounded text-center ${getCellColor(pahm.nostalgiaClicks || 0)} ${getCellTextColor(pahm.nostalgiaClicks || 0)}`}>
                            <div className="text-xs font-medium">Nostalgia</div>
                            <div className="text-lg font-bold">{pahm.nostalgiaClicks || 0}</div>
                            <div className="text-xs opacity-75">Past + Like</div>
                          </div>
                          <div className={`p-3 rounded text-center ${getCellColor(pahm.dislikesClicks || 0)} ${getCellTextColor(pahm.dislikesClicks || 0)}`}>
                            <div className="text-xs font-medium">Dislikes</div>
                            <div className="text-lg font-bold">{pahm.dislikesClicks || 0}</div>
                            <div className="text-xs opacity-75">Present + Dislike</div>
                          </div>
                          <div className={`p-3 rounded text-center ${getCellColor(pahm.presentClicks || 0)} ${getCellTextColor(pahm.presentClicks || 0)} ring-2 ring-purple-300`}>
                            <div className="text-xs font-medium">Present</div>
                            <div className="text-lg font-bold">{pahm.presentClicks || 0}</div>
                            <div className="text-xs opacity-75">Present + Neutral</div>
                          </div>
                          <div className={`p-3 rounded text-center ${getCellColor(pahm.likesClicks || 0)} ${getCellTextColor(pahm.likesClicks || 0)}`}>
                            <div className="text-xs font-medium">Likes</div>
                            <div className="text-lg font-bold">{pahm.likesClicks || 0}</div>
                            <div className="text-xs opacity-75">Present + Like</div>
                          </div>
                          <div className={`p-3 rounded text-center ${getCellColor(pahm.worryClicks || 0)} ${getCellTextColor(pahm.worryClicks || 0)}`}>
                            <div className="text-xs font-medium">Worry</div>
                            <div className="text-lg font-bold">{pahm.worryClicks || 0}</div>
                            <div className="text-xs opacity-75">Future + Dislike</div>
                          </div>
                          <div className={`p-3 rounded text-center ${getCellColor(pahm.futureClicks || 0)} ${getCellTextColor(pahm.futureClicks || 0)}`}>
                            <div className="text-xs font-medium">Future</div>
                            <div className="text-lg font-bold">{pahm.futureClicks || 0}</div>
                            <div className="text-xs opacity-75">Future + Neutral</div>
                          </div>
                          <div className={`p-3 rounded text-center ${getCellColor(pahm.anticipationClicks || 0)} ${getCellTextColor(pahm.anticipationClicks || 0)}`}>
                            <div className="text-xs font-medium">Anticipation</div>
                            <div className="text-lg font-bold">{pahm.anticipationClicks || 0}</div>
                            <div className="text-xs opacity-75">Future + Like</div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* PAHM Workflow Progress */}
                {isPahmTesting && (
                  <div className="mb-4 p-4 bg-white rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">Workflow Progress</span>
                      <span className="text-sm text-gray-600">{pahmWorkflowResults.length}/8 steps</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(pahmWorkflowResults.length / 8) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* PAHM Test Results */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {pahmWorkflowResults.length === 0 && !isPahmTesting ? (
                    <div className="text-purple-600 text-center py-4">
                      Click "🎯 Test PAHM Workflow" to start comprehensive PAHM testing
                    </div>
                  ) : (
                    pahmWorkflowResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          result.success
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${
                              result.success ? 'bg-green-500' : 'bg-red-500'
                            }`}></span>
                            <span className="font-mono text-sm font-medium">
                              {result.method} {result.endpoint}
                            </span>
                            {result.status && (
                              <span className={`px-2 py-1 text-xs rounded ${
                                result.status < 400 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {result.status}
                              </span>
                            )}
                            {result.data?.clickNumber && (
                              <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
                                Click #{result.data.clickNumber} ({result.data.position})
                              </span>
                            )}
                            {result.data?.label && (
                              <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                                {result.data.label}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{result.timestamp}</span>
                        </div>
                        
                        {result.error ? (
                          <div className="text-red-600 text-sm font-mono">
                            Error: {result.error}
                          </div>
                        ) : (
                          <details className="text-sm">
                            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                              View Response Data
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Stage 1 Completion Testing Section */}
            {(isCompletingStage1 || stage1Results.length > 0) && (
              <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  🏆 Stage 1 Completion Testing
                  {isCompletingStage1 && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  )}
                </h2>
                
                {/* Stage 1 Progress */}
                {isCompletingStage1 && (
                  <div className="mb-4 p-4 bg-white rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">Completion Progress</span>
                      <span className="text-sm text-gray-600">{stage1Results.length}/7 steps</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(stage1Results.length / 7) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Completing all 5 sub-stages (T1-T5) with required sessions...
                    </div>
                  </div>
                )}

                {/* Stage 1 Sub-stages Overview */}
                {stage1Results.some(r => r.data?.subStage) && (
                  <div className="mb-4 p-4 bg-white rounded border">
                    <h3 className="font-medium text-gray-800 mb-3">Sub-stages Completed</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {['T1', 'T2', 'T3', 'T4', 'T5'].map(subStage => {
                        const completed = stage1Results.some(r => r.data?.subStage === subStage);
                        const details = stage1Results.find(r => r.data?.subStage === subStage)?.data;
                        return (
                          <div key={subStage} className={`p-3 rounded text-center ${
                            completed ? 'bg-green-100 border border-green-300' : 'bg-gray-100 border border-gray-300'
                          }`}>
                            <div className={`font-bold text-lg ${completed ? 'text-green-800' : 'text-gray-500'}`}>
                              {subStage}
                            </div>
                            {details && (
                              <>
                                <div className="text-xs text-gray-600 mt-1">
                                  {details.sessionsCompleted} sessions
                                </div>
                                <div className="text-xs text-gray-600">
                                  {details.duration} min each
                                </div>
                              </>
                            )}
                            <div className={`w-2 h-2 rounded-full mx-auto mt-2 ${
                              completed ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stage 1 Test Results */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {stage1Results.length === 0 && !isCompletingStage1 ? (
                    <div className="text-blue-600 text-center py-4">
                      Click "🏆 Complete Stage 1" to unlock PAHM Matrix functionality
                    </div>
                  ) : (
                    stage1Results.map((result, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          result.success
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${
                              result.success ? 'bg-green-500' : 'bg-red-500'
                            }`}></span>
                            <span className="font-mono text-sm font-medium">
                              {result.method} {result.endpoint}
                            </span>
                            {result.status && (
                              <span className={`px-2 py-1 text-xs rounded ${
                                result.status < 400 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {result.status}
                              </span>
                            )}
                            {result.data?.subStage && (
                              <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                                {result.data.subStage} Completed
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{result.timestamp}</span>
                        </div>
                        
                        {result.error ? (
                          <div className="text-red-600 text-sm font-mono">
                            Error: {result.error}
                          </div>
                        ) : (
                          <details className="text-sm">
                            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                              View Response Data
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Debug/Bypass Results Section */}
            {(isDebuggingProgress || debugResults.length > 0) && (
              <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h2 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                  🔧 Debug & Bypass Results
                  {isDebuggingProgress && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                  )}
                </h2>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {debugResults.length === 0 && !isDebuggingProgress ? (
                    <div className="text-yellow-600 text-center py-4">
                      Use bypass or debug buttons to investigate progress issues
                    </div>
                  ) : (
                    debugResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          result.success
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${
                              result.success ? 'bg-green-500' : 'bg-red-500'
                            }`}></span>
                            <span className="font-mono text-sm font-medium">
                              {result.method} {result.endpoint}
                            </span>
                            {result.status && (
                              <span className={`px-2 py-1 text-xs rounded ${
                                result.status < 400 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {result.status}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{result.timestamp}</span>
                        </div>
                        
                        {result.error ? (
                          <div className="text-red-600 text-sm font-mono">
                            Error: {result.error}
                          </div>
                        ) : (
                          <details className="text-sm">
                            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                              View Response Data
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Individual API Testing */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Individual API Testing</h2>
                
                {Object.entries(groupedEndpoints).map(([group, groupEndpoints]) => (
                  <div key={group} className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3">{group}</h3>
                    <div className="space-y-2">
                      {groupEndpoints.map((endpoint) => (
                        <label key={endpoint.endpoint} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="endpoint"
                            value={endpoint.endpoint}
                            checked={selectedEndpoint === endpoint.endpoint}
                            onChange={(e) => {
                              setSelectedEndpoint(e.target.value);
                              setRequestBody(getExampleRequestBody(e.target.value));
                            }}
                            className="text-blue-600"
                          />
                          <span className="text-sm">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mr-2">
                              {endpoint.method}
                            </span>
                            <span className="font-mono text-sm">{endpoint.endpoint}</span>
                            <span className="text-gray-500 ml-2">- {endpoint.description}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Request Body */}
                {selectedEndpoint && !selectedEndpoint.includes('GET') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Request Body (JSON)
                    </label>
                    <textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      className="w-full h-40 p-3 border border-gray-300 rounded-md font-mono text-sm"
                      placeholder="Enter JSON request body..."
                    />
                  </div>
                )}

                <button
                  onClick={testEndpoint}
                  disabled={!selectedEndpoint || isLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                  {isLoading ? 'Testing...' : `Test ${selectedEndpoint || 'Selected Endpoint'}`}
                </button>
              </div>

              {/* Test Results */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Test Results ({testResults.length})
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {testResults.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                      No test results yet. Run some tests to see results here.
                    </div>
                  ) : (
                    testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          result.success
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${
                              result.success ? 'bg-green-500' : 'bg-red-500'
                            }`}></span>
                            <span className="font-mono text-sm font-medium">
                              {result.method} {result.endpoint}
                            </span>
                            {result.status && (
                              <span className={`px-2 py-1 text-xs rounded ${
                                result.status < 400 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {result.status}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{result.timestamp}</span>
                        </div>
                        
                        {result.error ? (
                          <div className="text-red-600 text-sm font-mono">
                            Error: {result.error}
                          </div>
                        ) : (
                          <details className="text-sm">
                            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                              View Response Data
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
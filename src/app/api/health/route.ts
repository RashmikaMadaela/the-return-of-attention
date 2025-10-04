/**
 * Health Check API Route - Main health endpoint
 * GET /api/health
 */

import { createHealthCheckAPI } from '@/lib/health-monitor';

const healthAPI = createHealthCheckAPI();

export async function GET() {
  return await healthAPI.healthCheck();
}
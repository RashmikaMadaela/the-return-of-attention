/**
 * System Info API Route - Detailed system information
 * GET /api/health/info
 */

import { createHealthCheckAPI } from '@/lib/health-monitor';

const healthAPI = createHealthCheckAPI();

export async function GET() {
  return await healthAPI.info();
}
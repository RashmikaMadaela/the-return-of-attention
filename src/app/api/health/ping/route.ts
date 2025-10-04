/**
 * Ping API Route - Simple health ping
 * GET /api/health/ping
 */

import { createHealthCheckAPI } from '@/lib/health-monitor';

const healthAPI = createHealthCheckAPI();

export async function GET() {
  return healthAPI.ping();
}
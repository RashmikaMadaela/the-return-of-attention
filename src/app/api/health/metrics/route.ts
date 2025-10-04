/**
 * Metrics API Route - Performance metrics
 * GET /api/health/metrics
 */

import { createHealthCheckAPI } from '@/lib/health-monitor';

const healthAPI = createHealthCheckAPI();

export async function GET() {
  return healthAPI.metrics();
}
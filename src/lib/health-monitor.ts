/**
 * BACKEND MONITORING & HEALTH CHECKS
 * Comprehensive system monitoring, health checks, and performance tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

// Health check status
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy'
}

export interface HealthCheck {
  service: string;
  status: HealthStatus;
  responseTime: number;
  timestamp: string;
  error?: string;
  details?: any;
}

export interface SystemHealth {
  overall: HealthStatus;
  checks: HealthCheck[];
  uptime: number;
  timestamp: string;
  version: string;
}

export interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  activeConnections: number;
  memoryUsage: NodeJS.MemoryUsage;
  timestamp: string;
}

class HealthMonitor {
  private static metrics: PerformanceMetrics = {
    requestCount: 0,
    averageResponseTime: 0,
    errorRate: 0,
    activeConnections: 0,
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };

  private static responseTimes: number[] = [];
  private static errors: number = 0;
  private static startTime = Date.now();

  // Database health check
  static async checkDatabase(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      // Simple query to test database connectivity
      await prisma.$queryRaw`SELECT 1`;
      
      const responseTime = Date.now() - start;
      
      return {
        service: 'database',
        status: responseTime < 1000 ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
        responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        service: 'database',
        status: HealthStatus.UNHEALTHY,
        responseTime: Date.now() - start,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
    }
  }

  // Memory health check
  static checkMemory(): HealthCheck {
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;
    
    let status = HealthStatus.HEALTHY;
    if (memoryUsageMB > 500) status = HealthStatus.DEGRADED;
    if (memoryUsageMB > 1000) status = HealthStatus.UNHEALTHY;

    return {
      service: 'memory',
      status,
      responseTime: 0,
      timestamp: new Date().toISOString(),
      details: {
        heapUsed: `${Math.round(memoryUsageMB)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
      }
    };
  }

  // Disk space health check (basic)
  static checkDisk(): HealthCheck {
    // Note: This is a basic implementation
    // In production, you might want to use a library like 'fs' to check actual disk space
    
    return {
      service: 'disk',
      status: HealthStatus.HEALTHY,
      responseTime: 0,
      timestamp: new Date().toISOString(),
      details: {
        note: 'Basic disk check - implement actual disk space monitoring in production'
      }
    };
  }

  // API endpoints health check
  static async checkAPIEndpoints(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      // Test a simple internal endpoint
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/health/ping`);
      const responseTime = Date.now() - start;
      
      return {
        service: 'api',
        status: response.ok ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
        responseTime,
        timestamp: new Date().toISOString(),
        details: {
          statusCode: response.status
        }
      };
    } catch (error) {
      return {
        service: 'api',
        status: HealthStatus.UNHEALTHY,
        responseTime: Date.now() - start,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'API health check failed'
      };
    }
  }

  // Comprehensive health check
  static async performHealthCheck(): Promise<SystemHealth> {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkMemory(),
      this.checkDisk(),
      this.checkAPIEndpoints()
    ]);

    // Determine overall health
    const hasUnhealthy = checks.some(check => check.status === HealthStatus.UNHEALTHY);
    const hasDegraded = checks.some(check => check.status === HealthStatus.DEGRADED);
    
    let overallStatus = HealthStatus.HEALTHY;
    if (hasUnhealthy) overallStatus = HealthStatus.UNHEALTHY;
    else if (hasDegraded) overallStatus = HealthStatus.DEGRADED;

    return {
      overall: overallStatus,
      checks,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    };
  }

  // Record request metrics
  static recordRequest(responseTime: number, isError: boolean = false) {
    this.metrics.requestCount++;
    this.responseTimes.push(responseTime);
    
    if (isError) {
      this.errors++;
    }

    // Keep only last 1000 response times for memory efficiency
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }

    // Update metrics
    this.updateMetrics();
  }

  // Update performance metrics
  private static updateMetrics() {
    this.metrics.averageResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
      : 0;
    
    this.metrics.errorRate = this.metrics.requestCount > 0
      ? (this.errors / this.metrics.requestCount) * 100
      : 0;
    
    this.metrics.memoryUsage = process.memoryUsage();
    this.metrics.timestamp = new Date().toISOString();
  }

  // Get current performance metrics
  static getMetrics(): PerformanceMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  // Reset metrics (useful for testing)
  static resetMetrics() {
    this.metrics = {
      requestCount: 0,
      averageResponseTime: 0,
      errorRate: 0,
      activeConnections: 0,
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
    this.responseTimes = [];
    this.errors = 0;
  }

  // Middleware to track requests
  static trackRequest(handler: (...args: any[]) => Promise<any>) {
    return async (request: NextRequest, ...args: any[]) => {
      const start = Date.now();
      let isError = false;

      try {
        const response = await handler(request, ...args);
        
        // Check if response indicates an error
        if (response instanceof NextResponse) {
          isError = response.status >= 400;
        }
        
        return response;
      } catch (error) {
        isError = true;
        throw error;
      } finally {
        const responseTime = Date.now() - start;
        this.recordRequest(responseTime, isError);
      }
    };
  }
}

// Utility functions for API routes
export const createHealthCheckAPI = () => {
  return {
    // Main health check endpoint
    healthCheck: async () => {
      const health = await HealthMonitor.performHealthCheck();
      
      return NextResponse.json(health, {
        status: health.overall === HealthStatus.HEALTHY ? 200 : 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    },

    // Simple ping endpoint
    ping: () => {
      return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - Date.now()) / 1000)
      });
    },

    // Performance metrics endpoint
    metrics: () => {
      const metrics = HealthMonitor.getMetrics();
      
      return NextResponse.json(metrics, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    },

    // Detailed system info
    info: async () => {
      const health = await HealthMonitor.performHealthCheck();
      const metrics = HealthMonitor.getMetrics();
      
      return NextResponse.json({
        health,
        metrics,
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          pid: process.pid,
          uptime: process.uptime()
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
    }
  };
};

// Export singleton instance
export const healthMonitor = HealthMonitor;

// Middleware exports
export const withHealthTracking = HealthMonitor.trackRequest;

export default HealthMonitor;
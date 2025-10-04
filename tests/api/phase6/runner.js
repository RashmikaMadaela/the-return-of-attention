/**
 * Phase 6 Test Runner
 * 
 * Main runner for Phase 6 comprehensive backend testing
 */

const { spawn } = require('child_process');
const path = require('path');

class Phase6TestRunner {
  constructor() {
    this.serverProcess = null;
    this.serverReady = false;
    this.serverPort = '3000';
  }

  async startDevServer() {
    return new Promise((resolve, reject) => {
      console.log('🚀 Starting development server...');
      
      this.serverProcess = spawn('npm', ['run', 'dev'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        cwd: process.cwd()
      });

      let output = '';
      
      this.serverProcess.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        
        // Check if server is ready and extract port
        if (text.includes('Ready on') || text.includes('Local:')) {
          // Extract port from output like "Local: http://localhost:3001"
          const portMatch = text.match(/localhost:(\d+)/);
          if (portMatch) {
            const port = portMatch[1];
            this.serverPort = port;
            console.log(`✅ Development server is ready on port ${port}!`);
          } else {
            this.serverPort = '3000'; // Default fallback
            console.log('✅ Development server is ready!');
          }
          this.serverReady = true;
          resolve();
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        const text = data.toString();
        console.log('Server stderr:', text);
        
        // Check for port usage message and extract the actual port
        const portUsageMatch = text.match(/using available port (\d+) instead/);
        if (portUsageMatch) {
          this.serverPort = portUsageMatch[1];
          console.log(`🔄 Server will use port ${this.serverPort}`);
        }
        
        // Some error messages might still indicate success
        if (text.includes('Ready on') || text.includes('Local:')) {
          // Extract port if available
          const portMatch = text.match(/localhost:(\d+)/);
          if (portMatch) {
            this.serverPort = portMatch[1];
            console.log(`✅ Development server is ready on port ${this.serverPort}!`);
          } else {
            this.serverPort = this.serverPort || '3000';
            console.log('✅ Development server is ready!');
          }
          this.serverReady = true;
          resolve();
        }
      });

      this.serverProcess.on('error', (error) => {
        console.error('Failed to start server:', error);
        reject(error);
      });

      // Timeout after 15 seconds (reduced)
      setTimeout(() => {
        if (!this.serverReady) {
          console.log('⚠️  Server startup timeout, but continuing with tests...');
          this.serverPort = this.serverPort || '3000';
          resolve(); // Continue anyway, server might be ready
        }
      }, 15000);
    });
  }

  async stopDevServer() {
    if (this.serverProcess) {
      console.log('🛑 Stopping development server...');
      this.serverProcess.kill('SIGTERM');
      
      // Wait a bit for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (!this.serverProcess.killed) {
        this.serverProcess.kill('SIGKILL');
      }
      
      this.serverProcess = null;
      this.serverReady = false;
      console.log('✅ Development server stopped');
    }
  }

  async runPhase61() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 PHASE 6.1: API Connectivity & Basic Functionality Testing');
    console.log('='.repeat(60));
    
    try {
      // Dynamic import of the connectivity test
      const connectivityTest = require('./connectivity-test.js');
      
      // Set the correct API base URL with detected port
      const apiBaseUrl = `http://localhost:${this.serverPort}/api`;
      connectivityTest.setApiBaseUrl(apiBaseUrl);
      console.log(`🔗 Using API base URL: ${apiBaseUrl}`);
      
      const results = await connectivityTest.runTests();
      
      return results;
    } catch (error) {
      console.error('❌ Phase 6.1 failed:', error);
      return { total: 0, passed: 0, failed: 1, errors: [error] };
    }
  }

  async runPhase62() {
    console.log('\n' + '='.repeat(60));
    console.log('🔐 PHASE 6.2: Authentication & Authorization Testing');
    console.log('='.repeat(60));
    
    try {
      // Dynamic import of the auth test
      const authTest = require('./auth-test.js');
      
      // Set the correct API base URL with detected port
      const apiBaseUrl = `http://localhost:${this.serverPort}/api`;
      authTest.setApiBaseUrl(apiBaseUrl);
      console.log(`🔗 Using API base URL: ${apiBaseUrl}`);
      
      const results = await authTest.runAuthTests();
      
      return results;
    } catch (error) {
      console.error('❌ Phase 6.2 failed:', error);
      return { total: 0, passed: 0, failed: 1, errors: [error] };
    }
  }

  async waitForServer() {
    console.log('⏳ Waiting for server to be fully ready...');
    
    const maxWaitTime = 30000; // 30 seconds
    const checkInterval = 1000; // 1 second
    let waited = 0;
    
    while (waited < maxWaitTime) {
      try {
        const response = await fetch(`http://localhost:${this.serverPort}/api/stages`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        // If we get any response (even error), server is responding
        console.log('✅ Server is responding to requests');
        return true;
      } catch (error) {
        // Server not ready yet
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        waited += checkInterval;
        
        if (waited % 5000 === 0) {
          console.log(`⏳ Still waiting for server... (${waited/1000}s)`);
        }
      }
    }
    
    console.log('⚠️  Server readiness check timeout, proceeding anyway...');
    return false;
  }

  async runAllTests() {
    console.log('🎯 Starting Phase 6 Comprehensive Backend Testing');
    console.log('='.repeat(80));
    
    const startTime = Date.now();
    const results = {
      phase61: null,
      phase62: null,
      overall: { total: 0, passed: 0, failed: 0 }
    };
    
    try {
      // Start development server
      await this.startDevServer();
      
      // Wait for server to be ready
      await this.waitForServer();
      
      // Run Phase 6.1: API Connectivity Testing
      results.phase61 = await this.runPhase61();
      
      // Update overall results
      results.overall.total += results.phase61.total;
      results.overall.passed += results.phase61.passed;
      results.overall.failed += results.phase61.failed;
      
      // Run Phase 6.2: Authentication & Authorization Testing
      results.phase62 = await this.runPhase62();
      
      // Update overall results
      results.overall.total += results.phase62.total;
      results.overall.passed += results.phase62.passed;
      results.overall.failed += results.phase62.failed;
      
    } catch (error) {
      console.error('❌ Testing failed:', error);
      results.overall.failed++;
    } finally {
      // Always stop the server
      await this.stopDevServer();
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    // Print final summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 PHASE 6 TESTING COMPLETE');
    console.log('='.repeat(80));
    console.log(`Total Duration: ${duration.toFixed(2)} seconds`);
    
    console.log('\n📈 PHASE BREAKDOWN:');
    if (results.phase61) {
      console.log(`Phase 6.1 (Connectivity): ${results.phase61.passed}/${results.phase61.total} (${((results.phase61.passed/results.phase61.total)*100).toFixed(1)}%)`);
    }
    if (results.phase62) {
      console.log(`Phase 6.2 (Authentication): ${results.phase62.passed}/${results.phase62.total} (${((results.phase62.passed/results.phase62.total)*100).toFixed(1)}%)`);
    }
    
    console.log(`\n📊 OVERALL RESULTS:`);
    console.log(`Total Tests: ${results.overall.total}`);
    console.log(`Passed: ${results.overall.passed}`);
    console.log(`Failed: ${results.overall.failed}`);
    
    const successRate = results.overall.total > 0 ? 
      (results.overall.passed / results.overall.total) * 100 : 0;
    
    console.log(`Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 90) {
      console.log('\n🎉 PHASE 6 SUCCESS! Backend testing passed!');
    } else if (successRate >= 75) {
      console.log('\n⚠️  PHASE 6 PARTIAL SUCCESS. Some issues need attention.');
    } else {
      console.log('\n💥 PHASE 6 FAILED. Significant issues need resolution.');
    }
    
    return results;
  }
}

// Create and run if this file is executed directly
if (require.main === module) {
  const runner = new Phase6TestRunner();
  
  // Handle process termination
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, cleaning up...');
    await runner.stopDevServer();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, cleaning up...');
    await runner.stopDevServer();
    process.exit(0);
  });
  
  // Run the tests
  runner.runAllTests()
    .then((results) => {
      console.log('\n✅ Testing completed successfully!');
      process.exit(results.overall.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Testing failed:', error);
      process.exit(1);
    });
}

module.exports = Phase6TestRunner;
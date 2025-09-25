#!/usr/bin/env node

/**
 * Test Runner for User Management APIs
 * Run with: npm run test:user-management
 */

const { runAllTests } = require('./user-management-api.test.js')

async function main() {
  try {
    await runAllTests()
    process.exit(0)
  } catch (error) {
    console.error('Test runner failed:', error)
    process.exit(1)
  }
}

main()
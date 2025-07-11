#!/usr/bin/env node

// Deployment verification script for TrackApp
// This script tests the key functionality after deployment

const http = require('http');
const https = require('https');

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testDeployment(baseUrl) {
  console.log(`🔍 Testing deployment at: ${baseUrl}`);
  console.log('=' .repeat(50));

  const tests = [
    {
      name: 'Root page',
      url: `${baseUrl}/`,
      expectedType: 'text/html'
    },
    {
      name: 'Dashboard route (SPA)',
      url: `${baseUrl}/dashboard`,
      expectedType: 'text/html'
    },
    {
      name: 'Auth route (SPA)',
      url: `${baseUrl}/auth`,
      expectedType: 'text/html'
    },
    {
      name: 'Profile route (SPA)',
      url: `${baseUrl}/profile`,
      expectedType: 'text/html'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n🧪 Testing: ${test.name}`);
      const result = await makeRequest(test.url);
      
      if (result.statusCode === 200) {
        const contentType = result.headers['content-type'];
        if (contentType && contentType.includes(test.expectedType)) {
          console.log(`✅ ${test.name}: OK (${result.statusCode}, ${contentType})`);
        } else {
          console.log(`⚠️  ${test.name}: Wrong content type (${contentType})`);
        }
      } else {
        console.log(`❌ ${test.name}: HTTP ${result.statusCode}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Deployment test completed');
}

// Get URL from command line or use localhost
const testUrl = process.argv[2] || 'http://localhost:8080';
testDeployment(testUrl).catch(console.error);

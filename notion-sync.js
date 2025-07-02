#!/usr/bin/env node

/**
 * Notion Sync System Test Script
 * This script tests your Notion sync system both locally and on Cloudflare Workers
 */

import https from 'https';
import http from 'http';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Configuration
const config = {
    localUrl: 'http://localhost:5173',
    workerUrl: 'https://notion-cors-proxy.your-subdomain.workers.dev', // Replace with your actual worker URL
    endpoints: {
        debug: '/api/debug',
        projects: '/api/projects',
        dataStatus: '/api/data/status',
        dataSync: '/api/data/sync',
        debugProperties: '/api/debug/properties'
    }
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;
        const requestOptions = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const req = protocol.request(url, requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: { raw: data } });
                }
            });
        });

        req.on('error', reject);

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

// Test functions
async function testEndpoint(baseUrl, endpoint, options = {}) {
    const url = baseUrl + endpoint;
    console.log(`\n🔍 Testing: ${endpoint}`);
    console.log(`   URL: ${url}`);

    try {
        const result = await makeRequest(url, options);
        console.log(`   Status: ${result.status}`);

        if (result.status === 200) {
            console.log(`   ✅ Success`);
            console.log(`   Response: ${JSON.stringify(result.data, null, 2)}`);
        } else {
            console.log(`   ❌ Failed`);
            console.log(`   Error: ${JSON.stringify(result.data, null, 2)}`);
        }

        return result;
    } catch (error) {
        console.log(`   ❌ Network Error: ${error.message}`);
        return { status: 0, error: error.message };
    }
}

async function runTests(baseUrl, title) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 TESTING ${title}`);
    console.log(`${'='.repeat(60)}`);

    // Test 1: Configuration Check
    await testEndpoint(baseUrl, config.endpoints.debug);

    // Test 2: Notion Projects
    await testEndpoint(baseUrl, config.endpoints.projects);

    // Test 3: Data Status
    await testEndpoint(baseUrl, config.endpoints.dataStatus);

    // Test 4: Debug Properties
    await testEndpoint(baseUrl, config.endpoints.debugProperties);

    // Test 5: Data Sync (with sample payload)
    await testEndpoint(baseUrl, config.endpoints.dataSync, {
        method: 'POST',
        body: {
            force: false,
            includeImages: true
        }
    });
}

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim().toLowerCase());
        });
    });
}

async function main() {
    console.log('🚀 Notion Sync System Test');
    console.log('='.repeat(40));

    const choice = await askQuestion(`
What would you like to test?
1. Local development server (localhost:5173)
2. Cloudflare Worker (production)
3. Both
4. Custom URL

Enter your choice (1-4): `);

    switch (choice) {
        case '1':
            await runTests(config.localUrl, 'LOCAL DEVELOPMENT');
            break;

        case '2':
            const workerUrl = await askQuestion(`Enter your Cloudflare Worker URL: `);
            await runTests(workerUrl || config.workerUrl, 'CLOUDFLARE WORKER');
            break;

        case '3':
            await runTests(config.localUrl, 'LOCAL DEVELOPMENT');
            const workerUrl2 = await askQuestion(`\nEnter your Cloudflare Worker URL: `);
            await runTests(workerUrl2 || config.workerUrl, 'CLOUDFLARE WORKER');
            break;

        case '4':
            const customUrl = await askQuestion(`Enter custom URL: `);
            await runTests(customUrl, 'CUSTOM URL');
            break;

        default:
            console.log('Invalid choice. Exiting...');
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('🏁 Test Complete!');
    console.log(`${'='.repeat(60)}`);

    rl.close();
}

// Handle script execution
main().catch(console.error);

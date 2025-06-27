#!/usr/bin/env node

/**
 * Fast Screenshot Tool for UI Editing
 * Optimized for speed - minimal screenshots, reduced timeouts
 */

const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Try to load playwright from project
const projectPath = process.cwd();
let chromium;
try {
  const playwrightPath = path.join(projectPath, 'node_modules', 'playwright');
  const playwright = require(playwrightPath);
  chromium = playwright.chromium;
} catch (error) {
  console.error('❌ Playwright not found in project node_modules.');
  process.exit(1);
}

// Parse arguments
const command = process.argv[2] || 'capture';
const urlArg = process.argv[3]; // Optional URL argument

// Function to prompt for server address
async function promptForServerAddress() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Try to read from config file first
  let configUrl = "http://192.168.231.238:8080";
  try {
    const configPath = path.join(process.cwd(), 'ui-editor-config.json');
    if (fs.existsSync(configPath)) {
      const configFile = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      configUrl = configFile.url || configUrl;
    }
  } catch (e) {
    // Use default if config read fails
  }

  return new Promise((resolve) => {
    console.log(`🌐 Current server address: ${configUrl}`);
    rl.question('📍 Press Enter to use current address, or type new address (e.g., http://192.168.231.238:8080): ', (answer) => {
      rl.close();
      const finalUrl = answer.trim() || configUrl;
      
      // Update config file with new address if provided
      if (answer.trim()) {
        try {
          const configPath = path.join(process.cwd(), 'ui-editor-config.json');
          let config = {};
          if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          }
          config.url = finalUrl;
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
          console.log(`✅ Updated server address to: ${finalUrl}`);
        } catch (e) {
          console.log(`⚠️ Could not update config file, but proceeding with: ${finalUrl}`);
        }
      }
      
      resolve(finalUrl);
    });
  });
}

// Config - will be updated dynamically
const config = {
  url: "http://192.168.231.238:8080", // Default fallback
  projectName: "tcc-deal-buddy"
};

// Setup paths
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const baseOutputDir = path.join(projectPath, '..', 'screenshots', config.projectName);
const workflowDir = path.join(baseOutputDir, 'workflow');

// Ensure directory exists
if (!fs.existsSync(workflowDir)) {
  fs.mkdirSync(workflowDir, { recursive: true });
}

async function takeScreenshot(prefix) {
  console.log(`🚀 Fast ${prefix} screenshot for ${config.projectName}...`);
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  
  // Fast load with enhanced error handling
  try {
    await page.goto(config.url, { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
  } catch (error) {
    if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      console.error(`❌ Connection refused to ${config.url}`);
      console.log('💡 The server address in ui-editor-config.json might be incorrect.');
      console.log('💡 Please check if the dev server is running and update the URL if needed.');
      console.log(`💡 Current configured URL: ${config.url}`);
      throw new Error(`Server not accessible at ${config.url}. Please verify the server address and ensure it's running.`);
    }
    throw error;
  }

  // Minimal wait
  await page.waitForTimeout(1000);

  // Take full page screenshot only
  const filename = `${prefix}-full-${timestamp}.png`;
  const filepath = path.join(workflowDir, filename);
  
  await page.screenshot({ 
    path: filepath, 
    fullPage: true 
  });
  
  console.log(`✅ Saved: ${filename}`);

  await browser.close();
  
  // Auto-update component map after 'after' screenshots
  if (prefix === 'after') {
    await updateComponentMap();
  }
}

async function updateComponentMap() {
  console.log('🔄 Auto-updating component map...');
  
  try {
    const { execSync } = require('child_process');
    const mapGeneratorPath = '/mnt/ssd/Projects/claude/tools/ui-editor/map-generator.cjs';
    
    // Run map generator
    execSync(`node "${mapGeneratorPath}" "${projectPath}"`, { 
      stdio: 'inherit',
      cwd: projectPath 
    });
    
    console.log('✅ Component map updated');
  } catch (error) {
    console.warn('⚠️  Could not update component map:', error.message);
  }
}

async function compareScreenshots() {
  const files = fs.readdirSync(workflowDir);
  const beforeFiles = files.filter(f => f.startsWith('before-full-'));
  const afterFiles = files.filter(f => f.startsWith('after-full-'));
  
  if (beforeFiles.length === 0 || afterFiles.length === 0) {
    console.log('❌ No before/after screenshots to compare');
    return;
  }

  const latest = { before: beforeFiles.slice(-1)[0], after: afterFiles.slice(-1)[0] };
  
  console.log('🔍 Fast comparison:');
  console.log(`Before: ${latest.before}`);
  console.log(`After:  ${latest.after}`);
  
  // Quick size comparison
  const beforeStat = fs.statSync(path.join(workflowDir, latest.before));
  const afterStat = fs.statSync(path.join(workflowDir, latest.after));
  const sizeDiff = afterStat.size - beforeStat.size;
  
  console.log(`Size change: ${sizeDiff > 0 ? '+' : ''}${sizeDiff} bytes`);
  console.log('💡 Open files to visually compare');
}

async function main() {
  // Prompt for server address before any operations (unless provided as argument)
  let serverUrl;
  if (urlArg) {
    serverUrl = urlArg;
    console.log(`🌐 Using provided URL: ${serverUrl}`);
  } else {
    serverUrl = await promptForServerAddress();
  }
  config.url = serverUrl;
  
  switch (command) {
    case 'before':
      await takeScreenshot('before');
      break;
    case 'after':
      await takeScreenshot('after');
      break;
    case 'compare':
      await compareScreenshots();
      break;
    default:
      await takeScreenshot('capture');
  }
}

main().catch(console.error);
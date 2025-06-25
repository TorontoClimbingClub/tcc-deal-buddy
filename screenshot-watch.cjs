#!/usr/bin/env node

/**
 * Screenshot Watcher for TCC Deal Buddy
 * Automatically takes screenshots when files change
 * 
 * Usage:
 *   node screenshot-watch.js              # Watch for changes and auto-screenshot
 *   node screenshot-watch.js --mobile     # Watch with mobile viewport
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { watch } = require('fs/promises');

const args = process.argv.slice(2);

// Get project name from current directory
const projectName = 'tcc-deal-buddy';
const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

// For WSL, we need to use the Windows host IP
const isWSL = process.platform === 'linux' && fs.existsSync('/proc/sys/fs/binfmt_misc/WSLInterop');
const url = isWSL ? 'http://192.168.50.32:8080' : 'http://localhost:8080';

const options = {
  url: url,
  baseOutputDir: path.join(__dirname, '..', 'screenshots', projectName),
  outputDir: null, // Will be set based on date
  mobile: args.includes('--mobile'),
  watchDirs: ['./src/components', './src/pages', './src/styles']
};

// Set output directory with date-based organization
options.outputDir = path.join(options.baseOutputDir, date);

let browser;
let page;
let isCapturing = false;

async function initBrowser() {
  console.log('🚀 Initializing browser...');
  browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: options.mobile 
      ? { width: 390, height: 844 }
      : { width: 1920, height: 1080 },
    deviceScaleFactor: options.mobile ? 3 : 1,
  });

  page = await context.newPage();
}

async function captureScreenshot(reason = 'change') {
  if (isCapturing) return;
  isCapturing = true;

  try {
    console.log(`\n📸 Taking screenshot (${reason})...`);
    
    // Ensure output directory exists (may have changed date)
    const currentDate = new Date().toISOString().split('T')[0];
    options.outputDir = path.join(options.baseOutputDir, currentDate);
    if (!fs.existsSync(options.outputDir)) {
      fs.mkdirSync(options.outputDir, { recursive: true });
    }
    
    await page.goto(options.url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(500);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const deviceSuffix = options.mobile ? '-mobile' : '-desktop';
    const filename = `auto-${timestamp}${deviceSuffix}.png`;
    const filepath = path.join(options.outputDir, filename);

    await page.screenshot({ 
      path: filepath, 
      fullPage: true 
    });

    // Create latest directory and symlinks
    const latestDir = path.join(options.baseOutputDir, 'latest');
    if (!fs.existsSync(latestDir)) {
      fs.mkdirSync(latestDir, { recursive: true });
    }
    
    const latestPath = path.join(latestDir, `latest${deviceSuffix}.png`);
    if (fs.existsSync(latestPath)) {
      fs.unlinkSync(latestPath);
    }
    
    // Create relative symlink from latest directory to dated file
    const relativeTarget = path.join('..', currentDate, path.basename(filepath));
    fs.symlinkSync(relativeTarget, latestPath);

    console.log(`✅ Screenshot saved: ${filepath}`);
    
  } catch (error) {
    console.error('❌ Screenshot failed:', error.message);
  } finally {
    isCapturing = false;
  }
}

async function watchFiles() {
  console.log('👀 Watching for file changes in:', options.watchDirs.join(', '));
  console.log('Press Ctrl+C to stop\n');

  // Debounce to avoid multiple screenshots
  let debounceTimer;
  const debouncedCapture = (reason) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => captureScreenshot(reason), 1000);
  };

  // Watch each directory
  for (const dir of options.watchDirs) {
    if (fs.existsSync(dir)) {
      const watcher = watch(dir, { recursive: true });
      
      (async () => {
        for await (const event of watcher) {
          if (event.filename?.endsWith('.tsx') || 
              event.filename?.endsWith('.ts') || 
              event.filename?.endsWith('.css')) {
            console.log(`🔄 Change detected: ${event.filename}`);
            debouncedCapture('file change');
          }
        }
      })();
    }
  }

  // Take initial screenshot
  await captureScreenshot('initial');
}

async function main() {
  // Ensure screenshots directory exists
  if (!fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir, { recursive: true });
  }

  try {
    await initBrowser();
    await watchFiles();
    
    // Keep process running
    process.stdin.resume();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Cleanup on exit
process.on('SIGINT', async () => {
  console.log('\n🛑 Stopping watcher...');
  if (browser) await browser.close();
  process.exit(0);
});

// Start the watcher
main().catch(console.error);
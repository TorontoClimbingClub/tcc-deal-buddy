#!/usr/bin/env node

/**
 * Automated Screenshot Tool for TCC Deal Buddy
 * Uses Playwright to capture screenshots of the running dev server
 * 
 * Usage:
 *   node screenshot.js                    # Takes full page screenshot
 *   node screenshot.js --element ".card"  # Screenshot specific element
 *   node screenshot.js --mobile          # Mobile viewport
 *   node screenshot.js --help            # Show help
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Parse command line arguments
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
  filename: 'screenshot',
  fullPage: true,
  mobile: args.includes('--mobile'),
  element: null,
  help: args.includes('--help') || args.includes('-h')
};

// Set output directory with date-based organization
options.outputDir = path.join(options.baseOutputDir, date);

// Check for element selector
const elementIndex = args.indexOf('--element');
if (elementIndex !== -1 && args[elementIndex + 1]) {
  options.element = args[elementIndex + 1];
  options.fullPage = false;
}

// Show help
if (options.help) {
  console.log(`
Screenshot Tool for TCC Deal Buddy

Usage: node screenshot.js [options]

Options:
  --element <selector>  Capture specific element (e.g., ".product-card")
  --mobile             Use mobile viewport (iPhone 12)
  --help, -h          Show this help message

Examples:
  node screenshot.js                           # Full page screenshot
  node screenshot.js --mobile                  # Mobile viewport
  node screenshot.js --element ".header"       # Screenshot header only
  node screenshot.js --element "#product-grid" # Screenshot product grid

Screenshots are saved to: ../screenshots/tcc-deal-buddy/YYYY-MM-DD/
Latest symlinks at: ../screenshots/tcc-deal-buddy/latest/
`);
  process.exit(0);
}

async function takeScreenshot() {
  console.log('🚀 Starting Playwright...');
  
  // Ensure screenshots directory exists
  if (!fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir, { recursive: true });
  }

  try {
    // Launch browser
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // For WSL compatibility
    });

    const context = await browser.newContext({
      viewport: options.mobile 
        ? { width: 390, height: 844 } // iPhone 12 dimensions
        : { width: 1920, height: 1080 },
      deviceScaleFactor: options.mobile ? 3 : 1,
    });

    const page = await context.newPage();
    
    console.log(`📡 Navigating to ${options.url}...`);
    await page.goto(options.url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait a bit for any animations to complete and data to load
    await page.waitForTimeout(3000);
    
    // Wait for product cards to be visible
    try {
      await page.waitForSelector('.grid .rounded-lg', { timeout: 5000 });
    } catch (e) {
      console.log('⚠️  Warning: Product cards not found, continuing anyway...');
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const deviceSuffix = options.mobile ? '-mobile' : '-desktop';
    const elementSuffix = options.element ? '-element' : '';
    const filename = `${options.filename}${deviceSuffix}${elementSuffix}-${timestamp}.png`;
    const filepath = path.join(options.outputDir, filename);

    // Take screenshot
    if (options.element) {
      console.log(`📸 Capturing element: ${options.element}`);
      const element = await page.locator(options.element).first();
      await element.screenshot({ path: filepath });
    } else {
      console.log(`📸 Capturing ${options.fullPage ? 'full page' : 'viewport'}...`);
      await page.screenshot({ 
        path: filepath, 
        fullPage: options.fullPage 
      });
    }

    console.log(`✅ Screenshot saved to: ${filepath}`);
    
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
    const relativeTarget = path.join('..', date, path.basename(filepath));
    fs.symlinkSync(relativeTarget, latestPath);
    console.log(`🔗 Latest screenshot link: ${latestPath}`);

    await browser.close();
    
  } catch (error) {
    console.error('❌ Error taking screenshot:', error.message);
    if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      console.error('💡 Make sure the dev server is running at http://localhost:8080');
    }
    process.exit(1);
  }
}

// Run the screenshot
takeScreenshot().catch(console.error);
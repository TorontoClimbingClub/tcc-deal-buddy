# Screenshot Automation for TCC Deal Buddy

This project includes automated screenshot tools using Playwright to capture the UI during development.

## Setup

First, install Playwright as a dev dependency:

```bash
npm install --save-dev playwright
```

## Usage

### One-time Screenshot

Take a single screenshot of the current state:

```bash
# Full page screenshot (desktop)
node screenshot.cjs

# Mobile viewport screenshot
node screenshot.cjs --mobile

# Screenshot specific element
node screenshot.cjs --element ".product-card"
node screenshot.cjs --element "#header"

# Show help
node screenshot.cjs --help
```

### Auto-Screenshot on File Changes

Watch for file changes and automatically capture screenshots:

```bash
# Watch mode (desktop)
node screenshot-watch.cjs

# Watch mode (mobile)
node screenshot-watch.cjs --mobile
```

The watcher monitors:
- `./src/components/**/*`
- `./src/pages/**/*`
- `./src/styles/**/*`

## Output

Screenshots are organized in a dedicated directory structure:

```
D:\Projects\screenshots\
└── tcc-deal-buddy\
    ├── 2024-06-25\                   # Date-organized folders
    │   ├── screenshot-desktop-2024-06-25T10-30-45.png
    │   ├── screenshot-mobile-2024-06-25T10-31-12.png
    │   └── auto-2024-06-25T10-35-20-desktop.png
    ├── 2024-06-26\                   # Next day's screenshots
    │   └── ...
    └── latest\                       # Symlinks to most recent
        ├── latest-desktop.png        # Always points to newest desktop screenshot
        └── latest-mobile.png         # Always points to newest mobile screenshot
```

**Windows paths:**
- Screenshots: `D:\Projects\screenshots\tcc-deal-buddy\YYYY-MM-DD\`
- Latest: `D:\Projects\screenshots\tcc-deal-buddy\latest\`

**WSL paths (for Claude Code):**
- Screenshots: `/mnt/ssd/Projects/screenshots/tcc-deal-buddy/YYYY-MM-DD/`
- Latest: `/mnt/ssd/Projects/screenshots/tcc-deal-buddy/latest/`

## Integration with Claude Code

I can now read screenshots to see UI changes:

1. After making code changes, run: `node screenshot.cjs`
2. I can then read the screenshot: `/mnt/ssd/Projects/screenshots/tcc-deal-buddy/latest/latest-desktop.png`
3. This allows me to verify changes and suggest improvements

The organized structure provides:
- **Date-based organization**: Easy to track changes over time
- **Project separation**: Screenshots don't clutter application code
- **Latest symlinks**: Quick access to most recent screenshots
- **Clean project directory**: Application code stays separate from generated assets

## Troubleshooting

- **"Connection refused" error**: Make sure the dev server is running (`npm run dev`)
- **WSL issues**: The scripts include WSL-compatible browser launch arguments
- **Permission errors**: Run `chmod +x screenshot*.cjs` to make scripts executable

## Advanced Usage

You can also create custom screenshot scripts:

```javascript
// custom-screenshot.js
const { chromium } = require('playwright');

async function captureCustomView() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate and interact with the page
  await page.goto('http://localhost:8080');
  await page.click('.search-button');
  await page.fill('input[type="search"]', 'climbing shoes');
  
  // Capture after interaction
  await page.screenshot({ path: './screenshots/search-results.png' });
  
  await browser.close();
}

captureCustomView();
```
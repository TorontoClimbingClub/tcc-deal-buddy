# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/5f9eaa3d-87e8-4329-a9d3-9b429f0acba3

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5f9eaa3d-87e8-4329-a9d3-9b429f0acba3) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev

# Step 5: Install UI editing dependencies for visual development workflow
npm install playwright sharp
```

## 🎨 UI Editing & Visual Development

This project includes a comprehensive UI editing workflow with visual validation:

### Quick Start
```bash
# Take before screenshot
npm run ui:before

# Make your UI changes
# ... edit components ...

# Take after screenshot & compare
npm run ui:after
npm run ui:compare
```

### Available Commands
```bash
npm run ui:before      # Capture current UI state (desktop + mobile)
npm run ui:after       # Capture updated UI state + auto-update component map
npm run ui:compare     # Visual comparison with pixel-perfect analysis
npm run ui:reset       # Clean workflow, start fresh
npm run ui:config      # Configure server URL settings
npm run ui:update-map  # Update component mapping
```

### Dependencies for Full Features
```bash
# Required for screenshot capture
npm install playwright

# Required for pixel-perfect visual comparison
npm install sharp
```

### WSL/Windows Setup
**In WSL (recommended):**
```bash
# Install all dependencies
npm install playwright sharp

# Download browser binaries
npx playwright install chromium
```

**In Windows PowerShell/CMD:**
```bash
# Install dependencies  
npm install playwright sharp

# Download browser binaries
npx playwright install chromium
```

### Features
- ✅ Smart server detection (auto-detects port 8081)
- ✅ Desktop + mobile responsive testing
- ✅ Pixel-perfect visual comparison
- ✅ Auto component map updates
- ✅ Screenshot cleanup & archiving
- ✅ Visual diff overlays
- ✅ Change percentage analysis

### Troubleshooting
If UI commands fail:
1. Ensure dev server is running (`npm run dev`)
2. Check server URL in `ui-editor-config.json`
3. Update server address: `npm run ui:config`
4. Install missing dependencies: `npm install playwright sharp`

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5f9eaa3d-87e8-4329-a9d3-9b429f0acba3) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

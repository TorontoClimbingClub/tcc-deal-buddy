# 🚨 CRITICAL: Lovable Live Preview Rules

## NEVER MODIFY THESE FILES WITHOUT EXTREME CAUTION

These files are **ESSENTIAL** for Lovable's live preview functionality. Any changes to these files can break the visual editing experience:

### 1. **vite.config.ts**
- **CONTAINS**: `componentTagger()` from lovable-tagger
- **PURPOSE**: Enables live editing and component identification
- **RULE**: Never remove or modify the componentTagger plugin

### 2. **src/main.tsx**
- **PURPOSE**: React app entry point that renders to the DOM
- **RULE**: Preserve the exact rendering setup and DOM mounting

### 3. **src/App.tsx**
- **PURPOSE**: Root component with routing and providers
- **RULE**: Maintain the component structure that Lovable expects

### 4. **index.html**
- **PURPOSE**: HTML entry point where React mounts
- **RULE**: Keep the mounting point and script tags intact

### 5. **package.json**
- **CONTAINS**: lovable-tagger dependency
- **RULE**: Never remove the lovable-tagger package

## Key Dependencies That Must Remain

```json
{
  "devDependencies": {
    "lovable-tagger": "..." // CRITICAL - DO NOT REMOVE
  }
}
```

## Safe Modification Guidelines

### ✅ SAFE TO MODIFY:
- Component content within existing components
- Adding new components in src/components/
- Styling changes (CSS, Tailwind classes)
- Adding new pages
- Business logic and data handling
- State management

### ❌ DANGEROUS TO MODIFY:
- vite.config.ts plugin configuration
- main.tsx rendering logic
- App.tsx root structure
- index.html mounting setup
- lovable-tagger package removal

## Emergency Recovery

If live preview breaks:
1. Check that lovable-tagger is in package.json
2. Verify vite.config.ts has componentTagger()
3. Ensure main.tsx renders to 'root' element
4. Confirm index.html has the root div

## Claude Code Instructions

When working on this project:
1. **ALWAYS** check these files before making changes
2. **NEVER** remove or significantly alter the core structure
3. **PRESERVE** all Lovable-specific configurations
4. **ASK** before modifying any of the critical files listed above

This rule must persist across all sessions and be the first consideration for any modification to this project.
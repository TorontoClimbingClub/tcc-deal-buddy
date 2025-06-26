# Claude Development Notes

## 🎨 UI Editing Workflow

**NEW: Lovable-like Visual Editing System**
This project now has a comprehensive UI editing workflow with visual validation:

**Files:**
- `CLAUDE_UI_MAP.md` - Complete component mapping with file:line locations (project-specific)
- `ui-editor-config.json` - Screenshot targets and dev server config (project-specific)
- `/mnt/ssd/Projects/claude/tools/ui-editor/` - Global UI editing tools (reusable)

**Workflow Commands:**
```bash
# Visual editing workflow (uses global UI editor tools)
node /mnt/ssd/Projects/claude/tools/ui-editor/screenshot-workflow.cjs . before    # Capture current state
# Make UI edits using CLAUDE_UI_MAP.md
node /mnt/ssd/Projects/claude/tools/ui-editor/screenshot-workflow.cjs . after     # Capture updated state  
node /mnt/ssd/Projects/claude/tools/ui-editor/screenshot-workflow.cjs . compare   # Validate changes
node /mnt/ssd/Projects/claude/tools/ui-editor/screenshot-workflow.cjs . reset     # Start fresh

# Manual screenshots (project-specific)
node screenshot.cjs                     # Full page
node screenshot.cjs --mobile           # Mobile view
node screenshot.cjs --element ".card"   # Specific elements

# Convenient npm scripts:
npm run ui:before                       # Alias for before command
npm run ui:after                        # Alias for after command  
npm run ui:compare                      # Alias for compare command
```

**How it works:**
1. Claude captures before screenshots automatically
2. Uses CLAUDE_UI_MAP.md to locate exact components (no searching!)
3. Makes precise edits with file:line targeting
4. Captures after screenshots for validation
5. Compares before/after to confirm changes worked

This achieves Lovable-like precision through systematic visual validation.

## Supabase Setup

This project uses Supabase Cloud (not local Docker containers).

**Linked Project:**
- Name: TCC-Deal-Buddy
- Reference ID: owtcaztrzujjuwwuldhl
- Org ID: eglvwmgxqosjyrtcewdt
- Region: us-east-2

**Working Commands (no Docker required):**
- `npx supabase projects list` - List projects
- `npx supabase gen types typescript` - Generate types from remote DB
- `npx supabase db diff` - Compare schemas
- `npx supabase functions list` - List edge functions

**Avoid these commands (require Docker):**
- `npx supabase status` - Will fail with Docker daemon error
- `npx supabase start` - Requires local containers
- `npx supabase stop` - Requires local containers
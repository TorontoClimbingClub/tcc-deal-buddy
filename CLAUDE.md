# Claude Development Notes

## 🎨 UI Editing Workflow

**SIMPLIFIED: Component Mapping System**
This project uses a streamlined UI editing workflow with component mapping:

**Files:**
- `CLAUDE_UI_MAP.md` - Complete component mapping with file:line locations (auto-generated)
- `/mnt/ssd/Projects/claude/tools/ui-editor/` - Global UI editing tools (simplified)

**Workflow Commands:**
```bash
# Simplified workflow (uses component mapping)
npm run ui:setup        # One-time project setup
npm run ui:update-map   # Generate/update component mapping
```

**How it works:**
1. Generate component map for precise targeting
2. Use CLAUDE_UI_MAP.md to locate exact components (no searching!)
3. Make precise edits with file:line targeting
4. Verify changes with live dev server preview
5. Update component map after major changes

This achieves precision through intelligent component mapping and live development feedback.

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
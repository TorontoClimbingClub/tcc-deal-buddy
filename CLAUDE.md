# Claude Development Notes

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
# Supabase Database

## Overview

This project uses Supabase (PostgreSQL) as its database. The schema was created via the Supabase Dashboard UI.

## Important

- **`schema.sql` is documentation only** — do not run it against the live database
- **Source of truth is the Supabase Dashboard** — all schema changes should be made there first
- **After any schema change**, update `schema.sql` in the same commit to keep it in sync

## Tables

| Table | Purpose |
|-------|---------|
| `life_os` | Core OS instances (1 per user per device type) |
| `folders` | Folders inside an OS (XP device) |
| `files` | Files inside a folder |
| `messages` | Messages inside an OS (Nokia device) |

## Relationships

```
life_os ←── folders ←── files
life_os ←── messages
```

All foreign keys use `ON DELETE CASCADE` — deleting an OS removes all its data.

## Row Level Security

RLS is enabled on all tables. Policies follow the pattern:
- **Owner** (`user_id = auth.uid()`) → full access
- **Temporary OS** (`is_temporary = true`) → full access (guest mode)
- **Everyone else** → no access

Note: API routes use the service role key (bypasses RLS). The RLS policies serve as defense-in-depth for any direct client access.

## Constraints

- `life_os_user_device_unique`: Each user can save at most 1 XP OS and 1 Nokia OS. Temporary OS (null user_id) is exempt.

## Recreating the Database

If you need to set up a fresh Supabase project:

1. Create a new Supabase project
2. Open the SQL Editor
3. Run `schema.sql` (tables must be created in order: `life_os` → `folders` → `files` / `messages`)
4. Enable RLS on all tables (the policies are included in the SQL file)
5. Update `.env.local` with the new project URL, anon key, and service role key

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | Public anon key (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service role key (bypasses RLS) |
| `NEXT_PUBLIC_BASE_URL` | Server | App base URL for internal API calls |

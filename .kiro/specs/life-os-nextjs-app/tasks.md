# Implementation Plan: Life OS Next.js App

## Overview

Scaffold a Next.js 14+ App Router project with TypeScript, Tailwind CSS, shadcn/ui, and a Supabase client utility. Implement two routes: a homepage with a "Create My Life OS" CTA and a dynamic OS workspace page at `/os/[id]`.

## Tasks

- [x] 1. Initialize Next.js project with required tooling
  - Bootstrap a new Next.js app (latest stable) with App Router, TypeScript, Tailwind CSS, and ESLint using pnpm
  - Ensure no `/src` directory is used; all source files live at the project root
  - Verify `package.json` uses pnpm and includes Next.js, TypeScript, Tailwind, and ESLint dependencies
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Set up folder structure
  - [x] 2.1 Create required top-level directories
    - Create `/components`, `/features`, `/lib`, and `/hooks` directories at the project root
    - Create `/features/os`, `/features/folders`, and `/features/files` subdirectories
    - Add `.gitkeep` files where needed to preserve empty directories in version control
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Install and configure shadcn/ui
  - [x] 3.1 Initialize shadcn/ui
    - Run `npx shadcn-ui@latest init` to configure shadcn/ui with Tailwind CSS integration
    - Ensure global styles in `app/globals.css` establish a clean visual base
    - _Requirements: 3.1, 3.3, 3.4_
  - [x] 3.2 Add required shadcn/ui components
    - Add `Button`, `Dialog`, `Input`, and `Card` components via `npx shadcn-ui@latest add`
    - Confirm components are generated under `components/ui/`
    - _Requirements: 3.2_

- [x] 4. Set up Supabase client utility
  - Create `lib/supabase.ts` that imports `createClient` from `@supabase/supabase-js`
  - Read `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from environment variables
  - Fall back to placeholder strings when env vars are absent so the app builds without live credentials
  - Export the client instance as a named export `supabase`
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 5. Implement root layout and global styles
  - Write `app/layout.tsx` as the root layout wrapping all routes with `<html>` and `<body>` tags
  - Import `app/globals.css` in the layout and apply Tailwind base classes
  - Set basic metadata (title, description)
  - _Requirements: 1.3, 7.1, 7.2_

- [x] 6. Implement Homepage route
  - Write `app/page.tsx` as a Client Component (`"use client"`)
  - Render a full-viewport centered layout using Tailwind utility classes
  - Include the shadcn/ui `Button` with the label "Create My Life OS"
  - On button click, generate a UUID via `crypto.randomUUID()` and navigate to `/os/[id]` using `useRouter`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1, 7.2_

- [x] 7. Implement OS Workspace dynamic route
  - Write `app/os/[id]/page.tsx` as a Server Component
  - Accept `params: { id: string }` as props
  - Render a full-viewport placeholder layout that visibly displays the `id` parameter
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2_

- [x] 8. Final checkpoint
  - Ensure the app builds without TypeScript or ESLint errors (`pnpm build` and `pnpm lint`)
  - Verify navigating to `/` shows the homepage button and clicking it routes to `/os/<uuid>`
  - Verify navigating to `/os/some-id` renders the id on the page
  - Ask the user if any questions arise before closing out.

## Notes

- Tasks are ordered to build incrementally: tooling → structure → UI foundation → routes
- The Supabase client uses placeholder fallbacks so no live credentials are needed during scaffolding
- shadcn/ui components are copied into `components/ui/` at init time — no runtime library dependency

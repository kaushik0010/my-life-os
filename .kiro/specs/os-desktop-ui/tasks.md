# Implementation Plan: OS Desktop UI

## Overview

Build a minimal full-screen desktop environment for `/os/[id]` using two new client components (`DesktopIcon`, `Desktop`) and a small update to the existing page route.

## Tasks

- [x] 1. Create `DesktopIcon` component
  - Create `features/os/DesktopIcon.tsx` with `"use client"` directive
  - Define `DesktopIconProps` interface with `label: string` and `onClick: () => void`
  - Render a `<button>` containing the lucide-react `Folder` icon above the `label` text
  - Style with Tailwind: flex column, centered, gap, hover state
  - _Requirements: 2.3, 2.4, 5.2, 5.4, 5.5_

- [x] 2. Create `Desktop` component
  - Create `features/os/Desktop.tsx` with `"use client"` directive
  - Declare `const FOLDERS = ["Childhood", "Cartoons", "School", "Random"]`
  - Add `const [openFolder, setOpenFolder] = useState<string | null>(null)`
  - Render a full-viewport `<div>` (`w-screen h-screen overflow-hidden`) with a background Tailwind class
  - Map `FOLDERS` to `<DesktopIcon>` components, each with `onClick={() => setOpenFolder(label)}`
  - Render a single shadcn `Dialog` controlled by `open={openFolder !== null}` and `onOpenChange={(open) => { if (!open) setOpenFolder(null) }}`
  - Inside `DialogContent`, render `DialogTitle` with `{openFolder}` as its text
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.5, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 5.1, 5.4, 5.5_

- [x] 3. Update `app/os/[id]/page.tsx`
  - Import `Desktop` from `features/os/Desktop`
  - Replace the existing `<main>` content with `<Desktop />`
  - Keep the component as a Server Component (no `"use client"` directive)
  - _Requirements: 1.1, 5.3_

- [x] 4. Final lint and build check
  - Run `pnpm lint` and resolve any ESLint errors
  - Run `pnpm build` and confirm no TypeScript or build errors
  - _Requirements: 5.4_

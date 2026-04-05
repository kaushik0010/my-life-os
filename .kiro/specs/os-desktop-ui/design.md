# Design Document: OS Desktop UI

## Overview

This feature adds a full-screen desktop environment to the OS Workspace page (`/os/[id]`). The UI renders a desktop background with four hardcoded folder icons. Clicking a folder icon opens a shadcn `Dialog` showing the folder's name. The implementation is intentionally minimal — no drag-and-drop, no animations, no persistence, no backend calls.

The client boundary is introduced at `Desktop.tsx`, keeping `app/os/[id]/page.tsx` as a Server Component.

## Architecture

```
app/os/[id]/page.tsx          (Server Component — awaits params, renders Desktop)
└── features/os/Desktop.tsx   (Client Component — owns openFolder state, renders icons + dialog)
    └── features/os/DesktopIcon.tsx  (Client Component — renders Folder icon + label)
```

Data flow is strictly top-down. `Desktop` holds the only piece of state (`openFolder: string | null`) and passes `onClick` callbacks down to each `DesktopIcon`. No context, no global store.

## Components and Interfaces

### `DesktopIcon`

**Path:** `features/os/DesktopIcon.tsx`

```ts
interface DesktopIconProps {
  label: string;
  onClick: () => void;
}
```

- `"use client"` directive
- Renders a `lucide-react` `Folder` icon above a text label
- The entire element is a `<button>` for keyboard accessibility
- No internal state

### `Desktop`

**Path:** `features/os/Desktop.tsx`

```ts
// No external props — all data is hardcoded internally
```

- `"use client"` directive
- Hardcodes the folder list: `["Childhood", "Cartoons", "School", "Random"]`
- State: `const [openFolder, setOpenFolder] = useState<string | null>(null)`
- Renders a full-viewport `<div>` (`w-screen h-screen overflow-hidden`) with a background color
- Renders `DesktopIcon` for each folder, passing `onClick={() => setOpenFolder(label)}`
- Renders a single shadcn `Dialog` controlled by `open={openFolder !== null}` and `onOpenChange={(open) => { if (!open) setOpenFolder(null) }}`
- `DialogTitle` displays `openFolder`

### `app/os/[id]/page.tsx`

Remains a Server Component. Awaits `params`, then renders `<Desktop />` as the sole child of `<main>`.

## Data Models

No external data. The folder list is a plain `string[]` constant inside `Desktop.tsx`:

```ts
const FOLDERS = ["Childhood", "Cartoons", "School", "Random"];
```

State shape:

```ts
openFolder: string | null  // null = no folder open; string = name of open folder
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: DesktopIcon renders label and icon

*For any* string label passed to `DesktopIcon`, the rendered output should contain both a folder icon element and the label text.

**Validates: Requirements 2.3**

### Property 2: Clicking a folder icon opens the dialog with that folder's label

*For any* folder label in the hardcoded list, clicking its `DesktopIcon` should cause the `Dialog` to be open and its title to equal that label.

**Validates: Requirements 3.1, 4.2**

### Property 3: Clicking a second icon replaces the open dialog

*For any* two distinct folder labels, clicking the first icon then clicking the second icon should result in the dialog showing the second label (not the first).

**Validates: Requirements 3.3**

### Property 4: Closing the dialog resets open state

*For any* open folder dialog, triggering the close action should result in the dialog no longer being open and `openFolder` returning to `null`.

**Validates: Requirements 4.4**

## Error Handling

This feature has no async operations or external data sources, so error handling is minimal:

- `openFolder` defaults to `null` — the dialog is closed on initial render
- `onOpenChange` guards against stale state by only calling `setOpenFolder(null)` when `open` is `false`
- TypeScript prop types prevent passing invalid values at compile time

## Testing Strategy

**Dual approach: unit/example tests + property-based tests.**

Unit/example tests (using Vitest + React Testing Library) cover:
- Desktop renders exactly four `DesktopIcon` components with the correct labels
- Desktop renders a full-viewport container with the expected Tailwind classes
- The Dialog is not present in the DOM on initial render
- The Dialog close button is present when a folder is open

Property-based tests (using `fast-check` with Vitest) cover the four correctness properties above. Each test should run a minimum of 100 iterations.

Tag format for property tests:
```
// Feature: os-desktop-ui, Property {N}: {property_text}
```

Each correctness property maps to exactly one property-based test. Unit tests handle the concrete examples and structural checks that don't benefit from randomization.

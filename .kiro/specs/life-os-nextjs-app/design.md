# Design Document: Life OS Next.js App

## Overview

Life OS is a Next.js 14+ (App Router) web application written in TypeScript. It provides a personal operating system experience in the browser, where each user can create and navigate their own "Life OS" workspace. This initial phase establishes the project scaffold, UI component foundation, Supabase client wiring, and two core routes: a homepage and a dynamic OS workspace.

The design prioritizes:
- A clean, scalable folder structure that supports future domain growth
- A consistent, accessible UI built on shadcn/ui + Tailwind CSS
- A Supabase client utility that is safe to import even without live credentials
- Minimal, functional route implementations that are ready to extend

---

## Architecture

The application follows Next.js App Router conventions with a flat root-level source layout (no `/src` directory).

```
/
├── app/                        # Next.js App Router: routes, layouts, pages
│   ├── layout.tsx              # Root layout (html, body, global styles)
│   ├── page.tsx                # Homepage route (/)
│   ├── globals.css             # Global Tailwind + base styles
│   └── os/
│       └── [id]/
│           └── page.tsx        # OS Workspace dynamic route (/os/[id])
├── components/                 # Shared, reusable UI components
│   └── ui/                     # shadcn/ui generated components (Button, Dialog, Input, Card)
├── features/                   # Domain-specific logic
│   ├── os/                     # OS workspace domain
│   ├── folders/                # Folders domain (future)
│   └── files/                  # Files domain (future)
├── lib/
│   └── supabase.ts             # Supabase client singleton
├── hooks/                      # Custom React hooks
├── tailwind.config.ts          # Tailwind configuration
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── .eslintrc.json              # ESLint configuration
└── package.json                # pnpm-managed dependencies
```

### Key Architectural Decisions

- **App Router over Pages Router**: Enables React Server Components, nested layouts, and the modern Next.js data-fetching model.
- **No `/src` directory**: Keeps the root clean and avoids an extra nesting level, per project requirements.
- **shadcn/ui**: Components are copied into `/components/ui` at init time, giving full ownership without a runtime dependency on the library itself.
- **Supabase client as a singleton**: Initialized once in `/lib/supabase.ts` and imported wherever needed, avoiding multiple client instances.

---

## Components and Interfaces

### Route: Homepage (`app/page.tsx`)

A React Server Component (or Client Component if navigation requires `useRouter`) that renders a full-viewport centered layout with a single CTA button.

```typescript
// app/page.tsx
export default function HomePage() {
  // Renders a centered "Create My Life OS" Button
  // On click: navigates to /os/[generated-id]
}
```

Navigation on button click uses Next.js `<Link>` or `router.push`. Since a new OS ID needs to be generated client-side, this page will be a Client Component (`"use client"`).

### Route: OS Workspace (`app/os/[id]/page.tsx`)

A Server Component that receives the dynamic `id` param and renders a full-viewport placeholder layout.

```typescript
// app/os/[id]/page.tsx
interface PageProps {
  params: { id: string };
}

export default function OsWorkspacePage({ params }: PageProps) {
  // Renders full-viewport layout showing params.id
}
```

### Root Layout (`app/layout.tsx`)

Wraps all routes with the HTML shell, applies global CSS, and sets metadata.

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // <html> + <body> with Tailwind base classes
}
```

### Supabase Client (`lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

The fallback placeholder values allow the app to build and run locally without a live Supabase project.

### shadcn/ui Components (`components/ui/`)

Initialized via `npx shadcn-ui@latest init` and individual `add` commands. The following components are required:

| Component | Path | Usage |
|-----------|------|-------|
| Button | `components/ui/button.tsx` | CTA on homepage, general actions |
| Dialog | `components/ui/dialog.tsx` | Modal interactions (future) |
| Input | `components/ui/input.tsx` | Form inputs (future) |
| Card | `components/ui/card.tsx` | Content containers (future) |

---

## Data Models

This initial phase has no persistent data models — the app is a scaffold. The only runtime "data" is the OS workspace `id` passed as a URL parameter.

### OS ID

The OS workspace ID is a string passed via the URL path segment `/os/[id]`. In this phase it is generated client-side (e.g., using `crypto.randomUUID()`) when the user clicks "Create My Life OS" on the homepage.

```typescript
// Conceptual type — no DB schema yet
type OsId = string; // UUID v4
```

### Environment Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | No (has placeholder) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No (has placeholder) | Supabase anonymous key |

These are read at module initialization time in `lib/supabase.ts`.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Supabase client initializes regardless of environment variables

*For any* combination of present or absent `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables, importing `lib/supabase.ts` should always export a non-null Supabase client instance without throwing an error.

**Validates: Requirements 4.3, 4.4**

### Property 2: Homepage button navigates to an OS workspace route

*For any* click on the "Create My Life OS" button, the resulting navigation target should match the pattern `/os/[id]` where `id` is a non-empty string.

**Validates: Requirements 5.4**

### Property 3: OS Workspace renders the route id parameter

*For any* non-empty string `id` passed as the dynamic route parameter, the rendered OS Workspace page should contain that `id` string visibly in its output.

**Validates: Requirements 6.3**

---

## Error Handling

### Missing Environment Variables

The Supabase client uses nullish coalescing to fall back to placeholder strings when env vars are absent. This prevents a runtime crash during local development or CI builds where Supabase credentials are not configured. The placeholder values are intentionally non-functional — they allow the module to load but will produce network errors if actual Supabase calls are made.

### Invalid or Missing Route Parameters

Next.js App Router guarantees that `params.id` is present when the `/os/[id]` route is matched. No additional null-guard is needed in the page component for this phase. If the route is accessed without an `id` segment, Next.js will return a 404 automatically.

### Navigation ID Generation

The homepage generates a new OS ID using `crypto.randomUUID()`, which is available in all modern browsers and in the Node.js runtime used by Next.js. No error handling is needed for this call in supported environments.

### ESLint and TypeScript Errors

The project is configured to fail builds on TypeScript errors (`strict: true` in tsconfig) and ESLint errors (via `next lint`). This surfaces issues at development time rather than at runtime.

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are used. They are complementary:
- Unit tests verify specific examples, structural checks, and integration points
- Property tests verify universal behavioral guarantees across many generated inputs

### Unit Tests

Focus areas:
- **Structural checks**: Verify required files and directories exist (requirements 1.x, 2.x, 3.x, 4.1)
- **Component rendering**: Render `HomePage` and verify the "Create My Life OS" button is present with the correct label (requirement 5.2)
- **Component rendering**: Render `OsWorkspacePage` with a sample id and verify it renders without error (requirement 6.2)
- **Supabase export**: Import `lib/supabase.ts` and verify the exported `supabase` object is non-null (requirement 4.2)
- **ESLint**: Run `next lint` and assert zero errors (requirement 7.3)

Recommended library: **Vitest** + **@testing-library/react** for component tests.

### Property-Based Tests

Recommended library: **fast-check** (TypeScript-native, works with Vitest).

Each property test runs a minimum of **100 iterations**.

---

**Property 1: Supabase client initializes regardless of environment variables**

```
// Feature: life-os-nextjs-app, Property 1: Supabase client initializes regardless of environment variables
fc.assert(
  fc.property(
    fc.option(fc.webUrl(), { nil: undefined }),
    fc.option(fc.string(), { nil: undefined }),
    (url, key) => {
      // Set or unset env vars, then re-import/re-initialize the client
      // Assert: result is a non-null object, no exception thrown
    }
  ),
  { numRuns: 100 }
)
```

**Property 2: Homepage button navigates to an OS workspace route**

```
// Feature: life-os-nextjs-app, Property 2: Homepage button navigates to an OS workspace route
fc.assert(
  fc.property(fc.constant(null), () => {
    // Render HomePage, simulate button click
    // Assert: navigation was called with a path matching /os/<non-empty-string>
  }),
  { numRuns: 100 }
)
```

**Property 3: OS Workspace renders the route id parameter**

```
// Feature: life-os-nextjs-app, Property 3: OS Workspace renders the route id parameter
fc.assert(
  fc.property(fc.string({ minLength: 1 }), (id) => {
    // Render OsWorkspacePage with params = { id }
    // Assert: rendered output contains the id string
  }),
  { numRuns: 100 }
)
```

### Test Configuration Notes

- Property tests must each reference their design property via the tag comment format shown above
- Each property test runs minimum 100 iterations (fast-check default is 100, no override needed)
- Unit tests for structural checks can be implemented as simple `fs.existsSync` assertions in a Vitest test file
- Component tests use `@testing-library/react` with `render` + `screen` queries

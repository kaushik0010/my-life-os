# Requirements Document

## Introduction

Life OS is a full-stack web application built with Next.js (App Router) and TypeScript. It provides a personal operating system experience in the browser, allowing users to create and manage their own "Life OS" instance. The initial phase focuses on project scaffolding, UI foundation, backend client setup, and two core routes: a homepage and a dynamic OS workspace route.

## Glossary

- **App**: The Next.js application as a whole
- **App_Router**: The Next.js App Router (`/app` directory) used for file-based routing
- **Homepage**: The root route (`/`) serving as the entry point for users
- **OS_Workspace**: The dynamic route (`/os/[id]`) representing a user's Life OS instance
- **Supabase_Client**: The configured Supabase JavaScript client used to interact with backend services
- **shadcn_UI**: The component library built on Radix UI and Tailwind CSS used for base UI components
- **Tailwind**: The Tailwind CSS utility-first styling framework
- **ESLint**: The static analysis tool used to enforce code quality rules
- **pnpm**: The package manager used for dependency management

## Requirements

### Requirement 1: Project Initialization

**User Story:** As a developer, I want the project initialized with Next.js, TypeScript, Tailwind CSS, and ESLint, so that I have a consistent and type-safe development foundation.

#### Acceptance Criteria

1. THE App SHALL be bootstrapped using Next.js (latest stable version) with the App Router enabled.
2. THE App SHALL use TypeScript for all source files.
3. THE App SHALL use Tailwind CSS for styling, configured at the root level.
4. THE App SHALL have ESLint enabled and configured with Next.js recommended rules.
5. THE App SHALL use pnpm as the package manager.
6. THE App SHALL NOT use a `/src` directory; all source files SHALL reside at the project root level.

---

### Requirement 2: Folder Structure

**User Story:** As a developer, I want a clean and scalable folder structure, so that the codebase remains organized as the application grows.

#### Acceptance Criteria

1. THE App SHALL contain an `/app` directory for all Next.js routes and layouts.
2. THE App SHALL contain a `/components` directory for reusable UI components shared across features.
3. THE App SHALL contain a `/features` directory for domain-specific logic, organized by domain (e.g., `os`, `folders`, `files`).
4. THE App SHALL contain a `/lib` directory for utility functions and helper modules.
5. THE App SHALL contain a `/hooks` directory for custom React hooks.

---

### Requirement 3: UI Component Setup

**User Story:** As a developer, I want shadcn/ui installed and base components configured, so that I have a consistent, accessible component foundation to build on.

#### Acceptance Criteria

1. THE App SHALL have shadcn/ui installed and initialized with Tailwind CSS integration.
2. THE App SHALL include the following base shadcn/ui components: `Button`, `Dialog`, `Input`, and `Card`.
3. THE App SHALL have global styles defined in a root CSS file that establish a clean visual base.
4. WHEN a shadcn/ui component is rendered, THE App SHALL apply Tailwind utility classes consistent with the configured theme.

---

### Requirement 4: Supabase Client Setup

**User Story:** As a developer, I want a Supabase client utility configured, so that backend service integration can be added without restructuring later.

#### Acceptance Criteria

1. THE App SHALL have the Supabase JavaScript client library (`@supabase/supabase-js`) installed as a dependency.
2. THE App SHALL contain a Supabase client utility file at `/lib/supabase.ts` that initializes and exports a Supabase client instance.
3. THE Supabase_Client SHALL read the Supabase project URL and anon key from environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. IF the required environment variables are not set, THE Supabase_Client SHALL export a client initialized with placeholder values to allow the app to build without a live connection.

---

### Requirement 5: Homepage Route

**User Story:** As a user, I want a homepage with a clear call-to-action, so that I can start creating my Life OS.

#### Acceptance Criteria

1. THE App_Router SHALL serve the Homepage at the root path (`/`).
2. THE Homepage SHALL display a centered `Button` component with the label "Create My Life OS".
3. THE Homepage SHALL use a full-viewport centered layout.
4. WHEN the "Create My Life OS" button is clicked, THE Homepage SHALL navigate the user to a new OS workspace route.

---

### Requirement 6: OS Workspace Dynamic Route

**User Story:** As a user, I want a dedicated workspace page for my Life OS instance, so that each OS has its own addressable URL.

#### Acceptance Criteria

1. THE App_Router SHALL serve the OS_Workspace at the dynamic path `/os/[id]`.
2. THE OS_Workspace SHALL display a placeholder layout indicating the workspace for the given `id`.
3. THE OS_Workspace SHALL render the `id` parameter visibly on the page so the route is identifiable during development.
4. THE OS_Workspace SHALL use a full-viewport layout as the base for future OS UI.

---

### Requirement 7: Code Quality and Conventions

**User Story:** As a developer, I want consistent code quality rules enforced, so that the codebase stays maintainable.

#### Acceptance Criteria

1. THE App SHALL use functional components exclusively; class components SHALL NOT be used.
2. THE App SHALL use modern React patterns including React hooks for state and side effects.
3. THE App SHALL pass ESLint checks with zero errors on initial scaffold.
4. THE App SHALL NOT include unnecessary third-party libraries beyond those specified in these requirements.

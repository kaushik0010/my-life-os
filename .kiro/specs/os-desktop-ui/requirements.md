# Requirements Document

## Introduction

The OS Desktop UI feature adds a full-screen, interactive desktop environment to the OS Workspace page (`/os/[id]`). It provides a visual desktop metaphor with clickable folder icons that open a simple window displaying the folder's name. The implementation is intentionally minimal: no drag-and-drop, no animations, no persistence, and no backend calls. Styling is done exclusively with Tailwind CSS, and existing shadcn/ui components are reused where appropriate.

## Glossary

- **Desktop**: The full-screen container component (`100vw × 100vh`) that renders the desktop background and all desktop icons
- **Desktop_Icon**: A clickable UI element that displays a folder icon and a text label; triggers a folder window when activated
- **Folder_Window**: A modal dialog that opens when a Desktop_Icon is clicked, displaying the name of the selected folder
- **OS_Workspace**: The dynamic Next.js route at `/os/[id]` that hosts the Desktop
- **shadcn_Dialog**: The `Dialog` component from shadcn/ui used to render the Folder_Window
- **Tailwind**: The Tailwind CSS utility-first styling framework used for all layout and visual styling

## Requirements

### Requirement 1: Full-Screen Desktop Container

**User Story:** As a user, I want the OS Workspace page to display a full-screen desktop environment, so that the experience feels like a real operating system.

#### Acceptance Criteria

1. THE OS_Workspace SHALL render the Desktop component as its sole content.
2. THE Desktop SHALL occupy exactly the full viewport width and height (`100vw` and `100vh`).
3. THE Desktop SHALL display a background using a Tailwind CSS color or gradient class.
4. THE Desktop SHALL NOT display any scrollbars when the content fits within the viewport.

---

### Requirement 2: Desktop Icons

**User Story:** As a user, I want to see folder icons on the desktop, so that I can identify and interact with my folders.

#### Acceptance Criteria

1. THE Desktop SHALL render at least three Desktop_Icon components.
2. THE Desktop SHALL hardcode the following folder labels: "Childhood", "Cartoons", "School", and "Random".
3. EACH Desktop_Icon SHALL display a visual folder icon and a text label beneath it.
4. THE Desktop_Icon SHALL accept the following props: `label` (string) and `onClick` (function).
5. THE Desktop SHALL arrange Desktop_Icon components using a Tailwind CSS flex or grid layout.

---

### Requirement 3: Desktop Icon Interaction

**User Story:** As a user, I want to click a folder icon to open it, so that I can see the folder's contents or name.

#### Acceptance Criteria

1. WHEN a Desktop_Icon is clicked, THE Desktop SHALL open a Folder_Window for the selected folder.
2. THE Desktop SHALL track which folder is currently open using local component state.
3. WHEN a Desktop_Icon is clicked while another Folder_Window is open, THE Desktop SHALL replace the open Folder_Window with the newly selected one.

---

### Requirement 4: Folder Window

**User Story:** As a user, I want a window to open when I click a folder, so that I can see the folder name and close it when done.

#### Acceptance Criteria

1. THE Folder_Window SHALL be implemented using the shadcn_Dialog component.
2. THE Folder_Window SHALL display the label of the selected Desktop_Icon as its title.
3. THE Folder_Window SHALL provide a mechanism to close it (via the shadcn_Dialog close button).
4. WHEN the Folder_Window is closed, THE Desktop SHALL update its state so no folder is marked as open.

---

### Requirement 5: Component Structure

**User Story:** As a developer, I want the desktop UI split into focused, reusable components, so that the codebase stays organized and maintainable.

#### Acceptance Criteria

1. THE Desktop SHALL be implemented as a React functional component at `features/os/Desktop.tsx`.
2. THE Desktop_Icon SHALL be implemented as a React functional component at `features/os/DesktopIcon.tsx`.
3. THE OS_Workspace page at `app/os/[id]/page.tsx` SHALL import and render the Desktop component.
4. ALL components SHALL be written in TypeScript with explicit prop type definitions.
5. ALL styling SHALL use Tailwind CSS utility classes exclusively; no inline styles or external CSS files SHALL be introduced.

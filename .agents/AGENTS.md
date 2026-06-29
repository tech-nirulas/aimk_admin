# Workspace Rules: AIMK Admin Panel (Next.js)

Welcome, agent! You are working on the admin panel codebase of **Angels in My Kitchen** (`aimk_admin`), a Next.js application using React 19 and Material-UI.

Please read and adhere strictly to the rules and references below before performing any tasks or edits.

---

## Critical Rules & Guidelines

1. **Keep Documentation Sync'd**: You MUST update the documentation in this `.agents/` folder whenever you introduce new features, pages, components, or state slices. Refer to [maintenance.md](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/.agents/maintenance.md) for instructions.
2. **Framework Context (Next.js 16/React 19)**:
   - This project uses Next.js 16 and React 19, which contains breaking changes compared to older versions. Heed deprecation notices.
   - Use App Router (pages are in `app/`).
   - Components under `app/` are Server Components by default. Add `"use client";` at the top of files that use hooks, state, or event handlers.
3. **Styling and UI**:
   - Built using **Material-UI (MUI)** and **Tailwind CSS v4** (`@tailwindcss/postcss`).
   - Do NOT use Tailwind CSS for MUI components. Use MUI's `sx` prop or custom themes.
   - Keep designs consistent with the existing layout structure (`AdminLayout`).
4. **Environment & Commands**:
   - The admin panel runs on port `7070` locally.
   - Run the development server with `./local.sh` (or `npm run dev -- -p 7070`).
   - The backend API URL is configured via `NEXT_PUBLIC_BASE_API_URL` (usually `http://localhost:9090`).

---

## Workspace Directories & References

- **Architecture Details**: Review [architecture.md](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/.agents/architecture.md) for details on components, file structures, and data flows.
- **Workflow Guide (Ask/Plan/Architect/Orchestrate/Debug)**: Review [workflows.md](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/.agents/workflows.md) to see how to approach frontend modifications.
- **Sync & Maintenance Checklist**: Review [maintenance.md](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/.agents/maintenance.md) to ensure all documentation is kept up-to-date with your code changes.

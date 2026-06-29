# Documentation Maintenance Policy: AIMK Admin Panel

This file defines the documentation maintenance policy for the `aimk_admin` repository. Agents MUST follow this policy strictly to prevent documentation rot.

---

## 1. Trigger Events for Documentation Updates

Whenever you make any of the following changes, you MUST update the corresponding `.agents/` documentation files:

| Change Type | Target Documentation File | Items to Update |
| :--- | :--- | :--- |
| **New Route / Page Creation** | [architecture.md](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/.agents/architecture.md) | Update the directory layout description and dashboard views. |
| **New API Service or Slice** | [architecture.md](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/.agents/architecture.md) | Update the state management section and register the service. |
| **MUI Config or Global Theme Change** | [architecture.md](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/.agents/architecture.md) | Update the styling and UI framework definitions. |
| **Port Change or Script updates** | [workflows.md](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/.agents/workflows.md) | Update port references and troubleshooting steps. |

---

## 2. Synchronization Checklist

Before completing any task, execute this mental checklist:
- `[ ]` Did I add a new route folder inside `app/admin/`? If yes, update `architecture.md`.
- `[ ]` Did I create a new RTK Query service in `features/`? If yes, update the State Management section in `architecture.md`.
- `[ ]` Did I change the developer ports or startup scripts? If yes, update `workflows.md`.
- `[ ]` Did I verify that all markdown file links in `.agents/` are correct?

> [!IMPORTANT]
> If a PR contains codebase changes without corresponding updates to the `.agents/` documentation (when applicable), it is considered incomplete and must not be finalized.

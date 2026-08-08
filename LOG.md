# AIMK Admin Panel — Development Log

## [2026-08-08] Vercel Build Fix for Shared Permissions Package (@aimk/permissions)
- Bundled `@aimk/permissions` package inside `packages/aimk-permissions` within the `aimk_admin` repository.
- Updated [package.json](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/package.json#L12) dependency from `"file:../aimk-permissions"` to `"file:./packages/aimk-permissions"`.
- This ensures Vercel and Next.js Turbopack can build `aimk_admin` self-contained without referencing parent directories outside the git repository.

## [2026-08-08] Enterprise Authentication & Silent Re-Auth Lifecycle
- Added `saveRefreshToken`, `getRefreshToken`, and `clearTokens` helpers to `helpers/encryptToken.helper.ts`.
- Created `features/api/baseQuery.ts` introducing `baseQueryWithReauth` with concurrent refresh request deduplication via singleton Promise (`refreshPromise`).
- Upgraded `features/auth/authSlice.ts` to manage `refreshToken` state, clear storage on logout, and handle `refresh` mutations.
- Updated `features/auth/authApiService.ts` to use `baseQueryWithReauth` and added `refreshToken`, `logoutBackend`, `logoutAll`, `getSessions`, and `revokeSession` endpoints.
- Updated `app/(auth)/login/page.tsx` to persist refresh token in encrypted storage on successful login.
- Upgraded `AuthProvider.tsx` (`lib/AuthProvider.tsx`) to perform silent re-authentication on startup when access token is expired/absent, preventing unnecessary login redirects.
- Fixed `openDrawer` parameter names (`drawerName`, `children`, `anchor: "right"`, `width: 500`) in [app/admin/users/page.tsx](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/app/admin/users/page.tsx#L135) so Edit User and Create Role drawers open correctly from the right side with complete form content.
- Added `onMouseDown` and `onClick` event propagation stops on the Role `<Select>` DataGrid column cell wrapper so dropdown menus open cleanly without DataGrid cell-focus intercepting click events.

## [2026-08-06] End-to-End Users & Role-Based Access Control (RBAC) System
- Built complete role-based permission system with role assignment, dynamic sidebar filtering, and Next.js route protection guard:
  1. `permission.helper.ts`: Added `hasModuleAccess(user, path)` checking role module access for `super_admin`, `admin`, and custom role permissions.
  2. `Sidebar.tsx`: Dynamically filters sidebar navigation links (`MENU_ITEMS`) so unauthorized modules are hidden from navigation.
  3. `AdminLayout.tsx`: Added Next.js route protection guard blocking unauthorized direct URL navigation with an "Access Denied (403)" page.
  4. `RolePermissionsModal.tsx`: Added Sidebar Navigation & Route Access matrix allowing admins to toggle module paths per role.
  5. `UsersPage`: Tabbed layout for Team Members & Roles Management with custom role creation, role deletion, role assignment, and permissions editing.

## [2026-08-06] CakeCustomizationsPage statusFilter ReferenceError Fix
- Added missing `const [statusFilter, setStatusFilter] = useState("");` state variable declaration in [app/admin/cake-customizations/page.tsx](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/app/admin/cake-customizations/page.tsx#L45), resolving runtime `ReferenceError: statusFilter is not defined`.

## [2026-08-06] Session Expiry & Redux Logout Storage Purge Alignment
- Aligned `authSlice.ts` (`logout` reducer in [features/auth/authSlice.ts](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/features/auth/authSlice.ts#L38)) to automatically purge encrypted token items (`encryptedToken`, `encryptionKey`, `iv`) from `localStorage` whenever `dispatch(logout())` is called.
- Streamlined `AuthProvider.tsx` ([lib/AuthProvider.tsx](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/lib/AuthProvider.tsx#L55)) to invoke `dispatch(logout())` on auth failure / session expiration for clean state reset and redirection to `/login`.

## [2026-08-06] MUI v6 TextField InputProps to slotProps Fix
- Fixed React DOM attribute console warning (`React does not recognize the InputProps prop on a DOM element`) by migrating deprecated `InputProps={{ startAdornment: ... }}` to standard MUI v6 `slotProps={{ input: { startAdornment: ... } }}` across all admin search fields and forms.

## [2026-08-06] Standardized Pagination & Filter Toolbars Across Admin Panel
- Standardized search, filter bar (`Paper` card with debounced search input, status/role filter, items per page selector 5/10/25/50, sort field, sort order, and "Clear Filters" button), and bottom pagination stats footer (`Showing X to Y of Z entries`) across 8 remaining admin pages:
  1. `Orders`: [app/admin/orders/page.tsx](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/app/admin/orders/page.tsx)
  2. `Offers`: [app/admin/offers/page.tsx](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/app/admin/offers/page.tsx)
  3. `Users`: [app/admin/users/page.tsx](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/app/admin/users/page.tsx)
  4. `Customers`: [app/admin/customers/page.tsx](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/app/admin/customers/page.tsx)
  5. `Inventory`: [app/admin/inventory/page.tsx](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/app/admin/inventory/page.tsx)
  6. `Reviews`: [app/admin/reviews/page.tsx](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/app/admin/reviews/page.tsx)
  7. `Cake Customizations`: [app/admin/cake-customizations/page.tsx](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/app/admin/cake-customizations/page.tsx)
  8. `Payments`: [app/admin/payments/page.tsx](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/app/admin/payments/page.tsx)

## [2026-08-06] Autocomplete renderOption MenuListContext Error Fix
- Fixed `MUI: MenuListContext is missing` error in [components/common/CustomFields.tsx](file:///home/ujjwal/Desktop/angels_projects/aimk_admin/components/common/CustomFields.tsx#L286) by replacing `<MenuItem>` inside `Autocomplete`'s `renderOption` with `<Box component="li">`.

## [2026-07-31] Project Rules & Milestone Initialization
- Updated `.agents/AGENTS.md` with step-by-step incremental execution rules and LOG.md maintenance requirements.
- Initialized `LOG.md` for execution history tracing.

## [2026-07-31] Milestone 4: Customize Cake (Step 4 - Admin Panel Page)
- Built `/admin/cake-customizations` page with DataGrid, status filters, detail modal, and WhatsApp integration.

## [2026-07-31] Milestone 6: Payment Service + COD (Step 4 - Admin Payments & Refunds)
- Built `/admin/payments` page with method badges (💵 COD vs 💳 Razorpay), status chips, and refund confirmation modal.

## [2026-07-31] Milestone 7: Outlet Auto-Assignment & Order Detail View (Steps 3 & 4)
- Built `/admin/orders/[id]` page with line items, financial breakdown, customer profile, and bakery outlet reassignment dropdown.

## [2026-07-31] Milestone 5: Offers System & Hero Carousel (FormDrawer & MediaPicker Update)
- Discount form fix & OfferForm with FormDrawer & MediaPickerModal.

## [2026-07-31] Milestone 8: Product Reviews & Ratings System
- Built `/admin/reviews` page with MUI DataGrid for customer review moderation & deletion.

## [2026-07-31] Milestone 9: Role-Based Access Control (RBAC), Edit User & Permissions Matrix
- Updated `UserForm.tsx` drawer and created `RolePermissionsModal.tsx`.

## [2026-08-01] Milestone 10: Inventory & Batch Management System
- Created `/admin/inventory` page with MUI DataGrid displaying Batch Number, Product details, and Expiry Date warning badges.

## [2026-08-01] Milestone 11: Customer Directory & Loyalty System
- Built `/admin/customers` page with DataGrid and `CustomerDetailModal`.

## [2026-08-01] Milestone 15: Analytics & Reports Dashboard System
- Executive dashboard at `/admin` with 4 key stat cards, quick action shortcuts, and top products table.

## [2026-08-01] Milestone 14: Strict Interfaces Consolidation & Type Safety Refactoring
- Standardized all domain interfaces in `interfaces/` directory (`customer.interface.ts`, `inventory.interface.ts`, `analytics.interface.ts`, `user.interface.ts`, `role.interface.ts`, `permission.interface.ts`).
- Updated components (`UserForm.tsx`, `RolePermissionsModal.tsx`, `BatchForm.tsx`, `CustomerDetailModal.tsx`) to import directly from `@/interfaces/`.
- Guaranteed 100% type-safe compilation across all admin modules.

## [2026-08-06] Milestone 15: Custom Cakes Category Hierarchy Support in Admin Form
- Updated `CategoryForm.tsx` in `aimk_admin` with parent category selector including a `-- None (Top Level Category) --` option and self-filtering logic to prevent circular references.
- Added `CategoryWithChildren` interface in `interfaces/category.interface.ts`.


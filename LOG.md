# AIMK Admin Panel — Development Log

## [2026-08-20] Admin Orders Table Payment Column & Online Gateway Details

- **Orders Table (`app/admin/orders/page.tsx`)**:
  - Enhanced Payment column with method badge (`💵 COD` vs `💳 Online`), status chip (`Pending`, `Captured`, `Failed`, `Refunded`), and a quick action button ("Collect Cash") for pending COD orders.
  - Added Snackbar toast notifications for status updates and instant cash collection feedback.
- **Order Details (`app/admin/orders/[id]/page.tsx`)**:
  - Added click-to-copy buttons for Razorpay Payment ID, Gateway Order ID, and Refund ID with toast notifications.
  - Enhanced online payment display when awaiting gateway callbacks or when transactions are captured/refunded.

## [2026-08-20] Order Status Alignment, Payment Details & COD Collection

Three reported bugs, two of which were the same class of problem: hardcoded status lists that had drifted apart.

**1. Order statuses now come from one place**

The three screens each shipped a different list, and the admin grid's differed from the backend enum:

| Screen | Statuses offered before |
|---|---|
| Prisma `OrderStatus` (truth) | pending, confirmed, payment_failed, processing, ready, out_for_delivery, delivered, cancelled, refunded |
| Admin orders grid | pending, confirmed, **completed** *(not a valid enum value)*, payment_failed, cancelled |
| Admin order detail | pending, confirmed, processing, delivered, cancelled |
| Storefront (both screens) | all 9 — correct, but duplicated inline in two files |

Selecting "Completed" in the grid sent an invalid enum value and the request failed with HTTP 500. Five valid statuses could not be set or filtered from the admin at all, and an order in one of them rendered with a blank status cell.

- Added `utils/orderStatus.ts` — the canonical list plus `getOrderStatusConfig()` (labels + chip colours), with the Prisma enum named as the source of truth. `angels/utils/orderStatus.ts` is a byte-identical copy; the two must move together.
- Added `components/common/OrderStatusSelect.tsx`, used by **both** the grid and the detail page so they cannot drift again. An unrecognised status renders as a disabled option instead of an empty box.
- Storefront: deleted the two duplicated `STATUS_CONFIG` maps in favour of the shared helper, and dropped a dead `"completed"` check in the review gate.
- Same treatment for payment statuses: `utils/paymentStatus.ts` now backs the Payments grid, which was also missing `PARTIALLY_REFUNDED` from both its chip map and its filter.

**2. Payment details and COD collection on the order detail page**

- The Payment card previously showed only the method and `order.paymentStatus`. It now lists every payment record for the order — amount, status, Razorpay **Payment ID** and Gateway Order ID, method/bank/wallet/VPA, captured/failed timestamps, gateway error, and refund id/amount — so an admin can tie a gateway transaction to the order without cross-referencing the Payments screen.
- COD orders get a **Mark Cash Received** action (`useMarkCodCollectedMutation`), which is the only way a cash order's payment ever reaches `CAPTURED`. Once collected the panel switches to a confirmation with the timestamp.
- Both payment mutations now invalidate the `Order` tag via `onQueryStarted`, because orders live in a separate api service with its own tag registry.

**Verified in the browser**: both admin status dropdowns list the same 9 statuses; the COD panel flipped from "not recorded" to "Cash received on …" in place after one click; an online order shows its `pay_…` transaction id and UPI VPA directly on the order page.

## [2026-08-20] Realtime Orders & Payments (Socket.IO → RTK Query cache)

The admin Orders and Payments grids now update themselves when the backend emits an event — no page refresh, no polling, and no full list refetch. REST remains the only way data is loaded; the socket only patches caches that already exist.

**New files**
- `features/realtime/realtimeEvents.ts` — mirror of the backend contract (rooms, event names, envelope) plus `createEventDeduper()`, a bounded LRU of `eventId`s that discards redelivered events and the double-reporting of a payment capture by both the Razorpay webhook and the frontend verify-payment callback.
- `features/realtime/socketClient.ts` — one shared `socket.io-client` connection to `${NEXT_PUBLIC_BASE_API_URL}/realtime`. Token is supplied via an `auth` **callback** so each reconnection attempt re-reads a freshly refreshed token. `autoConnect: false`; infinite retries with 1s→10s backoff.
- `features/realtime/realtimeCache.ts` — the heart of the feature. Enumerates cached query entries with `api.util.selectCachedArgsForQuery(...)` and patches each one via `api.util.updateQueryData(...)`:
  - Patching is **filter-aware**: `ORDER_LIST_SPEC` / `PAYMENT_LIST_SPEC` mirror the server-side `where` clauses (status filter + the search OR-clause), so a record is only spliced into a cached page it genuinely belongs to.
  - Inserts happen only on page 1 under the default newest-first sort; on other pages/sorts only `meta.totalItems` / `totalPages` are corrected, so pagination stays honest without inventing row positions.
  - A record that no longer matches a filter is removed and the total decremented. A record that *just entered* a filter is inserted — gated on `meta.previousStatus` differing from the filter, which is what prevents double-counting a record already sitting on another page.
  - Creates are idempotent (id checked before insert), so a duplicate event cannot duplicate a row.
  - Detail caches (`getAdminOrder`, `getPayment`) are patched too, so an open order-detail page stays live.
- `features/realtime/refreshAccessToken.ts` — standalone token refresh. Access tokens last 15 minutes and the server closes the socket at `exp`; socket.io does not auto-reconnect after a server-initiated close, so the provider refreshes and reconnects manually (1s→15s backoff). **This helper deliberately does not import the RTK Query `baseQuery`**: doing so pulls it into the pre-existing `baseQuery → authSlice → authApiService` cycle and throws `Cannot access 'baseQueryWithReauth' before initialization` at page load.
- `lib/RealtimeProvider.tsx` — connects only when authenticated, wires the four events to the cache patchers, tears the socket down on logout, and exposes `useRealtime()` (`status`, `isConnected`, `rooms`, `lastEventAt`). Distinguishes fatal auth failures (`FORBIDDEN`, `ACCOUNT_DISABLED`, …) which stop retrying, from retryable ones (`TOKEN_EXPIRED`, …) which refresh and reconnect. On *re*connect only, invalidates the `Order`/`Payment` tags once so RTK Query refetches just the mounted queries — recovering events missed while offline. This is the single intentional refetch.
- `components/common/RealtimeStatus.tsx` — Live / Reconnecting / Offline chip, so the connection state is visible rather than silent.

**Modified**
- `lib/Providers.tsx` — `RealtimeProvider` mounted inside `AuthProvider` (it needs auth state).
- `app/admin/orders/page.tsx`, `app/admin/payments/page.tsx` — added the status chip beside each title. No changes to how either page fetches data.
- Dependency added: `socket.io-client`.

**Verified in a real browser against the running backend**: a customer placing an order made the row appear at the top of the Orders grid with the count going 8→9 and **exactly one** network request in the whole session (the initial load); a refund triggered from outside the browser flipped a Payments row from PENDING to REFUNDED in place; under a `REFUNDED` filter a newly created PENDING payment was correctly ignored while a fresh refund correctly entered the view (1→2); under a `PENDING` filter a refund removed the row and dropped the count (8→7); two admin tabs updated simultaneously; killing the backend flipped the chip to "Reconnecting…" while the grid stayed usable, and restarting it restored "Live" and pulled in a change made directly in the database while the socket was down.


## [2026-08-20] Product Query Filtering Endpoint Alignment

- Updated `productsEndpoints.ts` (`features/products/productsEndpoints.ts`): Extended `getAllProducts` to accept `{ isActive?: boolean; search?: string } | void` so forms and dropdowns can optionally filter active or fetch all products.
- Verified `app/admin/products/page.tsx` pagination query forwards `isActive: undefined` for "All" (now correctly returning all active & inactive products following backend update).

## [2026-08-20] Category Query Filtering Endpoint Alignment

- Updated `categoryEndpoints.ts` (`features/categories/categoryEndpoints.ts`): Extended `getAllCategories` to accept `{ isActive?: boolean; search?: string } | void` so forms and dropdowns can optionally filter active or fetch all categories.
- Verified `app/admin/categories/page.tsx` pagination query properly forwards `isActive: undefined` for "All", `isActive: true` for "Active", and `isActive: false` for "Inactive".

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


# Graph Report - .  (2026-08-01)

## Corpus Check
- 33 files · ~44,710 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 524 nodes · 829 edges · 51 communities (26 shown, 25 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 150 input · 100 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Admin Pages & Routing|Admin Pages & Routing]]
- [[_COMMUNITY_API Endpoints Definitions|API Endpoints Definitions]]
- [[_COMMUNITY_Cake Customizations & Offers|Cake Customizations & Offers]]
- [[_COMMUNITY_Admin Layout & Typography|Admin Layout & Typography]]
- [[_COMMUNITY_Discount Redux & API Service|Discount Redux & API Service]]
- [[_COMMUNITY_Authentication & Login Flow|Authentication & Login Flow]]
- [[_COMMUNITY_Media Picker & Grid Components|Media Picker & Grid Components]]
- [[_COMMUNITY_TypeScript Build Configuration|TypeScript Build Configuration]]
- [[_COMMUNITY_Package Dependencies & Tailwind CSS|Package Dependencies & Tailwind CSS]]
- [[_COMMUNITY_Legal Entities API Service|Legal Entities API Service]]
- [[_COMMUNITY_Users Management & RBAC Permissions|Users Management & RBAC Permissions]]
- [[_COMMUNITY_Product Forms & Allergen Inputs|Product Forms & Allergen Inputs]]
- [[_COMMUNITY_Auth State & Localization|Auth State & Localization]]
- [[_COMMUNITY_Media Viewer & Detail Dialogs|Media Viewer & Detail Dialogs]]
- [[_COMMUNITY_Outlet Opening Hours Input|Outlet Opening Hours Input]]
- [[_COMMUNITY_Loading Animations & UI State|Loading Animations & UI State]]
- [[_COMMUNITY_Google Maps Coordinates Input|Google Maps Coordinates Input]]
- [[_COMMUNITY_GSAP Animation Hooks|GSAP Animation Hooks]]
- [[_COMMUNITY_Architecture Rules & UI Patterns|Architecture Rules & UI Patterns]]
- [[_COMMUNITY_Environment Scripts & Variables|Environment Scripts & Variables]]
- [[_COMMUNITY_Development Logs & Agent Specs|Development Logs & Agent Specs]]
- [[_COMMUNITY_Data Flow & Reducers|Data Flow & Reducers]]
- [[_COMMUNITY_ESLint Rules Configuration|ESLint Rules Configuration]]
- [[_COMMUNITY_Parameters Type Definitions|Parameters Type Definitions]]
- [[_COMMUNITY_Next.js Configuration|Next.js Configuration]]
- [[_COMMUNITY_PostCSS Configuration|PostCSS Configuration]]
- [[_COMMUNITY_Discount Validator Logic|Discount Validator Logic]]
- [[_COMMUNITY_Product Validator Logic|Product Validator Logic]]
- [[_COMMUNITY_Sync Checklist Guidelines|Sync Checklist Guidelines]]
- [[_COMMUNITY_Debug Workflows & Resolvers|Debug Workflows & Resolvers]]
- [[_COMMUNITY_Auth RTK Query Hooks|Auth RTK Query Hooks]]
- [[_COMMUNITY_Brand RTK Query Hooks|Brand RTK Query Hooks]]
- [[_COMMUNITY_Cake Customization RTK Hooks|Cake Customization RTK Hooks]]
- [[_COMMUNITY_Categories RTK Query Hooks|Categories RTK Query Hooks]]
- [[_COMMUNITY_Discount RTK Query Hooks|Discount RTK Query Hooks]]
- [[_COMMUNITY_Legal Entity RTK Hooks|Legal Entity RTK Hooks]]
- [[_COMMUNITY_Media Upload RTK Hooks|Media Upload RTK Hooks]]
- [[_COMMUNITY_Offers RTK Query Hooks|Offers RTK Query Hooks]]
- [[_COMMUNITY_Orders Management RTK Hooks|Orders Management RTK Hooks]]
- [[_COMMUNITY_Outlets RTK Query Hooks|Outlets RTK Query Hooks]]
- [[_COMMUNITY_Payments & Refunds RTK Hooks|Payments & Refunds RTK Hooks]]
- [[_COMMUNITY_Products RTK Query Hooks|Products RTK Query Hooks]]
- [[_COMMUNITY_Reviews RTK Query Hooks|Reviews RTK Query Hooks]]
- [[_COMMUNITY_Admin Users & Roles RTK Hooks|Admin Users & Roles RTK Hooks]]
- [[_COMMUNITY_Next.js Framework Metadata|Next.js Framework Metadata]]

## God Nodes (most connected - your core abstractions)
1. `useFormDrawer()` - 25 edges
2. `compilerOptions` - 16 edges
3. `useConfirmDialog()` - 15 edges
4. `useToast()` - 11 edges
5. `Brand` - 11 edges
6. `Category` - 10 edges
7. `Root` - 9 edges
8. `createBaseQuery()` - 9 edges
9. `Product` - 8 edges
10. `User` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Login()` --calls--> `useToast()`  [EXTRACTED]
  app/(auth)/login/page.tsx → hooks/useToast.ts
- `Navbar()` --calls--> `useConfirmDialog()`  [EXTRACTED]
  components/layout/Navbar.tsx → lib/DialogProvider.tsx
- `CategoryActions()` --calls--> `useFormDrawer()`  [EXTRACTED]
  components/ui/Category/CategoryActions.tsx → lib/FormDrawerProvider.tsx
- `FormDrawer()` --calls--> `useFormDrawer()`  [EXTRACTED]
  components/ui/FormDrawer.tsx → lib/FormDrawerProvider.tsx
- `AuthState` --references--> `User`  [EXTRACTED]
  features/auth/authSlice.ts → interfaces/user.interface.ts

## Import Cycles
- None detected.

## Communities (51 total, 25 thin omitted)

### Community 0 - "Admin Pages & Routing"
Cohesion: 0.05
Nodes (50): BrandsPage(), CategoriesPage(), LegalEntitiesPage(), CategoriesPage(), OutletsPage(), ProductsPage(), MaterialDateFieldProps, MaterialFreeInputMultiSelectProps (+42 more)

### Community 1 - "API Endpoints Definitions"
Cohesion: 0.09
Nodes (41): EndpointDefinitions, categoryEndpoints(), EndpointDefinitions, EndpointDefinitions, EndpointDefinitions, EndpointDefinitions, Brand, CreateBrandPayload (+33 more)

### Community 2 - "Cake Customizations & Offers"
Cohesion: 0.05
Nodes (21): STATUS_COLORS, STATUS_CHIPS, STATUS_CHIPS, baseQuery, cakeApiService, cakeEndpoints(), EndpointDefinitions, offerApiService (+13 more)

### Community 3 - "Admin Layout & Typography"
Cohesion: 0.06
Nodes (25): cormorant, dmMono, lato, metadata, playfair, MENU_ITEMS, FormDrawerProvider(), ModalContext (+17 more)

### Community 4 - "Discount Redux & API Service"
Cohesion: 0.07
Nodes (26): baseQuery, discountApiService, discountEndpoints(), discountSlice, initialState, baseQuery, mediaApiService, EndpointDefinitions (+18 more)

### Community 5 - "Authentication & Login Flow"
Cohesion: 0.09
Nodes (20): Login(), LoginValues, MaterialPasswordField(), baseQuery, CartItem, cartSlice, CartState, initialState (+12 more)

### Community 6 - "Media Picker & Grid Components"
Cohesion: 0.06
Nodes (32): formatBytes(), MediaGridItem(), MediaItem, MediaListItem(), MediaPickerModalProps, TYPE_COLORS, TYPE_ICONS, dependencies (+24 more)

### Community 7 - "TypeScript Build Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "Package Dependencies & Tailwind CSS"
Cohesion: 0.11
Nodes (18): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+10 more)

### Community 9 - "Legal Entities API Service"
Cohesion: 0.20
Nodes (11): baseQuery, legalEntityApiService, EndpointDefinitions, legalEntitiesEndpoints(), initialState, legalEntitySlice, CreateLegalEntityPayload, GetLegalEntitiesResponse (+3 more)

### Community 10 - "Users Management & RBAC Permissions"
Cohesion: 0.19
Nodes (7): RoleForm(), roleSchema, ACTIONS, SUBJECTS, UserForm(), userApiService, userEndpoints()

### Community 11 - "Product Forms & Allergen Inputs"
Cohesion: 0.15
Nodes (7): COMMON_ALLERGENS, DIETARY_OPTIONS, GST_RATES, PRODUCT_UNITS, ProductForm(), renderStep(), STEPS

### Community 12 - "Auth State & Localization"
Cohesion: 0.40
Nodes (8): authApiService, authSlice, AuthState, initialState, Localization, Permission, Role, User

### Community 13 - "Media Viewer & Detail Dialogs"
Cohesion: 0.26
Nodes (9): formatBytes(), MediaCard(), MediaDetailDialog(), MediaItem, MediaListRow(), timeAgo(), TYPE_COLORS, TYPE_ICONS (+1 more)

### Community 14 - "Outlet Opening Hours Input"
Cohesion: 0.22
Nodes (8): DAYS, DaySchedule, DEFAULT_SCHEDULE, DEFAULT_SLOT, OpeningHoursInput(), summarizeDay(), TIME_OPTIONS, WeekSchedule

### Community 15 - "Loading Animations & UI State"
Cohesion: 0.29
Nodes (5): fadeInUp, float, pulse, rotate, shimmer

### Community 16 - "Google Maps Coordinates Input"
Cohesion: 0.53
Nodes (5): buildGoogleMapsUrl(), Coordinates, CoordinatesInput(), isValidLat(), isValidLng()

### Community 18 - "Architecture Rules & UI Patterns"
Cohesion: 0.40
Nodes (5): MUI X-Data-Grid Wrapper, Formik & Yup Forms, Documentation Maintenance Policy, Designing UI Changes, Form Component Pattern

### Community 19 - "Environment Scripts & Variables"
Cohesion: 0.40
Nodes (4): NEXT_PUBLIC_BASE_API_URL, NEXT_PUBLIC_ENV, NEXT_PUBLIC_MEDIA_BASE_URL, local.sh script

### Community 21 - "Development Logs & Agent Specs"
Cohesion: 0.67
Nodes (3): Role-Based Access Control (RBAC), Workspace Rules (AGENTS.md), Development Log (LOG.md)

## Knowledge Gaps
- **195 isolated node(s):** `LoginValues`, `metadata`, `playfair`, `lato`, `cormorant` (+190 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Media Picker & Grid Components` to `Package Dependencies & Tailwind CSS`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **What connects `LoginValues`, `metadata`, `playfair` to the rest of the system?**
  _199 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Pages & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.05246913580246913 - nodes in this community are weakly interconnected._
- **Should `API Endpoints Definitions` be split into smaller, more focused modules?**
  _Cohesion score 0.0859538784067086 - nodes in this community are weakly interconnected._
- **Should `Cake Customizations & Offers` be split into smaller, more focused modules?**
  _Cohesion score 0.0545790934320074 - nodes in this community are weakly interconnected._
- **Should `Admin Layout & Typography` be split into smaller, more focused modules?**
  _Cohesion score 0.057692307692307696 - nodes in this community are weakly interconnected._
- **Should `Discount Redux & API Service` be split into smaller, more focused modules?**
  _Cohesion score 0.07254623044096728 - nodes in this community are weakly interconnected._
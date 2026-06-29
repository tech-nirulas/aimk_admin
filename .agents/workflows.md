# Agent Workflows: AIMK Admin Panel

This guide outlines how an agent should approach asking, planning, architecting, orchestrating, and debugging tasks on the Next.js/MUI admin panel.

---

## 1. Ask (Information Gathering)
When exploring a dashboard page or resource manager:
- **Route first**: Check `app/admin/<resource>` to see what page is rendered.
- **Look at Feature services**: Check `features/<resource>/` to find API service declarations (`<resource>ApiService.ts`) and RTK Query hooks.
- **Check component layout**: See if the page uses `components/common/DataTable.tsx` or a custom Formik form wrapper.

---

## 2. Plan (Designing UI Changes)
Before making UI modifications:
- Draft components structure.
- Define what API routes need to be called (check backend Swagger first at `http://localhost:9090/api-docs`).
- Map form fields to the backend schema and validation DTOs.
- Identify if the page needs client-side state or RTK Query caching.

---

## 3. Architect (Coding Patterns)

When adding a new admin management module (e.g., `banners`):
1. **API Service**:
   - Create `features/banners/bannersApiService.ts`.
   - Implement RTK Query endpoints (`fetchBanners`, `createBanner`, `updateBanner`, `deleteBanner`).
   - Register the service in `redux/api.ts`.
2. **Page & Route**:
   - Create `app/admin/banners/page.tsx` (add `"use client"` if using client-side state/hooks).
   - Use the `AdminLayout` wrapper.
   - For listing, use the `DataTable` component:
     ```tsx
     import DataTable from "@/components/common/DataTable";
     // define columns and pass data from useFetchBannersQuery()
     ```
3. **Form Component**:
   - Create `features/banners/BannerForm.tsx` using **Formik** and **Yup** validation.
   - Utilize Formik field wrappers from `components/common/CustomFields` (e.g., `CustomTextField`, `CustomSelectField`).

---

## 4. Orchestrate (Execution Steps)
- Coordinate front-end work with backend endpoints. Make sure the backend API route exists and is tested first.
- Register all newly created services in `redux/api.ts` so they are automatically included in the Redux store.
- Always lint your code (`npm run lint`) before testing or submitting. Next.js 16/React 19 builds are strict.

---

## 5. Debug & Error Resolver

### Port Collision (7070)
- **Problem**: Next.js server fails to start or defaults to port 3000 (colliding with backend).
- **Solution**: The local shell script `local.sh` starts the development server on port 7070 (`npm run dev -- -p 7070`). Always run `./local.sh` instead of `npm run dev` directly.

### Server vs. Client Components (Next.js 16)
- **Problem**: Error `useState / useEffect / useTheme only works in Client Components`.
- **Solution**: Add `"use client";` at the very top of the page or component file. By default, Next.js App Router treats all components under `app/` as Server Components.

### MUI SSR / Hydration Warning
- **Problem**: Hydration mismatches occur because of Material-UI elements loading before class names/styles are computed on the client.
- **Solution**: Ensure pages are wrapped in `AppRouterCacheProvider` (from `@mui/material-nextjs/v14-appRouter`) inside the root layout (`app/layout.tsx`).

### RTK Query Authentication / Bearer Header
- **Problem**: API queries return a 401 Unauthorized error even though the user is logged in.
- **Solution**: Check the `prepareHeaders` function inside the feature's API service. Verify that `getDecryptedToken()` from `@/helpers/decryptToken.helper` is retrieving the token correctly.

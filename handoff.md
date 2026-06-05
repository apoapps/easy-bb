## Goal

Make Next.js the only backend for `easy-bb`, remove external backend configuration options, and tighten responsive layout so login and dashboard metrics do not overflow, crop, or break spacing.

## Current State

Next.js serves both the UI and `/api/*`. Product code and docs no longer ask for an external API URL. API routes now return local Next backend responses. Since the real Blackboard connector is not implemented yet, login returns `BLACKBOARD_CONNECTOR_NOT_IMPLEMENTED` from `app/api/login/route.ts`.

Layout was tightened for mobile/desktop:

- Global `box-sizing` and horizontal overflow guard.
- Login card uses smaller mobile padding/shadow, responsive dice size, and a mobile-safe school-domain grid.
- Dashboard KPI grid uses tighter mobile gaps and 1/2/4-column breakpoints.
- KPI cards use `min-w-0`, fixed minimum height, responsive type, truncation, and smaller gauge sizing.
- Day banner stacks on mobile and wraps long course names.
- Dashboard list rows use shrink/min-width guards around icons, text, and chips.

## Files In Flight

- `app/api/_backend.ts`
- `app/api/_backend.test.ts`
- `app/api/login/route.ts`
- `app/api/logout/route.ts`
- `app/api/dashboard/route.ts`
- `app/api/me/route.ts`
- `app/api/memberships/route.ts`
- `src/lib/api.ts`
- `src/lib/apiConfig.ts`
- `src/lib/apiConfig.test.ts`
- `src/index.css`
- `src/App.tsx`
- `src/views/LoginPage.tsx`
- `src/views/DashboardPage.tsx`
- `src/components/Card.tsx`
- `src/components/KpiCard.tsx`
- `.env.example`
- `README.md`
- `handoff.md`

## Changed

- Replaced the old external API forwarding helper with local Next backend helpers in `app/api/_backend.ts`.
- Updated all API routes to call local backend helpers directly.
- Removed public/external API base handling from the browser client; it always calls same-origin Next `/api/*`.
- Updated tests to assert the backend no longer asks for external URL configuration.
- Updated README and `.env.example` to state that no external backend URL is required.
- Improved login/dashboard layout constraints to prevent horizontal overflow and cropped text.

## Failed Attempts

- New backend test first failed because `_backend.ts` did not exist; implemented it after confirming the expected red state.
- Browser MCP has limited DOM inspection tools, so verification used available tab resize/open checks plus build/lint/tests and static overflow-oriented class review.

## Next Step

Implement the real Blackboard connector inside `app/api` so `POST /api/login` can authenticate and subsequent routes can return real dashboard data. Do not reintroduce external backend URL configuration or production demo data.

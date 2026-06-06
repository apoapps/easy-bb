## Goal

Keep easy-bb production-ready as a Next.js app where Next API routes are the backend, mock/demo data cannot leak in production, and the UI presents a clean English Blackboard metrics experience under the `BB Wrapped` appbar brand.

## Current State

Next.js serves both the React UI and `/api/*`. The app uses the real Next API backend in production and demo mode only on local/dev URLs. Vercel is expected to deploy from GitHub push; do not deploy through any forbidden Vercel team or project.

The appbar now owns the `BB Wrapped` brand persistently. Dashboard and profile use a concise `Hi, {firstName}` story card, while the appbar user chip persists cached user state and shows the real display name with student number as a secondary label.

The Blackboard connector now follows paginated Blackboard responses for memberships, gradebook columns, and grade lists. It limits concurrent course/column fetches and keeps a gradebook column visible even if the user-specific grade lookup fails.

## Files In Flight

- `app/api/_blackboard.ts`
- `app/api/_blackboard.test.ts`
- `src/App.tsx`
- `src/components/TopBar.tsx`
- `src/lib/api.ts`
- `src/lib/userDisplay.ts`
- `src/views/DashboardPage.tsx`
- `src/views/ProfilePage.tsx`
- `handoff.md`

## Changed

- Added paginated Blackboard reads for course memberships, gradebook columns, and grade list fallbacks.
- Added bounded concurrency for dashboard course and column collection.
- Exported and tested `normalizeUser` so student numbers like `m041975` are stored as `studentId`, not shown as the primary display name.
- Added cached user persistence in localStorage so the appbar user state survives navigation/refresh while the session is valid.
- Added `src/lib/userDisplay.ts` to centralize display name, first name, and subtitle selection.
- Changed the appbar brand to `BB Wrapped`; dashboard/profile cards now say `Hi, {firstName}` instead of repeating `BB Wrapped`.
- Simplified dashboard storytelling: average, submitted historical items, watchlist items, compact status, course overview, and recent activity.
- Removed the featured course section.
- Fixed watchlist/needs-attention calculations so they use urgent/needs-grading activity data instead of showing misleading zeroes.
- Updated Profile to use the real display name and student number subtitle, with `Submitted` instead of `Graded`.
- Added tests for student-number display-name handling and real profile name preservation.

## Failed Attempts

- `npm run build` initially failed because TypeScript did not narrow `normalizeUser().name` to `string`. Fixed by assigning an explicit `let name = 'Student'` fallback before returning the user.
- The Playwright dev screenshot shows a circular Next dev indicator at the lower-left; this is local dev chrome and is not part of the production app.

## Next Step

After this commit is pushed to `origin/main`, wait for the GitHub-triggered Vercel deployment and smoke-test `https://easy-bb.vercel.app/` with a real Blackboard login. Confirm the appbar says `BB Wrapped`, the user chip shows name plus student number, dashboard/profile cards say `Hi, {name}`, zero-average courses stay at the bottom, and no horizontal overflow appears on mobile or desktop.

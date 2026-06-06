## Goal

Keep easy-bb production-ready as a Next.js app where Next API routes are the backend, demo/mock data cannot leak in production, and the UI presents a polished English Blackboard metrics dashboard built by apoapps.

## Current State

Next.js serves both the UI and `/api/*`. `POST /api/login` posts to the Blackboard web login for the selected school, stores Blackboard cookies server-side inside a sealed `httpOnly` cookie, and returns a compatibility `sessionId` to the existing React client.

Authenticated routes read the sealed cookie:

- `GET /api/me` calls `/learn/api/public/v1/users/me`.
- `GET /api/memberships` calls Blackboard course memberships for the current user.
- `GET /api/dashboard` reads current user, memberships, gradebook columns, and per-column grades to build the dashboard shape.
- `POST /api/logout` clears the sealed session cookie.

The visible app is now English-only, uses `BB Wrapped` as the large dashboard/profile story title, includes "Built by apoapps" links to `https://apoapps.com`, and shows a GitHub icon link to `https://github.com/apoapps/easy-bb` in the top-right header. Vercel is expected to deploy from GitHub push now that the user configured the correct Vercel account externally.

## Files In Flight

- `app/api/*`
- `app/client-app.tsx`
- `app/layout.tsx`
- `public/favicon.svg`
- `src/App.tsx`
- `src/components/ApoLogo.tsx`
- `src/components/Skeleton.tsx`
- `src/components/UiIcon.tsx`
- `src/components/Dice3D.tsx`
- `src/components/TopBar.tsx`
- `src/components/CourseCard.tsx`
- `src/components/BarRow.tsx`
- `src/views/*`
- `src/lib/api.ts`
- `src/lib/demoData.ts`
- `src/index.css`
- `tailwind.config.js`
- `README.md`
- `handoff.md`

## Changed

- Rebranded visible UI to easy-bb with a sketch-style apoapps logo, new favicon, `Built by apoapps` link, and GitHub icon link in the header.
- Rebuilt the 3D cube faces with crisp SVG icons instead of emoji so the icons render sharply and are not clipped or covered.
- Removed the logo stamp that overlapped the cube face.
- Neutralized the palette while keeping a restrained purple accent.
- Converted login, dashboard, courses, search, calendar, course detail, profile, modal labels, demo copy, README, and API error messages to English.
- Removed user-specific school examples and replaced demo data with generic Course A/B/C and Assignment labels.
- Swapped loading text/spinners for reusable skeleton components.
- Added a richer dashboard overview for all courses with graded percentage, attention count, stable count, course ranking, recent activity, featured course, urgent, and pending sections.
- Changed `/courses` from horizontal scroll cards to a responsive grid.
- Removed fade timing from course cards and dashboard rows so cards/rows render at full opacity immediately in screenshots and production.
- Changed dashboard/profile large titles to `BB Wrapped`.
- Sorted courses so `0.0%` averages and missing averages appear last in dashboard rankings, the courses grid, and profile term lists.
- Updated grade collection so a failed per-column grade lookup no longer drops the whole gradebook column; the activity still appears with unknown grade data.

## Failed Attempts

- `npx -p playwright node /tmp/easy-bb-verify.cjs` and `npx -p playwright -c 'node ...'` did not expose `require('playwright')` to the script. Resolved by using the cached npx package path through `NODE_PATH`.
- Playwright initially lacked the Chromium binary. Resolved with `npx -y playwright install chromium`.
- `next start` correctly disabled demo mode in production, so visual demo QA used `next dev` while production correctness stayed covered by `npm run build`.

## Next Step

Commit and push the current UI/data-collection changes to `origin/main`. After Vercel finishes, smoke-test `https://easy-bb.vercel.app/` for the English login screen, favicon, GitHub link, apoapps link, `BB Wrapped` dashboard/profile title, sorted zero-average courses, and real Blackboard login behavior.

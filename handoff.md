## Goal

Make BB DASH production-ready as a Next.js app where Next API routes are the backend, demo/mock data cannot leak in production, and Blackboard login/data reads are implemented inside `app/api` without using any external backend URL.

## Current State

Next.js serves both the UI and `/api/*`. The old `BLACKBOARD_CONNECTOR_NOT_IMPLEMENTED` placeholder has been removed. `POST /api/login` now posts to the Blackboard web login for the selected school, stores Blackboard cookies server-side inside a sealed `httpOnly` cookie, and returns a compatibility `sessionId` to the existing React client.

Authenticated routes read the sealed cookie:

- `GET /api/me` calls `/learn/api/public/v1/users/me`.
- `GET /api/memberships` calls Blackboard course memberships for the current user.
- `GET /api/dashboard` reads current user, memberships, gradebook columns, and per-column grades to build the existing dashboard shape.
- `POST /api/logout` clears the sealed session cookie.

No real Blackboard credentials were available in cleartext, so the complete successful login flow could not be verified end-to-end. Local verification confirmed invalid credentials now reach Blackboard and return `BLACKBOARD_LOGIN_FAILED` instead of the old placeholder or a 404.

Validation passed on June 5, 2026:

- `npm test`
- `npm run lint`
- `npm run build`
- `next start` API smoke tests for missing session, invalid login, and logout cookie clearing

GitHub push completed to `https://github.com/apoapps/easy-bb.git` on `main`. Vercel deploy was intentionally not run because both local Vercel CLI and the Vercel connector only exposed the forbidden `fgfitness` scope/team.

## Files In Flight

- `app/api/_blackboard.ts`
- `app/api/_blackboard.test.ts`
- `app/api/_session.ts`
- `app/api/_session.test.ts`
- `app/api/_backend.ts`
- `app/api/_backend.test.ts`
- `app/api/login/route.ts`
- `app/api/logout/route.ts`
- `app/api/dashboard/route.ts`
- `app/api/me/route.ts`
- `app/api/memberships/route.ts`
- `src/lib/api.ts`
- `README.md`
- `handoff.md`

## Changed

- Added a Blackboard connector with a small cookie jar, login form hidden-input parsing, Blackboard school normalization, REST JSON helpers, user normalization, memberships mapping, gradebook column reads, per-column grade reads, KPI aggregation, and explicit Blackboard error codes.
- Added sealed Next backend sessions in `app/api/_session.ts`; Blackboard cookies stay in an `httpOnly` cookie instead of localStorage.
- Rewired all API routes to use the real connector and cookie-backed session instead of `BLACKBOARD_CONNECTOR_NOT_IMPLEMENTED`.
- Updated browser fetches to use `credentials: 'same-origin'` so the `httpOnly` session cookie is sent to same-origin Next API routes.
- Added unit tests for Blackboard helper parsing/cookies and sealed session roundtrip.
- Updated README to describe the production Next backend and real Blackboard connector behavior.
- Pushed the implementation to GitHub `apoapps/easy-bb` on `main`.

## Failed Attempts

- Initial MFA detection falsely matched Blackboard's always-present MFA modal markup, causing invalid credentials to return `MFA_REQUIRED`. Fixed by checking only resolved hidden fields (`showMFAVerification=true` or `showMFARegistration=true`).
- Browser/plugin verification was not used for a real login because the password was not available in cleartext. Verification used `next start` and API curls.
- Vercel deployment was skipped because `vercel whoami` returned `fgfitnessperformance-5117`, and the Vercel connector listed only the FG Fitness team. User explicitly instructed never to upload there.

## Next Step

Test `POST /api/login` with real CETYS credentials in the app. If login succeeds but gradebook data is sparse, inspect Blackboard's exact permission response for `/learn/api/public/v2/courses/{courseId}/gradebook/columns/{columnId}/users/{userId}` and adjust the grade endpoint fallback accordingly.

## Goal

Convert `easy-bb` from Vite SPA to Next.js so the UI and `/api/*` routes live in the same production project, avoiding Vercel `NOT_FOUND` for `/api/login` while keeping mock/demo data out of production.

## Current State

The app is now a Next.js App Router project. The existing React dashboard is mounted client-only at `/`, preserving the current UI and hash routes. Next route handlers exist for `/api/login`, `/api/dashboard`, `/api/me`, `/api/memberships`, and `/api/logout`. If no real backend is configured, these routes return JSON `BACKEND_NOT_CONFIGURED` instead of Vercel's generic `NOT_FOUND`.

Final validation passed:

- `npm test`
- `npm run lint`
- `npm run build`
- `curl -i -X POST http://localhost:3000/api/login ...` returned HTTP 501 JSON with `BACKEND_NOT_CONFIGURED`, proving the route exists.
- Playwright opened `http://localhost:3000`; page title was `easy-bb`, UI loaded at `/#/login`, and only normal React DevTools/HMR dev logs remained.

## Files In Flight

- `app/layout.tsx`
- `app/page.tsx`
- `app/client-app.tsx`
- `app/api/_shared.ts`
- `app/api/_shared.test.ts`
- `app/api/login/route.ts`
- `app/api/logout/route.ts`
- `app/api/dashboard/route.ts`
- `app/api/me/route.ts`
- `app/api/memberships/route.ts`
- `src/App.tsx`
- `src/lib/api.ts`
- `src/views/*`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `next-env.d.ts`
- `tailwind.config.js`
- `eslint.config.js`
- `vercel.json`
- `.env.example`
- `.gitignore`
- `.vercelignore`
- `README.md`
- `handoff.md`

## Changed

- Added Next.js and removed Vite runtime dependencies/scripts.
- Added App Router shell with `app/layout.tsx`, `app/page.tsx`, and client-only `app/client-app.tsx` to avoid `document is not defined` during prerender.
- Added Next route handlers for all API paths used by the client.
- Added `BACKEND_API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL` support and proxy behavior for production.
- Converted client env usage from `import.meta.env` to `process.env.NODE_ENV` and `NEXT_PUBLIC_API_BASE_URL`.
- Moved internal SPA screens from `src/pages` to `src/views` so Next does not treat them as Pages Router files.
- Removed Vite files: `index.html`, `src/main.tsx`, `vite.config.ts`, `tsconfig.app.json`, `tsconfig.node.json`.
- Updated Tailwind, ESLint, Vercel config, README, env example, and ignores for Next.

## Failed Attempts

- First `next build` failed because `src/pages` conflicted with `app`; fixed by moving screens to `src/views`.
- Second `next build` failed with `document is not defined` because `HashRouter` was prerendered; fixed with a client-only dynamic wrapper.
- Local browser check first showed `favicon.ico` 404; fixed by adding metadata icon pointing to `/favicon.svg`.
- Vercel deployment remains intentionally unattempted with the local CLI because it is authenticated as `fgfitnessperformance-5117`, not `alexlink2004`.

## Next Step

Commit and push the Next.js migration to `origin/main`. Then deploy from Vercel using the `alexlink2004` scope only. Configure `BACKEND_API_BASE_URL` in Vercel if a real backend is available; otherwise `/api/login` will correctly return `BACKEND_NOT_CONFIGURED` JSON instead of a Vercel `NOT_FOUND`.

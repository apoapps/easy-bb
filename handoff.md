## Goal

Prepare `easy-bb` for production so demo/mock data cannot leak in production, then initialize/push the repo to `https://github.com/apoapps/easy-bb.git` and configure/deploy on Vercel under the `alexlink2004` / Alejandro Apodaca account, explicitly avoiding `fgfitness`.

## Current State

Production build, lint, and tests are passing as of the final check in this session. Demo mode is development-only and `?demo=1` is ignored in production. Demo data is dynamically imported only from the development-only mock API path. The old personal demo fixture was replaced with synthetic data. Git repo is initialized on `main` and pushed to `https://github.com/apoapps/easy-bb.git`. Vercel CLI is currently authenticated as `fgfitnessperformance-5117`, so Vercel link/deploy was intentionally not performed with that session.

## Files In Flight

- `src/lib/api.ts`
- `src/lib/apiConfig.ts`
- `src/lib/apiConfig.test.ts`
- `src/lib/demoData.ts`
- `src/App.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/SearchPage.tsx`
- `src/components/Chip.tsx`
- `src/components/Toast.tsx`
- `src/components/toastBus.ts`
- `package.json`
- `package-lock.json`
- `README.md`
- `vercel.json`
- `.vercelignore`
- `.env.example`
- `handoff.md`

## Changed

- `src/lib/api.ts`: removed static demo data import, added production-safe API base handling, dynamic dev-only mock loading, safer response parsing, and non-sensitive login defaults.
- `src/lib/apiConfig.ts`: added tested helpers for demo-mode policy and API base resolution.
- `src/lib/apiConfig.test.ts`: added Vitest coverage for production demo lockout and API base behavior.
- `src/lib/demoData.ts`: replaced personal/specific fixture data with synthetic demo data.
- `src/App.tsx`, `src/pages/LoginPage.tsx`: removed sensitive default user strings and updated toast imports.
- `src/pages/SearchPage.tsx`, `src/components/Chip.tsx`: removed lint-blocking `any` usage and control-character highlighting.
- `src/components/Toast.tsx`, `src/components/toastBus.ts`: split toast bus from React component for Vite fast-refresh lint.
- `package.json`, `package-lock.json`: added Vitest and `npm test`.
- `README.md`: replaced Vite template with production notes for `easy-bb`.
- `vercel.json`: added explicit Vercel Vite build configuration.
- `.vercelignore`: excludes env files, local build output, tests, and handoff from Vercel upload.
- `.env.example`: documented optional `VITE_API_BASE_URL`.
- Final validation: `npm test`, `npm run lint`, and `npm run build` passed; search found no old personal demo identifiers in `dist`, `README.md`, or `src/lib/demoData.ts`.

## Failed Attempts

- `git status --short --branch` failed initially because the folder was not a git repository.
- First `npx vitest run src/lib/apiConfig.test.ts` failed as expected because `apiConfig` did not exist yet.
- First `npm run lint` failed on existing lint issues plus new `api.ts` typing issues; fixed before proceeding.
- First `git push -u origin main` failed because GitHub active account was `fgfitnessperformance`; switched `gh` active account to `apoapps` and push succeeded.
- `vercel teams switch alexlink2004` failed with `scope_not_accessible`; current Vercel session only has access to `fg-fitness-performances-projects`, so no Vercel project was linked or deployed with that scope.
- Claimable Vercel deploy script returned "Your deployment is building" without a `previewUrl`, then exited because it could not extract URLs.

## Next Step

Authenticate Vercel as `alexlink2004` or provide a Vercel token for that account, then run `vercel link --yes --project easy-bb --scope alexlink2004` and `vercel --prod --scope alexlink2004`. Do not use the currently authenticated `fgfitnessperformance-5117` session.

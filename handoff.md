## Goal

Prepare `easy-bb` for production so demo/mock data cannot leak in production, then initialize/push the repo to `https://github.com/apoapps/easy-bb.git` and configure/deploy on Vercel under the `alexlink2004` / Alejandro Apodaca account, explicitly avoiding `fgfitness`.

## Current State

Production build, lint, and tests are passing. Demo mode is development-only and `?demo=1` is ignored in production. Demo data is dynamically imported only from the development-only mock API path. The old personal demo fixture was replaced with synthetic data.

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
- `.env.example`: documented optional `VITE_API_BASE_URL`.

## Failed Attempts

- `git status --short --branch` failed initially because the folder was not a git repository.
- First `npx vitest run src/lib/apiConfig.test.ts` failed as expected because `apiConfig` did not exist yet.
- First `npm run lint` failed on existing lint issues plus new `api.ts` typing issues; fixed before proceeding.

## Next Step

Initialize git, commit the full production-ready project, add remote `https://github.com/apoapps/easy-bb.git`, push `main`, then link/deploy to Vercel using the `alexlink2004` scope only and verify the selected scope is not `fgfitness`.

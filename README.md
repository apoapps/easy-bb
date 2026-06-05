# easy-bb

Blackboard metrics dashboard built with Next.js by apoapps.

## Production

- Next.js serves the app and the backend.
- API routes live in `app/api`.
- No external backend URL is required.
- Demo data is available only in local development.
- `?demo=1` is ignored in production.
- Mock data is never activated in production builds.

## Backend

The backend signs in to Blackboard from Next.js route handlers, stores the Blackboard session in a sealed `httpOnly` cookie, and reads courses, gradebook columns, grades, due dates, and profile data from Blackboard server-side.

Routes:

- `POST /api/login`
- `GET /api/dashboard`
- `GET /api/me`
- `GET /api/memberships`
- `POST /api/logout`

## Scripts

```bash
npm run dev
npm test
npm run lint
npm run build
npm start
```

## Links

- GitHub: https://github.com/apoapps/easy-bb
- Built by apoapps: https://apoapps.com

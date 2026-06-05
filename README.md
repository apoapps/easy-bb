# easy-bb

Dashboard web en Next.js para consultar materias, calificaciones y pendientes de Blackboard.

## Produccion

- Next.js sirve la app y tambien es el backend.
- Las rutas `/api/*` viven en `app/api`.
- No hay URL de backend externa que configurar.
- El modo demo solo funciona en desarrollo.
- `?demo=1` se ignora en produccion.
- Los datos demo no se activan en produccion.

## API local

Rutas del backend Next:

- `POST /api/login`
- `GET /api/dashboard`
- `GET /api/me`
- `GET /api/memberships`
- `POST /api/logout`

El conector real de Blackboard debe implementarse dentro de `app/api`. Mientras ese conector no exista, el backend responde `BLACKBOARD_CONNECTOR_NOT_IMPLEMENTED`.

## Scripts

```bash
npm run dev
npm test
npm run lint
npm run build
npm start
```

## Vercel

No usar el scope/proyecto `fgfitness` para este deploy. Usar el scope correcto de `alexlink2004` / Alejandro Apodaca.

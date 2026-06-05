# easy-bb

Dashboard web en Next.js para consultar materias, calificaciones y pendientes de Blackboard.

## Produccion

- La app y las rutas `/api/*` viven en el mismo proyecto Next.js.
- El modo demo solo funciona en desarrollo.
- `?demo=1` se ignora en produccion.
- Los datos demo se cargan con `import()` y no se incluyen como modo activo de produccion.
- Si no hay backend real configurado, `/api/login` responde JSON con `BACKEND_NOT_CONFIGURED` en vez de un 404 generico de Vercel.

## API real

Configura una de estas variables en Vercel:

```bash
# Recomendado: el servidor Next proxyeara /api/* a este backend.
BACKEND_API_BASE_URL=https://tu-backend.com

# Alternativa: el browser llamara directo a esta API publica.
NEXT_PUBLIC_API_BASE_URL=https://tu-backend.com
```

El backend real debe exponer:

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

## Vercel

No usar el scope/proyecto `fgfitness` para este deploy. Usar el scope correcto de `alexlink2004` / Alejandro Apodaca.

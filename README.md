# easy-bb

Dashboard web para consultar materias, calificaciones y pendientes de Blackboard.

## Produccion

- El modo demo solo funciona en desarrollo (`import.meta.env.DEV`).
- Los datos demo se cargan con `import()` y no se incluyen en el bundle de produccion.
- En produccion, `?demo=1` se ignora.
- La API usa `VITE_API_BASE_URL` si esta configurada; si no, usa `/api` en el mismo dominio.

## Scripts

```bash
npm run dev
npm test
npm run lint
npm run build
```

## Vercel

Configurar `VITE_API_BASE_URL` en Vercel si el backend vive en otro dominio.
No usar el scope/proyecto `fgfitness` para este deploy.

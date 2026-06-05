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

`POST /api/login` inicia sesion contra Blackboard desde el backend Next, guarda la cookie de Blackboard en una cookie `httpOnly` sellada, y las demas rutas leen Blackboard desde `app/api` sin exponer datos sensibles al navegador.

La lectura de calificaciones usa las APIs publicas de Blackboard Learn para cursos, columnas de gradebook y calificaciones por columna. Si Blackboard exige MFA o bloquea permisos de gradebook para la cuenta, el backend responde con un error explicito en vez de inventar datos.

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
